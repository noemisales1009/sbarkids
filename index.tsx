
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'src/index.css';

// Capturar erros globais de carregamento
console.log('🚀 Iniciando aplicação SBAR Juju...');

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

console.log('✅ Elemento root encontrado');

const root = ReactDOM.createRoot(rootElement);
console.log('🔄 Renderizando App...');

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

console.log('✅ App renderizado com sucesso');
