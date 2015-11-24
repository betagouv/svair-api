var expect = require('chai').expect;
var getYearFromReferenceAvis = require('../utils/year')


describe('Year ', function () {

  describe("when extracting year from reference avis", function() {
    it("can extract 20XX year", function() {
      expect(getYearFromReferenceAvis(147899998765)).to.equal(2014)
      expect(getYearFromReferenceAvis(157899998765)).to.equal(2015)
    })
  })
})
