
var _ = require('lodash');
var xpath = require('xpath')
var select = xpath.useNamespaces({ h: 'http://www.w3.org/1999/xhtml' })
var dom = require('xmldom').DOMParser
var fs = require('fs')

function parseEuro(str) {
  var data = str
  .replace(/\u00A0/g, '')
  .replace(/€/g, '')
  .replace(/ /g, '')
  .replace(/\n/g, '')
  .replace(/\t/g, '')
  return isNumeric(data) ? _.parseInt(data): 0;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports.euro = parseEuro


module.exports.result = function parseResult(html, year, callback) {
  var doc = new dom().parseFromString(html.replace(/(\n|\t)/g, ''))
  var result = {
    declarant1: { },
    declarant2: { }
  }

  var mappingDeclarant = {
    nom: 'Nom',
    nomNaissance : 'Nom de naissance',
    prenoms: 'Prénom(s)',
    dateNaissance : 'Date de naissance'
  };

  var compactedDeclarantMapping = _.map(mappingDeclarant, function (val, key) {
    var obj = _.isString(val) ? { src: val } : val;
    return _.assign(obj, { dest: key });
  });

  var declarantMappingBySrc = _.indexBy(compactedDeclarantMapping, 'src');

  function getImpot(value) {
    if(value.trim() === "Non imposable") {
      return null
    }
    return parseEuro(value)
  }

  var mapping = {
    dateRecouvrement: 'Date de mise en recouvrement de l\'avis d\'impôt',
    dateEtablissement: 'Date d\'établissement',
    nombreParts: { src: 'Nombre de part(s)', fn: parseFloat },
    situationFamille: 'Situation de famille',
    nombrePersonnesCharge: { src: 'Nombre de personne(s) à charge', fn: _.parseInt },
    revenuBrutGlobal: { src: 'Revenu brut global', fn: parseEuro },
    revenuImposable: { src: 'Revenu imposable', fn: parseEuro },
    impotRevenuNetAvantCorrections: { src: 'Impôt sur le revenu net avant corrections', fn: getImpot },
    montantImpot: { src: 'Montant de l\'impôt', fn: getImpot },
    revenuFiscalReference: { src: 'Revenu fiscal de référence', fn: parseEuro }
  };

  var compactedMapping = _.map(mapping, function (val, key) {
    var obj = _.isString(val) ? { src: val } : val;
    return _.assign(obj, { dest: key });
  });

  var mappingBySrc = _.indexBy(compactedMapping, 'src');

  if (select('//*[@id="nonTrouve"]', doc).length) {
    return callback(new Error('Invalid credentials'));
  }

  var docRow = select('//*[@id="principal"]//h:table//h:tr', doc)
  docRow.forEach(function(line) {
    var cells = line.getElementsByTagName('td')
    var rowHeading = cells[0].firstChild
    if (rowHeading && rowHeading.data in declarantMappingBySrc) {
      var mappingEntry = declarantMappingBySrc[rowHeading];
      if (mappingEntry.fn) {
        result = mappingEntry.fn(line, result)
      } else {
        result.declarant1[mappingEntry.dest] = cells[1].firstChild.data
        var data;
        if (cells[2].firstChild) {
          data = cells[2].firstChild.data
        }
        result.declarant2[mappingEntry.dest] = data || ''
      }


    } else if (cells.length === 2 && rowHeading in mappingBySrc) {
      var mappingEntry = mappingBySrc[rowHeading];
      if (mappingEntry.fn) {
        result[mappingEntry.dest] = mappingEntry.fn(cells[1].firstChild.data);
      } else {
        result[mappingEntry.dest] = cells[1].firstChild.data
      }
    }
  })

  var adress = []
  var adressRowNumbers = [5,6,7]
  adressRowNumbers.forEach(function (n) {
    var node = docRow[n].getElementsByTagName('td')[1]
    if (node && node.firstChild) {
      adress.push(node.firstChild.data)
    }
  })

  result.foyerFiscal = {
    annee: year,
    adresse: adress.join(' ')
  };

  var nodeAnnee = select('//*[@class="titre_affiche_avis"]//h:span', doc)
  if (nodeAnnee.length > 0) {
    var titleAnnee = nodeAnnee[0].firstChild.data;
    var regexp = /(\d{4})/g;

    result.anneeImpots = regexp.exec(titleAnnee)[0];
    result.anneeRevenus = regexp.exec(titleAnnee)[0];
  }
  if(!result.declarant1.nom) {
    return callback(new Error("Parsing error"))
  }
  callback(null, result)

}
