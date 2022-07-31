import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy'
import { resolve, join } from 'path';
import { writeFileSync } from 'fs';
const zxjMicroPlugin = function():PluginOption {
  let basePath = '';
  return {
    name: "vite:micro-app",
    apply: 'build',
    configResolved(config) {
      basePath = `${ config.base }${ config.build.assetsDir }/`
      console.log('basePath：', basePath)
    },
    writeBundle(options, bundle) {
      console.log('writeBundle')
      for (const chunkName in bundle) {
        if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
          const chunk = bundle[chunkName]
          if (chunk.fileName && chunk.fileName.lastIndexOf('.js') > -1) {
            // console.log(chunk)
            const ORIGIN = 'http://0.0.0.0'
            // @ts-ignore
            chunk.code = chunk.code.replace(/(from|import\()(\s*['"])(\.\.?\/)/g, (all, $1, $2, $3) => {
              const fullPath = new URL($3, ORIGIN + basePath)
              const newPath = fullPath.href.replace(ORIGIN, '')
              return all.replace($3, newPath)
            })
            const fullPath = join(options.dir, chunk.fileName)
            // @ts-ignore
            writeFileSync(fullPath, chunk.code);
          }
        }
      }
    },
  }
}

function _resolve(src: string) {
  return resolve(__dirname, src);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite/',
  resolve: {
    alias: [
      // 设置别名
      { find: '@', replacement: _resolve('src') },
    ]
  },
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    vue(),
    // zxjMicroPlugin(),
    legacy({
      targets: ['ie >= 10'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
})
