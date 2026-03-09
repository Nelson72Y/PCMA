import { h, render, useState, useEffect, html, Icon } from './preact-utils.js';
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Import Form Components
import TransportationForm from './components/TransportationForm.js';
import DomesticTravelForm from './components/DomesticTravelForm.js';
import InternationalTravelForm from './components/InternationalTravelForm.js';
import ExpenseClaimForm from './components/ExpenseClaimForm.js';
import AdminDashboard from './components/AdminDashboard.js';
import UserHistory from './components/UserHistory.js';

const Sidebar = ({ currentPage, setCurrentPage, handleLogout }) => html`
    <aside class="w-full md:w-64 bg-indigo-950 text-white p-6 space-y-8 md:min-h-screen flex-shrink-0">
        <h1 class="text-xl font-bold text-blue-300">TMVC E-Office</h1>
        <nav class="space-y-2">
            <button onClick=${() => setCurrentPage('dashboard')}
                class="w-full flex items-center gap-3 px-4 py-3 ${currentPage === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'} rounded-xl transition-all">
                <${Icon} name="layout-dashboard" className="w-5 h-5 flex-shrink-0" /> 控制台
            </button>
            <button onClick=${() => setCurrentPage('admin-dashboard')}
                class="w-full flex items-center gap-3 px-4 py-3 ${currentPage === 'admin-dashboard' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'} rounded-xl transition-all">
                <${Icon} name="users" className="w-5 h-5 flex-shrink-0" /> 管理員後台
            </button>
            <button onClick=${handleLogout}
                class="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-xl mt-10 transition-all">
                <${Icon} name="log-out" className="w-5 h-5 flex-shrink-0" /> 登出系統
            </button>
        </nav>
    </aside>
`;

const DashboardView = ({ user, setCurrentPage }) => {
    console.log("Rendering DashboardView for user:", user?.email);
    return html`
        <main class="flex-1 p-6 md:p-10 bg-slate-50 overflow-auto">
            <div class="mb-10">
                <h1 class="text-3xl font-bold">歡迎，<span class="text-indigo-600">${user?.email?.split('@')[0]}</span></h1>
                <p class="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest">TMVC Electronic Office System</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div onClick=${() => setCurrentPage('transport-form')}
                    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group">
                    <div class="w-12 h-12 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-all">
                        <${Icon} name="file-text" className="w-6 h-6" />
                    </div>
                    <h3 class="font-bold text-lg">交通費申請</h3>
                    <p class="text-xs text-slate-400 mt-1">日常洽公報銷</p>
                </div>
                <div onClick=${() => setCurrentPage('domestic-travel-form')}
                    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group">
                    <div class="w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-all">
                        <${Icon} name="file-text" className="w-6 h-6" />
                    </div>
                    <h3 class="font-bold text-lg">國內差旅</h3>
                    <p class="text-xs text-slate-400 mt-1">跨縣市出差</p>
                </div>
                <div onClick=${() => setCurrentPage('international-travel-form')}
                    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                    <div class="w-12 h-12 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-all">
                        <${Icon} name="file-text" className="w-6 h-6" />
                    </div>
                    <h3 class="font-bold text-lg">國外出差</h3>
                    <p class="text-xs text-slate-400 mt-1">包含幣別換算</p>
                </div>
                <div onClick=${() => setCurrentPage('expense-claim-form')}
                    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-fuchsia-400 hover:shadow-md transition-all cursor-pointer group">
                    <div class="w-12 h-12 bg-fuchsia-50 rounded-xl text-fuchsia-600 flex items-center justify-center mb-4 group-hover:bg-fuchsia-100 transition-all">
                        <${Icon} name="file-text" className="w-6 h-6" />
                    </div>
                    <h3 class="font-bold text-lg">支出證明單</h3>
                    <p class="text-xs text-slate-400 mt-1">辦公用品支出</p>
                </div>
            </div>

            <div class="border-t border-slate-200 pt-10">
                <${UserHistory} user=${user} />
            </div>
        </main>
    `;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            console.log("Auth State Changed:", u?.email || "No User");
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
        } catch (err) {
            console.error("Login Error:", err);
            setLoginError('登入失敗，請確認帳號密碼');
        }
    };

    const handleLogout = () => signOut(auth);

    if (loading) return html`
        <div class="flex items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>`;

    if (!user) return html`
        <div class="flex items-center justify-center min-h-screen bg-indigo-900 px-4">
            <div class="w-full max-w-md bg-white/10 p-8 rounded-3xl shadow-2xl glass-morphism text-center">
                <h1 class="text-3xl font-bold text-white mb-6">TMVC E-Office</h1>
                <form onSubmit=${handleLogin} class="space-y-4">
                    <input name="email" type="email" required placeholder="Email" class="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/50 outline-none focus:border-white/60" />
                    <input name="password" type="password" required placeholder="Password" class="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/50 outline-none focus:border-white/60" />
                    ${loginError && html`<p class="text-red-300 italic text-sm">${loginError}</p>`}
                    <button type="submit" class="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all">登入系統</button>
                </form>
            </div>
        </div>
    `;

    const renderPage = () => {
        console.log("Current Page:", currentPage);
        switch (currentPage) {
            case 'dashboard': return html`<${DashboardView} user=${user} setCurrentPage=${setCurrentPage} />`;
            case 'transport-form': return html`<${TransportationForm} user=${user} setCurrentPage=${setCurrentPage} />`;
            case 'domestic-travel-form': return html`<${DomesticTravelForm} user=${user} setCurrentPage=${setCurrentPage} />`;
            case 'international-travel-form': return html`<${InternationalTravelForm} user=${user} setCurrentPage=${setCurrentPage} />`;
            case 'expense-claim-form': return html`<${ExpenseClaimForm} user=${user} setCurrentPage=${setCurrentPage} />`;
            case 'admin-dashboard': return html`<${AdminDashboard} user=${user} setCurrentPage=${setCurrentPage} />`;
            default: return html`<${DashboardView} user=${user} setCurrentPage=${setCurrentPage} />`;
        }
    };

    return html`
        <div class="flex flex-col md:flex-row min-h-screen">
            <${Sidebar} currentPage=${currentPage} setCurrentPage=${setCurrentPage} handleLogout=${handleLogout} />
            ${renderPage()}
        </div>
    `;
}

console.log("Initializing App...");
render(html`<${App} />`, document.getElementById('app'));
