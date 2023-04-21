import axios from 'axios'
import path from 'path'
import fs from 'fs'

const localLibraries = [
  { library: 'react-icons', pathExtension: 'cjs', distPath: '' },
  { library: 'extract-files', pathExtension: '', distPath: '/public' },
]

const resolveLibraries = (build, localLibraries) => {
  return localLibraries.map((l) => {
    const namespace = l.library
    build.onResolve({ filter: new RegExp(`${l.library}`) }, async (args) => {
      // console.log({ args })
      return {
        path: args.path + l.distPath,
        namespace,
      }
    })

    build.onResolve({ filter: /^..\//, namespace }, async (args) => {
      const p = args.path.replace('../', '')
      const importer = `${args.importer.substring(0, args.importer.lastIndexOf('/'))}/${p}/${l.pathExtension}${
        l.distPath
      }`
      return {
        path: importer,
        namespace,
      }
    })

    build.onResolve({ filter: /^..\/lib/, namespace: 'extract-files' }, async (args) => {
      return {
        path: 'extract-files/public',
        namespace: 'extract-files',
      }
    })

    build.onResolve({ filter: /^.\//, namespace }, async (args) => {
      const importer = args.importer.includes('.js')
        ? args.importer.substring(0, args.importer.lastIndexOf('/'))
        : args.importer

      return {
        path: `${importer}/${args.path}.js`,
        namespace,
      }
    })
  })
}

const buildLocalLibraries = (build, localLibraries) => {
  return localLibraries.map(({ library }) => {
    build.onLoad({ filter: /.*/, namespace: library }, async (args) => {
      const p = path.resolve('./node_modules/', `${args.path}`)
      const file = p.includes('.js') ? p : p + '/index.js'
      const contents = await fs.promises.readFile(file, 'utf8')
      return {
        contents,
        loader: 'tsx',
        resolveDir: p,
      }
    })
  })
}

export const unpkgPathPlugin = (inputCode, unpkg, findLibraryFile, PKG_MTSONLINE_LIBRARY, PKG_MTSONLINE_DIST_PATH) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build) {
      resolveLibraries(build, localLibraries)

      build.onResolve({ filter: /^index.js/ }, async (args) => {
        return { path: args.path, namespace: 'library' }
      })

      build.onResolve({ filter: /^.\/|^..\// }, async (args) => {
        return {
          namespace: 'a',
          path: new URL(
            args.path,
            `${args.importer?.includes(unpkg) ? unpkg + args.resolveDir + '/' : args.resolveDir + '/'}`,
          ).href,
        }
      })

      build.onResolve({ filter: /.*/ }, async (args) => {
        return {
          namespace: 'a',
          path: args.path.includes(PKG_MTSONLINE_LIBRARY) ? args.path : `${unpkg}/${args.path}`,
        }
      })

      buildLocalLibraries(build, localLibraries)

      build.onLoad({ filter: /^index.js/, namespace: 'library' }, async (args) => {
        return {
          loader: 'tsx',
          contents: inputCode,
        }
      })

      build.onLoad({ filter: /.*/, namespace: 'a' }, async (args) => {
        const file = args.path.includes(PKG_MTSONLINE_LIBRARY) &&
          !args.path.includes('.css') && {
            path: `/${PKG_MTSONLINE_LIBRARY}/`,
            library: `node_modules/${PKG_MTSONLINE_LIBRARY}${PKG_MTSONLINE_DIST_PATH}/`,
          }

        const fileCSS = args.path.includes(PKG_MTSONLINE_LIBRARY) && args.path.includes('.css') && args.path
        // fileCSS && console.log({ args })
        const pkg = !file && !fileCSS && (await axios.get(args.path))
        if (fileCSS) {
          const data = findLibraryFile('css', `node_modules/${PKG_MTSONLINE_LIBRARY}${PKG_MTSONLINE_DIST_PATH}`)
          const escaped = data?.replace(/\n/g, '').replace(/"/g, '\\"').replace(/'/g, "\\'")
          const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
          `
          return {
            loader: 'tsx',
            contents,
            resolveDir: `/${PKG_MTSONLINE_LIBRARY}/`,
          }
        } else {
          return {
            loader: 'tsx',
            contents: file?.library ? findLibraryFile('js', file.library) : pkg?.data,
            resolveDir: file?.path || new URL('./', pkg.request.res.responseUrl).pathname,
          }
        }
      })
    },
  }
}
