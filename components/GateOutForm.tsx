
import React, { useState, useEffect, useRef } from 'react';
import { Container, TransportInfo, IDType } from '../types';
import { Upload, Truck as TruckIcon, PackageSearch, Layers, Clock, ChevronDown, IdCard, UserPlus, CheckCircle2, Calendar } from 'lucide-react';

// --- FUNCIONES DE UTILIDAD ---

const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 19);
};

const capitalizeProper = (val: string) => {
  if (!val) return '';
  return val
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatPlate = (val: string) => {
  const raw = val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (raw.length <= 4) return raw;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}`;
};

const formatID = (val: string, type: IDType) => {
  if (type === 'Extranjero') return val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const raw = val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 8)}-${raw.slice(8, 9)}`;
};

// --- COMPONENTE PRINCIPAL ---

interface GateOutFormProps {
  containers: Container[];
  knownDrivers: TransportInfo[];
  onGateOut: (id: string, transport: TransportInfo, exitDate: string) => void;
}

const GateOutForm: React.FC<GateOutFormProps> = ({ containers, knownDrivers, onGateOut }) => {
  const [outId, setOutId] = useState('');
  const [exitDate, setExitDate] = useState(getLocalISOString());
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [outTransport, setOutTransport] = useState<TransportInfo>({
    truckPlate: '', driverName: '', driverId: '', driverType: 'Nacional', company: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exitDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchId = outTransport.driverId.toUpperCase().trim();
    if (searchId.length >= 6) {
      const matched = knownDrivers.find(d => d.driverId.toUpperCase().trim() === searchId);
      if (matched) {
        setOutTransport(prev => ({
          ...prev,
          driverName: capitalizeProper(matched.driverName),
          company: capitalizeProper(matched.company),
          driverType: matched.driverType,
          truckPlate: prev.truckPlate || matched.truckPlate
        }));
        setIsNewRecord(false);
      } else {
        setIsNewRecord(true);
      }
    }
  }, [outTransport.driverId, knownDrivers]);

  const handleUpdateToNow = () => {
    setExitDate(getLocalISOString());
  };

  const handleIconClick = () => {
    if (exitDateInputRef.current) {
      if (typeof (exitDateInputRef.current as any).showPicker === 'function') {
        (exitDateInputRef.current as any).showPicker();
      } else {
        exitDateInputRef.current.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outId) return alert("Error: Debe seleccionar un contenedor para despachar.");
    onGateOut(
      outId, 
      { ...outTransport, driverName: capitalizeProper(outTransport.driverName), company: capitalizeProper(outTransport.company) },
      new Date(exitDate).toISOString()
    );
    setOutId('');
    setOutTransport({ truckPlate: '', driverName: '', driverId: '', driverType: 'Nacional', company: '' });
  };

  const selectedContainer = containers.find(c => c.id === outId);

  const calculateStay = (entryDate: string) => {
    const start = new Date(entryDate).getTime();
    const end = new Date(exitDate).getTime();
    const diff = Math.max(0, end - start);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const isFormValid = 
    outId !== '' &&
    exitDate !== '' &&
    outTransport.truckPlate.length === 7 &&
    outTransport.driverName.length >= 3 &&
    (outTransport.driverType === 'Extranjero' ? outTransport.driverId.length >= 6 : outTransport.driverId.length === 10);

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 border-t-8 border-t-red-600">
      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-red-600 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                <PackageSearch size={14} /> Inventario en Patio
              </h3>
              <div className="space-y-5">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Unidad para Despacho</label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-sm outline-none transition-all"
                  >
                    <span>{outId || '-- Seleccionar Contenedor --'}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden dropdown-3d ${isDropdownOpen ? 'dropdown-active' : ''}`}>
                    <div className="max-h-60 overflow-y-auto no-scrollbar">
                      {containers.map(c => (
                        <div
                          key={c.id}
                          onClick={() => { setOutId(c.id); setIsDropdownOpen(false); }}
                          className="px-4 py-3 hover:bg-red-50 text-sm font-bold text-slate-700 cursor-pointer border-b border-slate-50 last:border-none"
                        >
                          {c.id} | Bloque {c.location.block} - B{c.location.bay} R{c.location.row}
                        </div>
                      ))}
                      {containers.length === 0 && <div className="p-4 text-xs font-bold text-slate-400 text-center">Sin stock en patio</div>}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Fecha y Hora de Salida</label>
                      <button 
                        type="button" 
                        onClick={handleUpdateToNow} 
                        className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <Clock size={10} /> <span className="text-[8px] font-black uppercase">Ahora</span>
                      </button>
                    </div>
                    <div className="relative group">
                       <button 
                        type="button" 
                        onClick={handleIconClick}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors z-10"
                       >
                         <Calendar size={14} />
                       </button>
                       <input 
                        ref={exitDateInputRef}
                        required 
                        type="datetime-local"
                        step="1"
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-red-600 outline-none transition-colors cursor-pointer" 
                        value={exitDate} 
                        onChange={e => setExitDate(e.target.value)}
                       />
                    </div>
                 </div>

                {selectedContainer && (
                  <div className="p-6 bg-slate-900 rounded-lg text-white space-y-5 shadow-2xl relative overflow-hidden group">
                    <Layers size={80} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2 text-red-400">
                        <Clock size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cálculo de Estadía</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">Posición (BAROTI)</p>
                            <p className="text-sm font-black font-mono">
                                {selectedContainer.location.block}-{selectedContainer.location.bay}-{selectedContainer.location.row}-{selectedContainer.location.tier}
                            </p>
                         </div>
                         <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">Tiempo en Yard</p>
                            <p className="text-sm font-black font-mono text-indigo-400">{calculateStay(selectedContainer.entryDate)}</p>
                         </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cliente: <span className="text-white ml-2">{selectedContainer.client}</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-800 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                <TruckIcon size={14} className="text-indigo-600" /> Logística de Retiro
              </h3>
              <div className="space-y-5">
                 <div className="w-full">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Patente Camión (XXXX-XX)</label>
                    <input 
                      required placeholder="ABCD-12"
                      maxLength={7}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-lg uppercase font-mono font-black tracking-widest focus:border-red-600 outline-none"
                      value={outTransport.truckPlate}
                      onChange={e => setOutTransport({...outTransport, truckPlate: formatPlate(e.target.value)})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Tipo Documento</label>
                       <div className="flex bg-slate-100 p-1 rounded-md">
                          {(['Nacional', 'Extranjero'] as IDType[]).map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setOutTransport({...outTransport, driverType: t, driverId: ''})}
                              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-sm ${outTransport.driverType === t ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                            >
                              {t}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">
                         {outTransport.driverType === 'Nacional' ? 'RUT (XXXXXXXX-X)' : 'DNI / Pasaporte'}
                       </label>
                       <div className="relative">
                          <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            required 
                            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-red-600 outline-none uppercase font-mono" 
                            placeholder={outTransport.driverType === 'Nacional' ? "12345678-9" : "ABC123456"}
                            maxLength={outTransport.driverType === 'Nacional' ? 10 : 20}
                            value={outTransport.driverId} 
                            onChange={e => setOutTransport({...outTransport, driverId: formatID(e.target.value, outTransport.driverType)})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="relative">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Nombre Chofer</label>
                    <input 
                      required 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-red-600 outline-none" 
                      value={outTransport.driverName} 
                      onChange={e => setOutTransport({...outTransport, driverName: capitalizeProper(outTransport.driverName)})}
                    />
                    {outTransport.driverId.length >= 6 && (
                      <div className={`absolute right-3 top-9 flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider ${isNewRecord ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                        {isNewRecord ? <UserPlus size={10} /> : <CheckCircle2 size={10} />}
                        {isNewRecord ? 'Registrar Nuevo' : 'Chofer Conocido'}
                      </div>
                    )}
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Empresa Transportista</label>
                    <input 
                      required 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-red-600 outline-none" 
                      value={outTransport.company} 
                      onChange={e => setOutTransport({...outTransport, company: capitalizeProper(outTransport.company)})}
                    />
                 </div>
              </div>
              <div className="pt-10">
                <button 
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full py-4 rounded-md font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 bg-red-600 text-white shadow-xl shadow-red-100 hover:bg-red-700 hover:-translate-y-0.5 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:shadow-none disabled:translate-y-0"
                >
                  <Upload size={18} />
                  Confirmar Salida
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GateOutForm;
