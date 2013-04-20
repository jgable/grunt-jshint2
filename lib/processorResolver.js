
var JSHintAsync = require("./processors/jsHintAsync"),
    JSHintCluster = require("./processors/jsHintCluster");

module.exports = {
    resolve: function(taskOptions, processorOptions) {
        var processor;

        if(taskOptions.processor.toLowerCase() === "cluster") {
            processor = new JSHintCluster(processorOptions);
        } else {
            processor = new JSHintAsync(processorOptions);
        }

        return processor;
    }
};