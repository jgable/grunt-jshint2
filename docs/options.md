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