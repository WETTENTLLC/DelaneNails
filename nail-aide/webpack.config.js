const path = require('path');

module.exports = {
    entry: './nail-aide/nailaide.umd.js',
    output: {
        filename: 'nailaide.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'NailAide',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
