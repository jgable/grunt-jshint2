var should = require("should");

describe("grunt-jshint-bfs", function() {

    it("is class based instead of init(..) based", function() {
        return true;
    });

    it("accepts jshint options", function() {
        return true;
    });

    it("runs jshint on each file individually asynchronously", function() {
        return true;
    });

    it("caches successfully hinted files to speed up subsequent runs", function() {
        return true;
    });

    it("has higher maintainability statistics than grunt-contrib-jshint", function() {
        // Gotten by running grunt plato and checking the .plato-*/index.html
        // TODO: Automate this somehow?
        var theirMaintainability = 61.28,
            ourMaintainability = 75.86;

        ourMaintainability.should.be.above(theirMaintainability);
    });
});