
import React, { useState, useMemo } from 'react';
import { Fueling, TankRefill, Company, Machine, User, AuditLog, UserRole } from '../types';

interface ReportsProps {
  user: User;
  fuelings: Fueling[];
  refills: TankRefill[];
  companies: Company[];
  machines: Machine[];
  users: User[];
  logs: AuditLog[];
  onDeleteFueling: (id: string) => void;
  onUpdateFueling: (id: string, data: Partial<Fueling>) => void;
}

const Reports: React.FC<ReportsProps> = ({ user, fuelings, refills, companies, machines, users, logs, onDeleteFueling, onUpdateFueling }) => {
  const [activeTab, setActiveTab] = useState<'consumption' | 'refills' | 'tank_audit'>('consumption');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterMachine, setFilterMachine] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  // States para Edição de Lançamento
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Fueling>>({});

  const isManager = user.role === UserRole.GERENTE;

  const filteredFuelings = useMemo(() => {
    return fuelings.filter(f => {
      const matchCompany = filterCompany ? f.companyId === filterCompany : true;
      const matchMachine = filterMachine ? f.machineId === filterMachine : true;
      const date = new Date(f.date).getTime();
      const start = dateStart ? new Date(dateStart).getTime() : 0;
      const end = dateEnd ? new Date(dateEnd).getTime() + 86400000 : Infinity;
      return matchCompany && matchMachine && date >= start && date <= end;
    });
  }, [fuelings, filterCompany, filterMachine, dateStart, dateEnd]);

  const tankAdjustments = useMemo(() => {
    return logs.filter(log => log.entity === 'TANK' && log.action === 'ADJUST');
  }, [logs]);

  const handleStartEdit = (f: Fueling) => {
    setEditingId(f.id);
    setEditData({ liters: f.liters, meter: f.meter });
  };

  const handleSaveEdit = (id: string) => {
    if (!editData.liters || isNaN(editData.liters)) return;
    onUpdateFueling(id, editData);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Centro de Relatórios</h2>
          <p className="text-slate-500 font-medium">Histórico auditável de toda a operação de diesel.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button onClick={() => setActiveTab('consumption')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'consumption' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400'}`}>Consumo</button>
          <button onClick={() => setActiveTab('refills')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'refills' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400'}`}>Cargas</button>
          {isManager && (
            <button onClick={() => setActiveTab('tank_audit')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tank_audit' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-400'}`}>Auditoria Tanque</button>
          )}
        </div>
      </header>

      {/* Filtros para Consumo e Cargas */}
      {activeTab !== 'tank_audit' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa</label>
            <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Todas</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Equipamento</label>
            <select value={filterMachine} onChange={e => setFilterMachine(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Todos</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name} {m.plate ? `[${m.plate}]` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Início</label>
            <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Fim</label>
            <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      )}

      {/* Tabela de Consumo */}
      {activeTab === 'consumption' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">Abastecimentos de Equipamentos</h3>
            {isManager && <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Gerenciamento Ativado</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-10 py-5">Data/Hora</th>
                  <th className="px-10 py-5">Equipamento [Placa]</th>
                  <th className="px-10 py-5">Unidade</th>
                  <th className="px-10 py-5">Volume (L)</th>
                  <th className="px-10 py-5">Operador/Responsável</th>
                  {isManager && <th className="px-10 py-5 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFuelings.slice().reverse().map(f => {
                  const machine = machines.find(m => m.id === f.machineId);
                  const machineName = machine ? machine.name : "Removido";
                  const machinePlate = machine?.plate ? ` [${machine.plate}]` : "";
                  
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-5 text-xs font-medium text-slate-500 whitespace-nowrap">{new Date(f.date).toLocaleString('pt-BR')}</td>
                      <td className="px-10 py-5 text-xs font-black text-slate-800">{machineName}{machinePlate}</td>
                      <td className="px-10 py-5 text-[10px] font-black text-emerald-600 uppercase">{companies.find(c => c.id === f.companyId)?.name}</td>
                      <td className="px-10 py-5">
                        {editingId === f.id ? (
                          <input type="number" step="0.1" value={editData.liters} onChange={e => setEditData({...editData, liters: parseFloat(e.target.value)})} className="w-20 bg-white border border-emerald-300 rounded-lg p-1 text-xs font-black text-emerald-600" />
                        ) : (
                          <span className="text-xs font-black text-emerald-600">{f.liters.toLocaleString()} L</span>
                        )}
                      </td>
                      <td className="px-10 py-5">
                        <p className="text-xs font-bold text-slate-700">{f.operatorName}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Lançado por: {users.find(u => u.id === f.userId)?.name}</p>
                      </td>
                      {isManager && (
                        <td className="px-10 py-5 text-right">
                          {editingId === f.id ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleSaveEdit(f.id)} className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">Salvar</button>
                              <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">✕</button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleStartEdit(f)} className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs">✏️</button>
                              <button onClick={() => { if(confirm(`Deseja excluir o abastecimento? O combustível voltará ao tanque.`)) onDeleteFueling(f.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg text-xs">🗑️</button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'refills' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-800">Histórico de Cargas no Tanque</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-10 py-5">Data</th>
                  <th className="px-10 py-5">Fornecedor</th>
                  <th className="px-10 py-5">Volume Injetado</th>
                  <th className="px-10 py-5">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {refills.slice().reverse().map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5 text-xs font-medium text-slate-500">{new Date(r.date).toLocaleString('pt-BR')}</td>
                    <td className="px-10 py-5 text-xs font-black text-slate-800">{companies.find(c => c.id === r.companyId)?.name}</td>
                    <td className="px-10 py-5 text-xs font-black text-emerald-600">+{r.liters.toLocaleString()} L</td>
                    <td className="px-10 py-5 text-xs font-bold text-slate-700">{users.find(u => u.id === r.userId)?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tank_audit' && isManager && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-orange-100 overflow-hidden animate-fadeIn">
          <div className="px-10 py-8 bg-orange-50 border-b border-orange-100">
            <h3 className="text-xl font-black text-orange-800 flex items-center gap-3">
              <span>📜</span> Auditoria de Ajustes Manuais
            </h3>
            <p className="text-orange-600/70 text-xs font-bold mt-1 uppercase tracking-widest">Rastreabilidade Total por Gerente</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-10 py-5">Data/Hora</th>
                  <th className="px-10 py-5">Usuário</th>
                  <th className="px-10 py-5">Valores (Antigo → Novo)</th>
                  <th className="px-10 py-5">Motivo da Alteração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tankAdjustments.slice().reverse().map(adj => (
                  <tr key={adj.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-10 py-5 text-xs font-medium text-slate-500">{new Date(adj.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="px-10 py-5 text-xs font-black text-slate-800">{users.find(u => u.id === adj.userId)?.name}</td>
                    <td className="px-10 py-5 text-xs font-black text-slate-600">
                      <span className="text-slate-400 line-through">{adj.oldValue}L</span>
                      <span className="mx-2">→</span>
                      <span className="text-emerald-600">{adj.newValue}L</span>
                    </td>
                    <td className="px-10 py-5">
                      <div className="bg-white px-4 py-2 rounded-xl border border-orange-100/50 shadow-sm inline-block">
                        <p className="text-xs font-bold text-slate-700 italic">"{adj.reason}"</p>
                      </div>
                    </td>
                  </tr>
                ))}
                {tankAdjustments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-10 py-16 text-center text-slate-400 font-bold italic">Nenhum ajuste manual registrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
