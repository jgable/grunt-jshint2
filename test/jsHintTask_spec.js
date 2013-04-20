var path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintTask = require("../lib/jsHintTask");

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
                evil: true,
                globals: {
                    one: false,
                    two: true
                }
            }
        };

        var task = new JSHintTask(mockTask),
            actual = task._getJSHintSpecificOptions();

        should.exist(actual);

        // Were specified, should match
        actual.browser.should.equal(true);
        actual.evil.should.equal(true);

        // Was not specified, should not be there
        should.not.exist(actual.eqeqeq);

        // Should be pruned off the options object into predef
        should.not.exist(actual.globals);

        should.exist(actual.predef);

        actual.predef.one.should.equal(false);
        actual.predef.two.should.equal(true);
    });

    it("can load files from jshintrc file", function() {
        var mockTask = makeMockTask();

        mockTask._taskOptions = {
            jshintrc: path.join("test", "res", ".jshintrc")
        };

        var task = new JSHintTask(mockTask),
            actual = task._getJSHintSpecificOptions();

        should.exist(actual);

        actual.curly.should.equal(true);
        actual.eqeqeq.should.equal(true);
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