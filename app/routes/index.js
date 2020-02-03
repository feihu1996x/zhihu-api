const fs = require('fs');

module.exports = (app) => {
    fs.readdirSync(__dirname).forEach(file => {
        if ('index.js' === file) { return; }
        const router = require(`./${file}`)
        app.use(router.routes()).use(router.allowedMethods());
    });
};
