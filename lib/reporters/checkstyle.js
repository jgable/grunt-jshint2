// Author: Boy Baukema
// http://github.com/relaxnow

// Adapted to grunt-jshint-bfs 

var grunt = require("grunt"),
    _ = grunt.util._;

function CheckStyleReporter(opts) {
    opts = opts || {};

    // Check for specific checkstyle options first
    this.options = opts.checkstyle || opts;
}

CheckStyleReporter.prototype = {
    // Stubbed interface methods
    start: function(files) { 
        this.reportedFiles = {};
    },
    finish: function(files) {
        var self = this,
            out = [],
            result;

        // Preamble
        out.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
        out.push("<checkstyle version=\"4.3\">");

        _.each(files, function(filePath) {
            var cleanedFile = filePath.replace(/^\.\//, '');
            if (!self.reportedFiles.hasOwnProperty(cleanedFile)) {
                return;
            }

            out.push("\t<file name=\"" + filePath + "\">");
            _.each(self.reportedFiles[cleanedFile], function(issue) {
                out.push(
                    "\t\t<error " +
                        "line=\"" + issue.line + "\" " +
                        "column=\"" + issue.column + "\" " +
                        "severity=\"" + issue.severity + "\" " +
                        "message=\"" + self._encode(issue.message) + "\" " +
                        "source=\"" + self._encode(issue.source) + "\" " +
                        "/>"
                );
            });
            out.push("\t</file>");
        });

        // Finish up
        out.push("</checkstyle>");
        out.push("");

        result = out.join("\n");

        // Output to file or console (verbose)
        if(this.options.dest) {
            grunt.file.write(this.options.dest, result);
        } else {
            grunt.verbose.log.write(result);
        }
    },

    // Do nothing for files with no errors
    success: function(filePath, wasCached) { },

    error: function (filePath, errors, data) {
        "use strict";

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
    },

    _encode: function(s) {
        var pairs = {
            "&": "&amp;",
            '"': "&quot;",
            "'": "&apos;",
            "<": "&lt;",
            ">": "&gt;"
        };

        for (var r in pairs) {
            if (typeof(s) !== "undefined") {
                s = s.replace(new RegExp(r, "g"), pairs[r]);
            }
        }
        
        return s || "";
    }
};

module.exports = CheckStyleReporter;