var path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintTask = require("../lib/jsHintTask"),
    JSHintCache = require("../lib/jsHintCache");

describe("JSHintCache", function() {

    beforeEach(function(done) {
        JSHintTask.clearSwap({}, function(err) {
            if(err) {
                throw err;
            }

            done();
        });
    });

    it("caches successfully linted files", function(done) {
        var swap = new JSHintCache();

        swap.addCached("123", function(err, filePath) {
            if(err) {
                throw err;
            }

            swap.hasCached("123", function(isCached) {

                isCached.should.equal(true);

                done();
            });
        });
    });
});