import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';



export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['./src/**/*.test.*'],
        globals: true,
        mockReset: true,
        browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            screenshotFailures: false,
            instances: [
                { browser: 'chromium' },
                { browser: 'firefox' },
                { browser: 'webkit' },
            ],
        },
    },
}));