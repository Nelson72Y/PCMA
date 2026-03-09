import { h, html, Icon } from '../preact-utils.js';

const FormDetailModal = ({ form, onClose }) => {
    if (!form) return null;

    const renderItems = () => {
        if (!form.items) return null;

        const isDomestic = form.collection === "domestic_travel_forms";
        const isInternational = form.collection === "international_travel_forms";
        const isExpense = form.collection === "expense_claim_forms";

        return html`
            <div class="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="p-3 border-b">日期</th>
                            <th class="p-3 border-b">${isDomestic ? '項目' : '細項'}</th>
                            ${isDomestic && html`
                                <th class="p-3 border-b text-right">飛機</th>
                                <th class="p-3 border-b text-right">火車</th>
                                <th class="p-3 border-b text-right">汽車</th>
                                <th class="p-3 border-b text-right">過路費</th>
                                <th class="p-3 border-b text-right">日支費</th>
                                <th class="p-3 border-b text-right">稅額</th>
                            `}
                            ${isInternational && html`
                                <th class="p-3 border-b">幣別</th>
                                <th class="p-3 border-b text-right">外幣</th>
                                <th class="p-3 border-b text-right">匯率</th>
                            `}
                            <th class="p-3 border-b text-right">小計 (NTD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${form.items.map((it, idx) => html`
                            <tr key=${idx}>
                                <td class="p-3 border-b">${it.date}</td>
                                <td class="p-3 border-b">${it.description || (isDomestic ? '差旅費' : '-')}</td>
                                ${isDomestic && html`
                                    <td class="p-3 border-b text-right">${it.plane?.toLocaleString()}</td>
                                    <td class="p-3 border-b text-right">${it.train?.toLocaleString()}</td>
                                    <td class="p-3 border-b text-right">${it.car?.toLocaleString()}</td>
                                    <td class="p-3 border-b text-right">${it.toll?.toLocaleString()}</td>
                                    <td class="p-3 border-b text-right">${it.dailyAllowance?.toLocaleString()}</td>
                                    <td class="p-3 border-b text-right">${it.tax?.toLocaleString()}</td>
                                `}
                                ${isInternational && html`
                                    <td class="p-3 border-b">${it.currency}</td>
                                    <td class="p-3 border-b text-right">${it.amount?.toLocaleString()}</td>
                                    <td class="p-3 border-b text-right">${it.rate}</td>
                                `}
                                <td class="p-3 border-b text-right font-bold text-indigo-600">${(it.total || it.subtotal || it.amount || 0).toLocaleString()}</td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        `;
    };

    return html`
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick=${onClose}></div>
            
            <!-- Modal Content -->
            <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <header class="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mr-2">${form.displayType}</span>
                        <h2 class="text-xl font-bold text-slate-800 inline-block">單據明細詳情</h2>
                    </div>
                    <button onClick=${onClose} class="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400">
                        <${Icon} name="plus" className="w-6 h-6 rotate-45" />
                    </button>
                </header>

                <div class="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                    <!-- General Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">申請人</p>
                            <p class="text-slate-800 font-medium">${form.userEmail}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">提交日期</p>
                            <p class="text-slate-800 font-medium">
                                ${form.createdAt?.toDate ? form.createdAt.toDate().toLocaleString() : '未知'}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">目前狀態</p>
                            <span class="inline-block mt-1 px-3 py-0.5 ${form.status === '核准' ? 'bg-emerald-100 text-emerald-700' : form.status === '駁回' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} text-xs font-bold rounded-full">
                                ${form.status || '待審核'}
                            </span>
                        </div>
                        <div class="md:col-span-2 lg:col-span-3 h-px bg-slate-100"></div>
                        <div class="md:col-span-2 lg:col-span-2">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">洽公事由</p>
                            <p class="text-slate-800 mt-1 font-medium text-lg leading-relaxed">${form.reason}</p>
                        </div>
                        ${(form.location || form.destination) && html`
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">地點 / 目的地</p>
                                <p class="text-indigo-600 font-bold text-lg mt-1">${form.location || form.destination}</p>
                            </div>
                        `}
                    </div>

                    <!-- Items / Table -->
                    ${renderItems()}

                    <!-- Attachments -->
                    ${form.attachmentUrl && html`
                        <div class="pt-6">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">單據附件</p>
                            <a href=${form.attachmentUrl} target="_blank" class="inline-flex items-center gap-2 p-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl hover:bg-indigo-100 transition-all group">
                                <${Icon} name="file-text" className="w-6 h-6" />
                                <span class="font-bold">檢視附件檔案</span>
                            </a>
                        </div>
                    `}
                </div>

                <footer class="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <div>
                            <p class="text-xs font-bold text-slate-400">總金額 (NTD)</p>
                            <p class="text-3xl font-black text-indigo-600 tracking-tight">${form.displayAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    `;
};

export default FormDetailModal;
