
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Container, Movement, YardEspacio, ContainerSize, ContainerType, 
  TransportInfo, DocumentationPreload, Vessel, ShippingLine, CustomsAgency, Client, MaterialCatalog, EirConfig, InternationFCL
} from './types';
import YardMap from './components/YardMap';
import GateInForm from './components/GateInForm';
import GateOutForm from './components/GateOutForm';
import StatsCards from './components/StatsCards';
import MovementLog from './components/MovementLog';
import Settings from './components/Settings';
import DocumentationModule from './components/DocumentationModule';
import MasterDataModule from './components/MasterDataModule';
import ModularModule from './components/ModularModule';
import OperationsModule from './components/OperationsModule';
import EirReceipt from './components/EirReceipt';
import LoginScreen from './components/LoginScreen';
import { 
  LayoutDashboard, LogIn, LogOut, Map as MapIcon, History, Anchor, 
  Settings as SettingsIcon, FileText, Database, Menu, ChevronLeft, 
  ChevronRight, Command, Box, Briefcase, Power
} from 'lucide-react';

export interface YardConfig {
  blocks: string[];
  baysCount: number;
  rowsCount: number;
  tiersCount: number;
  lclBlock: string; // Nuevo campo para definir explícitamente el bloque LCL
}

type AppTab = 'dashboard' | 'yard' | 'document-control' | 'gate-in' | 'gate-out' | 'history' | 'master-data' | 'settings' | 'modular' | 'operations';

const App: React.FC = () => {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // --- ESTADOS PRINCIPALES ---
  const [containers, setContainers] = useState<Container[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [preloads, setPreloads] = useState<DocumentationPreload[]>([]);
  const [internations, setInternations] = useState<InternationFCL[]>([]);
  
  // MODIFICACIÓN: Estado inicial null para no mostrar nada al inicio
  const [activeTab, setActiveTab] = useState<AppTab | null>(null);
  const [selectedEspacio, setSelectedEspacio] = useState<YardEspacio | null>(null);
  
  // MODIFICACIÓN: Sidebar colapsada por defecto
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // EIR Auto-Generation
  const [lastReceivedContainer, setLastReceivedContainer] = useState<Container | null>(null);
  const [showEirReceipt, setShowEirReceipt] = useState(false);

  // --- ESTADOS DE DATOS MAESTROS (DATABASE) ---
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [shippingLines, setShippingLines] = useState<ShippingLine[]>([]);
  const [customsAgencies, setCustomsAgencies] = useState<CustomsAgency[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [materials, setMaterials] = useState<MaterialCatalog[]>([]);
  const [masterDrivers, setMasterDrivers] = useState<TransportInfo[]>([]);

  const [yardConfig, setYardConfig] = useState<YardConfig>({
    blocks: ['A', 'B', 'C'],
    baysCount: 6,
    rowsCount: 5,
    tiersCount: 5,
    lclBlock: 'C' // Por defecto bloque C
  });

  const [eirConfig, setEirConfig] = useState<EirConfig>({
    companyName: 'ZEROHUB LOGISTICS TERMINAL',
    companyAddress: 'Avenida Portuaria Industrial #1024, San Antonio',
    companyTaxId: '76.455.321-K',
    companyPhone: '+56 9 8765 4321',
    terminalCode: 'ZH-SA-01',
    footerNotes: 'Este documento constituye el comprobante de recepción de equipo en depósito. El terminal no se hace responsable por daños no declarados en el momento del gate-in. Sujeto a términos y condiciones generales de almacenaje.',
    eirPrefix: 'EIR',
    logoUrl: ''
  });

  // --- PERSISTENCIA (LOCAL DATABASE SIMULATION) ---
  useEffect(() => {
    // Check Authentication
    const auth = localStorage.getItem('zh_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const savedVessels = localStorage.getItem('zh_vessels');
    const savedLines = localStorage.getItem('zh_lines');
    const savedAgencies = localStorage.getItem('zh_agencies');
    const savedClients = localStorage.getItem('zh_clients');
    const savedMaterials = localStorage.getItem('zh_materials');
    const savedDrivers = localStorage.getItem('zh_drivers');
    const savedConfig = localStorage.getItem('zh_yard_config');
    const savedEir = localStorage.getItem('zh_eir_config');
    const savedContainers = localStorage.getItem('zh_containers');
    const savedMovements = localStorage.getItem('zh_movements');
    const savedInternations = localStorage.getItem('zh_internations');

    if (savedVessels) setVessels(JSON.parse(savedVessels));
    if (savedLines) setShippingLines(JSON.parse(savedLines));
    if (savedAgencies) setCustomsAgencies(JSON.parse(savedAgencies));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedMaterials) setMaterials(JSON.parse(savedMaterials));
    if (savedDrivers) setMasterDrivers(JSON.parse(savedDrivers));
    if (savedConfig) setYardConfig(prev => ({...prev, ...JSON.parse(savedConfig)})); // Merge para asegurar que lclBlock exista
    if (savedEir) setEirConfig(JSON.parse(savedEir));
    if (savedContainers) setContainers(JSON.parse(savedContainers));
    if (savedMovements) setMovements(JSON.parse(savedMovements));
    if (savedInternations) setInternations(JSON.parse(savedInternations));
  }, []);

  useEffect(() => {
    localStorage.setItem('zh_vessels', JSON.stringify(vessels));
    localStorage.setItem('zh_lines', JSON.stringify(shippingLines));
    localStorage.setItem('zh_agencies', JSON.stringify(customsAgencies));
    localStorage.setItem('zh_clients', JSON.stringify(clients));
    localStorage.setItem('zh_materials', JSON.stringify(materials));
    localStorage.setItem('zh_drivers', JSON.stringify(masterDrivers));
    localStorage.setItem('zh_yard_config', JSON.stringify(yardConfig));
    localStorage.setItem('zh_eir_config', JSON.stringify(eirConfig));
    localStorage.setItem('zh_containers', JSON.stringify(containers));
    localStorage.setItem('zh_movements', JSON.stringify(movements));
    localStorage.setItem('zh_internations', JSON.stringify(internations));
  }, [vessels, shippingLines, customsAgencies, clients, materials, masterDrivers, yardConfig, eirConfig, containers, movements, internations]);

  const baysLabels = useMemo(() => {
    return Array.from({ length: yardConfig.baysCount }, (_, i) => {
      const num = (i * 2 + 1).toString();
      return num.padStart(2, '0');
    });
  }, [yardConfig.baysCount]);

  const yardEspacios = useMemo(() => {
    const espacios: YardEspacio[] = [];
    yardConfig.blocks.forEach(block => {
      baysLabels.forEach(bay => {
        for (let r = 1; r <= yardConfig.rowsCount; r++) {
          for (let t = 1; t <= yardConfig.tiersCount; t++) {
            const containerInEspacio = containers.find(
              c => c.status === 'In' && 
              c.location.block === block &&
              c.location.bay === bay && 
              c.location.row === r && 
              c.location.tier === t
            );
            espacios.push({
              block,
              bay,
              row: r,
              tier: t,
              containerId: containerInEspacio ? containerInEspacio.id : null
            });
          }
        }
      });
    });
    return espacios;
  }, [containers, yardConfig, baysLabels]);

  const availableEspacios = useMemo(() => yardEspacios.filter(s => !s.containerId), [yardEspacios]);

  // Función para guardar o actualizar conductor en la base de datos
  const upsertDriver = (info: TransportInfo) => {
    setMasterDrivers(prev => {
      const exists = prev.findIndex(d => d.driverId.toUpperCase().trim() === info.driverId.toUpperCase().trim());
      if (exists > -1) {
        const updated = [...prev];
        updated[exists] = info;
        return updated;
      }
      return [info, ...prev];
    });
  };

  const handleGateIn = (containerData: Container) => {
    const finalContainer = {
      ...containerData,
      eirNumber: containerData.eirNumber || `${eirConfig.eirPrefix}-${Math.floor(Math.random() * 900000) + 100000}`
    };

    setContainers(prev => [...prev, finalContainer]);
    setMovements(prev => [
      {
        id: `MOV-${Date.now()}`,
        containerId: finalContainer.id,
        type: 'Gate-In',
        timestamp: finalContainer.entryDate,
        details: finalContainer.transport
      },
      ...prev
    ]);
    
    // Guardar conductor en la base de datos maestra
    upsertDriver(finalContainer.transport);
    
    // Actualizar estado de internación si existe coincidencia
    const matchedInternation = internations.find(i => 
      i.containerId === finalContainer.id || 
      (finalContainer.id.startsWith(i.containerId) && i.containerId.length > 4)
    );
    if (matchedInternation) {
      setInternations(prev => prev.map(p => 
        p.id === matchedInternation.id ? { ...p, status: 'En Patio' } : p
      ));
    }
    
    setLastReceivedContainer(finalContainer);
    setShowEirReceipt(true);
    setSelectedEspacio(null);
  };

  const handleGateOut = (containerId: string, transport: TransportInfo, exitDate: string) => {
    setContainers(prev => prev.map(c => 
      c.id === containerId ? { ...c, status: 'Out', exitDate: exitDate } : c
    ));
    setMovements(prev => [
      {
        id: `MOV-${Date.now()}`,
        containerId,
        type: 'Gate-Out',
        timestamp: exitDate,
        details: transport
      },
      ...prev
    ]);

    // Actualizar estado de internación si existe
    const matchedInternation = internations.find(i => 
      i.containerId === containerId
    );
    if (matchedInternation) {
      setInternations(prev => prev.map(p => 
        p.id === matchedInternation.id ? { ...p, status: 'Liberado' } : p
      ));
    }

    // Guardar conductor en la base de datos maestra
    upsertDriver(transport);

    setActiveTab('history');
  };

  const handleUpdateContainer = (updatedContainer: Container) => {
    setContainers(prev => prev.map(c => c.id === updatedContainer.id ? updatedContainer : c));
  };

  const handleRelocate = (containerId: string, newEspacio: YardEspacio) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    const fromPos = `${container.location.block}-${container.location.bay}-${container.location.row}-${container.location.tier}`;
    const toPos = `${newEspacio.block}-${newEspacio.bay}-${newEspacio.row}-${newEspacio.tier}`;
    setContainers(prev => prev.map(c => 
      c.id === containerId ? { ...c, location: { block: newEspacio.block, bay: newEspacio.bay, row: newEspacio.row, tier: newEspacio.tier } } : c
    ));
    setMovements(prev => [
      {
        id: `MOV-REL-${Date.now()}`,
        containerId,
        type: 'Relocation',
        timestamp: new Date().toISOString(),
        details: { reason: 'Cambio de posición manual', from: fromPos, to: toPos }
      },
      ...prev
    ]);
  };

  const handleDeleteLocation = (containerId: string) => {
    setContainers(prev => prev.filter(c => c.id !== containerId));
  };

  const handleAddPreload = (preload: DocumentationPreload) => {
    setPreloads(prev => [preload, ...prev]);
  };

  const handleDeletePreload = (id: string) => {
    setPreloads(prev => prev.filter(p => p.id !== id));
  };

  // Función para manejar la navegación y expansión automática
  const handleNavClick = (tab: AppTab) => {
    setActiveTab(tab);
    if (!isSidebarExpanded) {
      setIsSidebarExpanded(true);
    }
  };

  // Manejo de Auth
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('zh_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab(null);
    localStorage.removeItem('zh_auth');
  };

  // --- RENDER CONDICIONAL DEL LOGIN ---
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-row bg-gradient-to-br from-white via-slate-50 to-indigo-50/20">
      
      {/* BARRA LATERAL DINÁMICA */}
      <nav className={`
        bg-white text-slate-700 shadow-xl border-r border-slate-200 
        transition-all duration-300 ease-in-out flex flex-col z-50
        ${isSidebarExpanded ? 'w-72' : 'w-20'}
      `}>
        <div className="p-4 flex flex-col h-full">
          {/* Header del Nav */}
          <div className={`flex items-center gap-3 mb-10 transition-all duration-300 ${isSidebarExpanded ? 'px-2' : 'justify-center'}`}>
            <div 
              className="p-2.5 bg-indigo-600 rounded-md shadow-md cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <Anchor className="w-6 h-6 text-white" />
            </div>
            
            {isSidebarExpanded && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">ZERO<span className="text-indigo-600">HUB</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yard System</p>
              </div>
            )}
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
            {isSidebarExpanded && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 animate-in fade-in">Principal</p>}
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<LayoutDashboard size={20} />} label="Centro de Control" />
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'yard'} onClick={() => { handleNavClick('yard'); setSelectedEspacio(null); }} icon={<MapIcon size={20} />} label="Vista de Patio" />
            
            <div className="my-6 border-t border-slate-100 mx-2"></div>
            
            {isSidebarExpanded && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 animate-in fade-in">Operación</p>}
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'operations'} onClick={() => handleNavClick('operations')} icon={<Briefcase size={20} />} label="Gestión Operativa" />
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'document-control'} onClick={() => handleNavClick('document-control')} icon={<FileText size={20} />} label="Control Documento" />
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'modular'} onClick={() => handleNavClick('modular')} icon={<Box size={20} />} label="Internación Carga" />
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'gate-in'} onClick={() => handleNavClick('gate-in')} icon={<LogIn size={20} />} label="Recepción (Gate In)" />
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'gate-out'} onClick={() => handleNavClick('gate-out')} icon={<LogOut size={20} />} label="Despacho (Gate Out)" />
            
            <div className="my-6 border-t border-slate-100 mx-2"></div>
            
            {isSidebarExpanded && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 animate-in fade-in">Administración</p>}
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'master-data'} onClick={() => handleNavClick('master-data')} icon={<Database size={20} />} label="Gestión Maestra" />
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'history'} onClick={() => handleNavClick('history')} icon={<History size={20} />} label="Log de Movimientos" />

            <div className="my-6 border-t border-slate-100 mx-2"></div>

            {isSidebarExpanded && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 animate-in fade-in">Sistema</p>}
            <NavItem expanded={isSidebarExpanded} active={activeTab === 'settings'} onClick={() => handleNavClick('settings')} icon={<SettingsIcon size={20} />} label="Configuraciones" />
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            {/* BOTÓN CERRAR SESIÓN */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-3 py-3.5 mb-2 rounded-md text-red-500 hover:bg-red-50 transition-all duration-200 group ${!isSidebarExpanded && 'justify-center'}`}
              title={!isSidebarExpanded ? "Cerrar Sesión" : ''}
            >
              <Power size={20} className="shrink-0" />
              {isSidebarExpanded && (
                <span className="font-bold text-xs tracking-tight uppercase animate-in fade-in duration-200">
                  Cerrar Sesión
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors ${!isSidebarExpanded && 'justify-center'}`}
            >
              {isSidebarExpanded ? <ChevronLeft size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
              {isSidebarExpanded && <span className="text-xs font-bold text-slate-500 uppercase">Colapsar Menú</span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-8 min-h-full">
          
          {/* PANTALLA DE BIENVENIDA (Estado vacío) */}
          {activeTab === null && (
            <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in zoom-in-95 duration-700 text-center">
              <div className="bg-white p-10 rounded-xl shadow-2xl shadow-indigo-100 border border-slate-100 mb-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10 p-6 bg-indigo-600 rounded-lg text-white shadow-xl transform group-hover:scale-110 transition-transform duration-500">
                  <Anchor size={64} />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                Bienvenido a <span className="text-indigo-600">ZeroHub</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase text-sm tracking-[0.2em] max-w-lg leading-relaxed">
                Sistema Integral de Gestión de Patio y Logística Portuaria
              </p>
              
              <div className="mt-12 flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className="px-8 py-4 bg-slate-900 text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:-translate-y-1 transition-all shadow-lg flex items-center gap-3"
                >
                  <LayoutDashboard size={16} /> Ir al Dashboard
                </button>
                <button 
                  onClick={() => handleNavClick('yard')}
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-md font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-3"
                >
                  <MapIcon size={16} /> Ver Mapa de Patio
                </button>
              </div>

              <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <Command size={12} /> Seleccione un módulo del menú lateral para comenzar
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard Operativo</h2>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Métricas de terminal en tiempo real</p>
                </div>
              </header>
              <StatsCards containers={containers} espacios={yardEspacios} movements={movements} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-lg font-black mb-6 text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <History className="text-indigo-600" size={20} /> Movimientos Recientes
                  </h3>
                  <MovementLog limit={8} movements={movements} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'yard' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <header>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Layout Interactivo</h2>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Gestión de Posicionamiento de Estiba por Bloques</p>
              </header>
              <YardMap 
                espacios={yardEspacios} 
                containers={containers} 
                yardConfig={yardConfig}
                onDeleteLocation={handleDeleteLocation}
                onRelocate={handleRelocate}
                onUpdateContainer={handleUpdateContainer}
                onEspacioClick={(espacio) => {
                  setSelectedEspacio(espacio);
                  setActiveTab('gate-in');
                }} 
              />
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="animate-in fade-in duration-300">
              <OperationsModule containers={containers.filter(c => c.status === 'In')} />
            </div>
          )}

          {activeTab === 'document-control' && (
            <div className="animate-in fade-in duration-300">
              <DocumentationModule 
                preloads={preloads} 
                onAddPreload={handleAddPreload} 
                onDeletePreload={handleDeletePreload}
                vessels={vessels}
              />
            </div>
          )}

          {activeTab === 'modular' && (
            <div className="animate-in fade-in duration-300">
              <ModularModule 
                internations={internations}
                onAddInternation={(item) => setInternations([item, ...internations])}
                onDeleteInternation={(id) => setInternations(internations.filter(i => i.id !== id))}
                vessels={vessels}
              />
            </div>
          )}

          {activeTab === 'gate-in' && (
            <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-300">
               <GateInForm 
                 selectedEspacio={selectedEspacio}
                 availableEspacios={availableEspacios}
                 knownDrivers={masterDrivers}
                 vessels={vessels}
                 shippingLines={shippingLines}
                 yardConfig={yardConfig}
                 preloads={preloads}
                 onGateIn={handleGateIn}
               />
            </div>
          )}

          {activeTab === 'gate-out' && (
            <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-300">
               <GateOutForm 
                 containers={containers.filter(c => c.status === 'In')}
                 knownDrivers={masterDrivers}
                 onGateOut={handleGateOut}
               />
            </div>
          )}

          {activeTab === 'master-data' && (
            <MasterDataModule 
              vessels={vessels} setVessels={setVessels}
              shippingLines={shippingLines} setShippingLines={setShippingLines}
              customsAgencies={customsAgencies} setCustomsAgencies={setCustomsAgencies}
              clients={clients} setClients={setClients}
              materials={materials} setMaterials={setMaterials}
              drivers={masterDrivers} setDrivers={setMasterDrivers}
            />
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <header>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Log de Operaciones</h2>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Trazabilidad Completa de Unidades</p>
              </header>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <MovementLog movements={movements} />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
              <Settings 
                config={yardConfig} 
                onUpdate={setYardConfig} 
                activeContainersCount={containers.filter(c => c.status === 'In').length}
                eirConfig={eirConfig}
                onUpdateEir={setEirConfig}
              />
            </div>
          )}
        </div>
      </main>

      {/* MODAL EIR AUTO-GENERADO */}
      {showEirReceipt && lastReceivedContainer && (
        <EirReceipt 
          container={lastReceivedContainer} 
          config={eirConfig} 
          onClose={() => {
            setShowEirReceipt(false);
            setActiveTab('yard');
          }} 
        />
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, expanded }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-md transition-all duration-200 group relative ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    } ${!expanded && 'justify-center'}`}
    title={!expanded ? label : ''}
  >
    <span className={`shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
      {icon}
    </span>
    {expanded && (
      <span className="font-bold text-xs tracking-tight uppercase animate-in fade-in duration-200 whitespace-nowrap overflow-hidden">
        {label}
      </span>
    )}
    {!expanded && active && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full"></div>
    )}
  </button>
);

export default App;
