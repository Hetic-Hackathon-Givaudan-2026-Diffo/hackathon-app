import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Le thème d'abord : les feuilles des écrans s'appuient sur ses variables
import './ui/styles/theme.css';
import App from './ui/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
