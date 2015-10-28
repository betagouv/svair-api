var expect = require('chai').expect;
var fs = require('fs');
var parse = require('../utils/parse')


describe('Parse ', function () {
  var parseEuro = parse.euro;

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
});
