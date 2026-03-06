var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import path from 'path';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import pkg from './package.json';
var dependencies = Object.keys(pkg.dependencies);
var dedupe = __spreadArray(__spreadArray([], dependencies, true), ['react/jsx-runtime', 'react/jsx-dev-runtime'], false);
var ASSETS_WITHOUT_A_HASH = [
    // Avoid hashes in the audio still path, since it gets saved in the database
    // And we don't want it to update the hash everytime the svg file changes
    // https://meemoo.atlassian.net/browse/AVO-3336
    'audio-still.svg',
];
export default defineConfig(function () {
    return {
        build: {
            outDir: 'dist',
            sourcemap: true,
            cssCodeSplit: false,
            manifest: true, // Generate manifest, so ssr code can find the correct main-<hash>.css file
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                },
                plugins: [react()],
                output: {
                    assetFileNames: function (file) {
                        return file.name && ASSETS_WITHOUT_A_HASH.includes(file.name)
                            ? "assets/[name].[ext]"
                            : "assets/[name]-[hash].[ext]";
                    },
                },
            },
        },
        server: {
            port: 8080,
        },
        plugins: [svgrPlugin()],
        ssr: {
            noExternal: [
                // Ensures vite chooses the ESM build (module) of packages and not the common js build (main)
                '@viaa/avo2-types',
                '@viaa/avo2-components',
            ],
            external: ['use-query-params', 'react', 'react-dom'],
        },
        resolve: {
            // Avoid issues with multiple versions of react being loaded
            dedupe: dedupe,
        },
        // By default, Vite doesn't include shims for Node.js
        // But DraftJS/Braft RTE (used by the rich text editor) needs them to work
        define: {
            global: 'globalThis',
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },
    };
});
