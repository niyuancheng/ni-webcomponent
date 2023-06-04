// 用于控制rollup对packages的打包
import fs from "fs";
import { rm } from "fs/promises"
import path from "path"
import execa from "execa";
// import { Extractor, ExtractorConfig } from "@microsoft/api-extractor"
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import inquirer from "inquirer"

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)
// 1. 读取packages下所有的目录
const targets = fs.readdirSync(path.resolve(process.cwd(), "./packages")).filter(f => fs.statSync(`./packages/${f}`).isDirectory()).reverse()
const chooseBuildPackage = async (packages) => {
    const answer = await inquirer.prompt({
        type: "list",
        name: "package",
        message: "选择你要发布的包",
        choices: [...packages, "all"],
        default: "all",
    });
    return answer;
}
//2. 对指定的package进行打包
async function build(target) {
    // example: rollup -c -environment TARGET:shared
    const pkgDir = path.resolve(__dirname, `../packages/${target}`);
    const pkg = require(path.resolve(pkgDir, "./package.json"));
    // 每次打包之前都去删除旧版本的dist目录
    await rm(`${pkgDir}/dist`, { recursive: true, force: true })

    //TODO 将target作为命令行参数，来决定打包那一个具体包下的repo
    await execa("rollup", ['-c', '--environment', `TARGET:${target}`], {stdio: "inherit"});
    // 以下部分为废弃代码，主要作用是生成类型声明文件
    // if(!!pkg.types) {
    //     console.log(
    //         `Rolling up type definitions for ${target}...`
    //     )
    //     const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)
    //     const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath)
    //     const extractorResult = Extractor.invoke(extractorConfig, {
    //         localBuild: true,
    //         showVerboseMessages: true
    //     })
    //     if (extractorResult.succeeded) {
    //         console.log(`API Extractor completed successfully`)
    //         process.exitCode = 0
    //     } else {
    //         console.error(
    //             `API Extractor completed with ${extractorResult.errorCount} errors` +
    //             ` and ${extractorResult.warningCount} warnings`
    //         )
    //         process.exitCode = 1
    //     }

    //     for (let i of targets) {
    //         await rm(`${pkgDir}/dist/packages/${i}`, { recursive: true, force: true })
    //     }

    //     for (let i of targets) {
    //         if(fs.existsSync(`${pkgDir}/dist/packages`)) { // 判断下给定路径下的文件夹是否存在，如果存在就将其删除
    //             fs.rmdirSync(`${pkgDir}/dist/packages`)
    //         }
            
    //     }
    // }
}

//3. 并发的对packages下的所有模块进行打包

function runParallel(targets, build) {
    const res = []
    
    targets.forEach(target => {
        res.push(build(target));
    });

    return Promise.all(res)
}

async function buildPackage() {
    const { package: _pkg } = await chooseBuildPackage(targets);
    if(_pkg === "all") {
        runParallel(targets, build).then(val => {
            console.log("成功打包所有的模块");
        })
    } else {
        build(_pkg).then(() => {
            console.log(`成功打包${_pkg}包`)
        })
    }
}

buildPackage();

