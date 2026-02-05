
import React, { useState } from 'react';
import { Company, TankStatus } from '../types';

interface RefillFormProps {
  companies: Company[];
  tankStatus: TankStatus;
  onSubmit: (data: { companyId: string; liters: number }) => void;
  onUpdateMetadata: (name: string, capacity: number) => void;
  onAdjustTank: (liters: number, reason: string) => void;
}

const RefillForm: React.FC<RefillFormProps> = ({ companies, tankStatus, onSubmit, onUpdateMetadata, onAdjustTank }) => {
  const [activeTab, setActiveTab] = useState<'refill' | 'settings'>('refill');
  
  // Refill State
  const [companyId, setCompanyId] = useState('');
  const [liters, setLiters] = useState('');

  // Settings State
  const [tankName, setTankName] = useState(tankStatus.name);
  const [tankCapacity, setTankCapacity] = useState(tankStatus.capacity.toString());
  const [tankCurrentLevel, setTankCurrentLevel] = useState(tankStatus.currentLevel.toString());
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const handleSubmitRefill = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(liters);
    if (!companyId || !liters || isNaN(l)) return;

    if (tankStatus.currentLevel + l > tankStatus.capacity) {
      if (!confirm(`A quantidade excede a capacidade do tanque (${tankStatus.capacity.toLocaleString()}L). Deseja prosseguir?`)) {
        return;
      }
    }

    onSubmit({ companyId, liters: l });
    setCompanyId('');
    setLiters('');
  };

  const handleUpdateTankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(tankCapacity);
    const level = parseFloat(tankCurrentLevel);
    
    if (!tankName || isNaN(cap) || isNaN(level)) {
      alert("Preencha todos os campos numéricos.");
      return;
    }

    // Se houve alteração no nível atual, o motivo é obrigatório
    if (level !== tankStatus.currentLevel) {
      if (!adjustmentReason) {
        alert("Para alterar o volume atual manualmente, você deve informar o motivo da modificação.");
        return;
      }
      onAdjustTank(level, adjustmentReason);
    }

    // Atualiza metadados (nome e capacidade)
    onUpdateMetadata(tankName, cap);
    setAdjustmentReason('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Tab Selector */}
      <div className="flex bg-[#141d18] p-2 rounded-2xl border border-emerald-900/30 w-fit mx-auto shadow-2xl">
        <button 
          onClick={() => setActiveTab('refill')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'refill' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Carga Tanque
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Configurar Tanque
        </button>
      </div>

      {activeTab === 'refill' ? (
        <div className="bg-[#141d18] rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-900/20">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-10 text-white text-center">
            <h2 className="text-2xl font-black tracking-tighter uppercase">Abastecimento do Tanque</h2>
            <p className="text-emerald-100 text-xs mt-1 font-bold">Saldo Atual: {tankStatus.currentLevel.toLocaleString()}L de {tankStatus.capacity.toLocaleString()}L</p>
          </div>

          <form onSubmit={handleSubmitRefill} className="p-10 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Empresa Fornecedora</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-white"
                  required
                >
                  <option value="">Selecione a empresa...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quantidade Reposta (L)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-black text-2xl text-emerald-500"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 font-black">L</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-2xl shadow-xl shadow-emerald-950 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <span className="text-lg">🚛</span>
              <span>EFETUAR CARGA DE DIESEL</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-[#141d18] rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-900/20">
          <div className="bg-slate-800 p-10 text-white text-center">
            <h2 className="text-2xl font-black tracking-tighter uppercase">Gestão do Reservatório</h2>
            <p className="text-slate-400 text-xs mt-1 font-bold">Ajustes manuais e configurações de sistema.</p>
          </div>

          <form onSubmit={handleUpdateTankConfig} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome do Tanque</label>
                <input
                  type="text"
                  value={tankName}
                  onChange={(e) => setTankName(e.target.value)}
                  className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-bold text-white focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Capacidade Nominal (L)</label>
                <input
                  type="number"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value)}
                  className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-bold text-white focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="bg-[#0c1410] p-8 rounded-3xl border border-emerald-900/20 space-y-6">
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <span className="text-base">⚠️</span> Ajuste Manual de Volume
              </h3>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quantidade Atual (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tankCurrentLevel}
                  onChange={(e) => setTankCurrentLevel(e.target.value)}
                  className="w-full bg-[#1a2520] border border-emerald-900/20 rounded-2xl px-6 py-4 outline-none font-black text-xl text-emerald-400"
                  required
                />
              </div>

              {parseFloat(tankCurrentLevel) !== tankStatus.currentLevel && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Motivo da Modificação (Obrigatório)</label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Descreva o motivo do ajuste (ex: Erro de lançamento, Vazamento, Calibração...)"
                    className="w-full bg-[#1a2520] border border-orange-900/20 rounded-2xl px-6 py-4 outline-none font-medium text-white h-24 focus:border-orange-500"
                    required
                  />
                </div>
              )}
            </div>

            <div className="bg-emerald-900/10 p-6 rounded-2xl border border-emerald-500/10">
               <div className="flex justify-between text-[10px] font-black uppercase text-emerald-500 mb-2">
                 <span>Ocupação do Reservatório</span>
                 <span>{((parseFloat(tankCurrentLevel) / parseFloat(tankCapacity)) * 100 || 0).toFixed(1)}%</span>
               </div>
               <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(parseFloat(tankCurrentLevel) / parseFloat(tankCapacity)) * 100}%` }}></div>
               </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-emerald-50 text-slate-900 font-black py-6 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              Confirmar Alterações
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RefillForm;
