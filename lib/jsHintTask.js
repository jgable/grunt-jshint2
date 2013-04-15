var fs = require("fs"),
    path = require("path"),
    crypto = require("crypto");

var grunt = require("grunt"),
    _ = grunt.util._,
    async = grunt.util.async;

var JSHintFile = require("./jsHintFile"),
    JSHintCache = require("./jsHintCache"),
    DefaultReporter = require("./reporters/default");

// The constructor for the JSHintTask class
function JSHintTask(task) {
    this.origTask = task;
    this.files = task.filesSrc;

    this._setOptions(task);
}

JSHintTask.prototype = {
    // Get the party started
    run: function() {
        var self = this,
            done = this.origTask.async(),
            files = this.origTask.filesSrc,
            force = this.options.force,
            jsHintOpts = this._getJSHintSpecificOptions() || {},
            globals = this.options.globals || {},
            cacheResults = this.options.cache,
            lintFile = function(filePath, cb) {
                self._lintFile(filePath, jsHintOpts, globals, cacheResults, cb);
            };

        async.forEachLimit(files, this.options.spawnLimit, lintFile, function(err) {
            if(err) {
                return grunt.fatal(err);
            }

            if(self.origTask.errorCount) {
                return done(force);
            }

            // Print a success message.
            grunt.log.ok(files.length + ' files lint free.');  
            done();
        });
    },

    // Lint the file and report any errors
    _lintFile: function(filePath, opts, globals, cache, done) {
        var self = this,
            file = new JSHintFile({
                filePath: filePath,
                jsHintOpts: opts,
                globals: globals,
                cache: cache
            });

        file.lint(function(err, success, problems) {
            if(err) {
                return done(err);
            }

            var wasCached = success && problems === true;

            if(success) {
                // Let the reporter show a success message.
                self.options.reporter.success(filePath, wasCached);
                return done(null, success);
            }

            // Reporter will handle how to output the problems
            self.options.reporter.error(filePath, problems);
            done(null, success, problems);
        });
    },

    // Set the options from a passed in task, or defaults to the original task passed to the constructor
    _setOptions: function(task) {
        task = task || this.origTask;

        this.options = task.options(JSHintTask.DEFAULTS);

        this.options.reporter = this.options.reporter || new DefaultReporter(this.options.jshint);
    },

    // Abstracted way of extracting the specific options passed to jshint in case we need to change it in the future
    _getJSHintSpecificOptions: function() {
        if(this.options.jshintrc) {
            return grunt.file.readJSON(this.options.jshintrc);
        }

        return _.clone(this.options.jshint);
    }
};

// Name and description static attributes
JSHintTask.taskName = "jshint-bfs";
JSHintTask.taskDescription = "JSHint your files - better, faster and stronger";

// Some default task options, made available if necessary to other consumers.
JSHintTask.DEFAULTS = {
    force: false,
    cache: true,
    spawnLimit: 5,
    jshint: {},
    globals: {}
};

// A Static helper method for registering with grunt.
JSHintTask.registerWithGrunt = function(grunt) {
    grunt.registerMultiTask(JSHintTask.taskName, JSHintTask.taskDescription, function() {
        var task = new JSHintTask(this);

        task.run();
    });
};

// A Static helper method for clearing the cached successes.
JSHintTask.clearSwap = function(opts, done) {
    new JSHintCache(opts).clear(done);
};

module.exports = JSHintTask;