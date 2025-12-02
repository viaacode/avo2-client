import path from 'path';

import {defineConfig, UserConfig} from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import react from "@vitejs/plugin-react";

const ASSETS_WITHOUT_A_HASH = [
	// Avoid hashes in the audio still path, since it gets saved in the database
	// And we don't want it to update the hash everytime the svg file changes
	// https://meemoo.atlassian.net/browse/AVO-3336
	'audio-still.svg',
];

export default defineConfig((): UserConfig => {
	return {
		build: {
			outDir: 'dist',
			sourcemap: true,
			rollupOptions: {
				input: {
					main: path.resolve(__dirname, 'index.html'),
				},
				plugins: [react()],
				output: {
					assetFileNames: function (file) {
						return file.name && ASSETS_WITHOUT_A_HASH.includes(file.name)
							? `assets/[name].[ext]`
							: `assets/[name]-[hash].[ext]`;
					},
				},
			},
		},
		server: {
			port: 8080,
		},
		plugins: [
			viteTsconfigPaths(),
			svgrPlugin(),
		],
		ssr: {
			noExternal: [
				// Ensures vite chooses the ESM build (module) of packages and not the common js build (main)
				"@viaa/avo2-types",
				"@viaa/avo2-components"
			],
			external: [
				'use-query-params'
			]
		},
		resolve: {
			alias: {
				'~': path.resolve(__dirname, 'public'),
			},
			dedupe: [
				'@flowplayer/player',
				'@hookform/resolvers',
				'@meemoo/admin-core-ui',
				'@meemoo/react-components',
				'@popperjs/core',
				'@studiohyperdrive/pagination',
				'@tanstack/react-query',
				'@viaa/avo2-components',
				'@viaa/avo2-types',
				'autosize',
				'caniuse-lite',
				'capture-stack-trace',
				'clsx',
				'copy-to-clipboard',
				'date-fns',
				'date-fns-tz',
				'es-toolkit',
				'file-saver',
				'history',
				'i18next',
				'i18next-http-backend',
				'i18next-xhr-backend',
				'immer',
				'isomorphic-dompurify',
				'lodash-es',
				'marked',
				'node-fetch',
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
				'react-page-split',
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
				'ts-retry-promise',
				'use-query-params',
				'yup',
			],
		},
	};
});
