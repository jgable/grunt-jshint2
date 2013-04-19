
var grunt = require("grunt"),
    _ = grunt.util._;

var reporters = require("./reporters");

// This module is responsible for determining and returning an appropriate 
// reporter based on the options passed in.
module.exports = {
    resolve: function(reporter, options) {
        reporter = reporter || "default";

        if(_.isString(reporter)) {
            return this._loadFromLib(reporter, options);
        } else if(_.isFunction(reporter)) {
            return this._loadFromClass(reporter, options);
        } else if(_.isObject(reporter)) {
            reporter.options = options;
            return reporter;
        }
    },

    _loadFromLib: function(reporter, options) {
        var ReporterClass = reporters[reporter.toLowerCase()];

        if(!ReporterClass) {
            throw new Error("Unable to find reporter named: " + reporter.toLowerCase());
        }

        return this._loadFromClass(ReporterClass, options);
    },

    _loadFromClass: function(ReporterClass, options) {
        return new ReporterClass(options);
    }
};