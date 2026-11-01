import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/des-blocks/',
  plugins: [
    react(),
    // Installable from the browser menu, and works offline once loaded.
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      manifest: {
        // A fixed id of its own, so a phone never mixes it up with an earlier
        // install or with the other games on this site.
        id: 'des-blocks',
        name: 'Blocks',
        short_name: 'Blocks',
        description:
          'A sliding block puzzle game for kids that works offline',
        theme_color: '#0f8a7a',
        background_color: '#f4f5f7',
        display: 'standalone',
      },
    }),
  ],
});
