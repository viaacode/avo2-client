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
		// TODO, see if we can load graphql files instead of the documents from the react-query generated file, since we don't use the react query a lot
		// assetsInclude: ['**/*.graphql'],
		resolve: {
			alias: {
				// eslint-disable-next-line no-undef
				'~': path.resolve(__dirname, 'public'),
			},
			dedupe: [
				'@flowplayer/player',
				'@hookform/resolvers',
				'@meemoo/admin-core-ui',
				'@meemoo/react-components',
				'@popperjs/core',
				'@tanstack/react-query',
				'@viaa/avo2-components',
				'@viaa/avo2-types',
				'autosize',
				'caniuse-lite',
				'capture-stack-trace',
				'clsx',
				'date-fns',
				'dompurify',
				'file-saver',
				'history',
				'i18next',
				'i18next-xhr-backend',
				'immer',
				'lodash-es',
				'marked',
				'node-fetch',
				'oaf-react-router',
				'postcss',
				'query-string',
				'raf',
				'react',
				'react-colorful',
				'react-copy-to-clipboard',
				'react-datepicker',
				'react-dom',
				'react-helmet',
				'react-hook-form',
				'react-i18next',
				'react-idle-timer',
				'react-joyride',
				'react-modal',
				'react-perfect-scrollbar',
				'react-popper',
				'react-range',
				'react-redux',
				'react-router',
				'react-router-dom',
				'react-scrollbars-custom',
				'react-select',
				'react-table',
				'react-to-string',
				'react-toastify',
				'react-zendesk',
				'redux',
				'redux-devtools-extension',
				'redux-thunk',
				'source-map-explorer',
				'unique-selector',
				'use-query-params',
				'yup',
			],
		},
	};
});
