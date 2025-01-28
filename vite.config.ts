import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		react({
			tsDecorators: true, // Enable TypeScript decorators
			devTarget: 'es2020',
		}),
	],
});
