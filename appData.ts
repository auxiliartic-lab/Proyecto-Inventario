
import { Company } from './types';

// Logos convertidos a SVG Data URIs para independencia total (Internos en el código)
// Ecovitta: Verde oscuro
const LOGO_ECOVITTA = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMTIwIiBmaWxsPSJub25lIj4KICA8dGV4dCB4PSI1MCUiIHk9IjU1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiMzOUI1NEEiPmVjb3ZpdHRhPC90ZXh0PgogIDxwYXRoIGQ9Ik0yODAgNDAgQTMwIDMwIDAgMCAxIDI4MCAxMDAiIHN0cm9rZT0iIzM5QjU0QSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+`;

// Industrias Caldas: Azul Oscuro y Amarillo
const LOGO_CALDAS = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMTIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMzAgOTAgTDMwIDMwIEg1MCBMNTAgOTAgSDMwIFoiIGZpbGw9IiMwMDcyQkMiLz4KICA8Y2lyY2xlIGN4PSI4NSIgY3k9IjgwIiByPSIyNSIgc3Ryb2tlPSIjRkJCMDNCIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSIxMzAiIHk9IjgwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9IjgwMCIgZmlsbD0iIzQ3NTU2OSI+SU5EVVNUUklBUyBCQVNJQ0FTPC90ZXh0Pgo8L3N2Zz4=`;

// Quimica Basica: Azul Cyan y Verde
const LOGO_QUIMICA = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMTIwIiBmaWxsPSJub25lIj4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSIzNSIgc3Ryb2tlPSIjMDBBRUVGIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNNjAgOTUgQzgwIDk1IDkwIDExMCAxMjAgMTEwIiBzdHJva2U9IiM4Q0M2M0YiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHRleHQgeD0iMTIwIiB5PSI3MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZToiMzIiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiM2NDc0OGIiPlFVSU1JQ0EgQkFTSUNBPC90ZXh0Pgo8L3N2Zz4=`;

// Recurso Mexico: Naranja Mexico
const LOGO_MEXICO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMTIwIiBmaWxsPSJub25lIj4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSIzNSIgc3Ryb2tlPSIjRkJCMDNCIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNNjAgOTUgQzgwIDk1IDkwIDExMCAxMjAgMTEwIiBzdHJva2U9IiM4Q0M2M0YiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHRleHQgeD0iMTQwIiB5PSI4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiM4Q0M2M0YiPm14PC90ZXh0Pgo8L3N2Zz4=`;

export const COMPANIES: Company[] = [
  { 
    id: 1, 
    name: 'Ecovitta', 
    color: 'bg-brand-green-dark', 
    logo: LOGO_ECOVITTA
  },
  { 
    id: 2, 
    name: 'Industrias Caldas', 
    color: 'bg-brand-blue-dark', 
    logo: LOGO_CALDAS
  },
  { 
    id: 3, 
    name: 'Química Básica', 
    color: 'bg-brand-yellow', 
    logo: LOGO_QUIMICA
  },
  { 
    id: 4, 
    name: 'Recurso México', 
    color: 'bg-brand-mexico', 
    logo: LOGO_MEXICO
  }
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
