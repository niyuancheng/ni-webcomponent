//TODO 该文件为babel的配置文件
const presets = [["@babel/preset-env"], ["@babel/preset-typescript"], ["@babel/preset-react"]]
const plugins = [
    ["@babel/plugin-transform-runtime"],
    [
        "@babel/plugin-proposal-decorators",
        {
        legacy: true,
        },
    ],
]

module.exports = { presets, plugins }