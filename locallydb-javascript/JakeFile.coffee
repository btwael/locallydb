exec = require('child_process').exec

desc 'Compile all CoffeeScript files in /src to /lib.'
task 'compile', {async: on}, ->
    exec 'coffee --compile --output lib/ src/', (error) ->
        if error
            console.log 'Compiling: Error while compiling files :('
        else
            console.log 'Compiling: Files has successfully been compiled :)'
        complete()