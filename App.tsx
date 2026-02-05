
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

// CONFIGURAÇÃO DO SEU BANCO ONLINE (SUPABASE)
// Substitua pelas chaves que você pegou no Passo 3
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE'; 
const SUPABASE_KEY = 'SUA_KEY_ANON_DO_SUPABASE';

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

  // FUNÇÃO DE SINCRONIZAÇÃO REAL COM O BANCO DE DADOS ONLINE
  const handleSync = async () => {
    if (!isOnline) {
      alert("Sem conexão com a internet para sincronizar.");
      return;
    }

    if (SUPABASE_URL === 'SUA_URL_DO_SUPABASE') {
      alert("Configuração pendente: Insira a URL e Key do Supabase no topo do arquivo App.tsx");
      return;
    }

    try {
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Evita erros se o item já existir
      };

      // 1. Sincronizar Máquinas
      const unsyncedMachines = machines.filter(m => !m.synced);
      if (unsyncedMachines.length > 0) {
        const payload = unsyncedMachines.map(({ synced, ...rest }) => ({
          ...rest,
          company_id: rest.companyId // Mapear camelCase para snake_case do SQL
        }));
        
        await fetch(`${SUPABASE_URL}/rest/v1/machines`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        setMachines(prev => prev.map(m => ({ ...m, synced: true })));
      }

      // 2. Sincronizar Abastecimentos
      const unsyncedFuelings = fuelings.filter(f => !f.synced);
      if (unsyncedFuelings.length > 0) {
        const payload = unsyncedFuelings.map(({ synced, ...rest }) => ({
          id: rest.id,
          date: rest.date,
          machine_id: rest.machineId,
          company_id: rest.companyId,
          liters: rest.liters,
          meter: rest.meter,
          operator_name: rest.operatorName,
          user_id: rest.userId,
          observations: rest.observations || '',
          photo_url: rest.photoUrl || ''
        }));

        await fetch(`${SUPABASE_URL}/rest/v1/fuelings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        setFuelings(prev => prev.map(f => ({ ...f, synced: true })));
      }

      // 3. Sincronizar Cargas de Tanque
      const unsyncedRefills = refills.filter(r => !r.synced);
      if (unsyncedRefills.length > 0) {
        const payload = unsyncedRefills.map(({ synced, ...rest }) => ({
          id: rest.id,
          date: rest.date,
          company_id: rest.companyId,
          liters: rest.liters,
          user_id: rest.userId
        }));

        await fetch(`${SUPABASE_URL}/rest/v1/refills`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        setRefills(prev => prev.map(r => ({ ...r, synced: true })));
      }

      alert("Sincronização realizada com sucesso para o Banco Online!");
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Houve um problema ao enviar os dados. Verifique suas chaves do Supabase.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === (password || '123'));
    if (user) {
      setCurrentUser(user);
      setActiveTab(user.role === UserRole.ABASTECEDOR ? 'fueling' : 'dashboard');
    } else alert('Credenciais inválidas.');
  };

  const handleUpdateTankMetadata = useCallback((name: string, capacity: number) => {
    setTankStatus(prev => ({ ...prev, name, capacity }));
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser?.id || 'sys',
      action: 'UPDATE', entity: 'TANK', reason: `Configuração do tanque atualizada: ${name} (${capacity}L)`
    }]);
  }, [currentUser]);

  const handleUpdateUser = useCallback((userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data, synced: false } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser?.id || 'sys',
      action: 'USER_EDIT', entity: 'USER', reason: `Editou usuário ${userId}`
    }]);
  }, [currentUser]);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser?.id || 'sys',
      action: 'USER_DELETE', entity: 'USER', reason: `Excluiu usuário ${userId}`
    }]);
  }, [currentUser]);

  const handleDeleteFueling = useCallback((id: string) => {
    const fueling = fuelings.find(f => f.id === id);
    if (!fueling || !currentUser) return;
    
    setTankStatus(prev => ({ ...prev, currentLevel: prev.currentLevel + fueling.liters }));
    setFuelings(prev => prev.filter(f => f.id !== id));
    
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
      action: 'DELETE', entity: 'FUELING', reason: `Excluiu abastecimento #${id} de ${fueling.liters}L para ${fueling.machineId}`
    }]);
  }, [fuelings, currentUser]);

  const handleUpdateFueling = useCallback((id: string, data: Partial<Fueling>) => {
    const old = fuelings.find(f => f.id === id);
    if (!old || !currentUser) return;

    if (data.liters !== undefined) {
      const diff = data.liters - old.liters;
      setTankStatus(prev => ({ ...prev, currentLevel: prev.currentLevel - diff }));
    }

    setFuelings(prev => prev.map(f => f.id === id ? { ...f, ...data, synced: false } : f));
    
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
      action: 'UPDATE', entity: 'FUELING', 
      oldValue: `${old.liters}L`, 
      newValue: `${data.liters}L`,
      reason: `Editou volume de abastecimento #${id}`
    }]);
  }, [fuelings, currentUser]);

  const handleSuggestCorrection = useCallback((fuelingId: string, note: string) => {
    setFuelings(prev => prev.map(f => f.id === fuelingId ? { ...f, correctionNote: note, synced: false } : f));
  }, []);

  const handleProcessCorrection = useCallback((fuelingId: string, approved: boolean, newData?: Partial<Fueling>) => {
    if (!currentUser) return;
    
    setFuelings(prev => {
      const target = prev.find(f => f.id === fuelingId);
      if (!target) return prev;
      if (approved && newData) {
        const diff = newData.liters !== undefined ? newData.liters - target.liters : 0;
        setTankStatus(ts => ({ ...ts, currentLevel: ts.currentLevel - diff }));
        return prev.map(f => f.id === fuelingId ? { ...f, ...newData, correctionNote: undefined, synced: false } : f);
      } else {
        return prev.map(f => f.id === fuelingId ? { ...f, correctionNote: undefined, synced: false } : f);
      }
    });

    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
      action: 'UPDATE', entity: 'FUELING', reason: `${approved ? 'Aprovou' : 'Rejeitou'} correção para fueling ${fuelingId}`
    }]);
  }, [currentUser]);

  const handleFuelingSubmit = useCallback((data: any) => {
    if (!currentUser) return;
    const newFueling: Fueling = { 
      id: `f-${Date.now()}`, 
      date: new Date().toISOString(), 
      userId: currentUser.id, 
      synced: false,
      ...data 
    };
    setFuelings(prev => [...prev, newFueling]);
    setTankStatus(prev => ({ ...prev, currentLevel: prev.currentLevel - data.liters }));
    alert('Salvo Localmente! Sincronize quando tiver internet.');
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
    setTankStatus(prev => ({ ...prev, currentLevel: prev.currentLevel + data.liters }));
    alert('Recarga Salva Localmente!');
  }, [currentUser]);

  const handleAdjustTank = useCallback((liters: number, reason: string) => {
    if (!currentUser) return;
    const oldValue = tankStatus.currentLevel.toString();
    setTankStatus(prev => ({ ...prev, currentLevel: liters }));
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId: currentUser.id,
      action: 'ADJUST', entity: 'TANK', oldValue,
      newValue: liters.toString(), reason
    }]);
    alert('Ajuste de tanque concluído.');
  }, [currentUser, tankStatus.currentLevel]);

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
            <div className="flex items-center justify-center gap-2 mt-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
               <p className="text-emerald-500 font-bold uppercase text-[10px] tracking-[0.2em]">{isOnline ? 'CONEXÃO ESTÁVEL' : 'MODO OFFLINE'}</p>
            </div>
          </div>
          <div className="bg-[#141d18] rounded-[2.5rem] shadow-2xl p-10 border border-emerald-900/30">
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-bold text-white" required />
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-bold text-white" />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all">Acessar Sistema</button>
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
      {activeTab === 'profile' && <UserProfile user={currentUser} fuelings={fuelings} machines={machines} onUpdateUser={(data) => handleUpdateUser(currentUser.id, data)} />}
      {activeTab === 'fueling' && <FuelingForm user={currentUser} machines={machines} companies={companies} fuelings={fuelings} onSubmit={handleFuelingSubmit} onSuggestCorrection={handleSuggestCorrection} tankBalance={tankStatus.currentLevel} />}
      {activeTab === 'refill' && <RefillForm tankStatus={tankStatus} companies={companies} onSubmit={handleRefillSubmit} onUpdateMetadata={handleUpdateTankMetadata} onAdjustTank={handleAdjustTank} />}
      {activeTab === 'reports' && (
        <Reports 
          user={currentUser} 
          fuelings={fuelings} 
          refills={refills} 
          companies={companies} 
          machines={machines} 
          users={users} 
          logs={logs}
          onDeleteFueling={handleDeleteFueling}
          onUpdateFueling={handleUpdateFueling}
        />
      )}
      {activeTab === 'admin' && (
        <Admin 
          companies={companies} 
          machines={machines} 
          users={users} 
          fuelings={fuelings} 
          logs={logs} 
          onAddMachine={m => setMachines(p => [...p, {id: `m-${Date.now()}`, synced: false, ...m}])} 
          onAddUser={u => setUsers(p => [...p, {id: `u-${Date.now()}`, password: '123', synced: false, ...u}])} 
          onUpdateUser={handleUpdateUser} 
          onDeleteUser={handleDeleteUser} 
          onAdjustTank={handleAdjustTank}
          onProcessCorrection={handleProcessCorrection}
        />
      )}
    </Layout>
  );
};

export default App;
