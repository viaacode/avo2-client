import path from 'path';

import react from '@vitejs/plugin-react';
import {defineConfig, UserConfig} from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const ASSETS_WITHOUT_A_HASH = [
	// Avoid hashes in the audio still path, since it gets saved in the database
	// And we don't want it to update the hash everytime the svg file changes
	// https://meemoo.atlassian.net/browse/AVO-3336
	'audio-still.svg',
];

export default defineConfig((): UserConfig => {
	return {
		build: {
			outDir: 'dist-embed',
			sourcemap: true,
			rollupOptions: {
				input: {
					embed: path.resolve(__dirname, 'embed/index.html'),
				},
				plugins: [],
				output: {
					assetFileNames: function (file) {
						return ASSETS_WITHOUT_A_HASH.includes(file.name as string)
							? `assets/[name].[ext]`
							: `assets/[name]-[hash].[ext]`;
					},
					plugins: [
						{
							name: 'html-path-rewrite',
							generateBundle(_, bundle) {
								for (const key in bundle) {
									if (
										bundle[key].type === 'asset' &&
										bundle[key].fileName.endsWith('.html')
									) {
										if (bundle[key].fileName === 'embed/index.html') {
											bundle[key].fileName = 'embed.html';
										}
									}
								}
							},
						},
					],
				},
			},
		},
		server: {
			port: 8080,
		},
		plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
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
				'isomorphic-dompurify',
				'file-saver',
				'history',
				'i18next',
				'i18next-xhr-backend',
				'immer',
				'lodash-es',
				'marked',
				'node-fetch',
				'oaf-react-router',
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
				'react-zendesk',
				'redux',
				'redux-devtools-extension',
				'redux-thunk',
				'source-map-explorer',
				'use-query-params',
				'yup',
			],
		},
	};
});
