var path = require("path");

var ncp = require("ncp").ncp;

module.exports = function(grunt) {

    var cfg = {
        "jshint2": {
            options: {
                jshintrc: ".jshintrc"
            },

            // All the lib and task files
            dev: ["*.js", "tasks/*.js", "lib/**/*.js"],

            // All the mocha test files
            tests: {
                options: {
                    globals: {
                        describe: false,
                        it: false,
                        beforeEach: false
                    }
                },
                files: {
                    src: ["test/*.js"]
                }
            },

            dev_checkstyle: {
                options: {
                    reporter: "checkstyle",
                    dest: "test/res/checkStyleOutput.xml"
                },
                files: {
                    src: ["*.js", "tasks/*.js", "lib/**/*.js"]
                }
            },

            dev_xml: {
                options: {
                    reporter: "xml",
                    dest: "test/res/xmlStyleOutput.xml"
                },
                files: {
                    src: ["*.js", "tasks/*.js", "lib/**/*.js"]
                }
            },

            // For testing output of errors
            bad: ["test/res/bad-*.js"],

            bad_checkstyle: {
                options: {
                    reporter: "checkstyle",
                    dest: "test/res/checkStyleOutput.xml"
                },
                files: {
                    src: ["test/res/bad-*.js"]
                }
            },

            bad_xml: {
                options: {
                    reporter: "xml",
                    dest: "test/res/xmlStyleOutput.xml"
                },
                files: {
                    src: ["test/res/bad-*.js"]
                }
            },

            // This is for comparison between grunt-contrib-jshint
            // You'll need to clone jquery mobile into a peer directory
            // e.g. cd .. && git clone git://github.com/jquery/jquery-mobile.git
            jquerymobile: {
                options: {
                    jshintrc: "../jquery-mobile/js/.jshintrc"
                },
                files: {
                    src: [
                        "../jquery-mobile/js/**/*.js",
                        "!../jquery-mobile/js/jquery.hashchange.js",
                        "!../jquery-mobile/js/jquery.js",
                        "!../jquery-mobile/js/jquery.ui.widget.js"
                    ]
                }
            }
        },

        "jshint": {
            // This is for comparison between grunt-contrib-jshint
            // You'll need to clone jquery mobile into a peer directory
            // e.g. cd .. && git clone git://github.com/jquery/jquery-mobile.git
            jquerymobile: {
                options: {
                    jshintrc: "../jquery-mobile/js/.jshintrc"
                },
                files: {
                    src: [
                        "../jquery-mobile/js/**/*.js",
                        "!../jquery-mobile/js/jquery.hashchange.js",
                        "!../jquery-mobile/js/jquery.js",
                        "!../jquery-mobile/js/jquery.ui.widget.js"
                    ]
                }
            }
        },

        "simplemocha": {
            options: {
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            dev: ["test/*_spec.js"]
        }
    };

    cfg.plato = {
        "grunt-jshint2": {
            options: {
                title: "grunt-jshint2",
                jshint: grunt.file.readJSON(".jshintrc")
            },
            files: {
                ".plato-grunt-jshint2": ["tasks/*.js", "lib/**/*.js"]
            }
        },
        "grunt-contrib-jshint": {
            options: {
                // Disabled reading their jshintrc because it's not present on travis-ci server
                // TODO: grunt.file.readJSON("../grunt-contrib-jshint/.jshintrc")
                title: "grunt-contrib-jshint2",
                jshint: false
            },
            files: {
                // If you want to run this for yourself you'll need to clone the grunt-contrib-jshint repo into a peer directory
                // e.g. cd .. && git clone git://github.com/gruntjs/grunt-contrib-jshint.git
                ".plato-grunt-contrib-jshint": ["../grunt-contrib-jshint/tasks/**/*.js"]
            }
        }
    };

    grunt.initConfig(cfg);

    grunt.loadNpmTasks("grunt-simple-mocha");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-plato");

    grunt.loadTasks("tasks");

    // Recursively copy the plato report directory files over to dropbox for viewing
    grunt.registerTask("copy-plato", function() {
        var done = this.async(),
            files = {
                "/Users/jacob/Dropbox/Public/plato/grunt-contrib-jshint/": ".plato-grunt-contrib-jshint/",
                "/Users/jacob/Dropbox/Public/plato/grunt-jshint2/": ".plato-grunt-jshint2/"
            },
            cpFuncs = grunt.util._.map(files, function(src, dest) {
                return function(cb) {
                    ncp(path.join(process.cwd(), src), dest, cb);
                };
            });

        grunt.util.async.parallel(cpFuncs, function(err) {
            if (err) { 
                throw err;
            }

            done();
        });
    });

    grunt.registerTask("report", ['plato', 'copy-plato']);

    grunt.registerTask("start", function() {
        console.time("JSHint");
    });

    grunt.registerTask("finish", function() {
        console.timeEnd("JSHint");
    });

    grunt.registerTask("timed", ["start", "jshint2:jquerymobile", "finish", "start", "jshint:jquerymobile", "finish"]);

    grunt.registerTask("default", ["jshint2:dev", "jshint2:tests", "simplemocha:dev"]);
};