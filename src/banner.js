const os = require('os');

function banner() {
    process.stdout.write(os.platform() === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
    console.log(`
                 _______________________________________
                |                                       |
                |   _____ __    _____ _____     _       |
                |  |  _  |  |  |     | __  |___| |_     |
                |  |     |  |__| | | | __ -| . |  _|    |
                |  |__|__|_____|_|_|_|_____|___|_|  V1  |
                |_______________________________________|

                                @waltereza
    `);
}

module.exports = banner;
