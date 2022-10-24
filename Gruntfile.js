module.exports = grunt => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            configFiles: {
                files: [ 'Gruntfile.js', 'config/*.js' ],
                options: {
                  reload: true
                },
                tasks: ["default"]
            },
            scripts: {
                files: ['src/*.js'],
                tasks: ['default']
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: {
                    reserved: ["StlViewer", "THREE", "module", "global", "require"]
                },
                comments: false,
            },
            files: {
                src : [
                    'dependencies/*.js',
                    'dependencies/plugins/*.js',
                    'dist/stl_viewer.js'
                ],
                dest: 'dist/stl_viewer.min.js',
                cwd: '.'
            }
        },
        browserify: {
            dist: {
                files: {
                    'dist/stl_viewer.js': [
                        'src/*.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', [
        'browserify',
        'uglify',
    ]);
}