const _logUpdate = require('log-update');
const logUpdate = _logUpdate.default || _logUpdate;

let header = '';

function getFormattedDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `[${day}/${month} ${hours}:${minutes}] ->`;
}

function log(message) {
    header += '\n' + getFormattedDate() + ' ' + message;
    logUpdate(header);
}

module.exports = { log };
