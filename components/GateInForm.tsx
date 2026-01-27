
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Select from 'react-select';
import { Container, YardEspacio, ContainerSize, ContainerType, TransportInfo, LoadType, IDType, MaterialType, DocumentationPreload, Vessel, ShippingLine } from '../types';
import { YardConfig } from '../App';
import { Download, LogIn, MapPin, Truck as TruckIcon, Anchor, Ship, AlertTriangle, FileText, ChevronDown, IdCard, Box, Package, Scale, UserPlus, CheckCircle2, ClipboardList, Tag, Hash, Calendar, Clock, Weight, Layers, FileDigit, Info, Sparkles } from 'lucide-react';

// --- FUNCIONES DE UTILIDAD ---

const calculateCheckDigit = (containerNum: string): number | null => {
  if (containerNum.length !== 10) return null;
  const chars = containerNum.toUpperCase().split('');
  const charMap: Record<string, number> = {
    'A': 10, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17, 'H': 18, 'I': 19, 'J': 20,
    'K': 21, 'L': 23, 'M': 24, 'N': 25, 'O': 26, 'P': 27, 'Q': 28, 'R': 29, 'S': 30, 'T': 31,
    'U': 32, 'V': 34, 'W': 35, 'X': 36, 'Y': 37, 'Z': 38
  };
  const values = chars.map((char, i) => i < 4 ? charMap[char] || 0 : parseInt(char, 10));
  const weights = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
  const sum = values.reduce((acc, val, i) => acc + val * weights[i], 0);
  return (sum % 11) % 10;
};

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

const KNOWN_VESSELS = [
  'MSC Gulsun', 'Maersk Essen', 'CMA CGM Antoine de Saint Exupery', 'HMM Algeciras', 
  'Ever Golden', 'MOL Truth', 'Cosco Shipping Universe', 'Madrid Maersk', 
  'MSC Oscar', 'OOCL Hong Kong', 'Triton', 'MSC Isabella', 'Ever Ace',
  'HMM Oslo', 'MSC Tessa', 'CMA CGM Palais Royal', 'MSC Irina', 'MSC Loreto',
  'OOCL Spain', 'Berlin Express', 'Manila Maersk', 'Mumbai Maersk'
];

const DEFAULT_SHIPPING_LINES = [
  'Maersk Line', 'MSC (Mediterranean Shipping Company)', 'CMA CGM', 'Hapag-Lloyd',
  'ONE (Ocean Network Express)', 'Evergreen Marine', 'HMM (Hyundai Merchant Marine)',
  'Yang Ming Marine Transport', 'ZIM Integrated Shipping', 'Wan Hai Lines', 'Cosco Shipping'
];

// --- ESTILOS REACT-SELECT ---

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#4f46e5' : '#e2e8f0',
    borderRadius: '0.25rem', // REDUCED BORDER RADIUS
    padding: '2px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#4f46e5',
    },
    fontWeight: 'bold',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f5f7ff' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#334155',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#4f46e5',
    },
  }),
};

// --- COMPONENTES AUXILIARES ---

const PosIndicator = ({ label, value }: { label: string, value: string }) => (
  <div className="font-roboto">
    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-tight">{label}</p>
    <p className="text-[12px] font-black text-white">{value}</p>
  </div>
);

const CustomSelect = ({ label, options, value, onChange, placeholder, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden dropdown-3d ${isOpen ? 'dropdown-active' : ''}`}>
        <div className="max-h-60 overflow-y-auto no-scrollbar">
          {options.map((option: string) => (
            <div
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className="px-4 py-3 hover:bg-indigo-50 text-sm font-bold text-slate-700 cursor-pointer transition-colors border-b border-slate-50 last:border-none"
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

interface GateInFormProps {
  selectedEspacio: YardEspacio | null;
  availableEspacios: YardEspacio[];
  knownDrivers: TransportInfo[];
  vessels: Vessel[];
  shippingLines: ShippingLine[];
  yardConfig: YardConfig;
  preloads: DocumentationPreload[];
  onGateIn: (data: Container) => void;
}

const MATERIAL_TYPES: MaterialType[] = ['Cajas', 'Bobinas', 'Pallets', 'Sacos', 'Planchas'];

const GateInForm: React.FC<GateInFormProps> = ({ selectedEspacio, availableEspacios, knownDrivers, vessels, shippingLines, yardConfig, preloads, onGateIn }) => {
  const [ownerCode, setOwnerCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [checkDigit, setCheckDigit] = useState('');
  const [isDvAuto, setIsDvAuto] = useState(true);
  const [manualEspacio, setManualEspacio] = useState<string>('');
  const [loadType, setLoadType] = useState<LoadType>('FCL');
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [isDataPreloaded, setIsDataPreloaded] = useState(false);

  // Referencias para el salto de foco
  const serialRef = useRef<HTMLInputElement>(null);
  const checkDigitRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    client: '', receptionNote: '', eirNumber: '', vessel: '', voyage: '', bl: '', shippingLine: '',
    weight: 0, tare: 0, size: "20'" as ContainerSize, type: 'Dry' as ContainerType,
    truckPlate: '', driverName: '', driverId: '', driverType: 'Nacional' as IDType, company: '',
    cargoQuantity: 0, cargoWeight: 0, entryDate: getLocalISOString(),
    materialType: undefined as MaterialType | undefined
  });

  // Opciones para React-Select
  const vesselOptions = useMemo(() => {
    const combined = [...new Set([...KNOWN_VESSELS, ...vessels.map(v => v.name)])];
    return combined.sort().map(v => ({ value: v.toUpperCase(), label: v }));
  }, [vessels]);

  const lineOptions = useMemo(() => {
    const combined = [...new Set([...DEFAULT_SHIPPING_LINES, ...shippingLines.map(l => l.name)])];
    return combined.sort().map(l => ({ value: l.toUpperCase(), label: l }));
  }, [shippingLines]);

  // El bloque LCL es el que está definido en la configuración, o el último por defecto
  const lclDesignatedBlock = useMemo(() => {
    return yardConfig.lclBlock || yardConfig.blocks[yardConfig.blocks.length - 1];
  }, [yardConfig]);

  // Filtrar espacios disponibles según el tipo de carga
  const filteredEspacios = useMemo(() => {
    if (loadType === 'LCL') {
      return availableEspacios.filter(s => s.block === lclDesignatedBlock);
    } else {
      if (yardConfig.blocks.length > 1) {
        return availableEspacios.filter(s => s.block !== lclDesignatedBlock);
      }
      return availableEspacios;
    }
  }, [availableEspacios, loadType, lclDesignatedBlock, yardConfig.blocks]);

  // Actualizar loadType automáticamente si se selecciona un espacio desde el mapa
  useEffect(() => {
    if (selectedEspacio) {
      const isLclEspacio = selectedEspacio.block === lclDesignatedBlock;
      setLoadType(isLclEspacio ? 'LCL' : 'FCL');
    }
  }, [selectedEspacio, lclDesignatedBlock]);

  // Auto-seleccionar primer espacio válido al cambiar de tipo si no hay uno seleccionado
  useEffect(() => {
    if (!selectedEspacio && filteredEspacios.length > 0) {
      const firstAvailable = filteredEspacios[0];
      setManualEspacio(`${firstAvailable.block}-${firstAvailable.bay}-${firstAvailable.row}-${firstAvailable.tier}`);
    }
  }, [loadType, filteredEspacios, selectedEspacio]);

  // Lógica de Autocompletado por Precarga Documental (Número de Guía)
  useEffect(() => {
    const note = formData.receptionNote.toUpperCase().trim();
    if (note.length >= 4) {
      const matched = preloads.find(p => p.receptionNote.toUpperCase().trim() === note);
      if (matched) {
        setFormData(prev => ({
          ...prev,
          client: matched.client,
          vessel: matched.vessel,
          voyage: matched.voyage,
          bl: matched.bl,
          shippingLine: matched.shippingLine,
          weight: matched.weight
        }));

        // Autocompletar contenedor si existe en la precarga
        if (matched.containerId && loadType === 'FCL') {
          const cid = matched.containerId.replace(/[^A-Z0-9]/gi, ''); // Limpiar para procesar
          if (cid.length >= 4) setOwnerCode(cid.slice(0, 4));
          if (cid.length >= 10) setSerialNumber(cid.slice(4, 10));
          if (cid.length >= 11) {
            setCheckDigit(cid.slice(10, 11));
            setIsDvAuto(false);
          }
        }

        setIsDataPreloaded(true);
      } else {
        setIsDataPreloaded(false);
      }
    } else {
      setIsDataPreloaded(false);
    }
  }, [formData.receptionNote, preloads, loadType]);

  const isTransportComplete = 
    formData.truckPlate.length === 7 && 
    formData.driverName.trim().length >= 3 && 
    (formData.driverType === 'Extranjero' ? formData.driverId.length >= 6 : formData.driverId.length === 10) && 
    formData.company.trim().length >= 2;

  const combinedContainerId = (ownerCode + serialNumber).toUpperCase();
  const isVesselValid = loadType === 'LCL' || formData.vessel.trim().length >= 2;
  const isContainerValid = loadType === 'LCL' || (ownerCode.length === 4 && serialNumber.length === 6 && checkDigit.length === 1);

  const canSubmit = 
    isTransportComplete &&
    isVesselValid &&
    isContainerValid &&
    formData.client.trim() !== '' &&
    formData.receptionNote.trim() !== '' &&
    formData.entryDate !== '' &&
    (loadType === 'LCL' 
      ? (formData.cargoQuantity > 0 && formData.cargoWeight > 0 && !!formData.materialType) 
      : (formData.shippingLine !== '' && formData.tare >= 0 && formData.weight > 0));

  useEffect(() => {
    if (loadType === 'FCL' && combinedContainerId.length === 10 && isDvAuto) {
      const calculated = calculateCheckDigit(combinedContainerId);
      if (calculated !== null) setCheckDigit(calculated.toString());
    }
  }, [combinedContainerId, isDvAuto, loadType]);

  useEffect(() => {
    const searchId = formData.driverId.toUpperCase().trim();
    if (searchId.length >= 6) {
      const matched = knownDrivers.find(d => d.driverId.toUpperCase().trim() === searchId);
      if (matched) {
        setFormData(prev => ({
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
  }, [formData.driverId, knownDrivers]);

  const handleUpdateToNow = () => {
    setFormData(prev => ({ ...prev, entryDate: getLocalISOString() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    let targetEspacio = selectedEspacio || (manualEspacio ? availableEspacios.find(s => `${s.block}-${s.bay}-${s.row}-${s.tier}` === manualEspacio) : undefined);
    if (!targetEspacio) return alert("Ubicación inválida.");

    const finalId = loadType === 'LCL' 
      ? `LCL-${formData.receptionNote}-${formData.client.slice(0,3).toUpperCase()}`
      : `${combinedContainerId}-${checkDigit}`;

    onGateIn({
      ...formData,
      id: finalId,
      status: 'In',
      entryDate: new Date(formData.entryDate).toISOString(),
      location: { block: targetEspacio.block, bay: targetEspacio.bay, row: targetEspacio.row, tier: targetEspacio.tier },
      transport: { 
        truckPlate: formData.truckPlate, 
        driverName: capitalizeProper(formData.driverName), 
        driverId: formData.driverId,
        driverType: formData.driverType,
        company: capitalizeProper(formData.company) 
      },
      loadType,
      cargoQuantity: loadType === 'LCL' ? formData.cargoQuantity : undefined,
      cargoWeight: loadType === 'LCL' ? formData.cargoWeight : undefined,
      materialType: loadType === 'LCL' ? formData.materialType : undefined
    });
  };

  // Manejadores para el salto de foco automático
  const handleOwnerCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/gi, '');
    setOwnerCode(val);
    if (val.length === 4) {
      serialRef.current?.focus();
    }
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/gi, '');
    setSerialNumber(val);
    if (val.length === 6) {
      checkDigitRef.current?.focus();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 border-t-8 border-t-indigo-600">
      <div className="p-8 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-900 rounded-md text-white">
                 <LogIn size={22} />
              </div>
              <div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Registro de Recepción</h2>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocolo Gate-In Terminal</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="bg-slate-100 px-4 py-2 rounded-md border border-slate-200">
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Espacios disponibles para {loadType}: {filteredEspacios.length}</span>
              </div>
           </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                <TruckIcon size={14} /> 1. Datos del Chofer y Transporte
              </h3>
              <div className="space-y-5">
                 <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Patente Camión (XXXX-XX)</label>
                    <input 
                      required placeholder="ABCD-12"
                      maxLength={7}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-lg uppercase font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                      value={formData.truckPlate}
                      onChange={e => {
                        const val = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                        const formatted = val.length <= 4 ? val : `${val.slice(0, 4)}-${val.slice(4, 6)}`;
                        setFormData({...formData, truckPlate: formatted});
                      }}
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
                              onClick={() => setFormData({...formData, driverType: t, driverId: ''})}
                              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-sm ${formData.driverType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                            >
                              {t}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">
                         {formData.driverType === 'Nacional' ? 'RUT (XXXXXXXX-X)' : 'DNI / Pasaporte'}
                       </label>
                       <div className="relative">
                          <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            required 
                            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none uppercase font-mono" 
                            placeholder={formData.driverType === 'Nacional' ? "12345678-9" : "ABC123456"}
                            maxLength={formData.driverType === 'Nacional' ? 10 : 20}
                            value={formData.driverId} 
                            onChange={e => {
                              const raw = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                              const formatted = formData.driverType === 'Nacional' ? (raw.length <= 8 ? raw : `${raw.slice(0, 8)}-${raw.slice(8, 9)}`) : raw;
                              setFormData({...formData, driverId: formatted});
                            }}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="relative">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Nombre Chofer</label>
                    <input 
                      required 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none" 
                      value={formData.driverName} 
                      onChange={e => setFormData({...formData, driverName: capitalizeProper(e.target.value)})}
                    />
                    {formData.driverId.length >= 6 && (
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
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none" 
                      value={formData.company} 
                      onChange={e => setFormData({...formData, company: capitalizeProper(e.target.value)})}
                    />
                 </div>
              </div>
            </div>

            <div className={`space-y-6 transition-all duration-700 ${isTransportComplete ? 'opacity-100 blur-0 translate-x-0' : 'opacity-20 blur-[2px] pointer-events-none translate-x-4 grayscale select-none'}`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Anchor size={14} /> 2. Detalles de la Carga
                </h3>
                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-md border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setLoadType('FCL')}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-sm ${loadType === 'FCL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      FCL (Contenedor)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLoadType('LCL')}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-sm ${loadType === 'LCL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      LCL (Suelto)
                    </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                 <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest flex justify-between items-center">
                      N° Guía de Recepción
                      {isDataPreloaded && (
                        <span className="flex items-center gap-1 text-[8px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          <Sparkles size={8} /> PRECARGA ACTIVA
                        </span>
                      )}
                    </label>
                    <div className="relative">
                       <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                       <input 
                        required 
                        placeholder="Ej: GR-1020"
                        className={`w-full pl-9 pr-4 py-3 border rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none uppercase font-mono transition-all ${isDataPreloaded ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' : 'bg-white border-slate-200'}`} 
                        value={formData.receptionNote} 
                        onChange={e => setFormData({...formData, receptionNote: e.target.value.toUpperCase()})}
                       />
                    </div>
                 </div>

                 <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Cliente / Armador</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        required
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
                        value={formData.client}
                        onChange={e => setFormData({...formData, client: capitalizeProper(e.target.value)})}
                      />
                    </div>
                 </div>

                 <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">N° EIR (Interchange Receipt)</label>
                    <div className="relative">
                       <FileDigit className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                       <input 
                        placeholder="Ej: EIR-100200"
                        className="w-full pl-9 pr-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none uppercase font-mono transition-colors" 
                        value={formData.eirNumber} 
                        onChange={e => setFormData({...formData, eirNumber: e.target.value.toUpperCase()})}
                       />
                    </div>
                 </div>

                 <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Fecha y Hora de Ingreso</label>
                      <button type="button" onClick={handleUpdateToNow} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
                        <Clock size={10} /> <span className="text-[8px] font-black uppercase">Ahora</span>
                      </button>
                    </div>
                    <div className="relative">
                       <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input required type="datetime-local" step="1" className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} />
                    </div>
                 </div>

                 {loadType === 'LCL' ? (
                   <>
                    <div className="col-span-2 space-y-4 bg-indigo-50/30 p-4 rounded-lg border border-indigo-100/50">
                       <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-2">Atributos Carga Suelta</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                             <CustomSelect 
                               label="Tipo de Material"
                               options={MATERIAL_TYPES}
                               value={formData.materialType}
                               onChange={(val: MaterialType) => setFormData({...formData, materialType: val})}
                               placeholder="Cajas, Bobinas, Pallets, etc."
                             />
                          </div>
                          <div className="col-span-1">
                             <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Cantidad Bultos</label>
                             <div className="relative">
                               <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                               <input type="number" className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm outline-none" value={formData.cargoQuantity || ''} onChange={e => setFormData({...formData, cargoQuantity: parseInt(e.target.value) || 0})} />
                             </div>
                          </div>
                          <div className="col-span-1">
                             <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Peso Neto (KG)</label>
                             <div className="relative">
                               <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                               <input type="number" className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm outline-none" value={formData.cargoWeight || ''} onChange={e => setFormData({...formData, cargoWeight: parseInt(e.target.value) || 0})} />
                             </div>
                          </div>
                       </div>
                    </div>
                   </>
                 ) : (
                   <>
                    <div className="col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Identificación Unidad (SIGLA + N°)</label>
                      <div className="grid grid-cols-11 gap-2">
                        <input 
                          required maxLength={4} 
                          className="col-span-4 px-2 py-3 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-lg uppercase font-mono text-center focus:border-indigo-600 outline-none" 
                          placeholder="ABCD" 
                          value={ownerCode} 
                          onChange={handleOwnerCodeChange} 
                        />
                        <input 
                          ref={serialRef}
                          required maxLength={6} 
                          className="col-span-5 px-2 py-3 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-lg uppercase font-mono text-center focus:border-indigo-600 outline-none" 
                          placeholder="123456" 
                          value={serialNumber} 
                          onChange={handleSerialChange} 
                        />
                        <input 
                          ref={checkDigitRef}
                          required maxLength={1} 
                          className="col-span-2 px-2 py-3 bg-indigo-50 border border-indigo-200 rounded font-bold text-indigo-700 text-lg uppercase font-mono text-center focus:border-indigo-600 outline-none" 
                          placeholder="0" 
                          value={checkDigit} 
                          onChange={e => { setCheckDigit(e.target.value.replace(/[^0-9]/gi, '')); setIsDvAuto(false); }} 
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Línea Naviera</label>
                        <Select
                          options={lineOptions}
                          styles={selectStyles}
                          placeholder="SELECCIONAR..."
                          value={formData.shippingLine ? { value: formData.shippingLine.toUpperCase(), label: formData.shippingLine } : null}
                          onChange={(opt: any) => setFormData({...formData, shippingLine: opt?.label || ''})}
                          noOptionsMessage={() => "Sin resultados"}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">N° BL</label>
                        <input required className="w-full px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm uppercase" value={formData.bl} onChange={e => setFormData({...formData, bl: e.target.value.toUpperCase()})} />
                    </div>
                    
                    <div className="col-span-2 space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">Pesos del Contenedor (KG)</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-1">
                             <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Tara (KG)</label>
                             <div className="relative">
                               <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                               <input required type="number" className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm outline-none" value={formData.tare || ''} onChange={e => setFormData({...formData, tare: parseInt(e.target.value) || 0})} />
                             </div>
                          </div>
                          <div className="col-span-1">
                             <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Peso Bruto (KG)</label>
                             <div className="relative">
                               <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                               <input required type="number" className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm outline-none" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})} />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Nave</label>
                        <Select
                          options={vesselOptions}
                          styles={selectStyles}
                          placeholder="SELECCIONAR..."
                          value={formData.vessel ? { value: formData.vessel.toUpperCase(), label: formData.vessel } : null}
                          onChange={(opt: any) => setFormData({...formData, vessel: opt?.label || ''})}
                          noOptionsMessage={() => "Sin resultados"}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Viaje</label>
                        <input required className="w-full px-4 py-3 bg-white border border-slate-200 rounded font-bold text-slate-800 text-sm uppercase" value={formData.voyage} onChange={e => setFormData({...formData, voyage: e.target.value.toUpperCase()})} />
                    </div>
                   </>
                 )}
              </div>

              <div className="p-5 bg-slate-900 rounded-lg space-y-4 shadow-lg shadow-indigo-100 mt-2">
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2 font-roboto">
                      <MapPin size={12} /> POSICIÓN YARD (BAROTI)
                    </p>
                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       <Info size={10} className="text-amber-500" />
                       Solo se muestran espacios aptos para {loadType}
                    </div>
                 </div>
                 <div className="relative">
                    {selectedEspacio ? (
                        <div className="flex gap-10">
                          <PosIndicator label="Block" value={selectedEspacio.block} />
                          <PosIndicator label="Bay" value={selectedEspacio.bay} />
                          <PosIndicator label="Row" value={selectedEspacio.row.toString()} />
                          <PosIndicator label="Tier" value={selectedEspacio.tier.toString()} />
                        </div>
                    ) : (
                        <div className="relative">
                           <select 
                            required 
                            className="w-full px-4 py-3 bg-slate-800 border-none rounded-md text-white font-roboto text-[12px] outline-none cursor-pointer appearance-none" 
                            value={manualEspacio} 
                            onChange={e => setManualEspacio(e.target.value)}
                           >
                            <option value="">-- Seleccionar Espacio Disponible --</option>
                            {filteredEspacios.map(s => (
                              <option key={`${s.block}-${s.bay}-${s.row}-${s.tier}`} value={`${s.block}-${s.bay}-${s.row}-${s.tier}`}>
                                Bloque {s.block} | B{s.bay} R{s.row} T{s.tier} {s.block === lclDesignatedBlock ? ' (ZONA LCL)' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <button 
              type="submit"
              disabled={!canSubmit}
              className={`group relative w-full py-5 rounded-md font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${canSubmit ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 hover:-translate-y-0.5' : 'bg-slate-100 text-slate-300 cursor-not-allowed grayscale'}`}
            >
              <Download size={20} className={canSubmit ? 'animate-bounce' : ''} />
              Confirmar Recepción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GateInForm;
