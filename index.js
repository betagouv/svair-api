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
        'j_id_7:spi':numeroFiscal,
        'j_id_7:num_facture': referenceAvis,
        'j_id_7:j_id_l': 'Valider',
        'j_id_7_SUBMIT': 1
      }

      var formUrl = host + '/secavis/';
      var postUrl = host + '/secavis/faces/commun/index.jsf';

      request(formUrl, function (errGet, http, getBody) {
        if(errGet) return done(errGet);
        jsdom.env({
          html: getBody,
          src: [jquery],
          done: function (err, window) {
            var viewState = window.$('input[name="javax.faces.ViewState"]').val()
            formData["javax.faces.ViewState"] = viewState;
            request.post({
              url:postUrl,
              form: formData
            }, function (err, httpResponse, body) {
              if (err) return done(err);
              parseResponse(body, getYearFromReferenceAvis(referenceAvis), done)
            });
          }
        });
      })
  };
}
