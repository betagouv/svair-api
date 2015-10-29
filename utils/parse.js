
var _ = require('lodash');
var jsdom = require("jsdom");



module.exports.euro = function parseEuro(str) {
    return _.parseInt(str.replace(/€/g, '').replace(/\ /g, ''));
}


module.exports.result = function parseResult(html, callback) {
  var result = {
    declarant1: { },
    declarant2: { }
  }

  var mappingDeclarant = {
    'Nom': 'nom',
    'Nom de naissance': 'nomNaissance',
    'Prénom(s)': 'prenoms',
    'Date de naissance': 'dateNaissance'
  };


  jsdom.env(
    html,
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      if(err) return callback(err);
      window.$('#principal table tr').each(function() {
        var cells = window.$(this).find('td')
        var rowHeading = cells.eq(0).text().trim()
        if (rowHeading in mappingDeclarant) {
          var key = mappingDeclarant[rowHeading];
          result.declarant1[key] = cells.eq(1).text().trim()
          result.declarant2[key] = cells.eq(2).text().trim()
        }
      })
      callback(null, result)
    }
  );

}
