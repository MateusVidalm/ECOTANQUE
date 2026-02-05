
import React, { useState } from 'react';
import { Company, Machine, User, UserRole, AuditLog, Fueling, MachineType } from '../types';

interface AdminProps {
  companies: Company[];
  machines: Machine[];
  users: User[];
  fuelings: Fueling[];
  logs: AuditLog[];
  onAddMachine: (m: Omit<Machine, 'id'>) => void;
  onAddUser: (u: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAdjustTank: (liters: number, reason: string) => void;
  onProcessCorrection: (fuelingId: string, approved: boolean, newData?: Partial<Fueling>) => void;
}

const Admin: React.FC<AdminProps> = ({ 
  companies, machines, users, fuelings, logs, 
  onAddMachine, onAddUser, onUpdateUser, onDeleteUser, 
  onAdjustTank, onProcessCorrection 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  
  // States
  const [newMachine, setNewMachine] = useState<{name: string, companyId: string, type: MachineType, plate: string, photoUrl: string}>({ 
    name: '', 
    companyId: '', 
    type: 'MAQUINA', 
    plate: '',
    photoUrl: ''
  });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.ABASTECEDOR, companyId: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<User>>({});

  // Correction Editing States
  const [editingCorrectionId, setEditingCorrectionId] = useState<string | null>(null);
  const [correctionData, setCorrectionData] = useState<Partial<Fueling>>({});

  const pendingCorrections = fuelings.filter(f => !!f.correctionNote);

  const adminCards = [
    { id: 'machines', label: 'Frota', desc: 'Máquinas e Veículos', icon: '🚜', count: machines.length },
    { id: 'users', label: 'Equipe', desc: 'Gestão de usuários', icon: '👥', count: users.length },
    { id: 'corrections', label: 'Solicitações', desc: 'Pendências de correção', icon: '📩', count: pendingCorrections.length },
    { id: 'tank', label: 'Estoque', desc: 'Ajuste de tanque', icon: '⛽', count: '15.000L' },
    { id: 'logs', label: 'Histórico', desc: 'Auditoria Logs', icon: '📜', count: logs.length },
  ];

  const handleAddMachine = () => {
    if (!newMachine.name || !newMachine.companyId) {
      alert("Preencha o nome e selecione a unidade.");
      return;
    }
    if (newMachine.type === 'VEICULO' && !newMachine.plate) {
      alert("Para veículos, a placa é obrigatória.");
      return;
    }
    onAddMachine({
      name: newMachine.name,
      companyId: newMachine.companyId,
      type: newMachine.type,
      plate: newMachine.type === 'VEICULO' ? newMachine.plate : undefined,
      photoUrl: newMachine.photoUrl || undefined
    });
    setNewMachine({ name: '', companyId: '', type: 'MAQUINA', plate: '', photoUrl: '' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMachine(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!activeSubTab) {
    return (
      <div className="space-y-12 animate-fadeIn">
        <header>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão Estratégica</h2>
          <p className="text-slate-500 font-medium">Controle administrativo total do sistema.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {adminCards.map(card => (
            <button
              key={card.id} onClick={() => setActiveSubTab(card.id)}
              className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 text-left relative"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
              <h3 className="text-lg font-black text-slate-800">{card.label}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-6">{card.desc}</p>
              <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${card.id === 'corrections' && typeof card.count === 'number' && card.count > 0 ? 'bg-orange-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                {card.count} registros
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <button onClick={() => setActiveSubTab(null)} className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform">← Voltar ao Menu</button>

      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        
        {activeSubTab === 'machines' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Cadastrar Equipamento</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Vincular frota por unidade</p>
                </div>
                
                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group relative overflow-hidden">
                    {newMachine.photoUrl ? (
                      <>
                        <img src={newMachine.photoUrl} className="w-32 h-32 object-cover rounded-2xl shadow-lg" alt="Preview" />
                        <button onClick={() => setNewMachine(p => ({...p, photoUrl: ''}))} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">✕</button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer w-full">
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📷</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Foto</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unidade Responsável</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                      value={newMachine.companyId} 
                      onChange={e => setNewMachine({...newMachine, companyId: e.target.value})}
                    >
                      <option value="">Selecione a unidade...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome / Identificação</label>
                    <input 
                      placeholder="Ex: Escavadeira CAT 320" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                      value={newMachine.name} 
                      onChange={e => setNewMachine({...newMachine, name: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Equipamento</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button 
                        onClick={() => setNewMachine({...newMachine, type: 'MAQUINA'})}
                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newMachine.type === 'MAQUINA' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                      >
                        Máquina / Implemento
                      </button>
                      <button 
                        onClick={() => setNewMachine({...newMachine, type: 'VEICULO'})}
                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newMachine.type === 'VEICULO' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                      >
                        Veículo Frota
                      </button>
                    </div>
                  </div>

                  {newMachine.type === 'VEICULO' && (
                    <div className="animate-fadeIn">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Placa do Veículo</label>
                      <input 
                        placeholder="ABC-1234" 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                        value={newMachine.plate} 
                        onChange={e => setNewMachine({...newMachine, plate: e.target.value.toUpperCase()})} 
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleAddMachine} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    🚀 FINALIZAR CADASTRO
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800 mb-6">Equipamentos Cadastrados</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {machines.map(m => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-2xl flex items-center space-x-4 border border-slate-100 group hover:border-emerald-200 transition-colors">
                      <div className="w-14 h-14 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                        {m.photoUrl ? (
                          <img src={m.photoUrl} className="w-full h-full object-cover" alt={m.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                            {m.type === 'VEICULO' ? '🚛' : '🚜'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-black text-slate-700 block leading-tight">{m.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {m.plate && <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded uppercase">Placa: {m.plate}</span>}
                          <span className="text-[9px] font-black uppercase text-emerald-600">{companies.find(c => c.id === m.companyId)?.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        )}

        {activeSubTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-800">{editingUserId ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
              <div className="space-y-4">
                <input placeholder="Nome" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editingUserId ? editUserData.name : newUser.name} onChange={e => editingUserId ? setEditUserData({...editUserData, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})} />
                <input placeholder="E-mail" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editingUserId ? editUserData.email : newUser.email} onChange={e => editingUserId ? setEditUserData({...editUserData, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})} />
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editingUserId ? editUserData.role : newUser.role} onChange={e => editingUserId ? setEditUserData({...editUserData, role: e.target.value as UserRole}) : setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value={UserRole.ABASTECEDOR}>Abastecedor</option>
                  <option value={UserRole.ADMINISTRADOR}>Administrador</option>
                  <option value={UserRole.GERENTE}>Gerente</option>
                </select>
                <div className="flex gap-2">
                   <button onClick={() => { if (editingUserId) { onUpdateUser(editingUserId, editUserData); setEditingUserId(null); } else { onAddUser(newUser); setNewUser({ name: '', email: '', role: UserRole.ABASTECEDOR, companyId: '' }); } }} className="flex-1 bg-emerald-600 text-white p-5 rounded-2xl font-black">Salvar</button>
                   {editingUserId && <button onClick={() => setEditingUserId(null)} className="px-6 bg-slate-100 rounded-2xl font-bold">Cancelar</button>}
                </div>
              </div>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-emerald-200">
                  <div className="flex items-center space-x-4">
                     <img src={u.photoUrl || "https://ui-avatars.com/api/?name=" + u.name} className="w-12 h-12 rounded-xl object-cover" />
                     <div>
                        <p className="font-black text-slate-800 text-sm">{u.name}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">{u.role}</p>
                     </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                     <button onClick={() => { setEditingUserId(u.id); setEditUserData(u); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg">✏️</button>
                     <button onClick={() => onDeleteUser(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'corrections' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-800">Solicitações de Ajuste</h3>
            <div className="space-y-6">
              {pendingCorrections.map(f => (
                <div key={f.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pendência</span>
                       <span className="text-slate-400 text-[10px] font-black uppercase">{new Date(f.date).toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xl">{machines.find(m => m.id === f.machineId)?.name || f.machineId}</h4>
                      <p className="text-slate-500 font-bold text-sm">Abastecedor: {users.find(u => u.id === f.userId)?.name}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-orange-100">
                       <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Motivo Sugerido:</p>
                       <p className="text-slate-700 italic font-medium">"{f.correctionNote}"</p>
                    </div>
                  </div>

                  <div className="w-full lg:w-96 flex flex-col justify-center gap-4">
                    {editingCorrectionId === f.id ? (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Litros</label>
                              <input type="number" step="0.1" value={correctionData.liters} onChange={e => setCorrectionData({...correctionData, liters: parseFloat(e.target.value)})} className="w-full bg-white p-3 rounded-xl border border-slate-200 font-bold text-sm" />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Horímetro</label>
                              <input type="number" value={correctionData.meter} onChange={e => setCorrectionData({...correctionData, meter: parseFloat(e.target.value)})} className="w-full bg-white p-3 rounded-xl border border-slate-200 font-bold text-sm" />
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { onProcessCorrection(f.id, true, correctionData); setEditingCorrectionId(null); }} className="flex-1 bg-emerald-600 text-white font-black py-3 rounded-xl text-xs uppercase">Aprovar e Salvar</button>
                           <button onClick={() => setEditingCorrectionId(null)} className="px-4 bg-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => { setEditingCorrectionId(f.id); setCorrectionData(f); }} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                          <span>✏️</span> <span>Editar e Seguir</span>
                        </button>
                        <button onClick={() => { if(confirm('Deseja rejeitar e excluir esta solicitação?')) onProcessCorrection(f.id, false); }} className="flex-1 bg-white text-red-500 font-black py-4 rounded-2xl border-2 border-red-50 hover:bg-red-50 transition-colors">
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {pendingCorrections.length === 0 && <p className="text-center text-slate-400 py-10 font-bold italic">Nenhuma solicitação pendente no momento.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
