
var _ = require('lodash');


module.exports.euro = function parseEuro(str) {
    return _.parseInt(str.replace(/€/g, '').replace(/\ /g, ''));
}


module.exports.result = function parseResult(html) {
    return null;
}
