var os = require("os"),
	path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintFileWorker = require("../lib/jsHintFileWorker");

describe("JSHintFileWorker", function() {
	it("listens for work and signals when ready", function(done) {
		var onCalls = 0,
			fakeWorker = {
				on: function(name) { 
					name.should.equal("message");
					onCalls++;
				}
			},
			fw = new JSHintFileWorker(fakeWorker);

		fw._sendMessage = function(msg) {
			msg.type.should.equal("ready");
			onCalls.should.equal(1);
			done();
		};

		fw.listen();
	});

	it("lints files and signals when done", function(done) {
		var calls = 0,
			fakeWorker = {},
			fw = new JSHintFileWorker(fakeWorker);

		fw._sendMessage = function(msg) {
			msg.type.should.equal("linted");

			should.exist(msg.data);

			msg.data.success.should.equal(false);

			msg.data.problems.length.should.equal(1);

			done();
		};

		fw.lintFile({
			filePath: path.join(process.cwd(), "test/res/bad-3.js")
		});
	});

	it("receives lint messages from master", function() {
		var fw = new JSHintFileWorker(),
			called = 0,
			jsHintData = {fake: true};

		fw.lintFile = function(opts) {
			opts.should.equal(jsHintData);
			called++;
		};

		fw._handleMessage({
			type: "lint",
			data: jsHintData
		});

		called.should.equal(1);
	});
});