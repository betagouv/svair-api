var expect = require('chai').expect;
var request = require('request');
var nock = require('nock');
var fs = require('fs');
var svair = require('../index')


describe('Index test', function () {

  describe("Requesting", function () {

    var getHttpResponse = fs.readFileSync(__dirname + '/resources/getHttpResponse.txt','utf-8');
    var postHttpResponse = fs.readFileSync(__dirname + '/resources/postHttpResponse.txt','utf-8');
    var impotEndPoint = nock('https://cfsmsp.impots.gouv.fr');

    describe("calling the API", function() {
      it('return the declaration', function (done) {

        impotEndPoint
          .get('/secavis')
          .reply(200, getHttpResponse);

        impotEndPoint
          .post('/secavis/faces/commun/index.jsf',function(body) {
                  return body.indexOf("tutu") >= 0
                  && body.indexOf("toto") >= 0
                  && body.indexOf("3t/fiogJfp1YIlOG4QZOFeIxkWAnu4q/qVYjk8vVyd/dgiPhW86fayXH4c3CfzfYthiJkBaNz/ZCbbaeJNh+6NddJQVmylEiAIiiCfgXwr/j0Ygl2Ds14bwq3i2f678/J9MAxkDvB/qiY+6FfA/FDiSQ5ySdYPSn+OZMOmyhZrXl3aUNNDKUv2xUYwkeC8i4Sl") >= 0
                })
          .reply(200, postHttpResponse);

        svair("toto", "tutu", function(err, body) {
          done(err)
        })
      });
    })


  });
});
