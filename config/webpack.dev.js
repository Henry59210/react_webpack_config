const path = require("path")
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const getStyleLoader = (pre) => {
    return [
        "style-loader",
        "css-loader",
        {
            //配合package.json中的browserslist来制定兼容性的程度
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: ['postcss-preset-env'],
                }
            }
        },
        pre
    ].filter(Boolean) //把undefined的值过滤掉
}

module.exports = {
    entry: './src/main.js',
    output: {
        path: undefined,
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/js/[hash:10][ext][query]'
    },
    module: {
        rules: [
            //处理css
            {
                test: /\.css$/,
                use: getStyleLoader()
            },
            {
                test: /\.less$/,
                use: getStyleLoader('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader('sass-loader')
            },
            //处理图片
            {
                test: /\.(jpd?g|png|gif|webp|svg)/,
                type: "asset", //转base64
                parser: {
                    dataUrlCondition: { //小于10kb转base64，不用请求
                        maxSize: 10 * 1024,
                    }
                }
            },
            //处理其他资源
            {
                test: /\.(woff2?|ttf)/,
                type: "asset/resource", //原封不动输出
            },
            //处理js
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, "../src"),
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,//缓存不压缩
                    plugins: [
                        // "@babel/plugin-transform-runtime", // presets中包含了
                        "react-refresh/babel", // 开启js的HMR功能
                    ],
                }
            }
        ]
    },
    plugins: [
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        new ReactRefreshWebpackPlugin(), // 解决js的HMR功能运行时全局变量的问题
        // 将public下面的资源(比如说页面标签上的icon，直接打包不会进dist，要用这个插件)复制到dist目录去（除了index.html）
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "../public"),
                    to: path.resolve(__dirname, "../dist"),
                    toType: "dir",
                    noErrorOnMissing: true, // 不生成错误
                    globOptions: {
                        // 忽略文件
                        ignore: ["**/index.html"],
                    },
                    info: {
                        // 跳过terser压缩js
                        minimized: true,
                    },
                },
            ],
        }),
    ],
    mode: 'development',
    devtool: "cheap-module-source-map",
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
    },
    resolve: {
        // 自动补全文件扩展名，让jsx可以使用, 先检测jsx能不能用，不能就js，在不能就json
        extensions: [".jsx", ".js", ".json"],
    },
    devServer: {
        open: true,
        host: "localhost",
        port: 3000,
        hot: true,
        compress: true,
        historyApiFallback: true, // 解决react-router刷新404问题
    },
}
