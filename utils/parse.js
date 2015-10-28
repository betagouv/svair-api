
var _ = require('lodash');


module.export.euro = function parseEuro(str) {
    return _.parseInt(str.replace(/€/g, '').replace(/\ /g, ''));
}


module.export.result = function parseResult(html) {
    return null;
}
