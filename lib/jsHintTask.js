var grunt = require("grunt"),
    _ = grunt.util._;

var JSHintCache = require("./jsHintCache"),
    processorResolver = require("./processorResolver"),
    reportResolver = require("./reporterResolver");

// The JSHintTask is responsible for extracting options from a grunt task and executing the appropriate
// implementation (either async or cluster).  It also facilitates task progress and life cycle to the reporter.
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
            processorOptions = {
                files: files,
                jsHintOpts: this._getJSHintSpecificOptions() || {},
                globals: this.options.globals || {},
                cache: !!this.options.cache,
                spawnLimit: this.options.spawnLimit
            },
            processor = processorResolver.resolve(this.options, processorOptions);

        // Let reporters know that we have begun.
        self.options.reporter.start(files, this.options, processorOptions.jsHintOpts);

        // Bind to our processor events to bubble them up to the reporter
        processor.on("success", function(filePath, wasCached) {
            self.options.reporter.success(filePath, wasCached);
        });

        processor.on("fail", function(filePath, problems, data) {
            self.options.reporter.error(filePath, problems, data);
        });

        processor.on("error", function(err) {
            grunt.fatal(err);

            done(force);
        });

        processor.on("exit", function() {
            self.options.reporter.finish(files);

            // Proceed if we have no errors, or we set the force option to false
            var proceed = self.origTask.errorCount === 0 || force;

            done(proceed);
        });

        processor.processFiles();
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

// Only run the clustering if we have more than 30 files.
// TODO: Do some more research about what a good number for this is
JSHintTask.clusterFileLimit = 30;

// Some default task options, made available if necessary to other consumers.
JSHintTask.DEFAULTS = {
    force: false,
    cache: true,
    processor: "async",
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