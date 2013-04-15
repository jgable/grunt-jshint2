var path = require("path");

var grunt = require("grunt");


function DefaultReporter(jshintOpts) {
    this.jshintOpts = jshintOpts;
}

DefaultReporter.prototype = {
    success: function(filePath, wasCached) {
        if(!wasCached) {
            grunt.verbose.write("Linting " + this._getFileName(filePath) + "...");  
        } else {
            grunt.verbose.write("Skipped " + this._getFileName(filePath) + "...");
        }

        grunt.verbose.ok();
    },

    error: function(filePath, errors) {
        grunt.log.write("Linting " + this._getFileName(filePath) + "...");
        grunt.log.error();

        errors.forEach(this._reportError);

        grunt.log.writeln();
    },

    _reportError: function(e) {
        if(!e) {
            return;
        }

        grunt.fail.errorcount++;

        if(!e.evidence) {
            // Generic "Whoops, too many errors" error.
            grunt.log.error(e.reason);
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
        
        // TODO: Tab calculation based on jshint options

        grunt.log.writeln(evidence);
    },

    _getFileName: function(filePath) {
        return path.basename(filePath);
    }
};

module.exports = DefaultReporter;