var _ = require('lodash');
var request2 = require('request');
var jsdom = require("jsdom");

function parseEuro(str) {
    return _.parseInt(str.replace(/€/g, '').replace(/\ /g, ''));
}

module.exports = function (numeroFiscal, referenceAvis, done) {
    var request = request2.defaults({jar: true})
    var formData = {
      'j_id6:spi':numeroFiscal,
      'j_id6:num_facture': referenceAvis,
      'j_id6:j_id18': 'Valider',
      'j_id6_SUBMIT': 1
    }
    var formUrl = 'https://cfsmsp.impots.gouv.fr/secavis';
    var postUrl = 'https://cfsmsp.impots.gouv.fr/secavis/faces/commun/index.jsf';

    request(formUrl, function (errGet, http, getBody) {
      if(errGet) return done(errGet);

      jsdom.env(
        getBody,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
          var viewState = window.$('input[id="javax.faces.ViewState"]').val();
          formData["javax.faces.ViewState"] = viewState;
          request.post({url:postUrl, formData: formData}, function (err, httpResponse, body) {
            if (err) return done(err);
            done(null, body);
          });
        }
      );
    })
};
