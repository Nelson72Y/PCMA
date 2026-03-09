import { h, useState, useEffect, html, Icon } from '../preact-utils.js';
import { db, storage } from '../firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const TransportationForm = ({ user, setCurrentPage }) => {
    const [uploading, setUploading] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setReceiptUrl(url);
            alert('附件上傳成功！');
        } catch (error) {
            console.error(error);
            alert('上傳失敗');
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus('正在存入資料庫...');
        try {
            const docRef = await addDoc(collection(db, "transportation_forms"), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.email?.split('@')[0],
                type: '交通費申請',
                reason: e.target.reason.value,
                date: e.target.date.value,
                location: e.target.location.value,
                amount: parseFloat(e.target.amount.value),
                attachmentUrl: receiptUrl,
                createdAt: new Date(),
                status: '已提交'
            });
            alert("送出成功！單據編號：" + docRef.id);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("儲存失敗：", error);
            setSubmitStatus('❌ 儲存失敗，請查看控制台');
        }
        setSubmitting(false);
    };

    return html`
        <div class="flex-1 max-w-4xl mx-auto p-4 md:p-8 w-full">
            <header class="flex items-center gap-4 mb-8">
                <button onClick=${() => setCurrentPage('dashboard')} class="p-2 hover:bg-slate-200 rounded-full transition-all flex-shrink-0">
                    <${Icon} name="chevron-right" className="w-6 h-6 rotate-180" />
                </button>
                <h1 class="text-3xl font-bold text-slate-800">交通費申請表</h1>
            </header>
            <form onSubmit=${handleSubmit} class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-500">洽公事由</label>
                        <input name="reason" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-500">日期</label>
                        <input name="date" type="date" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none" />
                    </div>
                    <div class="space-y-2 md:col-span-2">
                        <label class="text-sm font-bold text-slate-500">起迄地點</label>
                        <input name="location" required placeholder="例如：公司 -> 台北車站 -> 客戶辦公室" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-500">金額 (NTD)</label>
                        <input name="amount" type="number" min="0" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-500">單據附件 (選填)</label>
                        <label class="flex-1 cursor-pointer block">
                            <div class="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all">
                                <${Icon} name="upload-cloud" className="w-5 h-5" />
                                <span class="font-bold">${uploading ? '上傳中...' : (receiptUrl ? '✅ 已選取檔案' : '點擊上傳收據')}</span>
                            </div>
                            <input type="file" accept="image/*,application/pdf" onChange=${handleFileUpload} class="hidden" />
                        </label>
                    </div>
                </div>
                <div class="pt-6 flex flex-col items-center gap-4">
                    ${submitStatus && html`<p class="font-bold text-indigo-600">${submitStatus}</p>`}
                    <button type="submit" disabled=${submitting} class="w-full md:w-64 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        ${submitting ? '送出中...' : '提交申請單'}
                    </button>
                </div>
            </form>
        </div>
    `;
};

export default TransportationForm;
