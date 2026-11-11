import {
  defaultAssetName,
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
    // Phones keep an installed app's icons by file name, so a new icon needs
    // new names: change the prefix whenever public/favicon.svg changes.
    assetName: (type, size) => `star-${defaultAssetName(type, size)}`,
  },
  images: ['public/favicon.svg'],
});
