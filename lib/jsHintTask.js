var fs = require("fs"),
    path = require("path"),
    crypto = require("crypto");

var grunt = require("grunt"),
    _ = grunt.util._,
    async = grunt.util.async;

var JSHintFile = require("./jsHintFile"),
    JSHintCache = require("./jsHintCache"),
    reportResolver = require("./reporterResolver");

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
            force = !!this.options.force,
            jsHintOpts = this._getJSHintSpecificOptions() || {},
            globals = this.options.globals || {},
            cacheResults = this.options.cache,
            lintFile = function(filePath, cb) {
                self._lintFile(filePath, jsHintOpts, globals, cacheResults, cb);
            };

        // Let reporters know that we have begun.
        self.options.reporter.start(files, this.options, jsHintOpts);

        async.forEachLimit(files, this.options.spawnLimit, lintFile, function(err) {
            if(err) {
                return grunt.fatal(err);
            }

            // Let the reporter handle finish message.
            self.options.reporter.finish(files);

            // Proceed if we have no errors, or we set the force option
            var proceed = self.origTask.errorCount === 0 || force;

            done(proceed);
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

        file.lint(function(err, success, problems, data) {
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
            self.options.reporter.error(filePath, problems, data);
            
            done(null, success, problems, data);
        });
    },

    // Set the options from a passed in task, or defaults to the original task passed to the constructor
    _setOptions: function(task) {
        task = task || this.origTask;

        this.options = task.options(JSHintTask.DEFAULTS);

        this.options.reporter = reportResolver.resolve(this.options.reporter, this.options);
    },

    // Abstracted way of extracting the specific options passed to jshint in case we need to change it in the future
    _getJSHintSpecificOptions: function() {
        var jsHintOpts;

        // Load from jshintrc file if passed.
        if(this.options.jshintrc) {
            jsHintOpts = grunt.file.readJSON(this.options.jshintrc);
        } else {
            jsHintOpts = _.clone(this.options.jshint);
        }

        // Pare off the legacy globals field if present
        if(jsHintOpts.globals) {
            if(!jsHintOpts.predef) {
                jsHintOpts.predef = {};
            }

            _.extend(jsHintOpts.predef, jsHintOpts.globals);

            delete jsHintOpts.globals;
        }

        return jsHintOpts;
    }
};

// Name and description static attributes
JSHintTask.taskName = "jshint2";
JSHintTask.taskDescription = "JSHint your files - better, faster and stronger";

// Some default task options, made available if necessary to other consumers.
JSHintTask.DEFAULTS = {
    force: false,
    cache: true,
    spawnLimit: 5,
    jshint: {},
    globals: {},
    reporter: "default"
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