import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { InventoryProvider } from './context/InventoryContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </React.StrictMode>
  );
}