var cluster = require("cluster");

var _ = require("lodash");

var JSHintFile = require("./jsHintFile");

//
// The JSHintFileWorker is a worker thread that lints files and bubbles up results to the cluster master.
//
function JSHintFileWorker(worker) {
    this.worker = worker;
}

JSHintFileWorker.prototype = {
    listen: function() {
        var self = this;

        this.worker.on("message", function(msg) {
            self._handleMessage(msg);
        });

        this._sendMessage({
            type: "ready"
        });
    },

    lintFile: function(opts) {
        var self = this,
            file = new JSHintFile(opts);

        file.lint(function(err, success, problems, data) {
            self._sendMessage({
                type: "linted",
                data: {
                    opts: opts,
                    err: err,
                    success: success,
                    problems: problems,
                    data: data
                }
            });
        });
    },

    _sendMessage: function(msg) {
        process.send(msg);
    },

    _handleMessage: function(msg) {
        switch(msg.type) {
            case "lint":
                this.lintFile(msg.data);
                break;
            default:
                if(_.isFunction(this[msg.type])) {
                    this[msg.type](msg.data);
                }
                break;
        }
    }
};

if(cluster.isWorker) {
    var fileWorker = new JSHintFileWorker(cluster.worker);

    fileWorker.listen();
}

module.exports = JSHintFileWorker;