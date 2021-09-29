const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BUILD_DIR = path.join('src/');
const OUT_DIR = path.join('static/');

const ADMIN_PATHNAME = path.join('admin/scripts/index');
const INDEX_PATHNAME = path.join('public/scripts/index');
const ROOM_PATHNAME = path.join('rooms/scripts/index');

const VENDOR_JS_PATHNAME = path.join('public/scripts/vendor');
const VENDOR_CSS_PATHNAME = path.join('public/styles/vendor');

module.exports = {
    mode: "production",
    entry: {
        [INDEX_PATHNAME]: path.join(__dirname, BUILD_DIR + INDEX_PATHNAME + '.ts'),
        [ADMIN_PATHNAME]: path.join(__dirname, BUILD_DIR + ADMIN_PATHNAME + '.ts'),
        [ROOM_PATHNAME]: path.join(__dirname, BUILD_DIR + ROOM_PATHNAME + '.ts')
    },
    output: {
        path: path.join(__dirname, OUT_DIR),
        filename: "[name].js"
    },
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                js: {
                    test: /[\\/]node_modules[\\/].*\.js$/,
                    name: VENDOR_JS_PATHNAME,
                    chunks: 'all'
                },
                css: {
                    test: /[\\/]node_modules[\\/].*\.css$/,
                    name: VENDOR_CSS_PATHNAME,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            ignoreOrder: false,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ],
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: "/node_modules/"
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};