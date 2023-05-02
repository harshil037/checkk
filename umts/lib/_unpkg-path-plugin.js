import axios from 'axios'
import { containsSpecial } from './utils'

export const unpkgPathPlugin = (inputCode, source, unpkg, qParam) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        console.log('onResolve', args)
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' }
        }

        // console.log('==================')
        // console.log(args.path)
        // console.log(containsSpecial(args.path))
        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            // path: new URL(args.path, `${source}${args.resolveDir}`).href,
            // path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
            path: new URL(
              args.path,
              `${
                args.importer?.includes('https://unpkg.com')
                  ? unpkg + args.resolveDir + '/'
                  : source + args.resolveDir + '/'
              }`,
            ).href,
          }
        }

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            // path: new URL(args.path, `${source}${args.resolveDir}`).href,
            // path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
            path: new URL(
              args.path,
              `${
                args.importer?.includes('https://unpkg.com')
                  ? unpkg + args.resolveDir + '/'
                  : source + args.resolveDir + '/'
              }`,
            ).href,
          }
        }

        return {
          namespace: 'a',
          // path: `${containsSpecial(args.path) ? source : unpkg}/${args.path}`,
          path: `https://unpkg.com/${args.path}`,
          // path: `${args.importer?.includes('https://unpkg.com') || arg.path ? unpkg + '/' + args.path : source + '/' + args.path}`,
        }
      })

      build.onLoad({ filter: /.*/ }, async (args) => {
        console.log('onLoad', args)

        if (args.path === 'index.js') {
          return {
            loader: 'tsx',
            contents: inputCode,
          }
        }

        console.log('===============')
        const file = args.path.includes(source) && args.path.replace(source, '')
        const fileEncoded =
          file &&
          encodeURIComponent(file + '.tsx')
            .replace(/\./g, '%2E')
            .replace(/\_/g, '%5f')
            .replace(/\_/g, '%5f')
        const path = fileEncoded ? source + fileEncoded : args.path
        const { data, request } = fileEncoded
          ? await axios.get(`${path}?ref=main`, {
              headers: {
                'PRIVATE-TOKEN': 'glpat-3GbvwkDLQHs9nG8ym8Nr',
              },
            })
          : await axios.get(args.path)
        const decodedContent = fileEncoded && data?.content && Buffer.from(data.content, 'base64').toString('utf-8')
        console.log({ decodedContent })
        return {
          loader: 'tsx',
          contents: fileEncoded ? decodedContent : data,
          resolveDir: new URL('./', request.res.responseUrl).pathname,
        }
      })
    },
  }
}
