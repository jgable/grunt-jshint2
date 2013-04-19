var os = require("os"),
    path = require("path"),
    cluster = require("cluster"),
    util = require("util"),
    EventEmitter = require("events").EventEmitter;

var _ = require("lodash");

var numCPUs = os.cpus().length;

//
// The JSHintCluster is responsible for linting a set of files using a set or worker processes in parallel.
//
function JSHintCluster(processorOptions) {
    EventEmitter.call(this);

    _.bindAll(this, "_messageHandler");

    this.options = processorOptions;

    this.started = false;
    
    this.workers = {
        cluster: {},
        available: []
    };

    this.work = [];

    this.intervalId = null;
}

_.extend(JSHintCluster.prototype, EventEmitter.prototype);

_.extend(JSHintCluster.prototype, {
    processFiles: function() {
        var self = this;

        _.each(this.options.files, function(file) {
            self.queueFile({
                filePath: file,
                jsHintOpts: self.options.jsHintOpts,
                globals: self.options.globals,
                cache: self.options.cache
            });
        });

        this.processed = 0;

        this.start();
    },

    start: function() {
        // Queue up our workers and setup the communication between them

        var self = this;

        cluster.setupMaster({
            exec: path.resolve(path.join(__dirname, "..", "jsHintFileWorker.js")),
            silent: true
        });

        _.times(numCPUs, cluster.fork);

        Object.keys(cluster.workers).forEach(function(id) {
            cluster.workers[id].on('message', function(msg) {
                self._messageHandler(msg, cluster.workers[id]);
            });
        });

        if(!this.intervalId) {
            this.intervalId = setInterval(function() {
                self._checkForWork();
            }, 100);
        }

        this.workers.cluster = cluster.workers;
    },

    stop: function() {
        if(this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Attempt to gracefully exit
        var self = this,
            totalWorkers = _.keys(this.workers.cluster).length,
            exitCount = 0,
            exitHandler = function() {
                exitCount++;

                if(exitCount === totalWorkers) {
                    self.started = false;
                    self.emit("stopped");
                    self.emit("exit");
                }
            };

        _.each(this.workers.cluster, function(worker, id) {
            worker.on("exit", exitHandler);
            worker.destroy();
        });
    },

    queueFile: function(opts) {
        // Add the work details to the work queue.
        this.work.push(opts);
    },

    _messageHandler: function(msg, worker) {
        // Handle ready, linted events
        switch(msg.type) {
            case "ready": 
                this.workers.available.push(worker);

                if(!this.started) {
                    this.started = true;
                    this.emit("started");
                }

                break;

            case "linted":
                this._processLintResult(msg.data);
                this.workers.available.push(worker);
                break;

            default:

                break;
        }
    },

    _checkForWork: function() {
        // Bug out if no work to do or workers available.
        if(!this.work.length || !this.workers.available.length) {
            return;
        }

        var self = this;

        while(this.workers.available.length > 0 && this.work.length > 0) {
            // TODO: Enqueue and Dequeue instead of just popping most recent
            var worker = this.workers.available.pop(),
                todo = this.work.pop();

            worker.send({
                type: "lint",
                data: todo
            });
        }
    },

    _processLintResult: function(data) {
        this.processed++;
        
        if(data.err) {
            this.emit("error", data.err);
            return;
        }

        var wasCached = data.opts.cache && data.success && data.problems === true;

        if(data.success) {
            // Let the reporter show a success message.
            this.emit("success", data.opts.filePath, wasCached);
        } else {
            // Reporter will handle how to output the problems
            this.emit("fail", data.opts.filePath, data.problems, data.data);    
        }

        if(this.processed === this.options.files.length) {
            this.stop();
        }
    }
});

module.exports = JSHintCluster;