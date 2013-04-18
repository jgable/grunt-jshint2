grunt jshint2 [![Build Status](https://secure.travis-ci.org/jgable/grunt-jshint2.png?branch=master)](http://travis-ci.org/jgable/grunt-jshint2)
================

The task I want the [grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint) task to be.

## Why another one?

I [offered to merge](https://github.com/gruntjs/grunt-contrib-jshint/issues/45) but they didn't seem interested in saving puppies.

## Significant Differences

#### Class Based

The units of work have been isolated into different classes rather than a single exposed init function.  I believe this makes them easier to test and easier to expose as an API to other consumers.

#### More Unit Tests

I've tried to make sure the critical parts of the code have test coverage, whereas it seems that unit testing has fallen by the wayside for the contrib task.

#### Explicit jshint options

I've changed the options structure to be more explicit about what the jshint options are in an effor to separate them from the task specific options.  I think this eliminates a lot of complicated option deleting code that is in the grunt-contrib-jshint codebase.

#### Asynchronous

I, personally, do not think that file reading should be done synchronously via the `grunt.file.read` function.  Although my limited testing hasn't revealed any definitive improvements, I believe each file should be linted asynchronously for performance.

#### Caches Successful Runs

If we've previously run jshint on a file, it should be cached so that we do not need to lint it again.  This is done through a combination of temp file based caching where a hash of the contents, the jshint options and the globals determine whether or not we need to lint the file again.  This is on by default, but can be controlled via an option.

#### Reporter Architecture

While there is an existing Pull Request open (/gruntjs/grunt-contrib-jshint/#34) to implement reporters, I am not happy with the hard linking of the reporter files and the hacky overriding of `stdout` necessary to make them work together nicely.  I've ported over the existing [xml](https://github.com/jgable/grunt-jshint-bfs/blob/master/lib/reporters/xml.js) and [checkstyle ](https://github.com/jgable/grunt-jshint-bfs/blob/master/lib/reporters/checkstyle.js) reporters, and have plans to write a base legacy reporter class that will help others who have existing reporters built port them to be used with this task.

### License

Copyright 2013 Jacob Gable, [MIT License](http://opensource.org/licenses/MIT).