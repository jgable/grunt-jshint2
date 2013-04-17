var path = require("path");

var grunt = require("grunt"),
    _ = grunt.util._;

/* Portions of this code taken from grunt-contrib-jshint */


function DefaultReporter(opts) {
    opts = opts || {};

    _.bindAll(this, "_reportError");

    this.tabReplace = this._makeTabString(opts.tabSize);
}

DefaultReporter.prototype = {
    start: function() { },

    success: function(filePath, wasCached) {
        if(!wasCached) {
            grunt.verbose.write("Linting " + this._getFileName(filePath) + "...");  
        } else {
            grunt.verbose.write("Skipped " + this._getFileName(filePath) + "...");
        }

        grunt.verbose.ok();
    },

    error: function(filePath, errors, data) {
        grunt.log.write("Linting " + this._getFileName(filePath) + "...");
        grunt.log.error();

        // If there was an indent option in jshint, use it to determine our tabString.
        if(data.options && data.options.indent) {
            this.tabReplace = this._makeTabString(data.options.indent);
        }

        errors.forEach(this._reportError);

        grunt.log.writeln();
    },

    finish: function(files) {
        // Print a success message.
        grunt.log.ok(files.length + ' files lint free.');  
    },

    _reportError: function(e) {
        if(!e) {
            return;
        }

        grunt.fail.errorcount++;

        if(!e.evidence) {
            // Generic "Whoops, too many errors" error.
            return grunt.log.error(e.reason);
        }

        var evidence = e.evidence,
            character = e.character,
            pos,
            code = '';

        // Descriptive code error bracket.
        // eg; [L8:C2]
        pos = '['.red + ('L' + e.line).yellow + ':'.red + ('C' + character).yellow + ']'.red;
        
        // Output a code if one is present
        if (e.code) {
            // eg; W032:
            code = e.code.yellow + ':'.red + ' ';
        }
        
        // Put it all together now: 
        // [L8:C2] W032: Some reason text
        grunt.log.writeln(pos + ' ' + code + e.reason.yellow);

        // Replace tab characters with the appropriate number of spaces.
        evidence = evidence.replace(/\t/g, this.tabReplace);
        
        // Output the line of text
        if (character === 0) {
            // Beginning of line.
            evidence = '?'.inverse.red + evidence;
        } else if (character > evidence.length) {
            // End of line.
            evidence = evidence + ' '.inverse.red;
        } else {
            // Middle of line.
            evidence = evidence.slice(0, character - 1) + evidence[character - 1].inverse.red + evidence.slice(character);
        }

        grunt.log.writeln(evidence);
    },

    _makeTabString: function(tabSize) {
        var tabReplace = "";

        if(tabSize) {
            for(var i = 0; i < tabSize; i++) {
                tabReplace += " ";
            }
        }

        return tabReplace;
    },

    _getFileName: function(filePath) {
        return path.relative(process.cwd(), filePath);
    }
};

module.exports = DefaultReporter;