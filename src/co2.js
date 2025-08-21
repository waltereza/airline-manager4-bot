const chalk = require('chalk');
const { log } = require('./logger');
const priceParser = require('./utils')

const btnfuel = '//*[@id="mapMaint"]';
const btnco2 = '//*[@id="popBtn2"]';
const eco2price = '//*[@id="co2Main"]/div/div[2]/span[2]/b';
const eqtdcompra = '//*[@id="amountInput"]';
const btncomprarCo2 = '//*[@id="co2Main"]/div/div[8]/div';
const btnclose = '//*[@id="popup"]/div/div/div[1]/div/span';
const ecap = '//*[@id="remCapacity"]';

async function co2Price(page, idealCo2Price, qtdCo2) {
    await page.waitForFunction(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, btnfuel);
    await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) element.click();
    }, btnfuel);
    await page.waitForXPath(btnco2);
    await page.waitForTimeout(3000);
    await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) element.click();
    }, btnco2);

    await page.waitForFunction(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, eco2price);
    let co2priceTxt = await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element ? element.innerText : '';
    }, eco2price);
    let parsedco2price = priceParser(co2priceTxt);

    await page.waitForXPath(ecap);
    let co2capTxt = await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element ? element.innerText : '';
    }, ecap);
    let co2cap = co2capTxt.replace(/[^0-9]/g, '');
    let parsedco2cap = parseInt(co2cap);

    if (parsedco2cap === 0) {
        log(chalk.yellow('Co2 stock full, nothing purchased!'));
        await page.waitForTimeout(3000);
    } else if (parsedco2price > idealCo2Price) {
        log(chalk.yellow('Nothing purchased, Co2 price higher than configured'));
        const [btnCloseEl] = await page.$x(btnclose);
        if (btnCloseEl) await btnCloseEl.click();
    } else if (parsedco2price <= idealCo2Price && parsedco2cap > 0) {
        const [qtdInput] = await page.$x(eqtdcompra);
        if (qtdInput) {
            await qtdInput.click();
            await page.evaluate(el => { el.value = ''; }, qtdInput);
            await qtdInput.type(qtdCo2.toString());
        }
        await page.waitForTimeout(3000);
        const [btnComprar] = await page.$x(btncomprarCo2);
        if (btnComprar) await btnComprar.click();
        await page.waitForTimeout(2000);
        await page.evaluate(xpath => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (element) element.click();
        }, btnclose);
        let co2Cost = (parsedco2price * qtdCo2) / 1000;
        log(`${chalk.green('CO2 purchase successfully completed!')} cost: ${co2Cost.toLocaleString('en-US', {style: 'currency', currency: 'USD'}).replace('US$', '$')}`);
    }
}

module.exports = co2Price;
