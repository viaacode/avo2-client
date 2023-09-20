import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
	return {
		build: {
			outDir: 'dist',
			sourcemap: true,
		},
		server: {
			port: 8080,
		},
		plugins: [react(), viteTsconfigPaths(), svgrPlugin(), cssInjectedByJsPlugin()],
		define: {
			// By default, Vite doesn't include shims for Node.js
			// necessary for rich text editor to work
			// https://github.com/vitejs/vite/discussions/5912#discussioncomment-5569850
			global: 'globalThis',
		},
		resolve: {
			alias: {
				// eslint-disable-next-line no-undef
				'~': path.resolve(__dirname, 'public'),
			},
		},
	};
});
