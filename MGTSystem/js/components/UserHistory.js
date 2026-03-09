import { h, useState, useEffect, html, Icon } from '../preact-utils.js';
import { db } from '../firebase-config.js';
import { collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import FormDetailModal from './FormDetailModal.js';

const UserHistory = ({ user }) => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null);

    const collections = [
        "transportation_forms",
        "domestic_travel_forms",
        "international_travel_forms",
        "expense_claim_forms"
    ];

    const fetchUserForms = async () => {
        setLoading(true);
        try {
            let allData = [];
            for (const collName of collections) {
                const q = query(
                    collection(db, collName),
                    where("userId", "==", user.uid)
                );
                const snap = await getDocs(q);
                snap.forEach(d => {
                    const data = d.data();
                    allData.push({
                        id: d.id,
                        collection: collName,
                        ...data,
                        status: data.status || '待審核',
                        displayType: getFriendlyName(collName),
                        displayAmount: data.totalAmount || data.amount || data.totalAmountNTD || 0
                    });
                });
            }
            // Sort by date (descending)
            allData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setForms(allData);
        } catch (error) {
            console.error("Error fetching user history:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchUserForms();
    }, [user]);

    const getFriendlyName = (coll) => {
        const names = {
            "transportation_forms": "交通費",
            "domestic_travel_forms": "國內差旅",
            "international_travel_forms": "國外出差",
            "expense_claim_forms": "支出證明"
        };
        return names[coll] || coll;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case '核准': return 'bg-emerald-100 text-emerald-700';
            case '駁回': return 'bg-red-100 text-red-700';
            case '已提交': return 'bg-blue-100 text-blue-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    };

    if (loading) return html`
        <div class="flex justify-center p-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    `;

    return html`
        <section class="mt-12">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-slate-800">我的申請記錄</h2>
                <button onClick=${fetchUserForms} class="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="重新整理">
                    <${Icon} name="refresh" className="w-5 h-5" />
                </button>
            </div>

            ${forms.length === 0 ? html`
                <div class="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-50 text-slate-300 rounded-full mb-4">
                        <${Icon} name="file-text" className="w-8 h-8" />
                    </div>
                    <p class="text-slate-400 font-medium">尚無任何申請記錄</p>
                </div>
            ` : html`
                <div class="grid grid-cols-1 gap-4">
                    ${forms.map(f => html`
                        <div key=${f.id} onClick=${() => setSelectedForm(f)}
                            class="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    <${Icon} name="file-text" className="w-6 h-6" />
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">${f.displayType}</span>
                                        <span class="text-xs text-slate-400 font-medium">${f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '未知'}</span>
                                    </div>
                                    <h4 class="font-bold text-slate-800 group-hover:text-indigo-600 transition-all truncate max-w-[200px] md:max-w-[400px]">${f.reason}</h4>
                                </div>
                            </div>
                            <div class="flex items-center justify-between md:justify-end gap-6">
                                <div class="text-right">
                                    <p class="text-xs text-slate-400 font-bold mb-0.5 uppercase tracking-tighter">金額 (NTD)</p>
                                    <p class="font-black text-slate-800 tracking-tight">${(f.displayAmount || 0).toLocaleString()}</p>
                                </div>
                                <div class="w-24 text-center">
                                    <span class="inline-block px-3 py-1 ${getStatusStyle(f.status)} text-xs font-bold rounded-full w-full">
                                        ${f.status}
                                    </span>
                                </div>
                                <div class="hidden md:block group-hover:translate-x-1 transition-transform">
                                    <${Icon} name="chevron-right" className="w-5 h-5 text-slate-300" />
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            `}

            ${selectedForm && html`<${FormDetailModal} form=${selectedForm} onClose=${() => setSelectedForm(null)} />`}
        </section>
    `;
};

export default UserHistory;
