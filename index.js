var _ = require('lodash');
var request2 = require('request');
var jsdom = require("jsdom");
var parseResponse = require('./utils/parse').result
var fs = require('fs');
var getYearFromReferenceAvis = require('./utils/year')

var jquery = fs.readFileSync( __dirname + "/lib/jquery.js", "utf-8");

module.exports = function Svair(host) {
  return function(numeroFiscal, referenceAvis, done) {
      var request = request2.defaults({jar: true})
      var formData = {
        'j_id6:spi':numeroFiscal,
        'j_id6:num_facture': referenceAvis,
        'j_id6:j_id18': 'Valider',
        'j_id6_SUBMIT': 1
      }

      var formUrl = host + '/secavis';
      var postUrl = host + '/secavis/faces/commun/index.jsf';

      request(formUrl, function (errGet, http, getBody) {
        if(errGet) return done(errGet);

        jsdom.env({
          html: getBody,
          src: [jquery],
          done: function (err, window) {
            var viewState = window.$('input[id="javax.faces.ViewState"]').val();
            formData["javax.faces.ViewState"] = viewState;
            request.post({url:postUrl, form: formData}, function (err, httpResponse, body) {
              if (err) return done(err);
              parseResponse(body, getYearFromReferenceAvis(referenceAvis), done)
            });
          }
        });
      })
  };
}
