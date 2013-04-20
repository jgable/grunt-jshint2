### Processors

A processor takes a list of files, some jshint options and globals and runs jshint on each file. 
The default processor is an asynchronous processor that reads each file and runs jshint.  Other 
processors like the cluster processor can take advantage of multi core machines in order to run 
jshint on different threads.

At this time it's not possible to write your own processor, but here is the interface that each 
processor should implement.

```javascript
function MyProcessor(options) {
	// Options contains; files, jsHintOpts, globals, cache, spawnLimit
	this.options = options;
}

_.extend(MyProcessor.prototype = EventEmitter.prototype);

_.extend(MyProcessor.prototype, {
	processFiles: function() {
		// Begin processing
		
		// Must emit the following events:
		
		// On lint success
		this.emit("success", filePath, wasCached);
		// On lint failure
		this.emit("fail", filePath, problems, data);
		// On error
		this.emit("error", err);
		// On finish
		this.emit("exit");
	}
});
```