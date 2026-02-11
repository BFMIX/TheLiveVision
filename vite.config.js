import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/main.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
