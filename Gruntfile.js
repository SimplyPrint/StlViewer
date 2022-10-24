module.exports = grunt => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            configFiles: {
                files: [ 'Gruntfile.js', 'config/*.js' ],
                options: {
                  reload: true
                }
            },
            scripts: {
                files: ['src/*.js'],
                tasks: ['uglify']
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: true,
                comments: false,
            },
            files: {
                'src': [
                    'dependencies/ie_polyfill.js',
                    'dependencies/three.min.js',
                    'dependencies/OrbitControls.js',
                    'dependencies/CanvasRenderer.js',
                    'dependencies/TrackballControls.js',
                    'dependencies/Projector.js',
                    'dependencies/webgl_detector.js',
                    'src/load_stl.js',
                    'src/stl_viewer.js'
                ],
                dest: 'build/stl_viewer.min.js',
                cwd: '.',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['uglify']);
}