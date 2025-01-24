import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { checker } from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import path from 'node:path';
import url from 'node:url';



const tsconfigPath = './tsconfig.web.build.json';

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: 'build',
        emptyOutDir: true,
        copyPublicDir: false,
        lib: {
            entry: './src/index.ts',
            formats: ['es'],
        },
        sourcemap: true,
        minify: false,
        ssr: true,
        rollupOptions: {
            input: Object.fromEntries(
                glob.sync(
                    'src/**/*.{ts,tsx}',
                    { ignore: 'src/**/*.{d,test}.{ts,tsx}' },
                ).map((file) => [
                    path.relative(
                        'src',
                        file.slice(
                            0,
                            file.length - path.extname(file).length,
                        ),
                    ),
                    url.fileURLToPath(new URL(file, import.meta.url)),
                ]),
            ),
            treeshake: true,
            output: {
                assetFileNames: 'assets/[name][extname]',
                entryFileNames: '[name].js',
            },
        },
    },
    plugins: [
        tsconfigPaths(),
        checker({ typescript: true }),
        dts({ tsconfigPath }),
    ],
});