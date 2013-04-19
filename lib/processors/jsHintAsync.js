var EventEmitter = require("events").EventEmitter;

var _ = require("lodash"),
    async = require("async");

var JSHintFile = require("../jsHintFile");

//
// JSHintAsync is responsible for jshint files in an asynchronous manner.
//
function JSHintAsync(options) {
    EventEmitter.call(this);

    this.options = options;
}

_.extend(JSHintAsync.prototype, EventEmitter.prototype);

_.extend(JSHintAsync.prototype, {
    processFiles: function() {
        var self = this,
            jsHintOpts = this.options.jsHintOpts || {},
            globals = this.options.globals || {},
            cacheResults = !!this.options.cache,
            lintFile = function(filePath, cb) {
                self._lintFile(filePath, jsHintOpts, globals, cacheResults, cb);
            };

        async.forEachLimit(this.options.files, this.options.spawnLimit, lintFile, function(err) {
            if(err) {
                self.emit("error", err);
                return;
            }

            self.emit("exit");
        });
    },

    // Lint the file and report any errors
    _lintFile: function(filePath, jsHintOpts, globals, cache, done) {
        var self = this,
            file = new JSHintFile({
                filePath: filePath,
                jsHintOpts: jsHintOpts,
                globals: globals,
                cache: cache
            });

        file.lint(function(err, success, problems, data) {
            if(err) {
                return done(err);
            }

            var wasCached = cache && success && problems === true;

            if(success) {
                // Let the reporter show a success message.
                self.emit("success", filePath, wasCached);
            } else {
                // Reporter will handle how to output the problems
                self.emit("fail", filePath, problems, data);    
            }
            
            done();
        });
    }
});

module.exports = JSHintAsync;