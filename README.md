grunt jshint2 [![Build Status](https://secure.travis-ci.org/jgable/grunt-jshint2.png?branch=master)](http://travis-ci.org/jgable/grunt-jshint2)
================

The task I want the [grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint) task to be.

### Why another one?

I [offered to merge](https://github.com/gruntjs/grunt-contrib-jshint/issues/45) but they didn't seem interested in saving puppies.

### Options

Here is an example config showing the default options.

```javascript
var cfg = {
	jshint2: {
		options: {
			// A path to your jshintrc file if you'd like to use one
			jshintrc: undefined,
			
			// jshint options to be passed to jshint.lint.
			jshint: {

			},
			
			// A list of predefined variables passed to jshint.lint
			globals: {

			},
			
			// What reporter you'd like to use; see Reporters for more info
			reporter: "default",
			
			// Do not fail task on jshint errors
			force: false,
			
			// Cache successful files; see Caching for more info
			cache: true,
			
			// Use the 'async' or 'cluster' processor; see Processors for more info
			processor: "async",
			
			// When using the async processor, the max number of files to process at a time.
			spawnLimit: 5
		}
	}
};
```

### Caching

Caching is done by keeping a computed sha1 hash of the file contents, the jshint options (stringified)
and the globals passed to the jshint.lint function.  

```javascript
_getContentsHash: function(content) {
    var sha1 = crypto.createHash('sha1');

    // The hash should include the file contents
    sha1.update(content);

    // And the jsHintOpts
    sha1.update(JSON.stringify(this.jsHintOpts));

    // And the globals
    sha1.update(JSON.stringify(this.globals));

    return sha1.digest("hex");
}
```

After a file is successfully linted an empty file with a name matching it's computed 
hash is created in a temp directory (using `os.tmpDir()`).  On subsequent jshint calls 
an existence check of the file determines whether we can skip validating it a second time.

By default, the directory where cached files is stored is dependant on the module version.  So 
updating the module will invalidate any already cached files.

### Reporters

Reporters offer a way to customize the output of the jshint2 task.  Since jshint's 
reporters seem to be in a state of flux at the moment, I've copied their implementations
over in order to maintain continuity.

A reporter can be specified in three ways

1. string (ie. "default" or "xml")
2. class (ie. `require("grunt-jshint2").reporters.xml`)
3. object with the following interface:

```javascript
// Reporters interface
var myReporter = {
	start: function(files, taskOptions, jsHintOptions) { 
        // The task is starting to process files
    },

    success: function(filePath, wasCached) {
        // A file was successfully linted
    },

    error: function(filePath, errors, data) {
        // A file had errors
    },

    finish: function(files) {	
    	// The task is finished processing
    }
};
```

Custom objects will have their `options` attribute set to the task options.  More information available from the `lib/reporterResolver.js` file.

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

### License

Copyright 2013 Jacob Gable, [MIT License](http://opensource.org/licenses/MIT).