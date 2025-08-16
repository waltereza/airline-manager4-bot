const chalk = require('chalk');
const { log } = require('./logger');

const btnfuel = '#mapMaint';
const efuelprice = '#fuelMain > div > div:nth-child(1) > span.text-danger > b';
const eqtdcompra = '#amountInput';
const btncomprar = '#fuelMain > div > div.col-sm-12.p-2 > div > button.btn.btn-danger.btn-xs.btn-block.w-100';
const btnclose = '#popup > div > div > div.modal-header > div > span';
const ecap = '#remCapacity';

async function fuelPrice(page, idealFuelPrice, qtdFuel) {
    await page.waitForFunction(selector => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, btnfuel);
    await page.waitForTimeout(5000);
    await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnfuel);

    await page.waitForFunction(selector => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, efuelprice);

    let fuelpriceTxt = await page.$eval(efuelprice, element => element.innerText);
    let fuelprice = fuelpriceTxt.replace(/[^0-9,]/g, '').replace(',', '.');
    let parsedfuelprice = parseFloat(fuelprice);

    await page.waitForSelector(ecap);
    let fuelcapTxt = await page.$eval(ecap, element => element.innerText);
    let fuelcap = fuelcapTxt.replace(/[^0-9]/g, '');
    let parsedfuelcap = parseInt(fuelcap);

    if (parsedfuelcap === 0) {
        log(chalk.yellow('Fuel stock full, nothing purchased!'));
        await page.click(btnclose);
        await page.waitForTimeout(3000);
        await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnclose);
    } else if (parsedfuelprice > idealFuelPrice) {
        log(chalk.yellow('Nothing purchased, fuel price higher than configured'));
        await page.click(btnclose);
    } else if (parsedfuelprice <= idealFuelPrice && parsedfuelcap > 0) {
        await page.evaluate(selector => {
            document.querySelector(selector).value = '';
        }, eqtdcompra);
        await page.type(eqtdcompra, qtdFuel.toString());
        await page.waitForTimeout(3000);
        await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btncomprar);
        await page.waitForTimeout(2000);
        let cost = parsedfuelprice * qtdFuel;
        log(`${chalk.green('Fuel purchase successfully completed!')} cost: ${cost.toLocaleString('en-US', {style: 'currency', currency: 'USD'}).replace('US$', '$')}`);
    }
}

module.exports = fuelPrice;
