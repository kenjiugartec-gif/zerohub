
import React, { useState, useMemo } from 'react';
import { InternationFCL, Vessel } from '../types';
import { 
  Box, 
  Plus, 
  Search, 
  Trash2, 
  Ship, 
  Calendar, 
  Anchor, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Clock,
  Package,
  Layers,
  ArrowDownToLine,
  Container as ContainerIcon
} from 'lucide-react';

interface ModularModuleProps {
  internations: InternationFCL[];
  onAddInternation: (item: InternationFCL) => void;
  onDeleteInternation: (id: string) => void;
  vessels: Vessel[];
}

const ModularModule: React.FC<ModularModuleProps> = ({ internations, onAddInternation, onDeleteInternation, vessels }) => {
  const [activeTab, setActiveTab] = useState<'FCL' | 'Primaria' | 'LCL'>('FCL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    containerId: '',
    bl: '',
    client: '',
    vessel: '',
    eta: new Date().toISOString().slice(0, 16),
    weight: 0,
    commodity: '',
    priority: 'Media' as 'Alta' | 'Media' | 'Baja'
  });

  const vesselOptions = useMemo(() => vessels.map(v => v.name), [vessels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.containerId || !formData.bl) return;

    const newItem: InternationFCL = {
      id: `INT-${Date.now()}`,
      ...formData,
      status: 'Programado',
      containerId: formData.containerId.toUpperCase(),
      bl: formData.bl.toUpperCase(),
      client: formData.client.toUpperCase(),
      commodity: formData.commodity.toUpperCase(),
      vessel: formData.vessel.toUpperCase(),
      operationType: activeTab // Guardar el tipo de operación
    };

    onAddInternation(newItem);
    setFormData({
      containerId: '',
      bl: '',
      client: '',
      vessel: '',
      eta: new Date().toISOString().slice(0, 16),
      weight: 0,
      commodity: '',
      priority: 'Media'
    });
  };

  // Filtrar según el tab activo y el término de búsqueda
  const filteredInternations = internations.filter(i => {
    const matchesTab = i.operationType === activeTab || (!i.operationType && activeTab === 'FCL'); // Compatibilidad con registros antiguos
    const matchesSearch = 
      i.containerId.includes(searchTerm.toUpperCase()) || 
      i.bl.includes(searchTerm.toUpperCase()) ||
      i.client.includes(searchTerm.toUpperCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 rounded-xl text-amber-500 shadow-xl shadow-slate-200">
            <Box size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Módulo de Internación</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestión de Operaciones de Ingreso</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('FCL')}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
              activeTab === 'FCL' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ContainerIcon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Internación FCL</span>
          </button>
          <button 
            onClick={() => setActiveTab('Primaria')}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
              activeTab === 'Primaria' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowDownToLine size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Primaria</span>
          </button>
          <button 
            onClick={() => setActiveTab('LCL')}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
              activeTab === 'LCL' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Carga LCL</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* FORMULARIO */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
              <Plus className="text-amber-500" size={18} />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">
                {activeTab === 'FCL' && 'Programar Internación FCL'}
                {activeTab === 'Primaria' && 'Programar Carga a Primaria'}
                {activeTab === 'LCL' && 'Programar Carga LCL'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">
                  {activeTab === 'LCL' ? 'ID Contenedor Master / Bulto' : 'Contenedor'}
                </label>
                <input 
                  required
                  placeholder={activeTab === 'LCL' ? "MASTER-ID" : "ABCD1234567"}
                  maxLength={activeTab === 'LCL' ? 20 : 11}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none uppercase font-mono transition-all"
                  value={formData.containerId}
                  onChange={e => setFormData({...formData, containerId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Bill of Lading (BL)</label>
                <input 
                  required
                  placeholder="BL-000000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none uppercase transition-all"
                  value={formData.bl}
                  onChange={e => setFormData({...formData, bl: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Cliente</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none uppercase transition-all"
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Nave</label>
                  <input 
                    list="vessels-list"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none uppercase transition-all"
                    value={formData.vessel}
                    onChange={e => setFormData({...formData, vessel: e.target.value})}
                  />
                  <datalist id="vessels-list">
                    {vesselOptions.map(v => <option key={v} value={v} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">ETA</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none transition-all"
                    value={formData.eta}
                    onChange={e => setFormData({...formData, eta: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Peso (KG)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none transition-all"
                    value={formData.weight || ''}
                    onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Prioridad</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none transition-all appearance-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Commodity / Carga</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-indigo-600 outline-none uppercase transition-all"
                  value={formData.commodity}
                  onChange={e => setFormData({...formData, commodity: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg mt-4"
              >
                Registrar {activeTab}
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Programación de {activeTab}</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="BUSCAR..."
                  className="w-48 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase outline-none focus:border-indigo-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidad / BL</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente / Carga</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logística</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInternations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Box size={32} className="opacity-20" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">No hay registros</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInternations.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 font-mono">{item.containerId}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{item.bl}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-700 uppercase truncate max-w-[150px]">{item.client}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 truncate max-w-[150px]">{item.commodity || 'GENERAL CARGO'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                              <Ship size={10} className="text-indigo-400" /> {item.vessel || 'TBN'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1">
                              <Clock size={10} /> {new Date(item.eta).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            item.status === 'En Patio' ? 'bg-green-50 text-green-600 border-green-200' :
                            item.status === 'Liberado' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {item.status === 'En Patio' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                            {item.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onDeleteInternation(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModularModule;
