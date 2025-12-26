
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';

// Desabilitar console em produção
const isDevelopment = import.meta.env.DEV;
if (!isDevelopment) {
  console.log = () => {};
  console.warn = () => {};
}

window.addEventListener('error', (event) => {
    console.error('❌ Erro global detectado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejeitada não tratada:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
    const errorMsg = "❌ Não foi possível encontrar elemento root no HTML";
    console.error(errorMsg);
    throw new Error(errorMsg);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
