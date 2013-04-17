
var grunt = require("grunt"),
	_ = grunt.util._;

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
		var ReporterClass = require("./reporters/" + reporter);

		return this._loadFromClass(ReporterClass, options);
	},

	_loadFromClass: function(ReporterClass, options) {
		return new ReporterClass(options);
	}
};