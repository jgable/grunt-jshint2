// Author: Vasili Sviridov
// http://github.com/vsviridov

// Adapted to grunt-jshint-bfs by Jacob Gable

var grunt = require("grunt"),
    _ = grunt.util._;

function XmlStyleReporter(opts) {
    _.bindAll(this, "_issue");

    opts = opts || {};

    // Check for specific xml options first
    this.options = opts.xml || opts;
}

XmlStyleReporter.prototype = {
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
        
        this._rootBegin(out);

        _.each(files, function(filePath) {
            var cleanedFile = filePath.replace(/^\.\//, '');
            if (!self.reportedFiles.hasOwnProperty(cleanedFile)) {
                return;
            }

            self._fileBegin(out, filePath);
            _.each(self.reportedFiles[cleanedFile], function(issue) {
                self._issue(out, issue);
            });
            self._fileEnd(out);
            
        });

        // Finish up
        this._rootEnd(out);
        out.push("");

        result = out.join("\n");

        // Output to file or console (verbose)
        if(this.options.dest) {
            grunt.file.write(this.options.dest, result);
        } else {
            grunt.verbose.log.write(result);
        }
    },

    _rootBegin: function(out) {
        out.push("<jslint>");
    },

    _rootEnd: function(out) {
        out.push("</jslint>");
    },

    _fileBegin: function(out, filePath) {
        out.push("\t<file name=\"" + filePath + "\">");
    },

    _fileEnd: function(out) {
        out.push("\t</file>");
    },

    _issue: function(out, issue) {
        out.push("\t\t<issue line=\"" + issue.line + "\" char=\"" +
            issue.character + "\" reason=\"" + this._encode(issue.reason) +
            "\" evidence=\"" + this._encode(issue.evidence) + "\" />");
    },

    // Do nothing for files with no errors
    success: function(filePath, wasCached) { },

    error: function (filePath, errors, data) {
        var self = this,
            cleanedFile = filePath.replace(/^\.\//, '');

        this.reportedFiles[cleanedFile] = this.reportedFiles[cleanedFile] || [];

        errors.forEach(function (error) {
            grunt.fail.errorcount++;
            
            // Add the error
            self.reportedFiles[cleanedFile].push(error);
        });
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

module.exports = XmlStyleReporter;