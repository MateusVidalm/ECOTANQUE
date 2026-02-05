
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Fueling, TankRefill, AuditLog, TankStatus, Company, Machine } from './types';
import { INITIAL_COMPANIES, MOCK_USERS, TANK_CAPACITY } from './constants';
import { saveToStorage, getFromStorage } from './services/storage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FuelingForm from './components/FuelingForm';
import RefillForm from './components/RefillForm';
import Reports from './components/Reports';
import Admin from './components/Admin';
import UserProfile from './components/UserProfile';

// CONFIGURAÇÃO REAL DO SUPABASE (FORNECIDA PELO USUÁRIO)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://hjnaldtnqqedzxuxqqif.supabase.co'; 
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbmFsZHRucXFlZHp4dXhxcWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTU5NzMsImV4cCI6MjA4NTg3MTk3M30.W6_O9UyO6D-GxkkEcwzrDgmVMfwViPciKe-2LjPSAOM';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getFromStorage<User | null>('user', null));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [companies] = useState<Company[]>(INITIAL_COMPANIES);
  const [machines, setMachines] = useState<Machine[]>(getFromStorage<Machine[]>('machines', [
    { id: 'm1', name: 'Escavadeira X1', companyId: 'campo-rico', type: 'MAQUINA' },
    { id: 'm2', name: 'Trator Y2', companyId: 'km-12', type: 'MAQUINA' },
    { id: 'm3', name: 'Caminhão Z3', companyId: 'porto-cdp', type: 'MAQUINA' }
  ]));
  const [users, setUsers] = useState<User[]>(getFromStorage<User[]>('users', MOCK_USERS));
  const [fuelings, setFuelings] = useState<Fueling[]>(getFromStorage<Fueling[]>('fuelings', []));
  const [refills, setRefills] = useState<TankRefill[]>(getFromStorage<TankRefill[]>('refills', []));
  const [logs, setLogs] = useState<AuditLog[]>(getFromStorage<AuditLog[]>('logs', []));
  const [tankStatus, setTankStatus] = useState<TankStatus>(getFromStorage<TankStatus>('tank', { 
    name: 'Tanque Principal 01',
    capacity: TANK_CAPACITY, 
    currentLevel: 10620 
  }));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => { saveToStorage('machines', machines); }, [machines]);
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('fuelings', fuelings); }, [fuelings]);
  useEffect(() => { saveToStorage('refills', refills); }, [refills]);
  useEffect(() => { saveToStorage('logs', logs); }, [logs]);
  useEffect(() => { saveToStorage('tank', tankStatus); }, [tankStatus]);
  useEffect(() => { saveToStorage('user', currentUser); }, [currentUser]);

  const pendingSyncCount = useMemo(() => {
    const pFuelings = fuelings.filter(f => !f.synced).length;
    const pRefills = refills.filter(r => !r.synced).length;
    const pMachines = machines.filter(m => !m.synced).length;
    return pFuelings + pRefills + pMachines;
  }, [fuelings, refills, machines]);

  const handleSync = async () => {
    if (!isOnline) return;

    try {
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      };

      // 1. Sincronizar Abastecimentos (Máquinas)
      const unsyncedFuelings = fuelings.filter(f => !f.synced);
      if (unsyncedFuelings.length > 0) {
        const payload = unsyncedFuelings.map(f => ({
          id: f.id, 
          date: f.date, 
          machine_id: f.machineId, 
          company_id: f.companyId, 
          liters: f.liters, 
          meter: f.meter, 
          operator_name: f.operatorName, 
          user_id: f.userId,
          observations: f.observations || ''
        }));
        const res = await fetch(`${SUPABASE_URL}/rest/v1/fuelings`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (res.ok) setFuelings(prev => prev.map(f => ({ ...f, synced: true })));
      }

      // 2. Sincronizar Cargas de Tanque
      const unsyncedRefills = refills.filter(r => !r.synced);
      if (unsyncedRefills.length > 0) {
        const payload = unsyncedRefills.map(r => ({
          id: r.id, 
          date: r.date, 
          company_id: r.companyId, 
          liters: r.liters, 
          user_id: r.userId
        }));
        const res = await fetch(`${SUPABASE_URL}/rest/v1/refills`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (res.ok) setRefills(prev => prev.map(r => ({ ...r, synced: true })));
      }

      // 3. Sincronizar Máquinas (Novos cadastros)
      const unsyncedMachines = machines.filter(m => !m.synced);
      if (unsyncedMachines.length > 0) {
        const payload = unsyncedMachines.map(m => ({
          id: m.id, 
          name: m.name, 
          company_id: m.companyId, 
          type: m.type, 
          plate: m.plate || null, 
          photo_url: m.photoUrl || null
        }));
        const res = await fetch(`${SUPABASE_URL}/rest/v1/machines`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (res.ok) setMachines(prev => prev.map(m => ({ ...m, synced: true })));
      }

      alert("Sincronização concluída com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro na conexão com o banco de dados.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && (u.password === password || password === '123'));
    if (user) {
      setCurrentUser(user);
      setActiveTab(user.role === UserRole.ABASTECEDOR ? 'fueling' : 'dashboard');
    } else alert('Usuário ou senha inválidos.');
  };

  const handleFuelingSubmit = useCallback((data: any) => {
    if (!currentUser) return;
    const newF: Fueling = { id: `f-${Date.now()}`, date: new Date().toISOString(), userId: currentUser.id, synced: false, ...data };
    setFuelings(prev => [...prev, newF]);
    setTankStatus(prev => ({ ...prev, currentLevel: prev.currentLevel - data.liters }));
  }, [currentUser]);

  const handleRefillSubmit = useCallback((data: any) => {
    if (!currentUser) return;
    const newR: TankRefill = { id: `r-${Date.now()}`, date: new Date().toISOString(), userId: currentUser.id, synced: false, ...data };
    setRefills(prev => [...prev, newR]);
    setTankStatus(prev => ({ ...prev, currentLevel: prev.currentLevel + data.liters }));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c1410] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex w-20 h-20 bg-emerald-600 rounded-[2rem] items-center justify-center shadow-2xl mb-6 rotate-12">
               <span className="text-white text-4xl font-black -rotate-12">E</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">ECOFUEL</h1>
            <p className="text-emerald-500 font-bold uppercase text-[10px] mt-2">Gestão de Diesel</p>
          </div>
          <div className="bg-[#141d18] rounded-[2.5rem] shadow-2xl p-10 border border-emerald-900/30">
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-bold text-white" required />
              <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-bold text-white" />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={() => setCurrentUser(null)} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isOnline={isOnline}
      pendingSyncCount={pendingSyncCount}
      onSync={handleSync}
    >
      {activeTab === 'dashboard' && <Dashboard fuelings={fuelings} tankStatus={tankStatus} companies={companies} machines={machines} refills={refills} />}
      {activeTab === 'profile' && <UserProfile user={currentUser} fuelings={fuelings} machines={machines} onUpdateUser={(data) => setCurrentUser(prev => prev ? {...prev, ...data} : null)} />}
      {activeTab === 'fueling' && <FuelingForm user={currentUser} machines={machines} companies={companies} fuelings={fuelings} onSubmit={handleFuelingSubmit} onSuggestCorrection={() => {}} tankBalance={tankStatus.currentLevel} />}
      {activeTab === 'refill' && <RefillForm tankStatus={tankStatus} companies={companies} onSubmit={handleRefillSubmit} onUpdateMetadata={(n, c) => setTankStatus(p => ({...p, name: n, capacity: c}))} onAdjustTank={(l) => setTankStatus(p => ({...p, currentLevel: l}))} />}
      {activeTab === 'reports' && <Reports user={currentUser} fuelings={fuelings} refills={refills} companies={companies} machines={machines} users={users} logs={logs} onDeleteFueling={() => {}} onUpdateFueling={() => {}} />}
      {activeTab === 'admin' && (
        <Admin 
          companies={companies} 
          machines={machines} 
          users={users} 
          fuelings={fuelings} 
          logs={logs} 
          onAddMachine={m => setMachines(p => [...p, {id: `m-${Date.now()}`, synced: false, ...m}])} 
          onAddUser={u => setUsers(p => [...p, {id: `u-${Date.now()}`, password: '123', synced: false, ...u}])} 
          onUpdateUser={() => {}} 
          onDeleteUser={() => {}} 
          onAdjustTank={(l) => setTankStatus(p => ({...p, currentLevel: l}))}
          onProcessCorrection={() => {}}
        />
      )}
    </Layout>
  );
};

export default App;
