import commonjs from "@rollup/plugin-commonjs"
import ts from '@rollup/plugin-typescript' // 用于解析ts文件的插件
import { nodeResolve } from '@rollup/plugin-node-resolve' // 解析项目中导入的第三方node 模块
import babel from "@rollup/plugin-babel"
// 解析json，这里主要用于解析package.json
import json from '@rollup/plugin-json'
import path from "path"
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
//TODO 这里需要自己声明require和__dirname(此为重点)，因为在最新版本的rollup配置文件中默认的格式是esm，而非cjs
const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
// 首先拿到packages的基本路径
const packagesDir = path.resolve(__dirname, "./packages")
// 接着根据命令行的TARGET获取到packages下具体的包的路径

const packageDir = path.resolve(packagesDir, process.env.TARGET);
const resolve = (p) => path.resolve(packageDir, p);
// 获取到指定包下面的package.json文件
const pkg = require(resolve("./package.json"))

const dependencies = ({ dependencies }) => Object.keys(dependencies || {});
const pkgdependencies = dependencies(pkg);
// 从具体包的路径中解析获得包名
const name = path.basename(packageDir);
// 对打包类型 做一个映射表， 根据提供的formats 格式化打包内容
const outputConfig = {
    'esm-bundler': {
      file: resolve(`dist/${name}.esm-bundler.js`),
      format: 'es' // esm
    },
    'cjs': {
      file: resolve(`dist/${name}.cjs.js`),
      format: 'cjs' // commonjs
    },
    'global': {
      file: resolve(`dist/${name}.global.js`),
      format: 'iife' // 立即执行函数
    }
}

// 获取package中的buildOptions， 按需打包
const options = pkg.buildOptions
const shouldEmitDeclartion = !!pkg.types;

const tsPlugin = ts({
    tsconfig: path.resolve(__dirname, "packages", name , 'tsconfig.json'),
    // tsconfigOverride: {
    //   compilerOptions: {
    //     sourceMap: true,
    //     declaration: shouldEmitDeclartion,
    //     declarationMap: shouldEmitDeclartion
    //   }
    // }
})
//TODO 现在我们有一个新的需求就是在打包组件的时候需要分包打包，而不是全部打包成一个整的文件
function createConfig(format, output) {
  output.name = options.name
  output.sourcemap = true

  // 生成rollup配置
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      tsPlugin,
      json(),
      commonjs({
        include: /node_modules/
      }),
      nodeResolve({ // 解析第三方文件
        extensions: ['.js', '.ts']
      }),
      // 在rollup中配置babel
      babel({
        babelHelpers: "runtime",
        exclude: "node_modules/**"
      })
    ],
    external: id => pkgdependencies.includes(id)
  }
}

// 导出生成的rollup配置
export default options.formats.map(format => createConfig(format, outputConfig[format]))