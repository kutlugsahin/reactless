import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import componentTransform from './plugin-reactive-components';

export default defineConfig({
	plugins: [
		react({
			tsDecorators: true, // Enable TypeScript decorators
			devTarget: 'es2020',
		}),
		tsConfigPaths(),
		componentTransform(),
	],
	optimizeDeps: {
		esbuildOptions: {
			tsconfigRaw: {
				compilerOptions: {
					experimentalDecorators: true,
				},
			},
		},
	},
});
