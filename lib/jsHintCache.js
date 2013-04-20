var path = require("path");

var grunt = require("grunt"),
    CacheSwap = require("cache-swap");

// Grab the package info only once instead of on every instantiation
var packageInfo = grunt.file.readJSON(path.resolve(path.join(__dirname, '..', 'package.json')));

//
// The JSHintCache is responsible for keeping track of successfully linted files
//
function JSHintCache(opts) {
    opts = opts || {};

    var cacheDirName = opts.cacheDirName || (JSHintCache.cacheDirName +'-'+ this._getVersion());

    this.swap = new CacheSwap({
        // Add on the package version so that upgrading the package will invalidate previous caches
        cacheDirName: cacheDirName
    });
}

JSHintCache.prototype = {

    // Check for an existing cached result
    hasCached: function(hash, done) {
        this.swap.hasCached(JSHintCache.cacheCategoryName, hash, done);
    },

    // Add a successful lint result
    addCached: function(hash, done) {
        this.swap.addCached(JSHintCache.cacheCategoryName, hash, "", done);
    },

    clear: function(done) {
        this.swap.clear(JSHintCache.cacheCategoryName, done);
    },

    // Grab the version of this module
    _getVersion: function() {

        return packageInfo.version;
    }
};

JSHintCache.cacheDirName = "grunt-jshint-bsf";
JSHintCache.cacheCategoryName = "jshinted";

module.exports = JSHintCache;