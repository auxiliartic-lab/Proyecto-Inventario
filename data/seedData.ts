
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, EquipmentStatus, Credential } from '../types';

export const initialEquipment: Equipment[] = [
  // --- ECOVITTA (ID: 1) ---
  { id: 1, companyId: 1, siteId: 1, type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', serialNumber: 'DL5420-X1', status: EquipmentStatus.ACTIVE, location: 'Oficina Central', assignedTo: 1, purchaseDate: '2024-01-15', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 2, companyId: 1, siteId: 1, type: 'Servidor', brand: 'HP', model: 'ProLiant DL380', serialNumber: 'HP-SRV-99', status: EquipmentStatus.ACTIVE, location: 'Data Center 1', assignedTo: undefined, purchaseDate: '2024-05-10' },
  
  // --- INDUSTRIAS BÁSICAS DE CALDAS (ID: 2) ---
  { id: 3, companyId: 2, siteId: 2, type: 'Laptop', brand: 'Apple', model: 'MacBook Pro M2', serialNumber: 'MBP-M2-001', status: EquipmentStatus.MAINTENANCE, location: 'Sede Caldas', assignedTo: 2, purchaseDate: '2024-11-20' },
  { id: 20, companyId: 2, siteId: 2, type: 'Desktop', brand: 'Lenovo', model: 'ThinkCentre M70q', serialNumber: 'LN-M70-022', status: EquipmentStatus.ACTIVE, location: 'Planta Producción', assignedTo: 18, purchaseDate: '2023-08-15', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 10' },
  { id: 21, companyId: 2, siteId: 2, type: 'Periférico', brand: 'Kyocera', model: 'Ecosys M2040', serialNumber: 'KYO-PRT-55', status: EquipmentStatus.ACTIVE, location: 'Administración', assignedTo: undefined, purchaseDate: '2024-01-10', peripheralType: 'Impresora' },

  // --- QUÍMICA BÁSICA COLOMBIANA (ID: 3) ---
  { id: 4, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'LN-TP14-001', status: EquipmentStatus.ACTIVE, location: 'Oficina Compras', assignedTo: 4, purchaseDate: '2025-01-10', processor: 'AMD Ryzen 5', ram: '16GB', storage: '512GB SSD', os: 'Windows 11 Pro' },
  { id: 5, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Dell', model: 'Latitude 7420', serialNumber: 'DL-7420-002', status: EquipmentStatus.ACTIVE, location: 'Oficina Planta', assignedTo: 5, purchaseDate: '2024-12-20', processor: 'Intel i7', ram: '32GB', storage: '1TB SSD', os: 'Windows 10 Pro' },
  { id: 6, companyId: 3, siteId: 3, type: 'Desktop', brand: 'HP', model: 'ProDesk 400', serialNumber: 'HP-PD400-003', status: EquipmentStatus.ACTIVE, location: 'Contabilidad', assignedTo: 6, purchaseDate: '2024-11-05', processor: 'Intel i5', ram: '16GB', storage: '256GB SSD', os: 'Windows 10' },
  { id: 7, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Apple', model: 'MacBook Air M1', serialNumber: 'MBA-M1-004', status: EquipmentStatus.ACTIVE, location: 'Nuevos Negocios', assignedTo: 7, purchaseDate: '2024-06-15', processor: 'M1', ram: '8GB', storage: '256GB SSD', os: 'macOS Monterey' },
  { id: 8, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', serialNumber: 'LN-X1-005', status: EquipmentStatus.ACTIVE, location: 'RRHH', assignedTo: 8, purchaseDate: '2024-02-01', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 9, companyId: 3, siteId: 3, type: 'Tablet', brand: 'Samsung', model: 'Galaxy Tab S8', serialNumber: 'SM-TABS8-006', status: EquipmentStatus.ACTIVE, location: 'Planta - Calidad', assignedTo: 9, purchaseDate: '2024-08-20', storage: '128GB', os: 'Android 13' },
  { id: 10, companyId: 3, siteId: 3, type: 'Smartphone', brand: 'Apple', model: 'iPhone 13', serialNumber: 'IP13-007', status: EquipmentStatus.ACTIVE, location: 'Seguridad', assignedTo: 10, purchaseDate: '2024-05-10', storage: '128GB', os: 'iOS 16' },
  { id: 11, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Dell', model: 'Vostro 3510', serialNumber: 'DL-VS3510-008', status: EquipmentStatus.MAINTENANCE, location: 'Mantenimiento', assignedTo: 11, purchaseDate: '2024-09-30', processor: 'Intel i5', ram: '8GB', storage: '1TB HDD', os: 'Windows 10' },
  { id: 12, companyId: 3, siteId: 3, type: 'Desktop', brand: 'Lenovo', model: 'ThinkCentre Neo', serialNumber: 'LN-TC-009', status: EquipmentStatus.ACTIVE, location: 'Recepción', assignedTo: 12, purchaseDate: '2025-02-12', processor: 'Intel i3', ram: '8GB', storage: '256GB SSD', os: 'Windows 11' },
  { id: 13, companyId: 3, siteId: 3, type: 'Periférico', brand: 'Zebra', model: 'Barcode Scanner', serialNumber: 'ZB-SCN-010', status: EquipmentStatus.ACTIVE, location: 'Almacén', assignedTo: 13, purchaseDate: '2025-01-05' },
  { id: 14, companyId: 3, siteId: 3, type: 'Servidor', brand: 'Dell', model: 'PowerEdge T440', serialNumber: 'DL-PE-T440', status: EquipmentStatus.ACTIVE, location: 'Cuarto de Servidores', assignedTo: undefined, purchaseDate: '2024-03-15', processor: 'Xeon Silver', ram: '64GB', storage: '4TB RAID', os: 'Windows Server 2019' },
  { id: 15, companyId: 3, siteId: 3, type: 'Laptop', brand: 'HP', model: 'EliteBook 840', serialNumber: 'HP-EB840-011', status: EquipmentStatus.ACTIVE, location: 'Logística', assignedTo: 14, purchaseDate: '2024-07-01', processor: 'Intel i5', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },

  // --- QUÍMICOS DEL CAUCA MÉXICO (ID: 4) ---
  { id: 16, companyId: 4, siteId: 4, type: 'Laptop', brand: 'Dell', model: 'XPS 15', serialNumber: 'DL-XPS-MX01', status: EquipmentStatus.ACTIVE, location: 'Gerencia General MX', assignedTo: 19, purchaseDate: '2024-03-10', processor: 'Intel i9', ram: '32GB', storage: '1TB SSD', os: 'Windows 11 Pro' },
  { id: 17, companyId: 4, siteId: 4, type: 'Desktop', brand: 'HP', model: 'Z2 Mini G9', serialNumber: 'HP-Z2-MX02', status: EquipmentStatus.ACTIVE, location: 'Ingeniería', assignedTo: 20, purchaseDate: '2024-06-01', processor: 'Intel i7', ram: '32GB', storage: '1TB SSD', os: 'Windows 11 Pro' },
  { id: 18, companyId: 4, siteId: 4, type: 'Smartphone', brand: 'Samsung', model: 'Galaxy S23', serialNumber: 'SM-S23-MX03', status: EquipmentStatus.ACTIVE, location: 'Ventas Campo', assignedTo: undefined, purchaseDate: '2024-09-15', storage: '256GB', os: 'Android 14' },

  // --- QUÍMICOS DEL CAUCA S.A.S (ID: 5) ---
  { id: 22, companyId: 5, siteId: 5, type: 'Laptop', brand: 'Asus', model: 'ExpertBook B9', serialNumber: 'AS-EB9-SAS01', status: EquipmentStatus.ACTIVE, location: 'Gerencia Financiera', assignedTo: 21, purchaseDate: '2024-02-20', processor: 'Intel i7', ram: '16GB', storage: '1TB SSD', os: 'Windows 11 Pro' },
  { id: 23, companyId: 5, siteId: 5, type: 'Laptop', brand: 'Lenovo', model: 'ThinkBook 15', serialNumber: 'LN-TB15-SAS02', status: EquipmentStatus.ACTIVE, location: 'Analista de Datos', assignedTo: 22, purchaseDate: '2024-04-12', processor: 'AMD Ryzen 7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 24, companyId: 5, siteId: 5, type: 'Tablet', brand: 'Apple', model: 'iPad Air 5', serialNumber: 'IPAD-A5-SAS03', status: EquipmentStatus.ACTIVE, location: 'Mercadeo', assignedTo: 23, purchaseDate: '2024-07-30', storage: '64GB', os: 'iPadOS 17' },
  { id: 25, companyId: 5, siteId: 5, type: 'Periférico', brand: 'Epson', model: 'EcoTank L3250', serialNumber: 'EPS-L32-SAS04', status: EquipmentStatus.MAINTENANCE, location: 'Recepción', assignedTo: undefined, purchaseDate: '2023-11-15', peripheralType: 'Impresora' }
];

export const initialCollaborators: Collaborator[] = [
  // --- ECOVITTA ---
  { id: 1, companyId: 1, siteId: 1, firstName: 'Bayron', lastName: 'Ramos', email: 'bayron@ecovitta.com', area: 'TIC', cargo: 'Líder Infraestructura', sex: 'Male', isActive: true },
  { id: 3, companyId: 1, siteId: 1, firstName: 'Juan', lastName: 'Perez', email: 'j.perez@ecovitta.com', area: 'RRHH', cargo: 'Analista', sex: 'Male', isActive: false },
  
  // --- INDUSTRIAS BÁSICAS DE CALDAS ---
  { id: 2, companyId: 2, siteId: 2, firstName: 'Maria', lastName: 'Gomez', email: 'm.gomez@caldas.com', area: 'Producción', cargo: 'Operadora', sex: 'Female', isActive: true },
  { id: 18, companyId: 2, siteId: 2, firstName: 'Carlos', lastName: 'Velasquez', email: 'c.velasquez@caldas.com', area: 'Mantenimiento', cargo: 'Jefe de Mantenimiento', sex: 'Male', isActive: true },

  // --- QUÍMICA BÁSICA COLOMBIANA ---
  { id: 4, companyId: 3, siteId: 3, firstName: 'Jhon Eduard', lastName: 'Ruiz Medina', email: 'jhoneduard.ruiz@qbasica.com', area: 'Compras', cargo: 'Jefe de Compras y Almacén', sex: 'Male', isActive: true },
  { id: 5, companyId: 3, siteId: 3, firstName: 'Cesar Humberto', lastName: 'Cardona Forero', email: 'cesar.cardona@gquimicas.com', area: 'Planta', cargo: 'Gerente de planta', sex: 'Male', isActive: true },
  { id: 6, companyId: 3, siteId: 3, firstName: 'Lina Marcela', lastName: 'Viveros', email: 'lina.viveros@gquimicas.com', area: 'Contabilidad', cargo: 'Analista Contable', sex: 'Female', isActive: true },
  { id: 7, companyId: 3, siteId: 3, firstName: 'Carolina', lastName: 'Angarita Lugo', email: 'carolina.angarita@qbasica.com', area: 'Comercial', cargo: 'Gerente Desarrollo de Nuevos Negocios', sex: 'Female', isActive: true },
  { id: 8, companyId: 3, siteId: 3, firstName: 'Anabell', lastName: 'Lua Sánchez', email: 'anabell.lua@qbasica.com', area: 'RRHH', cargo: 'Gerente General de Recursos Humanos', sex: 'Female', isActive: true },
  { id: 9, companyId: 3, siteId: 3, firstName: 'Enrique', lastName: 'Priego Hernández', email: 'enrique.priego@gquimicas.com', area: 'Calidad', cargo: 'Jefe de Calidad', sex: 'Male', isActive: true },
  { id: 10, companyId: 3, siteId: 3, firstName: 'Ana Isabel', lastName: 'Mejía Calixtro', email: 'anaisabel.mejia@gquimicas.com', area: 'Seguridad', cargo: 'Coordinador de Seguridad e Higiene y Ambiental', sex: 'Female', isActive: true },
  { id: 11, companyId: 3, siteId: 3, firstName: 'Abraham', lastName: 'Rivera Córdova', email: 'abraham.rivera@gquimicas.com', area: 'Mantenimiento', cargo: 'Planeador de Mantenimiento', sex: 'Male', isActive: true },
  { id: 12, companyId: 3, siteId: 3, firstName: 'Carimy', lastName: 'Urban Montoya', email: 'carimy.urban@gquimicas.com', area: 'Administración', cargo: 'Auxiliar Administrativo', sex: 'Female', isActive: true },
  { id: 13, companyId: 3, siteId: 3, firstName: 'Ariel Roberto', lastName: 'Elizalde Ramírez', email: 'ariel.elizarde@gquimicas.com', area: 'Logística', cargo: 'Jefe de Despachos', sex: 'Male', isActive: true },
  { id: 14, companyId: 3, siteId: 3, firstName: 'Itzain', lastName: 'Jiménez Silvestre', email: 'coordcomprasyalmacen@gquimicas.com', area: 'Compras', cargo: 'Coordinador de Compras y Almacén', sex: 'Male', isActive: true },
  { id: 15, companyId: 3, siteId: 3, firstName: 'Víctor Alfonso', lastName: 'Bermúdez Cuartas', email: 'victor.bermudez@gquimicas.com', area: 'Mantenimiento', cargo: 'Jefe de Mantenimiento', sex: 'Male', isActive: true },
  { id: 16, companyId: 3, siteId: 3, firstName: 'Alberto', lastName: 'Cabrera Aviles', email: 'alberto.cabrera@gquimicas.com', area: 'Instrumentación', cargo: 'Instrumentista', sex: 'Male', isActive: true },
  { id: 17, companyId: 3, siteId: 3, firstName: 'Daniela', lastName: 'Grajales Villa', email: 'daniela.grajales@qbasica.com', area: 'Administración', cargo: 'Asistente Ejecutiva', sex: 'Female', isActive: true },

  // --- QUÍMICOS DEL CAUCA MÉXICO (ID: 4) ---
  { id: 19, companyId: 4, siteId: 4, firstName: 'Alejandro', lastName: 'Vargas', email: 'a.vargas@qcmx.com', area: 'Dirección', cargo: 'Gerente General de Recursos Humanos', sex: 'Male', isActive: true },
  { id: 20, companyId: 4, siteId: 4, firstName: 'Sofia', lastName: 'Lopez', email: 's.lopez@qcmx.com', area: 'Ingeniería', cargo: 'Jefe de Calidad', sex: 'Female', isActive: true },

  // --- QUÍMICOS DEL CAUCA S.A.S (ID: 5) ---
  { id: 21, companyId: 5, siteId: 5, firstName: 'Camila', lastName: 'Torres', email: 'c.torres@qcsas.com.co', area: 'Finanzas', cargo: 'Analista Contable', sex: 'Female', isActive: true },
  { id: 22, companyId: 5, siteId: 5, firstName: 'Felipe', lastName: 'Rios', email: 'f.rios@qcsas.com.co', area: 'Sistemas', cargo: 'Auxiliar Administrativo', sex: 'Male', isActive: true },
  { id: 23, companyId: 5, siteId: 5, firstName: 'Valentina', lastName: 'Castro', email: 'v.castro@qcsas.com.co', area: 'Mercadeo', cargo: 'Coordinador de Seguridad e Higiene y Ambiental', sex: 'Female', isActive: true }
];

export const initialLicenses: SoftwareLicense[] = [
  // Ecovitta
  { id: 1, companyId: 1, name: 'Office 365 Business', vendor: 'Microsoft', key: 'XXXXX-XXXXX-XXXXX', startDate: '2024-01-01', expirationDate: '2026-12-31', type: 'Suscripción', totalSlots: 50, assignedTo: [], assignedToEquipment: [] },
  { id: 2, companyId: 1, name: 'Adobe Creative Cloud', vendor: 'Adobe Systems', key: 'ADOBE-9922', startDate: '2025-02-15', expirationDate: '2026-02-15', type: 'Suscripción', totalSlots: 5, assignedTo: [], assignedToEquipment: [] },
  { id: 3, companyId: 1, name: 'Antivirus ESET', vendor: 'ESET', key: 'ESET-AV-2024', startDate: '2024-05-01', expirationDate: '2025-05-01', type: 'Anual', totalSlots: 100, assignedTo: [], assignedToEquipment: [] },
  
  // IBC
  { id: 4, companyId: 2, name: 'AutoCAD 2024', vendor: 'Autodesk', key: 'ACAD-24-IBC', startDate: '2024-01-20', expirationDate: '2025-01-20', type: 'Anual', totalSlots: 2, assignedTo: [], assignedToEquipment: [] },
  
  // QBC
  { id: 5, companyId: 3, name: 'SAP Business One', vendor: 'SAP', key: 'SAP-BO-QBC-001', startDate: '2023-06-01', expirationDate: '2026-06-01', type: 'Suscripción', totalSlots: 20, assignedTo: [], assignedToEquipment: [] },
  
  // QCMX
  { id: 6, companyId: 4, name: 'Microsoft 365 E3', vendor: 'Microsoft', key: 'MS-365-MX-99', startDate: '2024-03-01', expirationDate: '2025-03-01', type: 'Suscripción', totalSlots: 30, assignedTo: [], assignedToEquipment: [] },
  
  // QCSAS
  { id: 7, companyId: 5, name: 'Kaspersky Endpoint Security', vendor: 'Kaspersky', key: 'KASP-SAS-2024', startDate: '2024-02-10', expirationDate: '2025-02-10', type: 'Anual', totalSlots: 15, assignedTo: [], assignedToEquipment: [22] }
];

export const initialMaintenance: MaintenanceRecord[] = [
  // IBC
  { id: 1, companyId: 2, equipmentId: 3, date: '2025-01-15', title: 'Falla de Pantalla', description: 'La pantalla parpadea intermitentemente.', severity: 'Moderate', status: 'Open', technician: 'Soporte Externo' },
  
  // QCMX
  { id: 2, companyId: 4, equipmentId: 16, date: '2024-11-20', title: 'Sobrecalentamiento', description: 'El equipo se apaga repentinamente.', severity: 'Severe', status: 'Closed', technician: 'Soporte Dell', resolutionDetails: 'Cambio de pasta térmica y ventiladores', resolutionDate: '2024-11-25', deliveryStatus: 'Delivered' },
  
  // QCSAS
  { id: 3, companyId: 5, equipmentId: 25, date: '2025-02-01', title: 'Atasco de Papel Recurrente', description: 'La impresora atasca papel en la bandeja 2.', severity: 'Moderate', status: 'Open', technician: 'Soporte Local' }
];

export const initialCredentials: Credential[] = [
    // Ecovitta
    { id: 4, companyId: 1, service: 'Portal Proveedores', username: 'logistica_eco', password: 'ProvPass2024', description: 'Acceso a portal de compras' },

    // IBC
    { id: 5, companyId: 2, service: 'SCADA Planta', username: 'operador_jefe', password: 'ScadaSecure#1', description: 'Control de maquinaria' },

    // QBC
    { id: 1, companyId: 3, service: 'Consola AWS', username: 'admin_it', password: 'SafePassword123!', description: 'Acceso root a infraestructura' },
    { id: 2, companyId: 3, service: 'Panel Hosting', username: 'webmaster', password: 'HostingPass2024', description: 'Cpanel principal' },
    { id: 3, companyId: 3, service: 'Router Principal', username: 'root', password: 'RouterPass99', description: 'Acceso físico al rack' },

    // QCMX
    { id: 6, companyId: 4, service: 'Banca Electrónica', username: 'tesoreria_mx', password: 'Bank#Mex2024', description: 'Token físico en caja fuerte' },

    // QCSAS
    { id: 7, companyId: 5, service: 'Portal DIAN', username: 'contador_sas', password: 'DianTaxPass24', description: 'Firma digital representante legal' }
];
