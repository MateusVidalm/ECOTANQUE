
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onSync: () => Promise<void>;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, onLogout, children, activeTab, setActiveTab, 
  isOnline, pendingSyncCount, onSync 
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMINISTRADOR, UserRole.GERENTE] },
    { id: 'fueling', label: 'Abastecer', icon: '⛽', roles: [UserRole.ABASTECEDOR, UserRole.GERENTE] },
    { id: 'profile', label: 'Meu Usuário', icon: '👤', roles: [UserRole.ABASTECEDOR, UserRole.ADMINISTRADOR, UserRole.GERENTE] },
    { id: 'refill', label: 'Carga Tanque', icon: '🚛', roles: [UserRole.GERENTE] },
    { id: 'reports', label: 'Relatórios', icon: '📋', roles: [UserRole.ADMINISTRADOR, UserRole.GERENTE] },
    { id: 'admin', label: 'Gestão', icon: '⚙️', roles: [UserRole.GERENTE] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const handleSyncClick = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    await onSync();
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-emerald-800 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-emerald-800 font-bold">E</span>
           </div>
           <h1 className="font-bold text-lg">EcoFuel</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncClick}
            className={`p-2 rounded-full ${pendingSyncCount > 0 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-700'}`}
          >
            <span className={`block ${isSyncing ? 'animate-spin' : ''}`}>🔄</span>
          </button>
          <button onClick={onLogout} className="text-xs bg-emerald-700 px-3 py-1.5 rounded-full font-bold">Sair</button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-emerald-100 p-6 shadow-sm">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white font-black text-xl">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900 leading-tight">ECOFUEL</h1>
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Controle Diesel</p>
            </div>
          </div>
        </div>

        {/* Status de Conexão */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Online</span>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
          </div>
          <button 
            onClick={handleSyncClick}
            disabled={!isOnline || isSyncing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
              pendingSyncCount > 0 
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100' 
                : 'bg-slate-200 text-slate-500 cursor-default'
            } disabled:opacity-50`}
          >
            <span className={isSyncing ? 'animate-spin' : ''}>{isSyncing ? '⌛' : '🔄'}</span>
            {isSyncing ? 'Sincronizando...' : pendingSyncCount > 0 ? `${pendingSyncCount} Pendentes` : 'Sincronizado'}
          </button>
        </div>

        <div className="flex-1 flex flex-col space-y-1">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                  : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className={`text-xl ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-6 p-2 rounded-xl bg-slate-50">
            <img 
              src={user.photoUrl || "https://ui-avatars.com/api/?name=" + user.name} 
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-50 ring-offset-2" 
              alt="User"
            />
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
              <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-tight">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-center space-x-2"
          >
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto pb-24 md:pb-10">
        {!isOnline && (
          <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <span className="text-xl">📡</span>
            <div>
              <p className="text-xs font-black text-rose-800 uppercase tracking-tight">Modo Offline Ativado</p>
              <p className="text-[10px] font-medium text-rose-600">Seus lançamentos serão salvos localmente e sincronizados quando houver conexão.</p>
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-50 flex justify-around p-2 z-50">
        {filteredMenu.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === item.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
