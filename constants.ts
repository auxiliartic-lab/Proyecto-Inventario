
import { Company } from './types';

export const COMPANIES: Company[] = [
  { id: 1, name: 'Ecovitta', color: 'bg-emerald-600' },
  { id: 2, name: 'Industrias Caldas', color: 'bg-blue-600' },
  { id: 3, name: 'Química Básica', color: 'bg-indigo-600' },
  { id: 4, name: 'Recurso México', color: 'bg-red-600' }
];

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tablero Principal', icon: 'fa-gauge' },
  { id: 'equipment', label: 'Equipos', icon: 'fa-laptop' },
  { id: 'collaborators', label: 'Colaboradores', icon: 'fa-users' },
  { id: 'licenses', label: 'Licencias', icon: 'fa-certificate' },
  { id: 'maintenance', label: 'Mantenimientos', icon: 'fa-screwdriver-wrench' },
  { id: 'credentials', label: 'Credenciales', icon: 'fa-key' },
  { id: 'reports', label: 'Reportes', icon: 'fa-chart-pie' }
];
