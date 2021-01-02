module.exports = {
    presets: ['@babel/preset-env'],
    plugins: [
        // Stage 3
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-proposal-optional-chaining',
    ],
};
