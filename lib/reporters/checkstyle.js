// Author: Boy Baukema
// http://github.com/relaxnow

// Adapted to grunt-jshint-bfs by Jacob Gable

var grunt = require("grunt"),
    _ = grunt.util._;

var XmlStyleReporter = require("./xml");

function CheckStyleReporter(opts) {
    XmlStyleReporter.call(this, opts);

    opts = opts || {};

    // Check for specific checkstyle options first
    this.options = opts.checkstyle || opts;
}

_.extend(CheckStyleReporter.prototype, XmlStyleReporter.prototype);

_.extend(CheckStyleReporter.prototype, {
    
    // XmlStyleReporter Implementations
    _rootBegin: function(out) {
        out.push("<checkstyle version=\"4.3\">");
    },

    _rootEnd: function(out) {
        out.push("</checkstyle>");
    },

    _issue: function(out, issue) {
        out.push(
                "\t\t<error " +
                    "line=\"" + issue.line + "\" " +
                    "column=\"" + issue.column + "\" " +
                    "severity=\"" + issue.severity + "\" " +
                    "message=\"" + this._encode(issue.message) + "\" " +
                    "source=\"" + this._encode(issue.source) + "\" " +
                    "/>");
    },

    error: function (filePath, errors, data) {
        var self = this,
            cleanedFile = filePath.replace(/^\.\//, '');

        this.reportedFiles[cleanedFile] = this.reportedFiles[cleanedFile] || [];

        errors.forEach(function (error) {
            grunt.fail.errorcount++;
            
            // Add the error
            self.reportedFiles[cleanedFile].push({
                severity: 'error',
                line: error.line,
                column: error.character,
                message: error.reason,
                source: error.raw
            });
        });

        var globals = data.implieds,
            unuseds = data.unused;

        if (globals) {
            // Add global warnings
            globals.forEach(function (global) {
                self.reportedFiles[cleanedFile].push({
                    severity: 'warning',
                    line: global.line,
                    column: 0,
                    message: "Implied global '" + global.name + "'",
                    source: 'jshint.implied-globals'
                });
            });
        }
        if (unuseds) {
            // Add ununsed warnings
            unuseds.forEach(function (unused) {
                self.reportedFiles[cleanedFile].push({
                    severity: 'warning',
                    line: unused.line,
                    column: 0,
                    message: "Unused variable: '" + unused.name + "'",
                    source: 'jshint.implied-unuseds'
                });
            });
        }
    }
});

module.exports = CheckStyleReporter;