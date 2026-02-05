
import React, { useMemo, useState } from 'react';
import { Fueling, TankStatus, Company, Machine, TankRefill } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  fuelings: Fueling[];
  tankStatus: TankStatus;
  companies: Company[];
  machines: Machine[];
  refills: TankRefill[];
}

const Dashboard: React.FC<DashboardProps> = ({ fuelings, tankStatus, companies, machines, refills = [] }) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const filteredFuelings = useMemo(() => {
    if (!selectedUnitId) return fuelings;
    return fuelings.filter(f => f.companyId === selectedUnitId);
  }, [fuelings, selectedUnitId]);

  const filteredRefills = useMemo(() => {
    if (!selectedUnitId) return refills;
    return refills.filter(r => r.companyId === selectedUnitId);
  }, [refills, selectedUnitId]);

  const totalConsumed = useMemo(() => filteredFuelings.reduce((s, f) => s + f.liters, 0), [filteredFuelings]);
  const totalRefilled = useMemo(() => filteredRefills.reduce((s, r) => s + r.liters, 0), [filteredRefills]);
  const lastRefill = useMemo(() => filteredRefills.length > 0 ? filteredRefills[filteredRefills.length - 1] : null, [filteredRefills]);

  const unitsData = useMemo(() => {
    return companies.map(c => {
      const consumed = fuelings.filter(f => f.companyId === c.id).reduce((s, f) => s + f.liters, 0);
      const refilled = refills.filter(r => r.companyId === c.id).reduce((s, r) => s + r.liters, 0);
      return { ...c, consumed, refilled, balance: refilled - consumed };
    });
  }, [companies, fuelings, refills]);

  const recentFuelings = useMemo(() => filteredFuelings.slice(-6).reverse(), [filteredFuelings]);

  const chartData = useMemo(() => {
    if (selectedUnitId) {
      const unitMachines = machines.filter(m => m.companyId === selectedUnitId);
      return unitMachines.map(m => ({
        name: m.name,
        liters: filteredFuelings.filter(f => f.machineId === m.id).reduce((s, f) => s + f.liters, 0)
      })).filter(d => d.liters > 0);
    }
    return unitsData.map(u => ({
      name: u.name,
      liters: u.consumed
    })).filter(d => d.liters > 0);
  }, [unitsData, selectedUnitId, machines, filteredFuelings]);

  const toggleFilter = (id: string) => setSelectedUnitId(prev => prev === id ? null : id);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans p-2 lg:p-0">
      {/* Header Estilizado */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-emerald-900 uppercase">Visão Operacional</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {selectedUnitId ? `Filtro Ativo: ${companies.find(c => c.id === selectedUnitId)?.name}` : 'Consolidado de todas as unidades'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedUnitId && (
            <button 
              onClick={() => setSelectedUnitId(null)} 
              className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all"
            >
              Limpar Filtro ✕
            </button>
          )}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors">
             <span className="text-lg">🔍</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Unidades - Cards Brancos */}
        <div className="col-span-12 space-y-4 mb-4">
          <div className="flex items-center gap-2 px-2">
            <span className="text-emerald-600 text-sm">🏢</span>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Resumo por Unidade</h2>
          </div>
          <div className="flex flex-wrap gap-4 pb-2">
            {unitsData.map(unit => (
              <button 
                key={unit.id} 
                onClick={() => toggleFilter(unit.id)} 
                className={`flex-1 min-w-[220px] bg-white p-5 rounded-[2rem] shadow-sm border-2 transition-all relative overflow-hidden text-left ${
                  selectedUnitId === unit.id 
                  ? 'border-emerald-500 ring-4 ring-emerald-500/5' 
                  : 'border-white hover:border-emerald-100'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{unit.name}</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${unit.balance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {unit.balance.toLocaleString()} L
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800">{unit.consumed.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Litros</span>
                </div>
                {selectedUnitId === unit.id && <div className="absolute top-0 right-0 p-2"><span className="text-emerald-500">✅</span></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Centro: Indicadores Gerais */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{tankStatus.name}</h2>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Capacidade: {tankStatus.capacity.toLocaleString()}L</span>
            </div>
            
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">CONSUMO {selectedUnitId ? 'FILTRADO' : 'TOTAL'}</p>
                  <p className="text-3xl font-black text-slate-800">{totalConsumed.toLocaleString('pt-BR')} L</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">RECARGA {selectedUnitId ? 'FILTRADA' : 'TOTAL'}</p>
                  <p className="text-3xl font-black text-slate-800">{totalRefilled.toLocaleString('pt-BR')} L</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Último Repasse</p>
                     <p className="text-xs font-black text-emerald-700">{lastRefill ? companies.find(c => c.id === lastRefill.companyId)?.name : '---'}</p>
                   </div>
                   <span className="text-xl">📊</span>
                </div>
                <div className="bg-emerald-600 p-4 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-emerald-100">
                  <div>
                    <p className="text-[9px] font-black text-emerald-100 uppercase mb-1">Saldo do Filtro</p>
                    <p className="text-sm font-black">{(totalRefilled - totalConsumed).toLocaleString('pt-BR')} L</p>
                  </div>
                  <span className="text-xl">⚖️</span>
                </div>
              </div>

              {/* Card Tanque em Destaque */}
              <div className="col-span-12 md:col-span-4 bg-white border-2 border-emerald-100 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Estoque Real Total</p>
                <div className="text-4xl font-black text-emerald-600 leading-none mb-1">{tankStatus.currentLevel.toLocaleString('pt-BR')} L</div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (tankStatus.currentLevel / tankStatus.capacity) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
                <span className="text-emerald-500">🚚</span> Lançamentos Recentes
              </h3>
              <div className="space-y-3">
                {recentFuelings.map(f => (
                  <div key={f.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl group hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-slate-700 truncate">
                        {machines.find(m => m.id === f.machineId)?.name || "Equipamento"}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{companies.find(c => c.id === f.companyId)?.name} • {new Date(f.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-black text-emerald-600 shrink-0">{f.liters}L</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-[320px]">
              <h3 className="text-xs font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
                <span className="text-emerald-500">📈</span> Consumo por {selectedUnitId ? 'Equipamento' : 'Unidade'}
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }} 
                    itemStyle={{ color: '#059669' }} 
                  />
                  <Area type="monotone" dataKey="liters" stroke="#059669" fillOpacity={1} fill="url(#colorLiters)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lateral: Visual Clean do Tanque */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border border-emerald-50 rounded-[2.5rem] p-8 flex flex-col items-center sticky top-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Status do Reservatório</h3>
            
            <div className="relative w-full h-72 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 overflow-hidden mb-8">
               {/* Vidro do Tanque */}
               <div className="relative z-10 w-24 h-48 border-4 border-slate-200 rounded-[2rem] p-1.5 bg-white/50 backdrop-blur-md shadow-lg">
                  <div className="w-full h-full bg-slate-100 rounded-[1.5rem] relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-1000 shadow-[0_-4px_12px_rgba(16,185,129,0.3)]" 
                      style={{ height: `${Math.min(100, (tankStatus.currentLevel / tankStatus.capacity) * 100)}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
               </div>
               
               {/* Decorativo ao fundo */}
               <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                  <span className="text-[120px]">⛽</span>
               </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-black text-slate-800 tracking-tight mb-1">{tankStatus.currentLevel.toLocaleString()} L</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível Atual do Óleo</p>
              
              <div className="mt-6 bg-emerald-50 px-4 py-2 rounded-full">
                <span className="text-[11px] font-black text-emerald-700">{((tankStatus.currentLevel / tankStatus.capacity) * 100).toFixed(1)}% Preenchido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
