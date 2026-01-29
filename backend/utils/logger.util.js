// Logger Utility
const chalk = require('chalk');

class Logger {
    static info(message, data = null) {
        console.log(chalk.blue('ℹ [INFO]'), message, data || '');
    }

    static success(message, data = null) {
        console.log(chalk.green('✓ [SUCCESS]'), message, data || '');
    }

    static warning(message, data = null) {
        console.log(chalk.yellow('⚠ [WARNING]'), message, data || '');
    }

    static error(message, error = null) {
        console.log(chalk.red('✗ [ERROR]'), message);
        if (error) {
            if (typeof error === 'object' && error.stack) {
                console.error(chalk.red(error.stack));
            } else if (typeof error === 'object') {
                console.error(chalk.red(JSON.stringify(error, null, 2)));
            } else {
                console.error(chalk.red(error));
            }
        }
    }

    static debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.gray('🐛 [DEBUG]'), message, data || '');
        }
    }

    static api(method, path, statusCode) {
        const color = statusCode >= 500 ? chalk.red :
            statusCode >= 400 ? chalk.yellow :
                statusCode >= 300 ? chalk.cyan :
                    chalk.green;

        console.log(
            chalk.gray('[API]'),
            chalk.bold(method),
            path,
            color(statusCode)
        );
    }
}

module.exports = Logger;
