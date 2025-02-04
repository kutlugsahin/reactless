import 'reflect-metadata';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';

import './index.css';
import { Reactivity } from './components/reactivity.tsx';

createRoot(document.getElementById('root')!).render(<App />);
