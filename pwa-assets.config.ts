import {
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config';

const background = { resizeOptions: { background: '#0f8a7a' } };

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: { ...preset.maskable, ...background },
    apple: { ...preset.apple, ...background },
  },
  images: ['public/favicon.svg'],
});
