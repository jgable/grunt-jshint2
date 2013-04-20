var os = require("os"),
    path = require("path");

var grunt = require("grunt"),
    should = require("should"),
    _ = grunt.util._;

var JSHintCluster = require("../lib/processors/jsHintCluster");

describe("JSHintCluster", function() {

    it("can start and stop itself", function(done) {
        var jsc = new JSHintCluster();

        jsc.on("started", function() {
            should.exist(jsc.workers.cluster);

            var numWorkers = _.keys(jsc.workers.cluster).length;

            numWorkers.should.equal(os.cpus().length);

            jsc.workers.available.length.should.be.above(0);
            
            jsc.stop();
        });

        jsc.on("stopped", done);

        jsc.start();
    });

    it("queues files to be linted", function(){
        var jsc = new JSHintCluster();

        jsc.queueFile({});
        jsc.queueFile({});
        jsc.queueFile({});

        jsc.work.length.should.equal(3);
    });

    it("responds to ready messages", function() {
        var jsc = new JSHintCluster(),
            fakeWorker = {fake: true};

        jsc._messageHandler({type: "ready"}, fakeWorker);

        jsc.workers.available.length.should.equal(1);
        jsc.workers.available[0].should.equal(fakeWorker);
    });

    it("responds to linted messages", function() {
        var jsc = new JSHintCluster(),
            fakeWorker = {fake: true},
            fakeResult = {result: true},
            called = 0;

        jsc._processLintResult = function(result) {
            result.should.equal(fakeResult);
            called++;
        };

        jsc._messageHandler({type: "linted", data: fakeResult}, fakeWorker);

        called.should.equal(1);
    });

    it("sends work to available workers", function() {
        var jsc = new JSHintCluster(),
            called = 0,
            fakeWork = {
                work: true
            },
            fakeWorker = {
                send: function(msg) {
                    msg.type.should.equal("lint");
                    msg.data.should.equal(fakeWork);
                    called++;
                }
            };

        // Available work, but no available workers
        jsc.work.push(fakeWork);
        jsc._checkForWork();

        called.should.equal(0);

        // Available workers, but no work
        jsc.work = [];
        jsc.workers.available.push(fakeWorker);
        jsc._checkForWork();

        called.should.equal(0);

        // Work and workers
        jsc.work.push(fakeWork);
        jsc._checkForWork();

        called.should.equal(1);
        jsc.work.length.should.equal(0);
    });
});