import React, { useState, useEffect, useCallback } from 'react';
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getFromStorage<User | null>('user', null));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [companies] = useState<Company[]>(INITIAL_COMPANIES);
  const [machines, setMachines] = useState<Machine[]>(() => getFromStorage<Machine[]>('machines', [
    { id: 'm1', name: 'Escavadeira CAT-01', companyId: 'campo-rico', type: 'MAQUINA' },
    { id: 'm2', name: 'Trator MF-05', companyId: 'fertitex', type: 'MAQUINA' },
    { id: 'm3', name: 'Caminhão MB-12', companyId: 'empresa-1', type: 'VEICULO', plate: 'EF-2024' }
  ]));
  
  const [users, setUsers] = useState<User[]>(() => getFromStorage<User[]>('users', MOCK_USERS));
  const [fuelings, setFuelings] = useState<Fueling[]>(() => getFromStorage<Fueling[]>('fuelings', []));
  const [refills, setRefills] = useState<TankRefill[]>(() => getFromStorage<TankRefill[]>('refills', []));
  const [logs, setLogs] = useState<AuditLog[]>(() => getFromStorage<AuditLog[]>('logs', []));
  const [tankStatus, setTankStatus] = useState<TankStatus>(() => getFromStorage<TankStatus>('tank', { 
    name: 'Tanque Central 15k',
    capacity: TANK_CAPACITY, 
    currentLevel: 15000 
  }));
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => { saveToStorage('machines', machines); }, [machines]);
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('fuelings', fuelings); }, [fuelings]);
  useEffect(() => { saveToStorage('refills', refills); }, [refills]);
  useEffect(() => { saveToStorage('logs', logs); }, [logs]);
  useEffect(() => { saveToStorage('tank', tankStatus); }, [tankStatus]);
  useEffect(() => { saveToStorage('user', currentUser); }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setActiveTab(user.role === UserRole.ABASTECEDOR ? 'fueling' : 'dashboard');
    } else alert('E-mail ou senha incorretos.');
  };

  const handleFuelingSubmit = useCallback((data: any) => {
    if (!currentUser) return;
    const newFueling: Fueling = { 
      id: `f-${Date.now()}`, 
      date: new Date().toISOString(), 
      userId: currentUser.id, 
      operatorName: data.operatorName || currentUser.name,
      synced: false,
      ...data 
    };
    setFuelings(prev => [...prev, newFueling]);
    setTankStatus(prev => ({ ...prev, currentLevel: Math.max(0, prev.currentLevel - data.liters) }));
  }, [currentUser]);

  const handleRefillSubmit = useCallback((data: any) => {
    if (!currentUser) return;
    const newRefill: TankRefill = { 
      id: `r-${Date.now()}`, 
      date: new Date().toISOString(), 
      userId: currentUser.id, 
      synced: false,
      ...data 
    };
    setRefills(prev => [...prev, newRefill]);
    setTankStatus(prev => ({ ...prev, currentLevel: Math.min(prev.capacity, prev.currentLevel + data.liters) }));
  }, [currentUser]);

  const handleAdjustTank = useCallback((liters: number, reason: string) => {
    if (!currentUser) return;
    const oldValue = tankStatus.currentLevel.toString();
    setTankStatus(prev => ({ ...prev, currentLevel: liters }));
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
      action: 'ADJUST', entity: 'TANK', oldValue, newValue: liters.toString(), reason
    }]);
  }, [currentUser, tankStatus.currentLevel]);

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c1410] p-6 text-slate-100">
        <div className="w-full max-w-sm space-y-8 animate-fadeIn">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] inline-flex items-center justify-center shadow-2xl mb-6">
               <span className="text-3xl font-black text-white">EF</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">ECOFUEL</h1>
            <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest mt-2">Industrial Diesel Control</p>
          </div>
          <div className="bg-[#141d18] p-10 rounded-[2.5rem] border border-emerald-900/20 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full bg-[#1a2520] border border-emerald-900/10 rounded-2xl px-6 py-4 outline-none font-bold text-white focus:border-emerald-500 transition-colors"
                required 
              />
              <input 
                type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#1a2520] border border-emerald-900/10 rounded-2xl px-6 py-4 outline-none font-bold text-white focus:border-emerald-500 transition-colors"
                required
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all">
                AUTENTICAR
              </button>
            </form>
          </div>
          <div className="text-center opacity-20 text-[9px] font-black uppercase tracking-widest">
            v1.4.0 • PWA Mode Ativo
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isOnline={isOnline}
      pendingSyncCount={0}
      onSync={async () => {}}
    >
      {activeTab === 'dashboard' && <Dashboard fuelings={fuelings} tankStatus={tankStatus} companies={companies} machines={machines} refills={refills} />}
      {activeTab === 'fueling' && <FuelingForm user={currentUser} machines={machines} companies={companies} fuelings={fuelings} onSubmit={handleFuelingSubmit} onSuggestCorrection={() => {}} tankBalance={tankStatus.currentLevel} />}
      {activeTab === 'profile' && <UserProfile user={currentUser} fuelings={fuelings} machines={machines} onUpdateUser={(d) => setCurrentUser(p => p ? {...p, ...d} : null)} />}
      {activeTab === 'refill' && <RefillForm tankStatus={tankStatus} companies={companies} onSubmit={handleRefillSubmit} onUpdateMetadata={(n, c) => setTankStatus(p => ({...p, name: n, capacity: c}))} onAdjustTank={handleAdjustTank} />}
      {activeTab === 'reports' && (
        <Reports 
          user={currentUser} fuelings={fuelings} refills={refills} companies={companies} 
          machines={machines} users={users} logs={logs} 
          onDeleteFueling={(id) => {
            const f = fuelings.find(x => x.id === id);
            if (f) {
              setFuelings(p => p.filter(x => x.id !== id));
              setTankStatus(p => ({ ...p, currentLevel: Math.min(p.capacity, p.currentLevel + f.liters) }));
              setLogs(prev => [...prev, {
                id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
                action: 'DELETE', entity: 'FUELING', reason: `Exclusão de abastecimento ID ${id}`
              }]);
            }
          }}
          onUpdateFueling={(id, data) => {
            const old = fuelings.find(x => x.id === id);
            if (old && data.liters !== undefined) {
              const diff = old.liters - data.liters;
              setTankStatus(p => ({ ...p, currentLevel: Math.min(p.capacity, Math.max(0, p.currentLevel + diff)) }));
              setFuelings(p => p.map(x => x.id === id ? { ...x, ...data } : x));
              setLogs(prev => [...prev, {
                id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
                action: 'UPDATE', entity: 'FUELING', reason: `Edição de volume ID ${id}`
              }]);
            }
          }}
        />
      )}
      {activeTab === 'admin' && (
        <Admin 
          companies={companies} machines={machines} users={users} fuelings={fuelings} logs={logs}
          onAddMachine={m => setMachines(p => [...p, {id: `m-${Date.now()}`, ...m}])}
          onAddUser={u => setUsers(p => [...p, {id: `u-${Date.now()}`, ...u, password: '123'}])}
          onUpdateUser={(id, d) => setUsers(p => p.map(u => u.id === id ? {...u, ...d} : u))}
          onDeleteUser={(id) => setUsers(p => p.filter(u => u.id !== id))}
          onAdjustTank={handleAdjustTank}
          onProcessCorrection={(id, approved, newData) => {
            if (approved && newData) {
               const old = fuelings.find(x => x.id === id);
               if (old && newData.liters !== undefined) {
                  const diff = old.liters - newData.liters;
                  setTankStatus(p => ({ ...p, currentLevel: Math.max(0, p.currentLevel + diff) }));
                  setFuelings(p => p.map(x => x.id === id ? { ...x, ...newData, correctionNote: undefined } : x));
               }
            } else {
               setFuelings(p => p.map(x => x.id === id ? { ...x, correctionNote: undefined } : x));
            }
          }}
        />
      )}
    </Layout>
  );
};

export default App;