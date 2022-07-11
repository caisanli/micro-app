import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import legacy from '@vitejs/plugin-legacy'
import { join } from 'path';
import { writeFileSync } from 'fs';
function zxjMicroPlugin() {
  let basePath = '';
  return {
    name: 'vite:micro-app',
    apply: 'build',
    configResolved(config) {
      basePath = `${ config.base }${ config.build.assetsDir }/`;
      console.log('basePath：', basePath);
    },
    writeBundle(options, bundle) {
      console.log('writeBundle');
      for (const chunkName in bundle) {
        if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
          const chunk = bundle[chunkName];
          if (chunk.fileName && chunk.fileName.lastIndexOf('.js') > -1) {
            // @ts-ignore
            chunk.code = chunk.code.replace(/(from|import\()(\s*['"])(\.\.?\/)/g, (all, $1, $2, $3) => {
              return all.replace($3, new URL($3, basePath));
            });
            const fullPath = join(options.dir || '', chunk.fileName);
            // @ts-ignore
            writeFileSync(fullPath, chunk.code);
          }
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite2/',
  resolve: {
    alias: {
      '@': '/src'
    },
  },
  plugins: [
    vue(),
    zxjMicroPlugin()
  ]
});
