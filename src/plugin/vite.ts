// import { join } from 'path';
// import { writeFileSync } from 'fs';
// import type { Plugin } from 'vite';
// import type { OutputChunk } from 'rollup';
//
// const vitePlugin = (): Plugin => {
//   let basePath = '';
//   return {
//     name: 'vite:micro-app',
//     apply: 'build',
//     configResolved(config) {
//       basePath = `${ config.base }${ config.build.assetsDir }/`;
//     },
//     writeBundle(options, bundle) {
//       for (const chunkName in bundle) {
//         if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
//           const chunk = bundle[chunkName] as OutputChunk;
//           if (chunk.fileName && chunk.fileName.lastIndexOf('.js') > -1) {
//             const ORIGIN = 'http://192.168.0.103:83';
//             chunk.code = chunk.code.replace(/(from|import\()(\s*['"])(\.\.?\/)/g, (all, $1, $2, $3) => {
//               const fullPath = new URL($3, ORIGIN + basePath);
//               const newPath = fullPath.href.replace(ORIGIN, '');
//               return all.replace($3, newPath);
//             });
//             const fullPath = join(options.dir || '', chunk.fileName);
//             writeFileSync(fullPath, chunk.code);
//           }
//         }
//       }
//     },
//   };
// };
//
// export {
//   vitePlugin
// };
