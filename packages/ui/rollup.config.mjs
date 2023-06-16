import commonjs from "@rollup/plugin-commonjs";
import ts from "@rollup/plugin-typescript";
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const extensions = ['.js', '.ts', '.tsx'];
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const componentDir = path.resolve(__dirname, "src", "components");
const srcDir = path.resolve(__dirname, "src")
const componentNames = fs
    // 获取所有文件夹及文件
    .readdirSync( componentDir , { withFileTypes: true })
    // 筛选出所有文件夹
    .filter((p) => p.isDirectory())
    // 数据预处理
    .map((p) => ({
        path: `components/${p.name}/index`,
        name: p.name,
    }))
    // 带上src/index.js
    .concat({ path: "index", name: "index" });

// 接下来开始导出配置选项
const options = [
    // 首先是将所有的组件都打包到一个文件中
    {
        input: "./src/index.ts",
        output: {
            file: "./umd/index.mini.js",
            name: "niui",
            format: "esm"
        },
        plugins: [
            ts({
                compilerOptions: {
                    outDir: "./umd"
                }
            }),
            nodeResolve({
                extensions
            }),
            postcss(),
            commonjs(),
            babel({
                babelHelpers: "runtime",
                exclude: "node_modules/**",
                extensions,
            })
        ]
    },
    //TODO 接着进行分包打包,此处的代码是重点！！！
    {
        input: componentNames.reduce((result, p) => {
            if(p.path === "index") {
                result[p.path] = `${srcDir}/${p.name}`
            } else {
                result[p.path] = `${componentDir}/${p.name}`;
            }
            return result;
        }, {}),
        treeshake: false,
        output: {
            dir: "lib",
            chunkFileNames: "[name].js",
            format: "esm"
        },
        plugins: [
            ts({
                compilerOptions: {
                    outDir: "./lib"
                }
            }),
            nodeResolve({
                extensions
            }),
            commonjs(),
            babel({
                babelHelpers: "runtime",
                exclude: "node_modules/**",
                extensions,
            }),
            postcss()
        ]
    }
]

export default options;