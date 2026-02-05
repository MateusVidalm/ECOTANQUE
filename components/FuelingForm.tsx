
import React, { useState, useMemo } from 'react';
import { Machine, Company, User, Fueling } from '../types';

interface FuelingFormProps {
  user: User;
  machines: Machine[];
  companies: Company[];
  fuelings: Fueling[];
  onSubmit: (data: { machineId: string; companyId: string; liters: number; meter: number; operatorName: string; photoUrl: string; obs: string }) => void;
  onSuggestCorrection: (fuelingId: string, note: string) => void;
  tankBalance: number;
}

const FuelingForm: React.FC<FuelingFormProps> = ({ user, machines, companies, fuelings, onSubmit, onSuggestCorrection, tankBalance }) => {
  const [view, setView] = useState<'form' | 'history'>('form');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [liters, setLiters] = useState('');
  const [meter, setMeter] = useState('');
  const [operator, setOperator] = useState('');
  const [obs, setObs] = useState('');
  const [isPhotoSelected, setIsPhotoSelected] = useState(false);
  
  // Correction State
  const [activeCorrectionId, setActiveCorrectionId] = useState<string | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');

  // Filtrar máquinas pela unidade selecionada
  const filteredMachines = useMemo(() => {
    if (!selectedCompanyId) return [];
    return machines.filter(m => m.companyId === selectedCompanyId);
  }, [machines, selectedCompanyId]);

  const selectedMachine = machines.find(m => m.id === machineId);
  const myFuelings = fuelings.filter(f => f.userId === user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !machineId || !liters || !meter || !operator) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    const litersNum = parseFloat(liters);
    if (litersNum > tankBalance) {
      alert('Saldo insuficiente no tanque!');
      return;
    }
    onSubmit({
      machineId, 
      companyId: selectedCompanyId, 
      liters: litersNum, 
      meter: parseFloat(meter),
      operatorName: operator, 
      photoUrl: isPhotoSelected ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300' : '',
      obs
    });
    setMachineId(''); setLiters(''); setMeter(''); setOperator(''); setObs(''); setIsPhotoSelected(false);
    setView('history');
  };

  const handleSendCorrection = () => {
    if (!activeCorrectionId || !correctionNote) return;
    onSuggestCorrection(activeCorrectionId, correctionNote);
    setActiveCorrectionId(null);
    setCorrectionNote('');
    alert('Sugestão enviada para revisão do Gerente.');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn space-y-8">
      <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto">
        <button 
          onClick={() => setView('form')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'form' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Novo Registro
        </button>
        <button 
          onClick={() => setView('history')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Meus Lançamentos
        </button>
      </div>

      {view === 'form' ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="bg-emerald-600 p-10 text-white relative">
            <h2 className="text-2xl font-black tracking-tight">Abastecimento em Campo</h2>
            <p className="text-emerald-100 text-sm mt-1 font-medium">Estoque Tanque: <span className="font-bold underline">{tankBalance.toLocaleString()} L</span></p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">1. Unidade / Empresa</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    setMachineId(''); // Reseta máquina ao trocar unidade
                  }}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-700"
                  required
                >
                  <option value="">Selecione a unidade...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">2. Equipamento</label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-700 ${!selectedCompanyId && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!selectedCompanyId}
                  required
                >
                  <option value="">{selectedCompanyId ? 'Selecione o equipamento...' : 'Selecione a unidade primeiro'}</option>
                  {filteredMachines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.plate ? `[${m.plate}]` : ''}</option>
                  ))}
                </select>
                
                {selectedMachine && (
                  <div className="mt-4 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                      {selectedMachine.photoUrl ? (
                        <img src={selectedMachine.photoUrl} className="w-full h-full object-cover" alt={selectedMachine.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
                           {selectedMachine.type === 'VEICULO' ? '🚛' : '🚜'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Identificação confirmada:</p>
                      <p className="font-black text-slate-800">{selectedMachine.name}</p>
                      {selectedMachine.plate && <p className="text-xs font-bold text-slate-400 uppercase">Placa: {selectedMachine.plate}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operador Responsável</label>
                <input
                  type="text" value={operator} onChange={(e) => setOperator(e.target.value)}
                  placeholder="Nome do operador" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume (Litros)</label>
                <div className="relative">
                  <input
                    type="number" step="0.1" value={liters} onChange={(e) => setLiters(e.target.value)}
                    placeholder="0.0" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-black text-emerald-600 text-xl"
                    required
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">L</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hodômetro / Horímetro</label>
                <input
                  type="number" value={meter} onChange={(e) => setMeter(e.target.value)}
                  placeholder="Km ou Horas" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold"
                  required
                />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registro de Foto</label>
                 <label className={`w-full flex items-center justify-center space-x-3 border-2 border-dashed rounded-2xl px-5 py-3.5 cursor-pointer transition-all ${isPhotoSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400 hover:border-emerald-300'}`}>
                    <span className="text-xl">📸</span>
                    <span className="text-[11px] font-black uppercase tracking-tight">{isPhotoSelected ? 'Foto Ok' : 'Capturar Evidência'}</span>
                    <input type="file" className="hidden" onChange={() => setIsPhotoSelected(true)} />
                 </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center space-x-3 active:scale-95">
              <span>🚀 FINALIZAR LANÇAMENTO</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800">Meus Lançamentos ({myFuelings.length})</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Apenas visualização</p>
          </div>

          <div className="space-y-4">
            {myFuelings.slice().reverse().map(f => {
              const machine = machines.find(m => m.id === f.machineId);
              const machineName = machine ? `${machine.name} ${machine.plate ? `[${machine.plate}]` : ''}` : "Equipamento Removido";
              return (
                <div key={f.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden">
                      {machine?.photoUrl ? (
                         <img src={machine.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="text-xs font-black text-emerald-600">{f.liters}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Litros</span>
                        </>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{machineName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(f.date).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {f.correctionNote ? (
                      <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                        <p className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">Correção Solicitada</p>
                        <p className="text-[10px] text-orange-400 italic font-medium truncate max-w-[150px]">{f.correctionNote}</p>
                      </div>
                    ) : activeCorrectionId === f.id ? (
                      <div className="flex flex-1 gap-2">
                        <input 
                          type="text" 
                          value={correctionNote} 
                          onChange={e => setCorrectionNote(e.target.value)} 
                          placeholder="Descreva o erro..."
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                        />
                        <button onClick={handleSendCorrection} className="bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">Enviar</button>
                        <button onClick={() => setActiveCorrectionId(null)} className="bg-slate-200 text-slate-500 p-2 rounded-xl text-xs font-bold">✕</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveCorrectionId(f.id)}
                        className="bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-colors"
                      >
                        Solicitar Alteração
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {myFuelings.length === 0 && <div className="p-12 text-center text-slate-400 font-bold italic">Nenhum registro encontrado.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelingForm;
