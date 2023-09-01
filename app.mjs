import puppeteer from 'puppeteer';
import { config } from 'dotenv';
config();
import chalk from 'chalk';
import logUpdate from 'log-update';

import os from 'os';

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

banner();

let header = ''

function log(message) {
    header += '\n' + getFormattedDate() + ' ' + message;
    logUpdate(header);
}


let url = "https://www.airline4.net/";
let user = process.env.EMAIL;
let passwd = process.env.PASSWD;
let idealFuelPrice = process.env.FUELPRICE;
let qtdFuel = process.env.FUELQTD;
let idealCo2Price = process.env.CO2PRICE;
let qtdCo2 = process.env.CO2QTD;
let departureTime = parseInt(process.env.DEPARTTIME, 10);


const btnlogin = 'body > div.am4-bg-frontpage > div > div.row.justify-content-between.py-0.py-lg-0 > div.col-12.col-lg-5.align-self-center.white-bg-opacity-landingpage > div > button.py-3.py-lg-3.btn.btn-lg.btn-primary-gradient.btn-block';
const btnauth = '#btnLogin';
const bxremeber = '#remember';
const ebank = '#headerAccount';
const cemail = '#lEmail';
const cpasswd = '#lPass';

const btnroutes = '#mapRoutes';
const btndeparture = '#departAll';


const btnfuel ='#mapMaint';
const efuelprice ='#fuelMain > div > div:nth-child(1) > span.text-danger > b';
const eqtdcompra ='#amountInput';
const btncomprar = '#fuelMain > div > div.col-sm-12.p-2 > div > button.btn.btn-danger.btn-xs.btn-block.w-100';
const btnclose = '#popup > div > div > div.modal-header > div > span';
const ecap = '#remCapacity';


const btnco2 = '#popBtn2';
const eco2price = '#co2Main > div > div:nth-child(2) > span.text-danger > b';
const btncomprarCo2= '#co2Main > div > div.col-sm-12.p-2 > div > button.btn.btn-danger.btn-xs.btn-block.w-100';


function getFormattedDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `[${day}/${month} ${hours}:${minutes}] ->`;
}


(async () => {



const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
    args: ['--window-size=1280,800']
});

    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForFunction((selector) => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== "";
    }, {}, btnlogin);
    await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnlogin);

    await page.type(cemail, user)
    await page.type(cpasswd, passwd)
    await page.click(bxremeber)
    await page.waitForTimeout(1000);
    await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnauth);

    const isLogged = await page.waitForFunction((selector) => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== "";
    }, {}, ebank);
    if (isLogged){
        log(chalk.green("User successfully logged in", user));
    } else{
        log(chalk.red("Loggin failed"));
    }

   

    const flightDeparture = async () => {
        await page.waitForTimeout(2000);
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnroutes);
    
        try {
            await page.waitForSelector(btndeparture, {visible: true, timeout: 10000});
            await page.click(btndeparture);
            log(chalk.green("Planes successfully departed!"));
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) element.click();
            }, btnclose);
        } catch (error) {
            if (error.name === "TimeoutError") {
                log(chalk.yellow("No planes to take off."));
                await page.evaluate((selector) => {
                    const element = document.querySelector(selector);
                    if (element) element.click();
                }, btnclose);
            } else {
                log(chalk.red(`Unexpected error: ${error.message}`));
            }
        }
    }
        


    const fuelPrice = async () => {
        await page.waitForFunction((selector) => {
            const element = document.querySelector(selector);
            return element && element.innerText && element.innerText.trim() !== "";
        }, {}, btnfuel);
        await page.waitForTimeout(5000);
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnfuel);

        // Espere até que o efuelprice contenha algum texto (não esteja vazio)
        await page.waitForFunction((selector) => {
            const element = document.querySelector(selector);
            return element && element.innerText && element.innerText.trim() !== "";
        }, {}, efuelprice);

        let fuelpriceTxt = await page.$eval(efuelprice, element => element.innerText);
        let fuelprice = fuelpriceTxt.replace(/[^0-9]/g, '');
        let parsedfuelprice = parseInt(fuelprice);


        await page.waitForSelector(ecap);
        let fuelcapTxt = await page.$eval(ecap, element => element.innerText);
        let fuelcap = fuelcapTxt.replace(/[^0-9]/g, '');
        let parsedfuelcap = parseInt(fuelcap);

        if (parsedfuelcap === 0) {
            log(chalk.yellow("Fuel stock full, nothing purchased!"));
            await page.click(btnclose)
            await page.waitForTimeout(3000)
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) element.click();
            }, btnclose);
        } else if (parsedfuelprice > idealFuelPrice) {
            log(chalk.yellow("Nothing purchased, fuel price higher than configured"));
            await page.click|(btnclose)
        } else if (parsedfuelprice <= idealFuelPrice && parsedfuelcap > 0) {
            await page.evaluate(selector => {
                document.querySelector(selector).value = '';
            }, eqtdcompra);
            await page.type(eqtdcompra, qtdFuel.toString());            
            await page.waitForTimeout(3000);
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) element.click();
            }, btncomprar);
            await page.waitForTimeout(2000);
            
            log(`${chalk.green("Fuel purchase successfully completed!")} cost: $${parsedfuelprice / 1000 * parsedfuelcap}`);
        }
        


    }

    const co2Price = async () => {
        await page.waitForFunction((selector) => {
            const element = document.querySelector(selector);
            return element && element.innerText && element.innerText.trim() !== "";
        }, {}, btnfuel);
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnfuel);
        await page.waitForSelector(btnco2)
        await page.waitForTimeout(3000)
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) element.click();
        }, btnco2);

        await page.waitForFunction((selector) => {
            const element = document.querySelector(selector);
            return element && element.innerText && element.innerText.trim() !== "";
        }, {}, eco2price);
        let co2priceTxt = await page.$eval(eco2price, element => element.innerText);
        let co2price = co2priceTxt.replace(/[^0-9]/g, '');
        let parsedco2price = parseInt(co2price);

        await page.waitForSelector(ecap);
        let co2capTxt = await page.$eval(ecap, element => element.innerText);
        let co2cap = co2capTxt.replace(/[^0-9]/g, '');
        let parsedco2cap = parseInt(co2cap);

        if (parsedco2cap === 0) {
            log(chalk.yellow("Co2 stock full, nothing purchased!"));
            await page.waitForTimeout(3000)
            
        } else if (parsedco2price > idealCo2Price) {
            log(chalk.yellow("Nothing purchased, Co2 price higher than configured"));
            await page.click(btnclose)          
        } else if (parsedco2price <= idealCo2Price && parsedco2cap > 0) {
            await page.click(eqtdcompra);
            await page.evaluate(selector => {
                document.querySelector(selector).value = '';
            }, eqtdcompra);
            await page.type(eqtdcompra, qtdCo2.toString());            
            await page.waitForTimeout(3000);
            await page.click(btncomprarCo2);
            await page.waitForTimeout(2000);
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) element.click();
            }, btnclose);            
            log(`${chalk.green('CO2 purchase successfully completed!')} cost: $${parsedco2price / 1000 * parsedco2cap}`);

        }
        
    }

    await fuelPrice();
    await co2Price();
    await flightDeparture();

    setInterval(async() => {
        await fuelPrice();
    }, 30 * 60000);
    
    setInterval(async() => {
        await co2Price();
    }, 31 * 60000);

    setInterval(async() => {
        await flightDeparture();
    }, departureTime * 60  * 60 * 1000);

    
})();