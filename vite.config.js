import { svelteTesting } from "@testing-library/svelte/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';
import mkcert from "vite-plugin-mkcert"

export default defineConfig({
    plugins: [sveltekit(), isoImport(), mkcert()],
    server: {
        host: true,
        port: 3000,
        strictPort: true,
        https: false,
    },

    test: {
        workspace: [{
            extends: "./vite.config.js",
            plugins: [svelteTesting()],

            test: {
                name: "client",
                environment: "jsdom",
                clearMocks: true,
                include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                exclude: ['src/lib/server/**'],
                setupFiles: ['./vitest-setup-client.js']
            }
        }, {
            extends: "./vite.config.js",

            test: {
                name: "server",
                environment: "node",
                include: ['src/**/*.{test,spec}.{js,ts}'],
                exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
            }
        }]
    }
});
