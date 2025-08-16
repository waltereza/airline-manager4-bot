const chalk = require('chalk');
const { log } = require('./logger');

const btnroutes = '#mapRoutes';
const btndeparture = '#departAll';
const btnclose = '#popup > div > div > div.modal-header > div > span';

async function flightDeparture(page) {
    await page.waitForTimeout(2000);
    await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnroutes);

    try {
        await page.waitForSelector(btndeparture, { visible: true, timeout: 10000 });
        await page.click(btndeparture);
        log(chalk.green('Planes successfully departed!'));
        await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnclose);
    } catch (error) {
        if (error.name === 'TimeoutError') {
            log(chalk.yellow('No planes to take off.'));
            await page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (element) element.click();
            }, btnclose);
        } else {
            log(chalk.red(`Unexpected error: ${error.message}`));
        }
    }
}

module.exports = flightDeparture;
