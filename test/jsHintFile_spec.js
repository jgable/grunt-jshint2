var path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintFile = require("../lib/jsHintFile"),
    JSHintTask = require("../lib/jsHintTask");

describe("JSHintFile", function() {

    beforeEach(function(done) {
        JSHintTask.clearSwap({}, function(err) {
            if(err) {
                throw err;
            }

            done();
        });
    });

    it("gets the contents of a file", function(done) {
        var file = new JSHintFile({
            filePath: path.join(__dirname, "res", "good-1.js")
        });

        file._getFileContents(file.filePath, function(err, contents) {
            if(err) {
                throw err;
            }

            var expected = "(function() {\n" +
                           "    var thing = 1;\n" +
                           "}());";

            contents.should.equal(expected);

            done();
        });
    });

    it("gets a hash of a file", function(done) {
        var file = new JSHintFile({
            filePath: path.join(__dirname, "res", "good-1.js")
        });

        file._getFileContents(file.filePath, function(err, contents) {
            if(err) {
                throw err;
            }

            var hash = file._getContentsHash(contents),
                expected = "0ce57259c415918aa6b78c5b4a24d696d449592b";

            hash.should.equal(expected);

            done();
        });
    });

    it("lints good files", function(done) {
        var file = new JSHintFile({
            filePath: path.join(__dirname, "res", "good-1.js"),
            jsHintOptions: {
                browser: true,
                evil: true
            },
            globals: {}
        });

        file.lint(function(err, success, problems) {
            if(err) {
                throw err;
            }

            success.should.equal(true);

            should.not.exist(problems);

            done();
        });
    });

    it("lints bad files", function(done) {
        var file = new JSHintFile({
            filePath: path.join(__dirname, "res", "bad-1.js"),
            jsHintOptions: {
                browser: true,
                evil: true
            },
            globals: {}
        });

        file.lint(function(err, success, problems) {
            if(err) {
                throw err;
            }

            success.should.equal(false);

            should.exist(problems);

            done();
        });
    });

    it("caches successfully linted files", function(done) {
        var file = new JSHintFile({
            filePath: path.join(__dirname, "res", "good-1.js"),
            cache: true,
            jsHintOptions: {
                browser: true,
                evil: true
            },
            globals: {}
        });

        file.lint(function(err, success, problems) {
            if(err) {
                throw err;
            }

            success.should.equal(true);

            // Does not report that it was cached.
            should.not.exist(problems);

            file.lint(function(err, nextSuccess, nextProblems) {
                if(err) {
                    throw err;
                }

                nextSuccess.should.equal(true);

                // Passes back true for problems to indicate it was cached
                nextProblems.should.equal(true);

                done();
            });
        });
    });

});