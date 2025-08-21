const chalk = require('chalk');
const { log } = require('./logger');

const btnfuel = '//*[@id="mapMaint"]';
const efuelprice = '//*[@id="fuelMain"]/div/div[1]/span[2]/b';
const eqtdcompra = '//*[@id="amountInput"]';
const btncomprar = '//*[@id="fuelMain"]/div/div[7]/div/button[2]';
const btnclose = '//*[@id="popup"]/div/div/div[1]/div/span';
const ecap = '//*[@id="remCapacity"]';

async function fuelPrice(page, idealFuelPrice, qtdFuel) {
    await page.waitForFunction(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, btnfuel);
    await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) element.click();
    }, btnfuel);

    await page.waitForFunction(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, efuelprice);

    let fuelpriceTxt = await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element ? element.innerText : '';
    }, efuelprice);
    let fuelprice = fuelpriceTxt.replace(/[^0-9,]/g, '').replace(',', '.');
    let parsedfuelprice = parseFloat(fuelprice);

    await page.waitForXPath(ecap);
    let fuelcapTxt = await page.evaluate(xpath => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element ? element.innerText : '';
    }, ecap);
    let fuelcap = fuelcapTxt.replace(/[^0-9]/g, '');
    let parsedfuelcap = parseInt(fuelcap);

    if (parsedfuelcap === 0) {
        log(chalk.yellow('Fuel stock full, nothing purchased!'));
        await page.waitForTimeout(3000);
    } else if (parsedfuelprice > idealFuelPrice) {
        log(chalk.yellow('Nothing purchased, fuel price higher than configured'));
        const [btnCloseEl] = await page.$x(btnclose);
        if (btnCloseEl) await btnCloseEl.click();
    } else if (parsedfuelprice <= idealFuelPrice && parsedfuelcap > 0) {
        const [qtdInput] = await page.$x(eqtdcompra);
        if (qtdInput) {
            await qtdInput.click();
            await page.evaluate(el => { el.value = ''; }, qtdInput);
            await qtdInput.type(qtdFuel.toString());
        }
        await page.waitForTimeout(3000);
        const [btnComprar] = await page.$x(btncomprar);
        if (btnComprar) await btnComprar.click();
        await page.waitForTimeout(2000);
        await page.evaluate(xpath => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (element) element.click();
        }, btnclose);
        let cost = parsedfuelprice * qtdFuel;
        log(`${chalk.green('Fuel purchase successfully completed!')} cost: ${cost.toLocaleString('en-US', {style: 'currency', currency: 'USD'}).replace('US$', '$')}`);
    }
}

module.exports = fuelPrice;
