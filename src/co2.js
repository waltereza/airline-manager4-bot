const chalk = require('chalk');
const { log } = require('./logger');

const btnfuel = '#mapMaint';
const btnco2 = '#popBtn2';
const eco2price = '#co2Main > div > div:nth-child(2) > span.text-danger > b';
const eqtdcompra = '#amountInput';
const btncomprarCo2 = '#co2Main > div > div.col-sm-12.p-2 > div > button.btn.btn-danger.btn-xs.btn-block.w-100';
const btnclose = '#popup > div > div > div.modal-header > div > span';
const ecap = '#remCapacity';

async function co2Price(page, idealCo2Price, qtdCo2) {
    await page.waitForFunction(selector => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, btnfuel);
    await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnfuel);
    await page.waitForSelector(btnco2);
    await page.waitForTimeout(3000);
    await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnco2);

    await page.waitForFunction(selector => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, eco2price);
    let co2priceTxt = await page.$eval(eco2price, element => element.innerText);
    let co2price = co2priceTxt.replace(/[^0-9,]/g, '').replace(',', '.');
    let parsedco2price = parseFloat(co2price);

    await page.waitForSelector(ecap);
    let co2capTxt = await page.$eval(ecap, element => element.innerText);
    let co2cap = co2capTxt.replace(/[^0-9]/g, '');
    let parsedco2cap = parseInt(co2cap);

    if (parsedco2cap === 0) {
        log(chalk.yellow('Co2 stock full, nothing purchased!'));
        await page.waitForTimeout(3000);
    } else if (parsedco2price > idealCo2Price) {
        log(chalk.yellow('Nothing purchased, Co2 price higher than configured'));
        await page.click(btnclose);
    } else if (parsedco2price <= idealCo2Price && parsedco2cap > 0) {
        await page.click(eqtdcompra);
        await page.evaluate(selector => {
            document.querySelector(selector).value = '';
        }, eqtdcompra);
        await page.type(eqtdcompra, qtdCo2.toString());
        await page.waitForTimeout(3000);
        await page.click(btncomprarCo2);
        await page.waitForTimeout(2000);
        await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnclose);
        let co2Cost = (parsedco2price * qtdCo2) / 1000;
        log(`${chalk.green('CO2 purchase successfully completed!')} cost: ${co2Cost.toLocaleString('en-US', {style: 'currency', currency: 'USD'}).replace('US$', '$')}`);
    }
}

module.exports = co2Price;
