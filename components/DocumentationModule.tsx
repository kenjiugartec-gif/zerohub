
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DocumentationPreload, CargoCondition, Vessel, VesselType } from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  Upload, 
  Ship, 
  Calendar, 
  Tag, 
  Hash, 
  Weight, 
  Scale, 
  Info,
  X,
  CheckCircle2,
  FileSearch,
  ClipboardCheck,
  Package,
  FileUp,
  History,
  AlertCircle,
  Briefcase,
  Anchor,
  ChevronDown,
  Search,
  Table as TableIcon,
  FileSpreadsheet,
  AlertTriangle,
  FileJson,
  Check,
  Maximize2,
  Compass
} from 'lucide-react';

interface DocumentationModuleProps {
  preloads: DocumentationPreload[];
  onAddPreload: (preload: DocumentationPreload) => void;
  onDeletePreload: (id: string) => void;
  vessels: Vessel[];
}

const CONDITIONS: CargoCondition[] = ['Directo', 'Indirecto'];

const SHIPPING_LINES = [
  'Maersk Line', 'MSC (Mediterranean Shipping Company)', 'CMA CGM', 'Hapag-Lloyd',
  'ONE (Ocean Network Express)', 'Evergreen Marine', 'HMM (Hyundai Merchant Marine)',
  'Yang Ming Marine Transport', 'ZIM Integrated Shipping', 'Wan Hai Lines', 
  'Cosco Shipping', 'PIL (Pacific International Lines)', 'KMTC', 'IRISL Group', 
  'SITC International', 'X-Press Feeders', 'Unifeeder', 'Zhonggu Logistics',
  'Sinokor Merchant Marine', 'TS Lines', 'Antong Holdings', 'Matson', 
  'Sea Lead Shipping', 'Swire Shipping', 'Grimaldi Group'
].sort();

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

// --- COMPONENTE BUSCADOR PROFESIONAL ---

interface SearchableInputProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

const SearchableInput: React.FC<SearchableInputProps> = ({ label, placeholder, options, value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.toLowerCase().includes(filter.toLowerCase())
    );
  }, [options, filter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{label}</label>
      <div className="relative group">
        <input 
          required={required}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all pr-10" 
          placeholder={placeholder}
          value={value}
          onFocus={() => {
            setIsOpen(true);
            setFilter(value);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setFilter(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none">
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-normal text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 last:border-none"
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center italic">
                Sin coincidencias
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const DocumentationModule: React.FC<DocumentationModuleProps> = ({ preloads, onAddPreload, onDeletePreload, vessels }) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'masivo'>('individual');
  
  // Estados para el contenedor individual
  const [ownerCode, setOwnerCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [checkDigit, setCheckDigit] = useState('');
  const [isDvAuto, setIsDvAuto] = useState(true);

  // Referencias para el salto de foco
  const serialRef = useRef<HTMLInputElement>(null);
  const checkDigitRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    receptionNote: '',
    client: '',
    customsAgency: '',
    shippingLine: '',
    vessel: '',
    voyage: '',
    weight: 0,
    bl: '',
    condition: 'Indirecto' as CargoCondition,
    preloadDate: new Date().toISOString().slice(0, 16)
  });
  
  const [file, setFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [massFile, setMassFile] = useState<File | null>(null);
  const [parsedMassData, setParsedMassData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const massFileInputRef = useRef<HTMLInputElement>(null);
  const [previewItem, setPreviewItem] = useState<DocumentationPreload | null>(null);

  const vesselOptions = useMemo(() => vessels.map(v => v.name), [vessels]);

  // Calcular DV automático
  useEffect(() => {
    const combined = (ownerCode + serialNumber).toUpperCase();
    if (combined.length === 10 && isDvAuto) {
      const calculated = calculateCheckDigit(combined);
      if (calculated !== null) setCheckDigit(calculated.toString());
    }
  }, [ownerCode, serialNumber, isDvAuto]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFile({
          name: selectedFile.name,
          type: selectedFile.type,
          data: event.target?.result as string
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleMassFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setMassFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const mockData = [
          { receptionNote: 'GR-5001', containerId: 'MEDU1234567', client: 'CLIENTE A', bl: 'BL-9901', weight: 24500, shippingLine: 'MSC', vessel: 'MSC GULSUN', voyage: '102W' },
          { receptionNote: 'GR-5002', containerId: 'MSKU7654321', client: 'CLIENTE B', bl: 'BL-9902', weight: 18000, shippingLine: 'MAERSK', vessel: 'MAERSK ESSEN', voyage: '201E' },
          { receptionNote: 'GR-5003', containerId: 'CMAU1122334', client: 'CLIENTE C', bl: 'BL-9903', weight: 22000, shippingLine: 'CMA CGM', vessel: 'CMA CGM ANTOINE', voyage: '445S' },
        ];
        setParsedMassData(mockData);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construir containerId si hay datos
    let containerId = '';
    if (ownerCode && serialNumber) {
      containerId = `${ownerCode}${serialNumber}-${checkDigit}`;
    }

    const newPreload: DocumentationPreload = {
      ...formData,
      id: `DOC-${Date.now()}`,
      containerId: containerId,
      fileName: file?.name,
      fileData: file?.data,
      fileType: file?.type
    };
    onAddPreload(newPreload);
    
    // Resetear formulario
    setFormData({
      receptionNote: '',
      client: '',
      customsAgency: '',
      shippingLine: '',
      vessel: '',
      voyage: '',
      weight: 0,
      bl: '',
      condition: 'Indirecto' as CargoCondition,
      preloadDate: new Date().toISOString().slice(0, 16)
    });
    setOwnerCode('');
    setSerialNumber('');
    setCheckDigit('');
    setIsDvAuto(true);
    setFile(null);
  };

  const handleConfirmMassLoad = () => {
    parsedMassData.forEach((item, index) => {
      onAddPreload({
        id: `DOC-MASS-${Date.now()}-${index}`,
        receptionNote: item.receptionNote,
        client: item.client,
        customsAgency: 'AGENCIA MASIVA',
        shippingLine: item.shippingLine,
        vessel: item.vessel,
        voyage: item.voyage,
        weight: item.weight,
        bl: item.bl,
        containerId: item.containerId,
        condition: 'Indirecto',
        preloadDate: new Date().toISOString()
      });
    });
    setMassFile(null);
    setParsedMassData([]);
    setActiveTab('individual');
  };

  const downloadTemplate = () => {
    const headers = "receptionNote,containerId,client,bl,weight,shippingLine,vessel,voyage";
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_carga_masiva_zerohub.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const triggerDownload = (data: string, name: string) => {
    const a = document.createElement('a');
    a.href = data;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* SELECTOR DE MODALIDAD */}
      <div className="flex justify-between items-center">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('individual')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'individual' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Package size={16} /> Ingreso Individual
          </button>
          <button 
            onClick={() => setActiveTab('masivo')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'masivo' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <FileSpreadsheet size={16} /> Carga Masiva (Excel)
          </button>
        </div>
      </div>

      {activeTab === 'individual' ? (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 relative z-40">
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg text-white">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Nueva Precarga Documental</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingrese los datos para registrar la guía de arribo</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-visible">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ClipboardCheck size={14} /> Identificación
                </h4>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">N° Guía de Recepción</label>
                    <input required placeholder="GR-0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none uppercase font-mono transition-all" value={formData.receptionNote} onChange={e => setFormData({...formData, receptionNote: e.target.value.toUpperCase()})} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Contenedor (Sigla + N° + DV)</label>
                    <div className="grid grid-cols-11 gap-1.5">
                      <input 
                        maxLength={4} 
                        className="col-span-4 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono text-sm font-black text-center focus:border-indigo-600 outline-none" 
                        placeholder="ABCD" 
                        value={ownerCode} 
                        onChange={handleOwnerCodeChange} 
                      />
                      <input 
                        ref={serialRef}
                        maxLength={6} 
                        className="col-span-5 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono text-sm font-black text-center focus:border-indigo-600 outline-none" 
                        placeholder="123456" 
                        value={serialNumber} 
                        onChange={handleSerialChange} 
                      />
                      <input 
                        ref={checkDigitRef}
                        maxLength={1} 
                        className="col-span-2 px-2 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center font-mono text-sm font-black text-indigo-700 focus:border-indigo-600 outline-none" 
                        placeholder="0" 
                        value={checkDigit} 
                        onChange={e => { setCheckDigit(e.target.value.replace(/[^0-9]/gi, '')); setIsDvAuto(false); }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Cliente / Armador</label>
                    <input required placeholder="Nombre del Cliente" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none transition-all" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Ship size={14} /> Logística
                </h4>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <SearchableInput label="Nave" placeholder="Buscar Nave..." options={vesselOptions} value={formData.vessel} onChange={(v) => setFormData({...formData, vessel: v})} required />
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Viaje</label>
                      <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:border-indigo-600 uppercase font-mono" value={formData.voyage} onChange={e => setFormData({...formData, voyage: e.target.value.toUpperCase()})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">N° BL</label>
                      <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:border-indigo-600 uppercase font-mono" value={formData.bl} onChange={e => setFormData({...formData, bl: e.target.value.toUpperCase()})} />
                    </div>
                    <SearchableInput label="Línea Naviera" placeholder="Seleccionar Naviera..." options={SHIPPING_LINES} value={formData.shippingLine} onChange={(v) => setFormData({...formData, shippingLine: v})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Peso Bruto (KG)</label>
                      <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:border-indigo-600" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Condición</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 h-[46px]">
                        {CONDITIONS.map(c => (
                          <button key={c} type="button" onClick={() => setFormData({...formData, condition: c})} className={`flex-1 py-1 text-[8px] font-black uppercase rounded-lg transition-all ${formData.condition === c ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                  <FileUp size={14} /> Adjunto Digital
                </h4>
                <div className="space-y-5">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${file ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileChange} />
                    {file ? (
                      <>
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                          <CheckCircle2 size={24} />
                        </div>
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest truncate max-w-[200px]">{file.name}</p>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-white text-indigo-400 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <Upload size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Subir Guía Digital</p>
                      </>
                    )}
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                  >
                    <ClipboardCheck size={20} /> Confirmar Registro
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      ) : (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl text-white">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Carga Masiva de Unidades</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sube un archivo Excel o CSV para precargar múltiples registros</p>
              </div>
            </div>
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              <Download size={14} /> Descargar Plantilla
            </button>
          </div>

          <div className="p-10 space-y-10">
            {!massFile ? (
              <div 
                onClick={() => massFileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-100 rounded-[2.5rem] py-24 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-indigo-100 hover:bg-indigo-50/20 transition-all"
              >
                <input type="file" ref={massFileInputRef} className="hidden" accept=".csv,.xlsx,.xls" onChange={handleMassFileChange} />
                <div className="p-6 bg-slate-50 text-slate-300 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
                  <Upload size={48} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-black text-slate-700 uppercase tracking-tight">Selecciona o arrastra tu archivo</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Formatos aceptados: .CSV, .XLSX, .XLS</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 bg-green-50 rounded-2xl border border-green-100">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <FileJson size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-green-900 uppercase tracking-tight">{massFile.name}</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                          <Check size={12} /> {parsedMassData.length} registros detectados listos para importar
                        </p>
                      </div>
                   </div>
                   <button onClick={() => { setMassFile(null); setParsedMassData([]); }} className="p-2 text-green-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={20} />
                   </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guía</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenedor</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">BL</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nave</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Peso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {parsedMassData.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-black text-slate-900 font-mono">{item.receptionNote}</td>
                          <td className="px-6 py-4 text-xs font-bold text-indigo-600 font-mono">{item.containerId}</td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{item.client}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-700 font-mono">{item.bl}</td>
                          <td className="px-6 py-4 text-[10px] font-black text-slate-800 uppercase tracking-tight">{item.vessel}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-900 text-right">{item.weight.toLocaleString()} KG</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={handleConfirmMassLoad}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                   >
                     <CheckCircle2 size={20} /> Procesar {parsedMassData.length} Registros
                   </button>
                   <button 
                    onClick={() => { setMassFile(null); setParsedMassData([]); }}
                    className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                   >
                     Cancelar
                   </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECCIÓN DE HISTORIAL (TABLA) */}
      <section className="space-y-6 relative z-10">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-white shadow-md">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Base Control Documento</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro histórico de ingresos controlados</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total: {preloads.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Precarga / Guía</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenedor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidades</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logística</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga / BL</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Adjunto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preloads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-15">
                        <FileSearch size={60} className="text-slate-300" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Sin registros documentales</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  preloads.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 font-mono tracking-tighter mb-1">{p.receptionNote}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={10} /> {new Date(p.preloadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black text-indigo-600 font-mono tracking-widest bg-indigo-50 px-2 py-1 rounded">
                          {p.containerId || 'SIN ASIGNAR'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{p.client}</span>
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{p.customsAgency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Ship size={12} className="text-indigo-400" /> {p.vessel}
                          </span>
                          <span className="text-[9px] font-black text-slate-500 uppercase mt-1 tracking-widest">{p.shippingLine}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800 font-mono tracking-widest mb-1">{p.bl}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.weight.toLocaleString()} KG</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          {p.fileData ? (
                            <>
                              <button onClick={() => setPreviewItem(p)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"><Eye size={16} /></button>
                              <button onClick={() => p.fileData && triggerDownload(p.fileData, p.fileName || 'document.pdf')} className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"><Download size={16} /></button>
                            </>
                          ) : (
                            <span className="text-[8px] font-black uppercase text-slate-300 italic">Sin Archivo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => onDeletePreload(p.id)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal de Previsualización Optimizado */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 fade-in duration-300 border border-white/20">
            <header className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-4 md:gap-5 overflow-hidden">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight truncate">{previewItem.receptionNote}</h4>
                  <div className="flex items-center gap-2 md:gap-3 mt-1 whitespace-nowrap overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{previewItem.fileName}</p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0"></span>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest truncate">{previewItem.client}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewItem.fileData && (
                  <button 
                    onClick={() => previewItem.fileData && triggerDownload(previewItem.fileData, previewItem.fileName || 'download')}
                    className="p-3 bg-white border border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 rounded-2xl transition-all text-slate-500 shadow-sm md:flex items-center gap-2 hidden"
                  >
                    <Download size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Descargar</span>
                  </button>
                )}
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="p-3 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-2xl transition-all text-slate-500 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-10 flex flex-col items-center justify-center min-h-[50vh]">
              {previewItem.fileType?.includes('image') ? (
                <div className="relative group w-full flex items-center justify-center">
                   <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-slate-900/60 backdrop-blur-md p-2 rounded-lg text-white">
                         <Maximize2 size={16} />
                      </div>
                   </div>
                   <img 
                    src={previewItem.fileData} 
                    alt="Previsualización" 
                    className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border-4 border-white transition-transform duration-500 hover:scale-[1.02] cursor-zoom-in" 
                    onClick={() => window.open(previewItem.fileData, '_blank')}
                   />
                </div>
              ) : (
                <div className="w-full max-w-2xl h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] shadow-xl border border-slate-200 border-dashed relative overflow-hidden group p-8 text-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                    <FileSearch size={100} className="text-slate-200 mb-8 relative z-10 transition-colors group-hover:text-indigo-200" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-slate-900 font-black uppercase text-base tracking-widest">Vista previa no disponible</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed uppercase font-bold max-w-sm mx-auto">
                      El tipo de archivo <span className="text-indigo-500">{previewItem.fileType || 'desconocido'}</span> requiere ser descargado para visualizarse correctamente fuera del entorno seguro.
                    </p>
                  </div>
                  <div className="mt-10 md:hidden">
                    <button 
                      onClick={() => previewItem.fileData && triggerDownload(previewItem.fileData, previewItem.fileName || 'download')}
                      className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all"
                    >
                      <Download size={20} /> Descargar Archivo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="p-6 md:p-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/80 sticky bottom-0 z-10">
              <div className="flex flex-wrap gap-6 md:gap-10 justify-center md:justify-start w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carga Registrada</span>
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{previewItem.weight.toLocaleString()} KG / BL: {previewItem.bl}</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-6 md:pl-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Logística</span>
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{previewItem.vessel} / {previewItem.shippingLine}</span>
                </div>
              </div>
              <div className="w-full md:w-auto text-center md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Agencia de Aduana</span>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">{previewItem.customsAgency}</span>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationModule;
