import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, UserConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';

import pkg from './package.json';

const dependencies: string[] = Object.keys(pkg.dependencies);

const dedupe = [
	...dependencies,
	'react/jsx-runtime',
	'react/jsx-dev-runtime',
];

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
			cssCodeSplit: false,
			manifest: true, // Generate manifest, so ssr code can find the correct main-<hash>.css file
			rollupOptions: {
				input: {
					embed: path.resolve(__dirname, 'embed/index.html'),
				},
				plugins: [react()],
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
		plugins: [react(), svgrPlugin()],
		resolve: {
			alias: {
				// eslint-disable-next-line no-undef
				'~': path.resolve(__dirname, 'public'),
			},
			dedupe
		},
	};
});
