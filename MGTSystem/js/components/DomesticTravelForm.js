import { h, useState, useEffect, html, Icon } from '../preact-utils.js';
import { db, storage } from '../firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const DomesticTravelForm = ({ user, setCurrentPage }) => {
    const [items, setItems] = useState([{ date: '', plane: 0, train: 0, car: 0, toll: 0, dailyAllowance: 0, tax: 0, total: 0 }]);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [submitStatus, setSubmitStatus] = useState('');

    const addItem = () => setItems([...items, { date: '', plane: 0, train: 0, car: 0, toll: 0, dailyAllowance: 0, tax: 0, total: 0 }]);
    const removeItem = (idx) => { if (items.length > 1 && confirm('確定要刪除嗎?')) setItems(items.filter((_, i) => i !== idx)); };
    const updateItem = (idx, field, val) => {
        const newItems = [...items];
        const row = newItems[idx];
        row[field] = field === 'date' ? val : (parseFloat(val) || 0);
        if (field !== 'date') row.total = row.plane + row.train + row.car + row.toll + row.dailyAllowance + row.tax;
        setItems(newItems);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setAttachmentUrl(url);
            alert('附件上傳成功！');
        } catch (error) {
            console.error(error);
            alert('上傳失敗');
        }
        setUploading(false);
    };

    const grandTotal = items.reduce((sum, it) => sum + it.total, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter(it => it.date !== '');
        if (validItems.length === 0) return alert("請至少填寫一筆日期明細");
        setSubmitting(true);
        try {
            await addDoc(collection(db, "domestic_travel_forms"), {
                userId: user.uid,
                userEmail: user.email,
                reason: e.target.reason.value,
                destination: e.target.destination.value,
                items: validItems,
                totalAmount: grandTotal,
                attachmentUrl: attachmentUrl,
                createdAt: new Date(),
                status: '已提交'
            });
            alert("送出成功！");
            setCurrentPage('dashboard');
        } catch (error) {
            console.error(error);
            setSubmitStatus('❌ 儲存失敗，請查看控制台');
        }
        setSubmitting(false);
    };

    const inputCls = "w-full p-2 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded";

    return html`
        <div class="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
            <header class="flex items-center gap-4 mb-8">
                <button onClick=${() => setCurrentPage('dashboard')} class="p-2 hover:bg-slate-200 rounded-full transition-all flex-shrink-0">
                    <${Icon} name="chevron-right" className="w-6 h-6 rotate-180" />
                </button>
                <h1 class="text-3xl font-bold text-slate-800">國內差旅費申請表</h1>
            </header>
            <form onSubmit=${handleSubmit} class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-500">洽公事由</label>
                        <input name="reason" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-500">起迄地點</label>
                        <input name="destination" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                </div>
                <div class="overflow-x-auto rounded-2xl border border-slate-100">
                    <table class="w-full text-left text-sm border-collapse min-w-[700px]">
                        <thead class="bg-indigo-50 text-indigo-950">
                            <tr>
                                <th class="p-3">日期</th>
                                <th class="p-3">飛機</th>
                                <th class="p-3">火車</th>
                                <th class="p-3">汽車</th>
                                <th class="p-3">過路費</th>
                                <th class="p-3">日支費</th>
                                <th class="p-3">營業稅</th>
                                <th class="p-3">小計</th>
                                <th class="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((it, idx) => html`
                                <tr key=${idx} class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td class="p-1"><input type="date" value=${it.date} onChange=${e => updateItem(idx, 'date', e.target.value)} class=${inputCls} required /></td>
                                    <td class="p-1"><input type="number" min="0" value=${it.plane || ''} placeholder="0" onChange=${e => updateItem(idx, 'plane', e.target.value)} class=${inputCls} /></td>
                                    <td class="p-1"><input type="number" min="0" value=${it.train || ''} placeholder="0" onChange=${e => updateItem(idx, 'train', e.target.value)} class=${inputCls} /></td>
                                    <td class="p-1"><input type="number" min="0" value=${it.car || ''} placeholder="0" onChange=${e => updateItem(idx, 'car', e.target.value)} class=${inputCls} /></td>
                                    <td class="p-1"><input type="number" min="0" value=${it.toll || ''} placeholder="0" onChange=${e => updateItem(idx, 'toll', e.target.value)} class=${inputCls} /></td>
                                    <td class="p-1"><input type="number" min="0" value=${it.dailyAllowance || ''} placeholder="0" onChange=${e => updateItem(idx, 'dailyAllowance', e.target.value)} class=${inputCls} /></td>
                                    <td class="p-1"><input type="number" min="0" value=${it.tax || ''} placeholder="0" onChange=${e => updateItem(idx, 'tax', e.target.value)} class=${inputCls} /></td>
                                    <td class="p-3 font-bold text-indigo-700 whitespace-nowrap">${it.total.toLocaleString()}</td>
                                    <td class="p-1 text-center">
                                        <button type="button" onClick=${() => removeItem(idx)} class="p-1.5 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="刪除此列">
                                            <${Icon} name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
                <button type="button" onClick=${addItem} class="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                    <${Icon} name="plus" className="w-5 h-5" /> 新增明細
                </button>

                <div class="pt-4 border-t border-slate-100">
                    <label class="text-sm font-bold text-slate-500 mb-2 block">單據附件 (選填)</label>
                    <label class="cursor-pointer block">
                        <div class="flex items-center justify-center gap-2 px-4 py-4 bg-indigo-50 text-indigo-600 border-2 border-dashed border-indigo-200 rounded-2xl hover:bg-indigo-100 transition-all">
                            <${Icon} name="upload-cloud" className="w-5 h-5" />
                            <span class="font-bold">${uploading ? '正在上傳附件...' : (attachmentUrl ? '✅ 附件上傳成功' : '點擊上傳所有相關收據 (PDF/JPG)')}</span>
                        </div>
                        <input type="file" accept="image/*,application/pdf" onChange=${handleFileUpload} class="hidden" />
                    </label>
                </div>

                <div class="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                    <div>
                        <p class="text-slate-400 text-sm">合計金額</p>
                        <h2 class="text-4xl font-black text-indigo-600">${grandTotal.toLocaleString()} <span class="text-lg font-normal text-slate-400">NTD</span></h2>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        ${submitStatus && html`<p class="font-bold text-red-500 text-sm">${submitStatus}</p>`}
                        <button type="submit" disabled=${submitting} class="w-full md:w-64 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50">
                            ${submitting ? '送出中...' : '提交申請'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
};

export default DomesticTravelForm;
