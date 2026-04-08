import { defineConfig } from 'vite';

const buildId = new Date()
  .toISOString()
  .replace(/[-:TZ.]/g, '')
  .slice(0, 14);

function injectBuildId(html) {
  return html.replace(/__BUILD_ID__/g, buildId);
}

export default defineConfig({
  publicDir: 'public',
  plugins: [
    {
      name: 'inject-build-id',
      transformIndexHtml(html) {
        return injectBuildId(html);
      },
    },
  ],
  build: {
    cssCodeSplit: false,
  },
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
});
