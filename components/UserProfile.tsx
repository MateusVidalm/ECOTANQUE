
import React, { useState } from 'react';
import { User, Fueling, Machine } from '../types';

interface UserProfileProps {
  user: User;
  fuelings: Fueling[];
  machines: Machine[]; // Adicionado prop de machines para resolver nomes
  onUpdateUser: (userData: Partial<User>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, fuelings, machines, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user.name, email: user.email });

  const userFuelings = fuelings.filter(f => f.userId === user.id);
  const totalLiters = userFuelings.reduce((sum, f) => sum + f.liters, 0);
  const totalCount = userFuelings.length;

  const handleSave = () => {
    onUpdateUser(editData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Meu Usuário</h2>
          <p className="text-slate-500 font-medium">Informações pessoais e desempenho.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
          >
            Editar Perfil
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Details */}
        <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="relative mb-6 group">
            <img 
              src={user.photoUrl || "https://ui-avatars.com/api/?name=" + user.name} 
              className="w-32 h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-emerald-50 transition-transform group-hover:scale-105"
              alt="Avatar"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
              <span className="text-lg">⭐</span>
            </div>
          </div>

          {isEditing ? (
            <div className="w-full space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome Completo</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">E-mail</label>
                <input 
                  type="email" 
                  value={editData.email} 
                  onChange={e => setEditData({...editData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold text-xs">Salvar</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl font-bold text-xs">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
              <p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest mt-1">{user.role}</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">{user.email}</p>
            </>
          )}
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-emerald-600 p-8 rounded-[2rem] shadow-xl shadow-emerald-100 text-white flex flex-col justify-between">
            <div className="text-4xl mb-6 opacity-30">📊</div>
            <div>
              <p className="text-emerald-100 font-black uppercase text-[10px] tracking-widest mb-1">Total Abastecido</p>
              <h4 className="text-4xl font-black">{totalLiters.toLocaleString()} L</h4>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="text-4xl mb-6 text-slate-100">📍</div>
            <div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Atendimentos</p>
              <h4 className="text-4xl font-black text-slate-800">{totalCount}</h4>
            </div>
          </div>

          <div className="sm:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-800 text-lg mb-6 flex items-center">
              <span className="mr-3">🕒</span> Meus Lançamentos Recentes
            </h4>
            <div className="space-y-3">
              {userFuelings.slice(-5).reverse().map(f => {
                const machineName = machines.find(m => m.id === f.machineId)?.name || "Equipamento";
                return (
                  <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {f.liters}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">{machineName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(f.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">Confirmado</span>
                      {f.correctionNote && <p className="text-[9px] text-orange-500 font-bold mt-1">Sugeriu correção</p>}
                    </div>
                  </div>
                );
              })}
              {totalCount === 0 && <p className="text-center text-slate-400 py-8 italic font-medium">Nenhum abastecimento registrado por você.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
