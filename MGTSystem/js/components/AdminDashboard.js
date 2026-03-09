import { h, useState, useEffect, html, Icon } from '../preact-utils.js';
import { db } from '../firebase-config.js';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { exportToExcel, prepareDataForExport } from '../export-utils.js';
import FormDetailModal from './FormDetailModal.js';

const AdminDashboard = ({ user, setCurrentPage }) => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedForm, setSelectedForm] = useState(null);

    const collections = [
        "transportation_forms",
        "domestic_travel_forms",
        "international_travel_forms",
        "expense_claim_forms"
    ];

    const fetchAllForms = async () => {
        setLoading(true);
        try {
            let allData = [];
            for (const collName of collections) {
                const q = query(collection(db, collName), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                snap.forEach(d => {
                    const data = d.data();
                    allData.push({
                        id: d.id,
                        collection: collName,
                        ...data,
                        status: data.status || '待審核',
                        // Normalize data for display
                        displayType: getFriendlyName(collName),
                        displayAmount: data.totalAmount || data.amount || data.totalAmountNTD || 0
                    });
                });
            }
            // Sort combined list by date
            allData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setForms(allData);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllForms();
    }, []);

    const getFriendlyName = (coll) => {
        const names = {
            "transportation_forms": "交通費",
            "domestic_travel_forms": "國內差旅",
            "international_travel_forms": "國外出差",
            "expense_claim_forms": "支出證明"
        };
        return names[coll] || coll;
    };

    const updateStatus = async (formId, collName, newStatus) => {
        if (!confirm(`確定要將此單據設定為 [${newStatus}] 嗎？`)) return;
        try {
            const docRef = doc(db, collName, formId);
            await updateDoc(docRef, { status: newStatus });
            alert("狀態更新成功！");
            fetchAllForms(); // Refresh
        } catch (error) {
            console.error(error);
            alert("更新失敗");
        }
    };

    const filteredForms = forms.filter(f => {
        const matchType = typeFilter === 'all' || f.collection === typeFilter;
        const matchStatus = statusFilter === 'all' || f.status === statusFilter;
        return matchType && matchStatus;
    });

    const handleExportExcel = () => {
        if (filteredForms.length === 0) return alert("沒有資料可匯出");
        const exportData = prepareDataForExport(filteredForms);
        const dateStr = new Date().toISOString().split('T')[0];
        exportToExcel(exportData, `TMVC_E-Office_Report_${dateStr}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return html`
        <div class="flex-1 p-6 md:p-10 bg-slate-50 overflow-auto">
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">管理員審核後台</h1>
                    <p class="text-slate-500 mt-1">檢視並管理所有同仁提交的申請單</p>
                </div>
                <div class="flex items-center gap-3">
                    <select value=${typeFilter} onChange=${e => setTypeFilter(e.target.value)} 
                        class="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="all">所有種類</option>
                        <option value="transportation_forms">交通費</option>
                        <option value="domestic_travel_forms">國內差旅</option>
                        <option value="international_travel_forms">國外出差</option>
                        <option value="expense_claim_forms">支出證明</option>
                    </select>
                    <select value=${statusFilter} onChange=${e => setStatusFilter(e.target.value)} 
                        class="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="all">所有狀態</option>
                        <option value="已提交">已提交</option>
                        <option value="待審核">待審核</option>
                        <option value="核准">核准</option>
                        <option value="駁回">駁回</option>
                    </select>
                    <button onClick=${fetchAllForms} class="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm" title="重新整理">
                        <${Icon} name="refresh" className="w-5 h-5" />
                    </button>
                    <div class="h-6 w-px bg-slate-200 mx-1"></div>
                    <button onClick=${handleExportExcel} class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm font-bold text-sm">
                        <${Icon} name="download" className="w-4 h-4" /> 匯出 Excel
                    </button>
                    <button onClick=${handlePrint} class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all shadow-sm font-bold text-sm">
                        <${Icon} name="printer" className="w-4 h-4" /> 列印 / PDF
                    </button>
                </div>
            </header>

            ${loading ? html`
                <div class="flex justify-center p-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ` : html`
                <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="p-4 font-bold text-slate-600 text-sm">提交日期</th>
                                <th class="p-4 font-bold text-slate-600 text-sm">申請人</th>
                                <th class="p-4 font-bold text-slate-600 text-sm">種類</th>
                                <th class="p-4 font-bold text-slate-600 text-sm">事由</th>
                                <th class="p-4 font-bold text-slate-600 text-sm text-right">金額 (NTD)</th>
                                <th class="p-4 font-bold text-slate-600 text-sm text-center">狀態</th>
                                <th class="p-4 font-bold text-slate-600 text-sm text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredForms.length === 0 ? html`
                                <tr><td colspan="7" class="p-10 text-center text-slate-400">目前沒有符合條件的單據</td></tr>
                            ` : filteredForms.map(f => html`
                                <tr key=${f.id} class="hover:bg-slate-50 border-b border-slate-50 transition-colors">
                                    <td class="p-4 text-sm text-slate-500">
                                        ${f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '未知'}
                                    </td>
                                    <td class="p-4 font-medium text-slate-800">${f.userEmail?.split('@')[0]}</td>
                                    <td class="p-4">
                                        <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">${f.displayType}</span>
                                    </td>
                                    <td class="p-4 text-sm text-slate-600 truncate max-w-[200px]" title=${f.reason}>${f.reason}</td>
                                    <td class="p-4 text-right font-bold text-slate-800">${(f.displayAmount || 0).toLocaleString()}</td>
                                    <td class="p-4 text-center">
                                        <span class="px-3 py-1 ${f.status === '核准' ? 'bg-emerald-100 text-emerald-700' : f.status === '駁回' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} text-xs font-bold rounded-full">
                                            ${f.status || '待審核'}
                                        </span>
                                    </td>
                                    <td class="p-4 text-right flex items-center justify-end gap-2">
                                        <button onClick=${() => setSelectedForm(f)} 
                                            class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100" title="查看明細">
                                            <${Icon} name="eye" className="w-5 h-5" />
                                        </button>
                                        <div class="h-6 w-px bg-slate-200 mx-1"></div>
                                        <button onClick=${() => updateStatus(f.id, f.collection, '核准')} 
                                            class="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-100">核准</button>
                                        <button onClick=${() => updateStatus(f.id, f.collection, '駁回')} 
                                            class="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-100">駁回</button>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            `}

            ${selectedForm && html`<${FormDetailModal} form=${selectedForm} onClose=${() => setSelectedForm(null)} />`}
        </div>
    `;
};

export default AdminDashboard;
