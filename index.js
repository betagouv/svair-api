var Browser = require('zombie');
var _ = require('lodash');

function parseEuro(str) {
    return _.parseInt(str.replace(/€/g, '').replace(/\ /g, ''));
}

var mappingDeclarant = {
    'Nom': 'nom',
    'Nom de naissance': 'nomNaissance',
    'Prénom(s)': 'prenoms',
    'Date de naissance': 'dateNaissance'
};

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

module.exports = function (numeroFiscal, referenceAvis, done) {
    var browser = new Browser();
    var data = {
        declarant1: {},
        declarant2: {}
    };

    browser.visit('https://cfsmsp.impots.gouv.fr/secavis', function (err) {
        if (err) return done(new Error('Unable to visit SVAIR website'));

        browser
            .fill('j_id6:spi', numeroFiscal)
            .fill('j_id6:num_facture', referenceAvis)
            .pressButton('Valider', function (err) {
                if (err) return done(new Error('Unable to post form'));
                if (browser.query('#nonTrouve')) {
                    return done(new Error('Invalid credentials'));
                }

                browser.queryAll('tr').forEach(function (row) {
                    var cols = browser.queryAll('td', row);
                    var rowHeading = browser.text(cols[0]).trim();

                    if (rowHeading in mappingDeclarant) {
                        var key = mappingDeclarant[rowHeading];
                        data.declarant1[key] = browser.text(cols[1]);
                        data.declarant2[key] = browser.text(cols[2]);
                    } else if (cols.length === 2 && rowHeading in mappingBySrc) {
                        var mappingEntry = mappingBySrc[rowHeading];
                        if (mappingEntry.fn) {
                            data[mappingEntry.dest] = mappingEntry.fn(browser.text(cols[1]));
                        } else {
                            data[mappingEntry.dest] = browser.text(cols[1]);
                        }
                    }
                });

                var nodeAnnee = browser.query('.titre_affiche_avis');
                if (nodeAnnee) {
                    var titleAnnee = nodeAnnee._childNodes[1].textContent;
                    var regexp = /(\d{4})/g;

                    data.anneeImpots = regexp.exec(titleAnnee)[0];
                    data.anneeRevenus = regexp.exec(titleAnnee)[0];
                }
                
                done(null, data);
            });
    });
};
