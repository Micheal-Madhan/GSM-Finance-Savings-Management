
import React, { useState, useEffect, useCallback } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation,
  Link 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  PiggyBank, 
  Gift, 
  Coins, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Plus, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Languages,
  Settings,
  User as UserIcon
} from 'lucide-react';
import { LoginUser, SchemeUser, UserRole, Language, SchemeType, PaymentRecord, SchemeSettings } from './types';
import { TRANSLATIONS, INITIAL_ADMIN } from './constants';

// --- Utility Components ---

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled }) => {
  const base = "px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 text-sm";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Input: React.FC<{
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  error?: string;
  maxLength?: number;
  readOnly?: boolean;
  labelColor?: string;
}> = ({ label, type = 'text', value, onChange, placeholder, required, className = '', icon, error, maxLength, readOnly, labelColor = 'text-slate-500' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>{label}{required && <span className="text-rose-500 ml-1">*</span>}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        readOnly={readOnly}
        className={`w-full border rounded-xl px-4 py-3 text-sm ${icon ? 'pl-11' : ''} ${error ? 'border-rose-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all ${readOnly ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white text-slate-900 placeholder:text-slate-300 font-medium'}`}
      />
    </div>
    {error && <p className="text-[10px] text-rose-500 font-medium mt-1 ml-1">{error}</p>}
  </div>
);

const Notification: React.FC<{
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-slide-up glass-card border-none ${type === 'success' ? 'bg-white text-emerald-600' : 'bg-white text-rose-600'}`}>
      <div className={`p-2 rounded-lg ${type === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
        {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>
      <span className="font-semibold text-sm">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md ml-2"><X className="w-4 h-4" /></button>
    </div>
  );
};

// --- Context / State Helpers ---

const validatePhone = (phone: string) => /^\d{10}$/.test(phone);

const useData = () => {
  const [loginUsers, setLoginUsers] = useState<LoginUser[]>(() => {
    const saved = localStorage.getItem('gsm_login_users');
    if (saved) return JSON.parse(saved);
    return [{ id: '0', name: 'System Admin', username: INITIAL_ADMIN.username, password: INITIAL_ADMIN.password, role: 'Admin', phone: '0000000000', address: 'System', createdAt: new Date().toISOString() }];
  });
  const [schemeUsers, setSchemeUsers] = useState<SchemeUser[]>(() => {
    const saved = localStorage.getItem('gsm_scheme_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [schemeSettings, setSchemeSettings] = useState<SchemeSettings>(() => {
    const saved = localStorage.getItem('gsm_scheme_settings');
    return saved ? JSON.parse(saved) : { KHSS: 1000, DSS: 2000, Finance: 5000 };
  });
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(() => {
    const saved = sessionStorage.getItem('gsm_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('gsm_lang') as Language) || 'en');

  useEffect(() => localStorage.setItem('gsm_login_users', JSON.stringify(loginUsers)), [loginUsers]);
  useEffect(() => localStorage.setItem('gsm_scheme_users', JSON.stringify(schemeUsers)), [schemeUsers]);
  useEffect(() => localStorage.setItem('gsm_scheme_settings', JSON.stringify(schemeSettings)), [schemeSettings]);
  useEffect(() => currentUser ? sessionStorage.setItem('gsm_current_user', JSON.stringify(currentUser)) : sessionStorage.removeItem('gsm_current_user'), [currentUser]);
  useEffect(() => localStorage.setItem('gsm_lang', lang), [lang]);

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  return { loginUsers, setLoginUsers, schemeUsers, setSchemeUsers, schemeSettings, setSchemeSettings, currentUser, setCurrentUser, lang, setLang, t };
};

// --- View Components ---

import { supabase } from './supabaseClient';
const LoginPage = ({ data }: { data: any }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Query Supabase Users_Table for username and password match
      const { data: users, error: supaError } = await supabase
        .from('Users_Table')
        .select('*')
        .eq('Username', username)
        .eq('Password', password)
        .single();
      if (supaError || !users) {
        setError(data.lang === 'ta' ? 'தவறான விவரங்கள்' : 'Invalid credentials');
      } else {
        data.setCurrentUser(users);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(data.lang === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${data.lang === 'ta' ? 'font-tamil' : ''}`}>
      <div className="w-full max-w-sm glass-card p-8 space-y-8 animate-slide-up">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg mb-6 tracking-tighter">GSM</div>
          <h1 className="text-2xl font-bold text-slate-900">{data.t('login')}</h1>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Enterprise Finance</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input label={data.t('username')} value={username} onChange={e => setUsername(e.target.value)} placeholder={data.lang === 'ta' ? 'பயனர் ஐடி' : 'Identity ID'} required icon={<UserIcon className="w-4 h-4" />} />
          <Input label={data.t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={data.lang === 'ta' ? 'கடவுச்சொல்' : 'Security Key'} required icon={<ShieldCheck className="w-4 h-4" />} />
          {error && <p className="text-[10px] font-bold text-rose-500 text-center py-2 bg-rose-50 rounded-lg">{error}</p>}
          <Button type="submit" className="w-full py-3" disabled={loading}> {loading ? (data.lang === 'ta' ? 'சரிபார்க்கிறது...' : 'Checking...') : data.t('login')} </Button>
        </form>
        <div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-100 text-xs">
          <Link to="/forgot-password" title="Demo purpose only" className="text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-widest text-[9px]">{data.t('forgotPassword')}</Link>
          <p className="text-slate-500">{data.lang === 'ta' ? 'கணக்கு இல்லையா?' : 'New operator?'} <Link to="/register" className="text-slate-900 font-bold hover:underline decoration-indigo-600">{data.t('register')}</Link></p>
        </div>
        <div className="flex justify-center">
           <button onClick={() => data.setLang(data.lang === 'en' ? 'ta' : 'en')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase border border-slate-200 px-4 py-1.5 rounded-full">
             <Languages className="w-3.5 h-3.5" /> <span>{data.lang === 'en' ? 'தமிழ்' : 'English'}</span>
           </button>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({ data }: { data: any }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '', role: 'Basic' as UserRole, password: '' });
  const [phoneError, setPhoneError] = useState('');
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) { setPhoneError(data.t('invalidPhone')); return; }
    const newUser: LoginUser = { id: Date.now().toString(), name: formData.name, username: formData.username.toLowerCase().trim(), email: formData.email, phone: formData.phone, role: formData.role, password: formData.password, address: '', createdAt: new Date().toISOString() };
    data.setLoginUsers([...data.loginUsers, newUser]);
    alert(data.lang === 'ta' ? 'பதிவு முடிந்தது.' : 'Success.');
    navigate('/');
  };
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${data.lang === 'ta' ? 'font-tamil' : ''}`}>
      <div className="w-full max-w-md glass-card p-8 space-y-6 animate-slide-up">
        <h1 className="text-xl font-bold text-center text-slate-900">{data.lang === 'ta' ? 'புதிய பதிவு' : 'New Registration'}</h1>
        <form onSubmit={handleRegister} className="grid grid-cols-1 gap-4">
          <Input label={data.t('name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder={data.lang === 'ta' ? 'முழு பெயர்' : 'Full Name'} />
          <Input label={data.t('username')} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder={data.lang === 'ta' ? 'பயனர் ஐடி' : 'Username'} required />
          <Input label={data.t('phone')} value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setPhoneError('');}} required error={phoneError} maxLength={10} placeholder={data.lang === 'ta' ? 'தொலைபேசி' : 'Phone'} />
          <Input label={data.t('password')} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder={data.lang === 'ta' ? 'கடவுச்சொல்' : 'Password'} />
          <div className="pt-4 flex gap-3">
             <Button type="submit" className="flex-1"> {data.t('register')} </Button>
             <Button variant="ghost" onClick={() => navigate('/')} className="flex-1"> {data.t('cancel')} </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Layout = ({ data, children }: { data: any, children?: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { data.setCurrentUser(null); navigate('/'); };
  const menuItems = [
    { label: data.t('dashboard'), icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Basic'] },
    { label: data.t('khss'), icon: PiggyBank, path: '/khss', roles: ['Admin', 'Basic'] },
    { label: data.t('dss'), icon: Gift, path: '/dss', roles: ['Admin', 'Basic'] },
    { label: data.t('finance'), icon: Coins, path: '/finance', roles: ['Admin', 'Basic'] },
    { label: data.t('addUser'), icon: UserPlus, path: '/add-user', roles: ['Admin'] },
    { label: data.t('addLoginUser'), icon: ShieldCheck, path: '/add-login-user', roles: ['Admin'] },
    { label: data.t('userDetails'), icon: Users, path: '/user-details', roles: ['Admin'] },
    { label: data.t('schemeSettings'), icon: Settings, path: '/settings', roles: ['Admin'] },
  ];
  const activeUser = data.currentUser;
  // Use UserType from Supabase response if available, fallback to local role
  const userType = activeUser?.UserType || activeUser?.role;
  const filteredMenu = menuItems.filter(item => item.roles.includes(userType));

  return (
    <div className={`min-h-screen flex ${data.lang === 'ta' ? 'font-tamil' : ''}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-64 glass-card border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 rounded-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-14 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs tracking-tighter">GSM</div>
            <span className="font-bold text-lg text-slate-900">Finance</span>
            <button className="lg:hidden p-1 text-slate-400 ml-auto" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1">
            {filteredMenu.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`} >
                <item.icon className="w-4.5 h-4.5" /> <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-slate-100 space-y-4">
             <div className="px-4 py-3 bg-slate-50 rounded-xl flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold"> {(activeUser?.name || activeUser?.Name || '').charAt(0)} </div>
                 <div className="flex-1 overflow-hidden">
                   <p className="text-xs font-bold text-slate-900 truncate">{activeUser?.name || activeUser?.Name}</p>
                   <p className="text-[10px] text-slate-500">{userType === 'Admin' ? data.t('admin') : data.t('basic')}</p>
                 </div>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-lg" >
               <LogOut className="w-4 h-4" /> <span>{data.t('logout')}</span>
             </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col z-10">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden p-1 text-slate-900" onClick={() => setSidebarOpen(true)}><Menu className="w-7 h-7" /></button>
          <h2 className="text-lg font-bold text-slate-900 hidden sm:block"> {menuItems.find(i => i.path === location.pathname)?.label || data.t('dashboard')} </h2>
          <button onClick={() => data.setLang(data.lang === 'en' ? 'ta' : 'en')} className="px-3 py-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-bold uppercase" >
            {data.lang === 'en' ? 'Tamil' : 'English'}
          </button>
        </header>
        <div className="p-6 max-w-6xl mx-auto w-full"> {children} </div>
      </main>
    </div>
  );
};

const DashboardView = ({ data }: { data: any }) => {
  const stats = [
    { label: data.t('khss'), value: data.schemeUsers.filter((u: any) => u.schemeType === 'KHSS').length, icon: PiggyBank, color: 'bg-indigo-500', path: '/khss' },
    { label: data.t('dss'), value: data.schemeUsers.filter((u: any) => u.schemeType === 'DSS').length, icon: Gift, color: 'bg-pink-500', path: '/dss' },
    { label: data.t('finance'), value: data.schemeUsers.filter((u: any) => u.schemeType === 'Finance').length, icon: Coins, color: 'bg-cyan-500', path: '/finance' },
    { label: data.t('userDetails'), value: data.loginUsers.length, icon: Users, color: 'bg-blue-500', path: '/user-details' },
  ];
  return (
    <div className="space-y-8 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.path} className="glass-card p-5 border border-white hover:-translate-y-1 group">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>
      <div className="glass-card p-6 border border-white">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-900">{data.lang === 'ta' ? 'சமீபத்திய பரிவர்த்தனைகள்' : 'Recent Transactions'}</h3>
           <Link to="/user-details" className="text-xs font-bold text-indigo-600 hover:underline">{data.lang === 'ta' ? 'அனைத்தும்' : 'View All'}</Link>
         </div>
         <div className="space-y-3">
           {data.schemeUsers.length > 0 ? data.schemeUsers.slice(-5).reverse().map((user: any) => (
             <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm"> {user.name.charAt(0)} </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.id} • {user.schemeType}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="font-bold text-slate-900 text-base">₹{user.paidAmount.toLocaleString()}</p>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase">{data.lang === 'ta' ? 'உறுதி செய்யப்பட்டது' : 'Authorized'}</p>
               </div>
             </div>
           )) : <div className="py-10 text-center text-slate-400 text-sm font-medium"> {data.t('noUsersFound')} </div>}
         </div>
      </div>
    </div>
  );
};

const SettingsView = ({ data }: { data: any }) => {
  const [localSettings, setLocalSettings] = useState<SchemeSettings>({ ...data.schemeSettings });
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); data.setSchemeSettings(localSettings); setNotification({ message: data.lang === 'ta' ? 'அமைப்புகள் சேமிக்கப்பட்டன.' : 'Settings saved.', type: 'success' }); };
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up">
       {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
       <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3"> <Settings className="w-6 h-6 text-indigo-600" /> {data.t('schemeSettings')} </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <Input label={data.t('khss') + " (₹)"} type="number" value={localSettings.KHSS} onChange={e => setLocalSettings({...localSettings, KHSS: parseFloat(e.target.value) || 0})} />
            <Input label={data.t('dss') + " (₹)"} type="number" value={localSettings.DSS} onChange={e => setLocalSettings({...localSettings, DSS: parseFloat(e.target.value) || 0})} />
            <Input label={data.t('finance') + " (₹)"} type="number" value={localSettings.Finance} onChange={e => setLocalSettings({...localSettings, Finance: parseFloat(e.target.value) || 0})} />
            <Button type="submit" className="w-full py-3 text-base"> {data.t('save')} </Button>
          </form>
       </div>
    </div>
  );
};

const SchemeView = ({ data, type }: { data: any, type: SchemeType }) => {
        // Reset selectedUser when type (menu) changes
        useEffect(() => {
          setSelectedUser(null);
        }, [type]);
      // For KHSS/DSS: store transaction info for selected user
      const [khssTransaction, setKhssTransaction] = useState<{ AmountPaid: number, BalanceAmount: number } | null>(null);
      const [dssTransaction, setDssTransaction] = useState<{ AmountPaid: number, BalanceAmount: number } | null>(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<SchemeUser | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDateInput, setPaymentDateInput] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [dssUsers, setDssUsers] = useState<any[]>([]);
  const [khssUsers, setKhssUsers] = useState<any[]>([]);

  // Fetch DSS and KHSS users from Supabase when their view is opened
  useEffect(() => {
    const fetchSchemeUsers = async () => {
      if (type === 'DSS') {
        const { data: users, error } = await supabase
          .from('Diwali_Scheme_Table')
          .select('*');
        if (!error && users) {
          setDssUsers(users);
        } else {
          setNotification({ message: 'Failed to fetch DSS users', type: 'error' });
        }
      } else if (type === 'KHSS') {
        const { data: users, error } = await supabase
          .from('KolliHills_Scheme_Table')
          .select('*');
        if (!error && users) {
          setKhssUsers(users);
        } else {
          setNotification({ message: 'Failed to fetch KHSS users', type: 'error' });
        }
      }
    };
    fetchSchemeUsers();
  }, [type]);

  // When a KHSS or DSS user is selected, fetch their latest transaction for AmountPaid/BalanceAmount
  useEffect(() => {
    const fetchTransaction = async () => {
      if (type === 'KHSS' && selectedUser && selectedUser.KHSS_ID) {
        const { data: txs, error } = await supabase
          .from('Transactions_Table')
          .select('AmountPaid,BalanceAmount,PaymentDate')
          .eq('SchemeType', 'KolliHills')
          .eq('SchemeRefID', selectedUser.KHSS_ID)
          .order('PaymentDate', { ascending: true });
        if (!error && txs && txs.length > 0) {
          // Sum all AmountPaid, get latest BalanceAmount
          const totalPaid = txs.reduce((sum, t) => sum + (t.AmountPaid || 0), 0);
          const latestBalance = txs[txs.length - 1].BalanceAmount;
          setKhssTransaction({ AmountPaid: totalPaid, BalanceAmount: latestBalance });
        } else {
          setKhssTransaction(null);
        }
      } else {
        setKhssTransaction(null);
      }
      if (type === 'DSS' && selectedUser && selectedUser.DSS_ID) {
        const { data: txs, error } = await supabase
          .from('Transactions_Table')
          .select('AmountPaid,BalanceAmount,PaymentDate')
          .eq('SchemeType', 'Diwali')
          .eq('SchemeRefID', selectedUser.DSS_ID)
          .order('PaymentDate', { ascending: true });
        if (!error && txs && txs.length > 0) {
          const totalPaid = txs.reduce((sum, t) => sum + (t.AmountPaid || 0), 0);
          const latestBalance = txs[txs.length - 1].BalanceAmount;
          setDssTransaction({ AmountPaid: totalPaid, BalanceAmount: latestBalance });
        } else {
          setDssTransaction(null);
        }
      } else {
        setDssTransaction(null);
      }
    };
    fetchTransaction();
  }, [type, selectedUser]);

  // Use Supabase for KHSS/DSS, local state for Finance
  let searchResults: any[] = [];
  if (type === 'DSS') {
    searchResults = dssUsers.filter((u: any) => (u.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.DSS_ID || '').toLowerCase().includes(searchTerm.toLowerCase()));
  } else if (type === 'KHSS') {
    searchResults = khssUsers.filter((u: any) => (u.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.KHSS_ID || '').toLowerCase().includes(searchTerm.toLowerCase()));
  } else {
    searchResults = data.schemeUsers.filter((u: any) => u.schemeType === type && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase())));
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) { setNotification({ message: data.lang === 'ta' ? 'தவறான தொகை.' : 'Invalid amount.', type: 'error' }); return; }
    const updatedUser: SchemeUser = { ...selectedUser, paidAmount: selectedUser.paidAmount + amount, paymentHistory: [...selectedUser.paymentHistory, { id: Date.now().toString(), amount, date: new Date().toISOString() }] };
    data.setSchemeUsers(data.schemeUsers.map((u: any) => u.id === selectedUser.id ? updatedUser : u));
    setNotification({ message: data.lang === 'ta' ? 'பணம் பெறப்பட்டது.' : 'Payment received.', type: 'success' });
    setSelectedUser(null); setPaymentAmount(''); setSearchTerm('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      {!selectedUser ? (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">{data.t(type.toLowerCase())}</h3>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input type="text" placeholder={data.t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.length > 0 ? searchResults.map((user: any) => (
              <button
                key={type === 'DSS' ? user.DSS_ID : type === 'KHSS' ? user.KHSS_ID : user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 border border-slate-100 group shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {(type === 'DSS' ? user.CustomerName : type === 'KHSS' ? user.CustomerName : user.name)?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">{type === 'DSS' ? user.CustomerName : type === 'KHSS' ? user.CustomerName : user.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{type === 'DSS' ? user.DSS_ID : type === 'KHSS' ? user.KHSS_ID : user.id}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform w-5 h-5" />
              </button>
            )) : <div className="col-span-2 py-20 text-center text-slate-400 text-sm"> {data.t('noUsersFound')} </div>}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedUser(null)}>
            <ChevronRight className="rotate-180 w-4 h-4" /> {data.t('back')}
          </Button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-6 space-y-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-600 text-white rounded-2xl mx-auto flex items-center justify-center text-4xl font-black mb-4">
                  {(type === 'DSS' ? selectedUser.CustomerName : type === 'KHSS' ? selectedUser.CustomerName : selectedUser.name)?.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{type === 'DSS' ? selectedUser.CustomerName : type === 'KHSS' ? selectedUser.CustomerName : selectedUser.name}</h3>
                <p className="text-indigo-600 font-mono text-xs font-bold mt-1">{type === 'DSS' ? selectedUser.DSS_ID : type === 'KHSS' ? selectedUser.KHSS_ID : selectedUser.id}</p>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">{data.t('phone')}</span>
                  <span className="font-bold">{type === 'DSS' ? selectedUser.PhoneNumber : type === 'KHSS' ? selectedUser.PhoneNumber : selectedUser.phone}</span>
                </div>
                <div className="flex justify-between gap-4 text-right">
                  <span className="text-slate-400 font-semibold">{data.t('address')}</span>
                  <span className="font-bold truncate max-w-[120px]">{type === 'DSS' ? selectedUser.Address : type === 'KHSS' ? selectedUser.Address : selectedUser.address || '—'}</span>
                </div>
                {type === 'DSS' && (
                  <div className="flex justify-between gap-4 text-right">
                    <span className="text-slate-400 font-semibold">{data.t('itemSelection')}</span>
                    <span className="font-bold truncate max-w-[120px]">{selectedUser.ItemSelection || '—'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between min-h-[400px]">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">{data.t('totalAmount')}</p>
                  <p className="text-lg font-bold text-slate-900">₹{(type === 'DSS' ? selectedUser.TotalAmount : type === 'KHSS' ? selectedUser.TotalAmount : selectedUser.totalAmount)?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <p className="text-[9px] text-emerald-600 font-bold uppercase mb-2">{data.t('paidAmount')}</p>
                  <p className="text-lg font-bold text-emerald-600">
                    ₹{
                      type === 'DSS'
                        ? (dssTransaction ? dssTransaction.AmountPaid : (selectedUser.PaidAmount || 0))
                        : type === 'KHSS'
                          ? (khssTransaction ? khssTransaction.AmountPaid : (selectedUser.PaidAmount || 0))
                          : selectedUser.paidAmount
                    }
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl text-center">
                  <p className="text-[9px] text-rose-600 font-bold uppercase mb-2">{data.t('balance')}</p>
                  <p className="text-lg font-bold text-rose-600">
                    ₹{
                      type === 'DSS'
                        ? (dssTransaction ? dssTransaction.BalanceAmount : ((selectedUser.TotalAmount || 0) - (selectedUser.PaidAmount || 0)))
                        : type === 'KHSS'
                          ? (khssTransaction ? khssTransaction.BalanceAmount : ((selectedUser.TotalAmount || 0) - (selectedUser.PaidAmount || 0)))
                          : (selectedUser.totalAmount - selectedUser.paidAmount)
                    }
                  </p>
                </div>
              </div>
              {/* Payment form for all schemes */}
              <form
                className="space-y-6 mt-10"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const amount = parseFloat(paymentAmount);
                  if (isNaN(amount) || amount <= 0) {
                    setNotification({ message: data.lang === 'ta' ? 'தவறான தொகை.' : 'Invalid amount.', type: 'error' });
                    return;
                  }
                  const today = new Date();
                  const paymentDate = paymentDateInput || today.toISOString().slice(0, 10);
                  // Calculate balance
                  const total = type === 'DSS' ? (selectedUser.TotalAmount || 0) : type === 'KHSS' ? (selectedUser.TotalAmount || 0) : (selectedUser.totalAmount || 0);
                  const paid = type === 'DSS' ? (selectedUser.PaidAmount || 0) : type === 'KHSS' ? (selectedUser.PaidAmount || 0) : (selectedUser.paidAmount || 0);
                  const balance = total - (paid + amount);
                  // Prepare transaction object
                  const transaction = {
                    SchemeType: type === 'KHSS' ? 'KolliHills' : type === 'DSS' ? 'Diwali' : 'Finance',
                    SchemeRefID: type === 'KHSS' ? selectedUser.KHSS_ID : type === 'DSS' ? selectedUser.DSS_ID : selectedUser.id,
                    AmountPaid: amount,
                    PaymentDate: paymentDate,
                    BalanceAmount: balance,
                    TransactionType: paymentMode,
                    CreatedBy: data.currentUser?.Username || data.currentUser?.username || null
                  };
                  const { error } = await supabase.from('Transactions_Table').insert([transaction]);
                  if (error) {
                    setNotification({ message: data.t('error') + ': ' + error.message, type: 'error' });
                  } else {
                    setNotification({ message: data.t('success'), type: 'success' });
                    setPaymentAmount('');
                    setPaymentDateInput('');
                    setPaymentMode('Cash');
                    // Update paid amount in UI for KHSS/DSS
                    if (type === 'KHSS') {
                      setKhssUsers(prev => prev.map(u => u.KHSS_ID === selectedUser.KHSS_ID ? { ...u, PaidAmount: (u.PaidAmount || 0) + amount } : u));
                      setKhssTransaction({ AmountPaid: (khssTransaction ? khssTransaction.AmountPaid : (selectedUser.PaidAmount || 0)) + amount, BalanceAmount: (khssTransaction ? khssTransaction.BalanceAmount : ((selectedUser.TotalAmount || 0) - (selectedUser.PaidAmount || 0))) - amount });
                    } else if (type === 'DSS') {
                      setDssUsers(prev => prev.map(u => u.DSS_ID === selectedUser.DSS_ID ? { ...u, PaidAmount: (u.PaidAmount || 0) + amount } : u));
                      setDssTransaction({ AmountPaid: (dssTransaction ? dssTransaction.AmountPaid : (selectedUser.PaidAmount || 0)) + amount, BalanceAmount: (dssTransaction ? dssTransaction.BalanceAmount : ((selectedUser.TotalAmount || 0) - (selectedUser.PaidAmount || 0))) - amount });
                    }
                    // Navigate back to customer list
                    setTimeout(() => setSelectedUser(null), 500);
                  }
                }}
              >
                <Input
                  label={data.t('paymentAmount')}
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  icon={<div className="font-bold text-indigo-600 text-lg">₹</div>}
                />
                <Input
                  label={data.t('paymentDate') || 'Payment Date'}
                  type="date"
                  value={paymentDateInput || new Date().toISOString().slice(0, 10)}
                  onChange={e => setPaymentDateInput(e.target.value)}
                  required
                />
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <Button type="submit" className="w-full py-4 text-lg">{data.lang === 'ta' ? 'சமர்ப்பிக்கவும்' : 'Submit Payment'}</Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddUserView = ({ data }: { data: any }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', totalAmount: '0', numSchemes: '1', schemeType: 'KHSS' as SchemeType, selectedItem: 'Copper Kudam' });
  const [phoneError, setPhoneError] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  useEffect(() => { const defaultAmt = data.schemeSettings[formData.schemeType] || 0; const count = parseInt(formData.numSchemes) || 0; setFormData(prev => ({ ...prev, totalAmount: (defaultAmt * count).toString() })); }, [formData.schemeType, formData.numSchemes, data.schemeSettings]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) { setPhoneError(data.t('invalidPhone')); return; }
    const count = data.schemeUsers.filter((u: any) => u.schemeType === formData.schemeType).length + 1;
    const prefix = formData.schemeType === 'KHSS' ? 'KHSS' : formData.schemeType === 'DSS' ? 'DSS' : 'FIN';
    const uniqueId = `GSM-${prefix}-${count.toString().padStart(3, '0')}`;
    const newUser: SchemeUser = {
      id: uniqueId,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: 0,
      numSchemes: parseInt(formData.numSchemes),
      schemeType: formData.schemeType,
      selectedItem: formData.schemeType === 'DSS' ? formData.selectedItem : undefined,
      paymentHistory: [],
      createdAt: new Date().toISOString()
    };
    // Save to Supabase table
    let supabaseTable = '';
    if (formData.schemeType === 'KHSS') supabaseTable = 'KolliHills_Scheme_Table';
    else if (formData.schemeType === 'DSS') supabaseTable = 'Diwali_Scheme_Table';
    if (supabaseTable) {
      try {
        let insertObj: any = {};
        if (formData.schemeType === 'KHSS') {
          insertObj = {
            KHSS_ID: uniqueId,
            CustomerName: formData.name,
            PhoneNumber: formData.phone,
            Address: formData.address,
            TotalAmount: parseFloat(formData.totalAmount),
            NumberOfSchemes: parseInt(formData.numSchemes),
            CreatedDate: new Date().toISOString(),
            CreatedBy: data.currentUser?.Username || data.currentUser?.username || null
          };
        } else if (formData.schemeType === 'DSS') {
          insertObj = {
            DSS_ID: uniqueId,
            CustomerName: formData.name,
            PhoneNumber: formData.phone,
            Address: formData.address,
            TotalAmount: parseFloat(formData.totalAmount),
            NumberOfSchemes: parseInt(formData.numSchemes),
            ItemSelection: formData.selectedItem,
            CreatedAt: new Date().toISOString(),
            CreatedDate: new Date().toISOString(),
            CreatedBy: data.currentUser?.Username || data.currentUser?.username || null
          };
        }
        const { error } = await supabase.from(supabaseTable).insert([insertObj]);
        if (error) {
          setNotification({ message: data.t('error') + ': ' + error.message, type: 'error' });
          return;
        }
      } catch (err: any) {
        setNotification({ message: data.t('error') + ': ' + (err.message || 'Unknown error'), type: 'error' });
        return;
      }
    }
    data.setSchemeUsers([...data.schemeUsers, newUser]);
    setNotification({ message: `${data.t('success')} ID: ${uniqueId}`, type: 'success' });
    setFormData({ name: '', phone: '', address: '', totalAmount: '0', numSchemes: '1', schemeType: 'KHSS', selectedItem: 'Copper Kudam' });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-8">{data.t('addUser')}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.lang === 'ta' ? 'திட்ட வகை' : 'Select Scheme'}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['KHSS', 'DSS', 'Finance'] as SchemeType[]).map((type) => (
                <button key={type} type="button" onClick={() => setFormData({ ...formData, schemeType: type })} className={`py-3 px-2 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wider transition-all ${formData.schemeType === type ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{data.t(type.toLowerCase())}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={data.t('name')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder={data.lang === 'ta' ? 'பெயர்' : 'Customer Name'} required />
            <Input label={data.t('phone')} value={formData.phone} onChange={e => { setFormData({ ...formData, phone: e.target.value }); setPhoneError(''); }} required error={phoneError} maxLength={10} placeholder={data.lang === 'ta' ? 'எண்' : 'Mobile'} />
          </div>
          <Input label={data.t('address')} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder={data.lang === 'ta' ? 'முகவரி' : 'Address'} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={data.t('numSchemes')} type="number" value={formData.numSchemes} onChange={e => setFormData({ ...formData, numSchemes: e.target.value })} required />
            <Input label={data.t('totalAmount')} type="number" value={formData.totalAmount} onChange={() => {}} required icon={<span className="font-bold text-indigo-600 text-sm">₹</span>} readOnly />
          </div>
          {formData.schemeType === 'DSS' && (
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{data.t('itemSelection')}</label>
                <select value={formData.selectedItem} onChange={e => setFormData({ ...formData, selectedItem: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium">
                  <option value="Copper Kudam">{data.t('copperKudam')}</option>
                  <option value="Kuthu Vizhakku">{data.t('kuthuVizhakku')}</option>
                  <option value="Brass Vessel">Brass Vessel</option>
                  <option value="Silver Coin">Silver Coin</option>
                </select>
             </div>
          )}
          <Button type="submit" className="w-full py-4 text-base mt-6"> {data.t('submit')} </Button>
        </form>
      </div>
    </div>
  );
};

const AddLoginUserView = ({ data }: { data: any }) => {
  const [formData, setFormData] = useState({ name: '', username: '', password: '', phone: '', address: '', email: '', role: 'Basic' as UserRole });
  const [phoneError, setPhoneError] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!validatePhone(formData.phone)) { setPhoneError(data.t('invalidPhone')); return; }
    const newUser: LoginUser = { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    data.setLoginUsers([...data.loginUsers, newUser]);
    setNotification({ message: data.lang === 'ta' ? 'வெற்றி.' : 'Success.', type: 'success' });
    setFormData({ name: '', username: '', password: '', phone: '', address: '', email: '', role: 'Basic' });
  };
  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-8">{data.t('addLoginUser')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={data.t('name')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label={data.t('username')} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
            <Input label={data.t('password')} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <Input label={data.t('phone')} value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setPhoneError('');}} required error={phoneError} maxLength={10} />
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">{data.t('userType')}</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium">
              <option value="Admin">{data.t('admin')}</option>
              <option value="Basic">{data.t('basic')}</option>
            </select>
          </div>
          <Button type="submit" className="w-full py-4 text-base mt-6"> {data.t('submit')} </Button>
        </form>
      </div>
    </div>
  );
};

const UserDetailsView = ({ data }: { data: any }) => {
  const [viewType, setViewType] = useState<'Login' | SchemeType>('Login');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginUsers, setLoginUsers] = useState<any[]>([]);
  const [khssUsers, setKhssUsers] = useState<any[]>([]);
  const [dssUsers, setDssUsers] = useState<any[]>([]);
  useEffect(() => {
    // Fetch all users from Supabase
    const fetchAll = async () => {
      if (viewType === 'Login') {
        const { data: users } = await supabase.from('Users_Table').select('*');
        setLoginUsers(users || []);
      } else if (viewType === 'KHSS') {
        const { data: users } = await supabase.from('KolliHills_Scheme_Table').select('*');
        setKhssUsers(users || []);
      } else if (viewType === 'DSS') {
        const { data: users } = await supabase.from('Diwali_Scheme_Table').select('*');
        setDssUsers(users || []);
      }
    };
    fetchAll();
  }, [viewType]);

  let filteredUsers: any[] = [];
    // Placeholder for delete action to fix error
    const handleDeleteUser = (user: any) => {
      // TODO: Implement delete logic (Supabase or local state)
      alert('Delete not implemented yet for ' + (user.CustomerName || user.KHSS_ID || user.id));
    };
  if (viewType === 'Login') {
    filteredUsers = loginUsers.filter((u: any) => (u.name || u.Name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  } else if (viewType === 'KHSS') {
    filteredUsers = khssUsers.filter((u: any) => (u.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  } else if (viewType === 'DSS') {
    filteredUsers = dssUsers.filter((u: any) => (u.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }

  // ...existing code for rendering table and editing modal...
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-card p-6 border border-white">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200">
               {(['Login', 'KHSS', 'DSS', 'Finance'] as const).map(type => (
                 <button key={type} onClick={() => setViewType(type)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewType === type ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                   {type === 'Login' ? (data.lang === 'ta' ? 'நிர்வாகிகள்' : 'Operators') : data.t(type.toLowerCase())}
                 </button>
               ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
              <input type="text" placeholder={data.t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium" />
            </div>
         </div>
         <div className="overflow-x-auto mt-8">
            <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-100">
                   {viewType === 'KHSS' ? (
                     <>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">KHSS ID</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">Customer Name</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">Phone Number</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">Address</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">Total Amount</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">Number Of Schemes</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4 text-right">Action</th>
                     </>
                   ) : (
                     <>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">{data.lang === 'ta' ? 'விவரம்' : 'Details'}</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">{data.lang === 'ta' ? 'தொடர்பு' : 'Contact'}</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4">{data.lang === 'ta' ? 'நிலை' : 'Status'}</th>
                       <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest px-4 text-right">{data.lang === 'ta' ? 'செயல்' : 'Action'}</th>
                     </>
                   )}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredUsers.length > 0 ? filteredUsers.map((user: any, idx: number) => (
                   viewType === 'KHSS' ? (
                     <tr key={user.KHSS_ID || idx} className="hover:bg-slate-50/50 group">
                       <td className="py-5 px-4 font-medium text-slate-800">{user.KHSS_ID}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.CustomerName}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.PhoneNumber}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.Address}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">₹{user.TotalAmount?.toLocaleString()}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.NumberOfSchemes}</td>
                       <td className="py-5 px-4 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setEditingUser(user)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all border border-transparent" title="Edit"><Edit2 className="w-4 h-4" /></button>
                           <button onClick={() => handleDeleteUser(user)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all border border-transparent" title="Delete"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       </td>
                     </tr>
                   ) : viewType === 'DSS' ? (
                     <tr key={user.DSS_ID || idx} className="hover:bg-slate-50/50 group">
                       <td className="py-5 px-4 font-medium text-slate-800">{user.DSS_ID}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.CustomerName}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.PhoneNumber}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.Address}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">₹{user.TotalAmount?.toLocaleString()}</td>
                       <td className="py-5 px-4 font-medium text-slate-800">{user.NumberOfSchemes}</td>
                       <td className="py-5 px-4 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setEditingUser(user)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all border border-transparent" title="Edit"><Edit2 className="w-4 h-4" /></button>
                           <button onClick={() => handleDeleteUser(user)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all border border-transparent" title="Delete"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       </td>
                     </tr>
                   ) : null
                 )) : <tr> <td colSpan={viewType === 'KHSS' || viewType === 'DSS' ? 7 : 4} className="py-20 text-center text-slate-300 font-medium text-sm"> {data.t('noUsersFound')} </td> </tr>}
               </tbody>
            </table>
         </div>
      </div>
      {/* ...existing code for editing modal if needed... */}
    </div>
  );
};

const AppRoutes = () => {
  const data = useData(); const location = useLocation(); const navigate = useNavigate();
  useEffect(() => { if (!data.currentUser && !['/', '/register', '/forgot-password'].includes(location.pathname)) navigate('/'); }, [data.currentUser, location.pathname, navigate]);
  return (
    <Routes>
      <Route path="/" element={<LoginPage data={data} />} />
      <Route path="/register" element={<RegisterPage data={data} />} />
      <Route path="/forgot-password" element={<div className="min-h-screen flex items-center justify-center p-6"><div className="glass-card p-10 max-w-sm w-full text-center space-y-8 animate-slide-up"><div className="w-16 h-16 bg-rose-50 rounded-2xl mx-auto flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm"><AlertCircle className="w-8 h-8" /></div><div className="space-y-4"><h1 className="text-xl font-bold text-slate-900">{data.t('forgotPassword')}</h1><p className="text-slate-500 text-xs font-medium leading-relaxed">{data.lang === 'ta' ? 'நிர்வாகியை தொடர்பு கொள்ளவும்.' : 'Contact administrator to reset.'}</p></div><Button onClick={() => navigate('/')} className="w-full"> {data.t('back')} </Button></div></div>} />
      <Route path="/dashboard" element={<Layout data={data}><DashboardView data={data} /></Layout>} />
      <Route path="/khss" element={<Layout data={data}><SchemeView data={data} type="KHSS" /></Layout>} />
      <Route path="/dss" element={<Layout data={data}><SchemeView data={data} type="DSS" /></Layout>} />
      <Route path="/finance" element={<Layout data={data}><SchemeView data={data} type="Finance" /></Layout>} />
      <Route path="/add-user" element={<Layout data={data}><AddUserView data={data} /></Layout>} />
      <Route path="/add-login-user" element={<Layout data={data}><AddLoginUserView data={data} /></Layout>} />
      <Route path="/user-details" element={<Layout data={data}><UserDetailsView data={data} /></Layout>} />
      <Route path="/settings" element={<Layout data={data}><SettingsView data={data} /></Layout>} />
      <Route path="*" element={<Navigate to={data.currentUser ? "/dashboard" : "/"} />} />
    </Routes>
  );
};

const App: React.FC = () => <Router><AppRoutes /></Router>;
export default App;
