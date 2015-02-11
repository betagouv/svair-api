var Browser = require('zombie');
var _ = require('lodash');

function parseEuro(str) {
    return _.parseInt(str.replace(/€/g, '').replace(/\ /g, ''));
}

var mapping = {
    dateRecouvrement: 'Date de mise en recouvrement de l\'avis d\'impôt',
    dateEtablissement: 'Date d\'établissement',
    nombreParts: { src: 'Nombre de parts(s)', fn: parseFloat },
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
    var browser = Browser.create();
    var data = {};

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

                    if (cols.length === 2 && browser.text(cols[0]) in mappingBySrc) {
                        var mappingEntry = mappingBySrc[browser.text(cols[0])];
                        if (mappingEntry.fn) {
                            data[mappingEntry.dest] = mappingEntry.fn(browser.text(cols[1]));
                        } else {
                            data[mappingEntry.dest] = browser.text(cols[1]);
                        }
                    }
                });
                done(null, data);
            });
    });
};
