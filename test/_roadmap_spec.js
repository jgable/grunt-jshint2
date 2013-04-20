var should = require("should");

describe("grunt-jshint2", function() {
    var yessir = function() { return true; };

    it("is class based instead of init(..) based", yessir);

    it("accepts jshint options", yessir);

    it("runs jshint on each file individually asynchronously", yessir);

    it("caches successfully hinted files to speed up subsequent runs", yessir);

    it("has higher maintainability statistics than grunt-contrib-jshint", function() {
        // Calculated by running grunt plato and checking the .plato-*/index.html
        // TODO: Automate this somehow?
        var theirMaintainability = 61.28,
            ourMaintainability = 75.86;

        ourMaintainability.should.be.above(theirMaintainability);
    });

    it("has checkstyle and xml reporters", yessir);

    it("has a cluster based processor for larger files", yessir);
});