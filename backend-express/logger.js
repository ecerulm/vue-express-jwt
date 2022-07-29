const { createLogger, format, transports } = require('winston')
const { combine, timestamp, splat, cli } = format;


const logger = createLogger({
    format: combine(
        timestamp(), // 
        splat(), // support %s in log
        cli() // colorize and the padLevels 
    ),
    transports: [ new transports.Console() ]
});

console.log('new logger instance created');



module.exports = logger;