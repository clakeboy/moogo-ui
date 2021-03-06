module.exports = function (api) {
    api.cache(true);

    const presets = [
        "@babel/preset-env",
        "@babel/preset-react"
    ];
    const plugins = [
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-transform-runtime",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import"
    ];

    return {
        presets,
        plugins
    };
}