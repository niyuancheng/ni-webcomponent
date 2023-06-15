//TODO 该文件为babel的配置文件
const presets = [["@babel/preset-env"], ["@babel/preset-typescript"]]
const plugins = [
    //TODO 此处为重点！！！需要注意的是插件@babel/plugin-transform-runtime要和 搭配使用，才能对ECMAScript的新api进行编译和polyfill
    ["@babel/plugin-transform-runtime"],
    [
        "@babel/plugin-proposal-decorators",
        {
            legacy: true,
        },
    ],
]

module.exports = { presets, plugins }