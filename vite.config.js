import path from 'path';

import react from '@vitejs/plugin-react';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const ASSETS_WITHOUT_A_HASH = [
	// Avoid hashes in the audio still path, since it gets saved in the database
	// And we don't want it to update the hash everytime the svg file changes
	// https://meemoo.atlassian.net/browse/AVO-3336
	'audio-still.svg',
];

export default defineConfig(() => {
	return {
		build: {
			outDir: 'dist',
			sourcemap: true,
			rollupOptions: {
				plugins: [sourcemaps()],
				output: {
					assetFileNames: function (file) {
						return ASSETS_WITHOUT_A_HASH.includes(file.name)
							? `assets/[name].[ext]`
							: `assets/[name]-[hash].[ext]`;
					},
				},
			},
		},
		server: {
			port: 8080,
		},
		plugins: [react(), viteTsconfigPaths(), svgrPlugin(), cssInjectedByJsPlugin()],
		sourcemap: true,
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
