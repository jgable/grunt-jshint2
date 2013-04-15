
module.exports = function(grunt) {

    var cfg = {
        "jshint-bfs": {
            options: {
                jshint: {
                    "curly": true,
                    "eqeqeq": true,
                    "undef": true
                },
                globals: {
                    "module": true,
                    "exports": true,
                    "require": true,
                    "__dirname": true
                }
            },
            dev: ["*.js", "tasks/*.js", "lib/**/*.js", "test/*.js"],
            bad: ["test/res/bad-*.js"]
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

    cfg["jshint-bfs"].options.jshint.predef = cfg["jshint-bfs"].options.globals;

    cfg.plato = {
        options: {
            jshint: cfg["jshint-bfs"].options.jshint
        },
        "grunt-jshint-bfs": {
            files: {
                ".plato-grunt-jshint-bfs": ["tasks/*.js", "lib/**/*.js"]
            }
        },
        "grunt-contrib-jshint": {
            files: {
                // If you want to run this for yourself you'll need to update your path to grunt-contrib-jshint
                ".plato-grunt-contrib-jshint": ["../grunt-contrib-jshint/tasks/**/*.js"]
            }
        }
    };

    grunt.initConfig(cfg);

    grunt.loadNpmTasks("grunt-simple-mocha");
    grunt.loadNpmTasks("grunt-plato");

    grunt.loadTasks("tasks");

    grunt.registerTask("default", ["jshint-bfs:dev", "simplemocha:dev"]);
};