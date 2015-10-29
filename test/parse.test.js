var expect = require('chai').expect;
var fs = require('fs');
var parse = require('../utils/parse')


describe('Parse ', function () {
  var parseEuro = parse.euro;
  var parseResult = parse.result;
  var postHttpResponse = fs.readFileSync(__dirname + '/resources/postHttpResponse.txt','utf-8');

  describe("parse Euro", function () {
    it("remove space", function () {
      expect(parseEuro("13 000")).to.be.equal(13000)
    })

    it("remove € symbol", function () {
      expect(parseEuro("13000€")).to.be.equal(13000)
    })
    it("remove space € symbol", function () {
      expect(parseEuro("13 000 €")).to.be.equal(13000)
    })
  });

  describe("parse Response", function () {

    it("extract the first person", function (done) {
      parseResult(postHttpResponse, function(err, result) {
        if(err) return done(err);
        expect(result).to.contain.all.keys('declarant1')
        expect(result.declarant1).to.deep.equal({
          nom: 'MARTIN',
          nomNaissance: 'MARTIN',
          prenoms: 'Jean',
          dateNaissance: '29/03/1984'
        });
        done();
      })
    })

    it("extract the second person", function (done) {
      parseResult(postHttpResponse, function(err, result) {
        if(err) return done(err);
        expect(result).to.contain.all.keys('declarant2')
        expect(result.declarant2).to.deep.equal({
          nom: '',
          nomNaissance: '',
          prenoms: '',
          dateNaissance: ''
        });
        done();
      })
    })

  });
});
