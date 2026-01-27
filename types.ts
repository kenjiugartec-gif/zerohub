
export type ContainerSize = '20\'' | '40\'' | '45\'' | '48\'';
export type ContainerType = 'Dry' | 'Reefer' | 'Open Top' | 'Flat Rack' | 'Tank';
export type LoadType = 'FCL' | 'LCL';
export type IDType = 'Nacional' | 'Extranjero';
export type MaterialType = 'Cajas' | 'Bobinas' | 'Pallets' | 'Sacos' | 'Planchas';
export type CargoCondition = 'Directo' | 'Indirecto';
export type VesselType = 'Portacontenedores' | 'Granelero' | 'Tanque' | 'Ro-Ro';

export interface EirConfig {
  companyName: string;
  companyAddress: string;
  companyTaxId: string;
  companyPhone: string;
  terminalCode: string;
  footerNotes: string;
  logoUrl?: string;
  eirPrefix: string;
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  flag: string;
  type: VesselType;
}

export interface ShippingLine {
  id: string;
  name: string;
  scac: string;
  contactEmail?: string;
  website?: string;
}

export interface CustomsAgency {
  id: string;
  name: string;
  taxId: string;
  contactPhone?: string;
  address?: string;
}

export interface Client {
  id: string;
  name: string;
  taxId: string;
  email?: string;
}

export interface MaterialCatalog {
  id: string;
  name: string;
  description: string;
  unit: 'Unidades' | 'KG' | 'Metros' | 'Pallets';
}

export interface InternationFCL {
  id: string;
  containerId: string;
  bl: string;
  client: string;
  vessel: string;
  eta: string;
  weight: number;
  commodity: string;
  status: 'Programado' | 'En Patio' | 'Liberado';
  priority: 'Alta' | 'Media' | 'Baja';
  operationType?: 'FCL' | 'LCL' | 'Primaria';
}

export interface DocumentationPreload {
  id: string;
  receptionNote: string;
  client: string;
  customsAgency: string;
  shippingLine: string;
  vessel: string;
  voyage: string;
  weight: number;
  bl: string;
  condition: CargoCondition;
  preloadDate: string;
  containerId?: string; // Campo opcional para pre-asignar una unidad específica
  fileName?: string;
  fileData?: string; // Base64
  fileType?: string;
}

export interface Container {
  id: string; 
  client: string;
  receptionNote: string; 
  eirNumber?: string;
  vessel: string;
  voyage: string;
  bl: string;
  shippingLine: string;
  weight: number;
  tare: number;
  size: ContainerSize;
  type: ContainerType;
  entryDate: string;
  exitDate?: string;
  status: 'In' | 'Out';
  location: {
    block: string;
    bay: string;
    row: number;
    tier: number;
  };
  transport: TransportInfo;
  loadType: LoadType;
  cargoQuantity?: number;
  cargoWeight?: number;
  materialType?: MaterialType;
}

export interface TransportInfo {
  truckPlate: string;
  driverName: string;
  driverId: string;
  driverType: IDType;
  company: string;
}

export interface Movement {
  id: string;
  containerId: string;
  type: 'Gate-In' | 'Gate-Out' | 'Correction' | 'Relocation';
  timestamp: string;
  details: TransportInfo | { reason: string; from: string; to: string };
}

export interface YardEspacio {
  block: string;
  bay: string;
  row: number;
  tier: number;
  containerId: string | null;
}