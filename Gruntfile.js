module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({

        jshint: {
            files: [
                'Gruntfile.js',
                'src/**/*.js',
                'demo/**/*.js',
                'test/**/*.js'
            ],
            options: {
               jshintrc: '.jshintrc'
            }
        },

        clean: {
            dist: ['dist']
        },

        processhtml: {
            build: {
                files: {
                    '_gh-pages/index.html': 'demo/index.html'
                }
            }
        },

        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            index: {
                files: {
                    '_gh-pages/index.html': '_gh-pages/index.html'
                }
            }
        },

        uglify: {
            build: {
                options: {
                    sourceMap: true
                },
                files: {
                    'dist/ng-form-builder.min.js': 'src/**/*.js'
                }
            },
            demo: {
                files: {
                    '_gh-pages/demo.min.js': [
                        'bower_components/angular/angular.js',
                        'src/angular-form-builder.js',
                        'demo/demo.js'
                    ]
                }
            }
        },

        // karma: {
        //     unit: {
        //         options: {
        //             configFile: 'test/conf/karma.conf.js'
        //         }
        //     }
        // },

        watch: {
            scripts: {
                files: ['src/**/*', 'demo/**/*'],
                tasks: ['build']
            }
        }

    });

    /* Build process...

    - Lint JS
    - Clean old build
    - Process styles
    - Process scripts
    - Process demo */

    grunt.registerTask('build', [
      // 'jshint',
        'clean',
        'uglify:build',
        'demo'
    ]);

    grunt.registerTask('demo', [
        'processhtml',
        'htmlmin',
        'uglify:demo'
    ]);

    // A bit redundant, but explicit.  First test, good for local testing...

    grunt.registerTask('test', [
        'jshint',
    //    'karma'
    ]);

    // ...and second test, used by Travis CI to trigger those same tests.

    grunt.registerTask('travis', [
        'test'
    ]);

    grunt.registerTask('default', ['build']);
    grunt.registerTask('dev', ['build', 'watch']);
};