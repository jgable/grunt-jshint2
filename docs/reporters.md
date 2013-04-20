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