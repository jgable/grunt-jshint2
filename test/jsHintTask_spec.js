var path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintTask = require("../lib/JSHintTask");

describe("JSHintTask", function() {

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
    
    it("registers itself with grunt", function() {
        should.exist(JSHintTask.registerWithGrunt);

        JSHintTask.registerWithGrunt(grunt);

        // Check that it registered
        should.exist(grunt.task._tasks[JSHintTask.taskName]);
        grunt.task._tasks[JSHintTask.taskName].info.should.equal(JSHintTask.taskDescription);
    });

    it("loads options from a task", function() {
        var task = new JSHintTask(makeMockTask()),
            actual = task.options;

        should.exist(actual);

        actual.force.should.equal(JSHintTask.DEFAULTS.force);

        actual.cache.should.equal(JSHintTask.DEFAULTS.cache);

        actual.spawnLimit.should.equal(JSHintTask.DEFAULTS.spawnLimit);

        actual.jshint.should.equal(JSHintTask.DEFAULTS.jshint);
    });

    it("prunes the jshint options from task options", function() {
        var mockTask = makeMockTask();

        mockTask._taskOptions = {
            jshint: {
                browser: true,
                evil: true
            }
        };

        var task = new JSHintTask(mockTask),
            actual = task._getJSHintSpecificOptions();

        should.exist(actual);

        actual.browser.should.equal(true);
        actual.evil.should.equal(true);
    });

    it("can load files from jshintrc file", function() {
        var mockTask = makeMockTask();

        mockTask._taskOptions = {
            jshintrc: path.join(__dirname, "res", ".jshintrc")
        };

        var task = new JSHintTask(mockTask),
            actual = task._getJSHintSpecificOptions();

        should.exist(actual);

        actual.curly.should.equal(true);
        actual.eqeqeq.should.equal(true);
    });

    it("lints each file asynchronously", function(done) {
        grunt.log.muted = true;
        
        var mockTask = makeMockTask(function(err) {
            if(err) {
                throw err;
            }

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

        mockTask._taskOptions = {
            jshint: {
                browser: true,
                evil: true
            }
        };

        var task = new JSHintTask(mockTask),
            orig_lintFile = task._lintFile,
            events = [];

        // Stub the lint method to confirm async activity
        task._lintFile = function(filePath, opts, globals, cache, lintDone) {
            events.push("start:" + filePath);
            orig_lintFile.call(task, filePath, opts, globals, cache, function(err, success, problems) {
                events.push("end:" + filePath);
                lintDone(err, success, problems);
            });
        };

        task.run();
    });

    it("can clear the cache swap", function(done) {
        JSHintTask.clearSwap({}, function(err) {
            if(err) {
                throw err;
            }

            done();
        });
    });

});