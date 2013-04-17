grunt-jshint-bfs [![Build Status](https://secure.travis-ci.org/jgable/grunt-jshint-bfs.png?branch=master)](http://travis-ci.org/jgable/grunt-jshint-bfs)
================

The repo I want the grunt-contrib-jshint repo to be.

## Why?

The existing grunt-contrib-jshint task at the time of this writing is hard to change and has limited unit tests.  Rather than work the required large changes into their existing codebase I've decided to make this as an example and hopefully have them adopt the practices from here.


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

While there is an existing Pull Request open to implement reporters, I am not happy with the hard linking of the reporter files and the hacky overriding of `stdout` necessary to make them work together nicely.  I've ported over the existing xml and checkstyle reporters, and have plans to write a base legacy reporter class that will help others who have existing reporters built port them to be used with this task.

#### Style stuff

You guys are 2 space tab guys, I'm a 4 space tab guy.  You guys are not fans of white space, I'm a big fan of it.  Evidently you are also against single var statements for multiple assignment.  I'm sure if I had to, I could probably get over this stuff.

### Where do we go from here?

I'd love to hear some feedback and have a dialog about the points I've raised above.  I've never understood the init function based architecture in use and I'm curious if I might be missing something.

I'd be happy to talk about starting up a new branch with this code and merging it in over time.  I'm sensitive to the options structure change and understand that it might be something that a minor version would be incremented for.

As a final option, if all my code just makes you want to vomit in your mouth a little bit, I could just publish this as a separate task and check back in from time to time looking longingly at your code and thinking of the oh so sweet merging we could have done together.

### License

Copyright 2013 Jacob Gable, [MIT License](http://opensource.org/licenses/MIT).