
var _ = require('lodash');
var jsdom = require("jsdom");
var fs = require('fs')


var jquery = fs.readFileSync(__dirname + "/../lib/jquery.js", "utf-8");


function parseEuro(str) {
  return _.parseInt(str
    .replace(/\u00A0/g, '')
    .replace(/€/g, '')
    .replace(/ /g, '')
    .replace(/\n/g, '')
    .replace(/\t/g, ''));
}

function parseAdress(line, cells, result, key) {
  var city = line.next('tr').find('td').eq(1).text().trim();
  result.declarant1[key] = {
    voirie: cells.eq(1).text().trim(),
    commune: city
  }
  var declarant2Name = cells.eq(2).text().trim()
  if(declarant2Name) {
    result.declarant2[key] = {
      voirie: declarant2Name,
      commune: city
    }
  }
  return result;
}

module.exports.euro = parseEuro


module.exports.result = function parseResult(html, callback) {
  var result = {
    declarant1: { },
    declarant2: { }
  }

  var mappingDeclarant = {
    nom: 'Nom',
    nomNaissance : 'Nom de naissance',
    prenoms: 'Prénom(s)',
    dateNaissance : 'Date de naissance',
    adresse : { src: 'Adresse déclarée au 1er janvier  2015', fn: parseAdress }
  };

  var compactedDeclarantMapping = _.map(mappingDeclarant, function (val, key) {
      var obj = _.isString(val) ? { src: val } : val;
      return _.assign(obj, { dest: key });
  });

  var declarantMappingBySrc = _.indexBy(compactedDeclarantMapping, 'src');

  var mapping = {
    dateRecouvrement: 'Date de mise en recouvrement de l\'avis d\'impôt',
    dateEtablissement: 'Date d\'établissement',
    nombreParts: { src: 'Nombre de part(s)', fn: parseFloat },
    situationFamille: 'Situation de famille',
    nombrePersonnesCharge: { src: 'Nombre de personne(s) à charge', fn: _.parseInt },
    revenuBrutGlobal: { src: 'Revenu brut global', fn: parseEuro },
    revenuImposable: { src: 'Revenu imposable', fn: parseEuro },
    impotRevenuNetAvantCorrections: { src: 'Impôt sur le revenu net avant corrections', fn: parseEuro },
    montantImpot: { src: 'Montant de l\'impôt', fn: parseEuro },
    revenuFiscalReference: { src: 'Revenu fiscal de référence', fn: parseEuro }
};

var compactedMapping = _.map(mapping, function (val, key) {
    var obj = _.isString(val) ? { src: val } : val;
    return _.assign(obj, { dest: key });
});

var mappingBySrc = _.indexBy(compactedMapping, 'src');

  jsdom.env({
    html: html,
    src: [jquery],
    done: function (err, window) {
      if(err) return callback(err);
      if (window.$('#nonTrouve').length > 0) {
        return callback(new Error('Invalid credentials'));
      }
      window.$('#principal table tr').each(function() {
        var line =  window.$(this);
        var cells = line.find('td');
        var rowHeading = cells.eq(0).text().trim()
        if (rowHeading in declarantMappingBySrc) {
          var mappingEntry = declarantMappingBySrc[rowHeading];
          if (mappingEntry.fn) {
            result = mappingEntry.fn(line, cells, result, mappingEntry.dest)
          } else {
            result.declarant1[mappingEntry.dest] = cells.eq(1).text().trim()
            result.declarant2[mappingEntry.dest] = cells.eq(2).text().trim()
          }


        } else if (cells.length === 2 && rowHeading in mappingBySrc) {
            var mappingEntry = mappingBySrc[rowHeading];
            if (mappingEntry.fn) {
              result[mappingEntry.dest] = mappingEntry.fn(cells.eq(1).text());
            } else {
              result[mappingEntry.dest] = cells.eq(1).text().trim();
            }
        }
      })
      var nodeAnnee = window.$('.titre_affiche_avis span');
      if (nodeAnnee.length > 0) {
          var titleAnnee = nodeAnnee.eq(0).text();
          var regexp = /(\d{4})/g;

          result.anneeImpots = regexp.exec(titleAnnee)[0];
          result.anneeRevenus = regexp.exec(titleAnnee)[0];
      }
      callback(null, result)
    }
  });

}
