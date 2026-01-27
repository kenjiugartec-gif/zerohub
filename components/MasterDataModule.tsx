
import React, { useState } from 'react';
import { Vessel, ShippingLine, CustomsAgency, Client, MaterialCatalog, VesselType, TransportInfo, IDType } from '../types';
import { 
  Ship, Anchor, Briefcase, Users, Package, Plus, Trash2, Search, 
  Hash, Globe, Mail, Phone, Building2, Layers, FileSearch, CheckCircle2,
  X, Edit3, Save, MapPin, ExternalLink, ShieldCheck, Activity, Tag, 
  Compass, Globe2, CreditCard, Box, ChevronDown, Truck, UserCircle,
  // Fix: Added IdCard to the imports from lucide-react
  IdCard
} from 'lucide-react';

interface MasterDataModuleProps {
  vessels: Vessel[]; setVessels: React.Dispatch<React.SetStateAction<Vessel[]>>;
  shippingLines: ShippingLine[]; setShippingLines: React.Dispatch<React.SetStateAction<ShippingLine[]>>;
  customsAgencies: CustomsAgency[]; setCustomsAgencies: React.Dispatch<React.SetStateAction<CustomsAgency[]>>;
  clients: Client[]; setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  materials: MaterialCatalog[]; setMaterials: React.Dispatch<React.SetStateAction<MaterialCatalog[]>>;
  drivers: TransportInfo[]; setDrivers: React.Dispatch<React.SetStateAction<TransportInfo[]>>;
}

type SubTab = 'maritime' | 'agencies' | 'clients' | 'materials' | 'drivers';

const MasterDataModule: React.FC<MasterDataModuleProps> = ({ 
  vessels, setVessels, 
  shippingLines, setShippingLines, 
  customsAgencies, setCustomsAgencies, 
  clients, setClients, 
  materials, setMaterials,
  drivers, setDrivers
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('maritime');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleUpdate = (updatedData: any) => {
    if ('imo' in updatedData) setVessels(vessels.map(v => v.id === updatedData.id ? updatedData : v));
    else if ('scac' in updatedData) setShippingLines(shippingLines.map(l => l.id === updatedData.id ? updatedData : l));
    else if ('address' in updatedData) setCustomsAgencies(customsAgencies.map(a => a.id === updatedData.id ? updatedData : a));
    else if ('email' in updatedData && !('address' in updatedData)) setClients(clients.map(c => c.id === updatedData.id ? updatedData : c));
    else if ('unit' in updatedData) setMaterials(materials.map(m => m.id === updatedData.id ? updatedData : m));
    else if ('driverId' in updatedData) setDrivers(drivers.map(d => d.driverId === updatedData.driverId ? updatedData : d));
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 rounded-xl text-indigo-500 shadow-xl shadow-slate-200">
            <Layers size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión Maestra</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={12} className="text-green-500" /> Control de Catálogos Corporativos
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          <SubTabButton active={activeTab === 'maritime'} onClick={() => setActiveTab('maritime')} icon={<Compass size={14} />} label="Gestión Marítima" />
          <SubTabButton active={activeTab === 'agencies'} onClick={() => setActiveTab('agencies')} icon={<Briefcase size={14} />} label="Agencias" />
          <SubTabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={14} />} label="Clientes" />
          <SubTabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Truck size={14} />} label="Conductores" />
          <SubTabButton active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon={<Package size={14} />} label="Materiales" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* PANEL LATERAL: FORMULARIOS */}
        <div className="xl:col-span-4 space-y-8">
          {activeTab === 'maritime' && (
            <div className="space-y-8">
               <VesselForm onSubmit={(v: any) => setVessels([...vessels, { id: `V${Date.now()}`, ...v }])} />
               <LineForm onSubmit={(l: any) => setShippingLines([...shippingLines, { id: `L${Date.now()}`, ...l }])} />
            </div>
          )}
          {activeTab === 'agencies' && <AgencyForm onSubmit={(a: any) => setCustomsAgencies([...customsAgencies, { id: `A${Date.now()}`, ...a }])} />}
          {activeTab === 'clients' && <ClientForm onSubmit={(c: any) => setClients([...clients, { id: `C${Date.now()}`, ...c }])} />}
          {activeTab === 'drivers' && <DriverForm onSubmit={(d: any) => setDrivers(prev => [...prev.filter(x => x.driverId !== d.driverId), d])} />}
          {activeTab === 'materials' && <MaterialForm onSubmit={(m: any) => setMaterials([...materials, { id: `M${Date.now()}`, ...m }])} />}
          
          <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <Activity className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={150} />
            <div className="relative z-10 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Estado del Sistema Maestro</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Registros</p>
                   <p className="text-3xl font-black">{vessels.length + shippingLines.length + clients.length + drivers.length}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Conductores</p>
                   <p className="text-3xl font-black">{drivers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL PRINCIPAL: TABLA */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  {activeTab === 'drivers' ? 'Base de Datos de Conductores' : 'Registros Activos'}
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="FILTRAR..."
                  className="w-64 pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-indigo-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Tipo</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre / Detalle</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Técnica</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeTab === 'maritime' && (
                    <>
                      {vessels.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())).map(v => (
                        <EntityRow key={v.id} icon={<Ship size={12}/>} type="NAVE" id={v.id} title={v.name} subtitle={v.flag} techLabel={v.imo} onEdit={() => setEditingItem(v)} onDelete={() => setVessels(vessels.filter(x => x.id !== v.id))} />
                      ))}
                      {shippingLines.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())).map(l => (
                        <EntityRow key={l.id} icon={<Anchor size={12}/>} type="LINEA" id={l.id} title={l.name} subtitle={l.website || 'Carrier'} techLabel={l.scac} onEdit={() => setEditingItem(l)} onDelete={() => setShippingLines(shippingLines.filter(x => x.id !== l.id))} />
                      ))}
                    </>
                  )}
                  {activeTab === 'agencies' && customsAgencies.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
                    <EntityRow key={a.id} icon={<Briefcase size={12}/>} type="AGENCIA" id={a.taxId} title={a.name} subtitle={a.address} techLabel="Aduana" onEdit={() => setEditingItem(a)} onDelete={() => setCustomsAgencies(customsAgencies.filter(x => x.id !== a.id))} />
                  ))}
                  {activeTab === 'clients' && clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                    <EntityRow key={c.id} icon={<Users size={12}/>} type="CLIENTE" id={c.taxId} title={c.name} subtitle={c.email} techLabel="Consignatario" onEdit={() => setEditingItem(c)} onDelete={() => setClients(clients.filter(x => x.id !== c.id))} />
                  ))}
                  {activeTab === 'drivers' && drivers.filter(d => d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || d.driverId.includes(searchTerm)).map(d => (
                    <EntityRow key={d.driverId} icon={<UserCircle size={12}/>} type="CONDUCTOR" id={d.driverId} title={d.driverName} subtitle={d.company} techLabel={d.truckPlate} onEdit={() => setEditingItem(d)} onDelete={() => setDrivers(drivers.filter(x => x.driverId !== d.driverId))} />
                  ))}
                  {activeTab === 'materials' && materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                    <EntityRow key={m.id} icon={<Package size={12}/>} type="MATERIAL" id={m.id} title={m.name} subtitle={m.description} techLabel={m.unit} onEdit={() => setEditingItem(m)} onDelete={() => setMaterials(materials.filter(x => x.id !== m.id))} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <h3 className="text-lg font-black uppercase tracking-tight">Editar Registro</h3>
              <button onClick={() => setEditingItem(null)} className="hover:bg-white/10 p-2 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingItem); }} className="p-10 space-y-6">
              <InputField label="Nombre" value={editingItem.name || editingItem.driverName} onChange={v => editingItem.driverName ? setEditingItem({...editingItem, driverName: v}) : setEditingItem({...editingItem, name: v})} icon={<Tag size={14} />} />
              {editingItem.company && (
                <InputField label="Empresa / Compañía" value={editingItem.company} onChange={v => setEditingItem({...editingItem, company: v})} icon={<Building2 size={14} />} />
              )}
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Save size={18} /> Guardar
                </button>
                <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const EntityRow = ({ id, icon, type, title, subtitle, techLabel, onEdit, onDelete }: any) => (
  <tr className="hover:bg-slate-50/50 transition-all group">
    <td className="px-8 py-6">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-[8px] font-black text-indigo-500 bg-indigo-50 w-fit px-2 py-0.5 rounded uppercase tracking-widest">
           {icon} {type}
        </span>
        <span className="font-mono text-[9px] font-bold text-slate-400">{id}</span>
      </div>
    </td>
    <td className="px-8 py-6">
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 truncate max-w-[200px]">{subtitle}</span>
      </div>
    </td>
    <td className="px-8 py-6">
      <span className="text-[10px] font-black text-slate-700 font-mono bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">{techLabel}</span>
    </td>
    <td className="px-8 py-6 text-right">
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={14} /></button>
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
      </div>
    </td>
  </tr>
);

const SubTabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shrink-0 ${
      active ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const InputField = ({ label, value, onChange, icon, placeholder, type = "text", dark = false }: any) => (
  <div className="space-y-2">
    <label className={`block text-[9px] font-black uppercase tracking-widest px-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
        {icon}
      </div>
      <input 
        required
        type={type}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-4 rounded-xl font-bold text-xs uppercase outline-none transition-all ${
          dark 
          ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const VesselForm = ({ onSubmit }: any) => {
  const [data, setData] = useState({ name: '', imo: '', flag: '', type: 'Portacontenedores' as VesselType });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ name: '', imo: '', flag: '', type: 'Portacontenedores' });
  };
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Ship className="text-indigo-400" size={20} />
        <h4 className="text-xs font-black text-white uppercase tracking-widest">Nueva Nave</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField dark label="Nombre Nave" value={data.name} onChange={v => setData({...data, name: v})} icon={<Compass size={14} />} placeholder="Ej: MSC GULSUN" />
        <InputField dark label="IMO" value={data.imo} onChange={v => setData({...data, imo: v})} icon={<Hash size={14} />} placeholder="9839430" />
        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Agregar Nave</button>
      </form>
    </div>
  );
};

const LineForm = ({ onSubmit }: any) => {
  const [data, setData] = useState({ name: '', scac: '', contactEmail: '', website: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ name: '', scac: '', contactEmail: '', website: '' });
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Anchor className="text-indigo-600" size={20} />
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Línea Naviera</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Nombre Línea" value={data.name} onChange={v => setData({...data, name: v})} icon={<Building2 size={14} />} placeholder="MAERSK" />
        <InputField label="SCAC" value={data.scac} onChange={v => setData({...data, scac: v})} icon={<Hash size={14} />} placeholder="MAEU" />
        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Vincular Naviera</button>
      </form>
    </div>
  );
};

const DriverForm = ({ onSubmit }: any) => {
  const [data, setData] = useState<TransportInfo>({ truckPlate: '', driverName: '', driverId: '', driverType: 'Nacional', company: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ truckPlate: '', driverName: '', driverId: '', driverType: 'Nacional', company: '' });
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="text-indigo-600" size={20} />
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Nuevo Conductor</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Nombre Chofer" value={data.driverName} onChange={v => setData({...data, driverName: v})} icon={<UserCircle size={14} />} />
        <InputField label="RUT / ID" value={data.driverId} onChange={v => setData({...data, driverId: v})} icon={<IdCard size={14} />} />
        <InputField label="Patente Defecto" value={data.truckPlate} onChange={v => setData({...data, truckPlate: v})} icon={<Hash size={14} />} />
        <InputField label="Transportista" value={data.company} onChange={v => setData({...data, company: v})} icon={<Building2 size={14} />} />
        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Registrar Conductor</button>
      </form>
    </div>
  );
};

const AgencyForm = ({ onSubmit }: any) => {
  const [data, setData] = useState({ name: '', taxId: '', contactPhone: '', address: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ name: '', taxId: '', contactPhone: '', address: '' });
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="text-indigo-600" size={20} />
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Agencia de Aduana</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Razón Social" value={data.name} onChange={v => setData({...data, name: v})} icon={<ShieldCheck size={14} />} />
        <InputField label="RUT" value={data.taxId} onChange={v => setData({...data, taxId: v})} icon={<CreditCard size={14} />} />
        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Validar Agencia</button>
      </form>
    </div>
  );
};

const ClientForm = ({ onSubmit }: any) => {
  const [data, setData] = useState({ name: '', taxId: '', email: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ name: '', taxId: '', email: '' });
  };
  return (
    <div className="bg-indigo-600 rounded-2xl p-8 space-y-6 text-white">
      <div className="flex items-center gap-3">
        <Users className="text-white" size={20} />
        <h4 className="text-xs font-black uppercase tracking-widest">Ficha Cliente</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField dark label="Razón Social" value={data.name} onChange={v => setData({...data, name: v})} icon={<Globe2 size={14} />} />
        <InputField dark label="E-mail" value={data.email} onChange={v => setData({...data, email: v})} icon={<Mail size={14} />} />
        <button type="submit" className="w-full py-4 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Alta Cliente</button>
      </form>
    </div>
  );
};

const MaterialForm = ({ onSubmit }: any) => {
  const [data, setData] = useState({ name: '', description: '', unit: 'Unidades' as any });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ name: '', description: '', unit: 'Unidades' });
  };
  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Box className="text-amber-600" size={20} />
        <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Catálogo Material</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Nombre Material" value={data.name} onChange={v => setData({...data, name: v})} icon={<Tag size={14} />} />
        <button type="submit" className="w-full py-4 bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Agregar Material</button>
      </form>
    </div>
  );
};

export default MasterDataModule;
