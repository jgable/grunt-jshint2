var path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintTask = require("../lib/jsHintTask"),
    JSHintAsync = require("../lib/processors/jsHintAsync");

describe("JSHintAsync", function() {

    beforeEach(function(done) {
        JSHintTask.clearSwap({}, function(err) {
            if(err) {
                throw err;
            }

            done();
        });
    });

    var makeMockTask = function(done) {
        return {
            _taskOptions: { bad: "option" },
            filesSrc: grunt.file.expand("test/res/good*.js"),
            options: function(defs) { return _.defaults(this._taskOptions, defs); },
            async: function() {
                return done;
            }
        };
    };

    it("lints each file asynchronously", function(done) {
        grunt.log.muted = true;

        var mockTask = makeMockTask();

        var jha = new JSHintAsync({
            files: mockTask.filesSrc,
            jsHintOpts: {
                browser: true,
                evil: true
            },
            globals: {},
            cache: false,
            spawnLimit: 5
        });

        var orig_lintFile = jha._lintFile,
            events = [];

        // Stub the lint method to confirm async activity
        jha._lintFile = function(filePath, opts, globals, cache, lintDone) {
            events.push("start:" + filePath);
            orig_lintFile.call(jha, filePath, opts, globals, cache, function(err, success, problems) {
                events.push("end:" + filePath);
                lintDone(err, success, problems);
            });
        };

        jha.on("error", function(err) {
            throw err;
        });

        jha.on("exit", function() {
            // How many files did we start doing before we finished one
            var leadingStarts = 0;
            for(var i = 0; i < events.length; i++) {
                if(events[i].slice(0, 5) !== "start") {
                    break;
                }

                leadingStarts++;
            }

            leadingStarts.should.be.above(2);

            done();
        });

        jha.processFiles();
    });

});