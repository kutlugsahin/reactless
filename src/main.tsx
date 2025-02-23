import { createRoot } from 'react-dom/client';
import 'reflect-metadata';

import { Comp } from './components/reactivity.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<Comp />);
