import { h, useState, useEffect, html, Icon } from '../preact-utils.js';
import { db, storage } from '../firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const ExpenseClaimForm = ({ user, setCurrentPage }) => {
    const [items, setItems] = useState([{ date: '', description: '', amount: 0 }]);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [submitStatus, setSubmitStatus] = useState('');

    const addItem = () => setItems([...items, { date: '', description: '', amount: 0 }]);
    const removeItem = (idx) => { if (items.length > 1 && confirm('確定要刪除嗎?')) setItems(items.filter((_, i) => i !== idx)); };
    const updateItem = (idx, field, val) => {
        const newItems = [...items];
        newItems[idx][field] = (field === 'date' || field === 'description') ? val : (parseFloat(val) || 0);
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

    const grandTotal = items.reduce((sum, it) => sum + it.amount, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter(it => it.date !== '' && it.amount > 0);
        if (validItems.length === 0) return alert("請填寫有效的支出明細與金額");
        setSubmitting(true);
        try {
            await addDoc(collection(db, "expense_claim_forms"), {
                userId: user.uid,
                userEmail: user.email,
                reason: e.target.reason.value,
                items: validItems,
                totalAmount: grandTotal,
                attachmentUrl: attachmentUrl,
                createdAt: new Date(),
                status: '已提交'
            });
            alert("支出證明單送出成功！");
            setCurrentPage('dashboard');
        } catch (error) {
            console.error(error);
            setSubmitStatus('❌ 儲存失敗，請查看控制台');
        }
        setSubmitting(false);
    };

    const inputCls = "w-full p-2 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-fuchsia-300 rounded";

    return html`
        <div class="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
            <header class="flex items-center gap-4 mb-8">
                <button onClick=${() => setCurrentPage('dashboard')} class="p-2 hover:bg-slate-200 rounded-full transition-all flex-shrink-0">
                    <${Icon} name="chevron-right" className="w-6 h-6 rotate-180" />
                </button>
                <h1 class="text-3xl font-bold text-slate-800">支出證明單</h1>
            </header>
            <form onSubmit=${handleSubmit} class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-500">總體報支事由</label>
                    <input name="reason" required placeholder="例: 2026年3月份辦公用品採購" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300" />
                </div>
                <div class="overflow-x-auto rounded-2xl border border-slate-100">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-fuchsia-50 text-fuchsia-950">
                            <tr>
                                <th class="p-4 w-1/4">日期</th>
                                <th class="p-4 w-1/2">項目摘要</th>
                                <th class="p-4 w-1/4 text-right">金額</th>
                                <th class="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((it, idx) => html`
                                <tr key=${idx} class="border-b border-slate-50 hover:bg-fuchsia-50/30 transition-colors">
                                    <td class="p-1">
                                        <input type="date" value=${it.date} onChange=${e => updateItem(idx, 'date', e.target.value)} class=${inputCls} required />
                                    </td>
                                    <td class="p-1">
                                        <input placeholder="項次內容描述" value=${it.description} onChange=${e => updateItem(idx, 'description', e.target.value)} class=${inputCls} required />
                                    </td>
                                    <td class="p-1">
                                        <input type="number" min="0" value=${it.amount || ''} placeholder="0" onChange=${e => updateItem(idx, 'amount', e.target.value)} class="${inputCls} text-right font-bold" required />
                                    </td>
                                    <td class="p-1 text-center">
                                        <button type="button" onClick=${() => removeItem(idx)} class="p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all" title="刪除此列">
                                            <${Icon} name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
                <button type="button" onClick=${addItem} class="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-fuchsia-600 hover:border-fuchsia-300 hover:bg-fuchsia-50 transition-all flex items-center justify-center gap-2 font-bold">
                    <${Icon} name="plus" className="w-5 h-5" /> 新增一筆支出
                </button>

                <div class="pt-4 border-t border-slate-100">
                    <label class="text-sm font-bold text-slate-500 mb-2 block">單據附件 (選填)</label>
                    <label class="cursor-pointer block">
                        <div class="flex items-center justify-center gap-2 px-4 py-4 bg-fuchsia-50 text-fuchsia-600 border-2 border-dashed border-fuchsia-200 rounded-2xl hover:bg-fuchsia-100 transition-all">
                            <${Icon} name="upload-cloud" className="w-5 h-5" />
                            <span class="font-bold">${uploading ? '正在上傳附件...' : (attachmentUrl ? '✅ 附件已就緒' : '點擊上傳收據 (PDF/JPG)')}</span>
                        </div>
                        <input type="file" accept="image/*,application/pdf" onChange=${handleFileUpload} class="hidden" />
                    </label>
                </div>

                <div class="pt-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div class="text-center md:text-left">
                        <p class="text-slate-400 text-sm font-bold">證明單總額</p>
                        <h2 class="text-5xl font-black text-fuchsia-600 tracking-tight">${grandTotal.toLocaleString()}<span class="text-2xl ml-1 font-normal text-slate-400">NTD</span></h2>
                    </div>
                    <div class="flex flex-col items-center gap-3 w-full md:w-auto">
                        ${submitStatus && html`<p class="font-bold text-fuchsia-600 text-sm">${submitStatus}</p>`}
                        <button type="submit" disabled=${submitting} class="w-full md:w-72 py-5 bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-fuchsia-200 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none">
                            ${submitting ? '送出中...' : '確認並提交支出證明'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
};

export default ExpenseClaimForm;
