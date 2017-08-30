var _ = require('lodash');
var request2 = require('request');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser
var parseResponse = require('./utils/parse').result
var fs = require('fs');
var getYearFromReferenceAvis = require('./utils/year')

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
        var doc = new dom().parseFromString(getBody)
        viewState = xpath.select('//*[@name="javax.faces.ViewState"]/@value', doc)[0].value
        formData["javax.faces.ViewState"] = viewState;
        request.post({
          url:postUrl,
          form: formData
        }, function (err, httpResponse, body) {
          if (err) return done(err);
          try {
            parseResponse(body, getYearFromReferenceAvis(referenceAvis), done)
          } catch (e) {
            done(new Error('Impossible to parse svair response'))
          }
        });
      })
  };
}
