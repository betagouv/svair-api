var expect = require('chai').expect;
var fs = require('fs');
var parse = require('../utils/parse')


describe('Parse ', function () {
  var parseEuro = parse.euro;
  var parseResult = parse.result;
  var postHttpResponse = fs.readFileSync(__dirname + '/resources/postHttpResponse.txt','utf-8');
  var getHttpResponse = fs.readFileSync(__dirname + '/resources/getHttpResponse.txt','utf-8');
  var postHttpResponse2 = fs.readFileSync(__dirname + '/resources/postHttpResponse2.txt','utf-8');
  var postHttpEmptyCell = fs.readFileSync(__dirname + '/resources/postHttpResponseEmptyCell.txt','utf-8');

  describe("parse Euro", function () {
    it("remove space", function () {
      expect(parseEuro("13 000")).to.be.equal(13000)
    })

    it("remove € symbol", function () {
      expect(parseEuro("13000€")).to.be.equal(13000)
    })

    it("remove non breakable space symbol", function () {
      expect(parseEuro("13\u00A0000")).to.be.equal(13000)
    })

    it("remove space € symbol", function () {
      expect(parseEuro("1 665 €\n\t\t\t\t\t")).to.be.equal(1665)
    })

    it("return 0 if no data", function () {
      expect(parseEuro("")).to.be.equal(0)
    })
  });

  describe("parse Response", function () {
    describe("for the bad formatted response", function() {
      it("return an error", function (done) {
        parseResult(getHttpResponse, 2015, function(err, result) {
          expect(err).to.deep.equal(new Error("Parsing error"));
          done();
        })
      })
    })

    describe("for the single person", function() {
      it("extract the first person", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result).to.contain.all.keys('declarant1')
          expect(result.declarant1).to.deep.equal({
            nom: 'MARTIN',
            nomNaissance: 'MARTIN',
            prenoms: 'Jean',
            dateNaissance: '29/03/1984',

          });
          done();
        })
      })

      it("extract the second person", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
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

      it("extract the adress", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result).to.contain.all.keys('declarant1')
          expect(result.foyerFiscal).to.deep.equal({
            adresse: '34 RUE DE L\'EGLISE 75009 PARIS',
            annee: 2015
          });
          done();
        })
      })


      it("extract the part number", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.nombreParts).to.equal(1)
          done();
        })
      })

      it("extract the dateRecouvrement ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.dateRecouvrement).to.equal("31/07/2015")
          done();
        })
      })

      it("extract the dateEtablissement ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.dateEtablissement).to.equal("08/07/2015")
          done();
        })
      })

      it("extract the situationFamille ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.situationFamille).to.equal("Célibataire")
          done();
        })
      })

      it("extract the nombrePersonnesCharge ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.nombrePersonnesCharge).to.equal(0)
          done();
        })
      })

      it("extract the revenuBrutGlobal ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.revenuBrutGlobal).to.equal(17580)
          done();
        })
      })

      it("extract the revenuImposable ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.revenuImposable).to.equal(17580)
          done();
        })
      })

      it("extract the impotRevenuNetAvantCorrections ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.impotRevenuNetAvantCorrections).to.equal(1665)
          done();
        })
      })

      it("extract the montantImpot ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.montantImpot).to.equal(1665)
          done();
        })
      })

      it("extract the revenuFiscalReference ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.revenuFiscalReference).to.equal(17580)
          done();
        })
      })

      it("extract the year of impots ", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.anneeImpots).to.equal('2015')
          done();
        })
      })

      it("extract anneeRevenus", function (done) {
        parseResult(postHttpResponse, 2015, function(err, result) {
          if(err) return done(err);
          expect(result.anneeRevenus).to.equal('2014')
          done();
        })
      })
    });

    describe("for two person", function() {
      it("extract the first person", function (done) {
        parseResult(postHttpResponse2, 2014, function(err, result) {
          if(err) return done(err);
          expect(result).to.contain.all.keys('declarant1')
          expect(result.declarant1).to.deep.equal({
            nom: 'HONORE',
            nomNaissance: 'HONORE',
            prenoms: 'Jean',
            dateNaissance: '31/12/1959'
          });
          done();
        })
      })

      it("extract the second person", function (done) {
        parseResult(postHttpResponse2, 2014, function(err, result) {
          if(err) return done(err);
          expect(result).to.contain.all.keys('declarant2')
          expect(result.declarant2).to.deep.equal({
            nom: 'MARTIN',
            nomNaissance: 'MARTIN',
            prenoms: 'Laurence',
            dateNaissance: '11/06/1968'
          });
          done();
        })
      });

      it("extract the adress", function (done) {
        parseResult(postHttpResponse2, 2014, function(err, result) {
          if(err) return done(err);
          expect(result).to.contain.all.keys('declarant1')
          expect(result.foyerFiscal).to.deep.equal({
            adresse: 'APT. 509 47 rue de carnot 94320 THIAIS',
            annee: 2014
          });
          done();
        })
      })

      it("extract the impotRevenuNetAvantCorrections ", function (done) {
        parseResult(postHttpResponse2, 2014, function(err, result) {
          if(err) return done(err);
          expect(result.impotRevenuNetAvantCorrections).to.equal(null)
          done();
        })
      })

      it("extract the montantImpot ", function (done) {
        parseResult(postHttpResponse2, 2014, function(err, result) {
          if(err) return done(err);
          expect(result.montantImpot).to.equal(null)
          done();
        })
      })
    });

    describe("with empty cells", function() {
      it("returns null values", function (done) {
        parseResult(postHttpEmptyCell, 2015, function(err, result) {
          if(err) return done(err);
          expect(result).to.contain.keys('revenuBrutGlobal');
          expect(result.revenuBrutGlobal).to.be.null;
          done();
        })
      })
    });
  });
});
