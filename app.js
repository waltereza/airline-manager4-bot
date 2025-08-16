const puppeteer = require('puppeteer');
const { config } = require('dotenv');
const chalk = require('chalk');
config();

const banner = require('./src/banner');
const { log } = require('./src/logger');
const flightDeparture = require('./src/flight');
const fuelPrice = require('./src/fuel');
const co2Price = require('./src/co2');

banner();

let url = 'https://www.airline4.net/';
let user = process.env.EMAIL;
let passwd = process.env.PASSWD;
let idealFuelPrice = process.env.FUELPRICE;
let qtdFuel = process.env.FUELQTD;
let idealCo2Price = process.env.CO2PRICE;
let qtdCo2 = process.env.CO2QTD;
let departureTime = parseInt(process.env.DEPARTTIME, 10);

const btnlanding = '//*[@id="landing"]/div[1]/div/div[1]/button[1]';
const btnlogin = '//*[@id="signupForm"]/div[2]/button';
const btnauth = '#btnLogin';
const ebank = '#headerAccount';
const cemail = '#lEmail';
const cpasswd = '#lPass';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1280,800']
    });

    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForXPath(btnlanding);
    const [landingBtn] = await page.$x(btnlanding);
    if (landingBtn) await landingBtn.click();

    await page.waitForXPath(btnlogin);
    const [loginBtn] = await page.$x(btnlogin);
    if (loginBtn) await loginBtn.click();

    await page.type(cemail, user);
    await page.type(cpasswd, passwd);
    await page.waitForTimeout(1000);
    await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
    }, btnauth);

    const isLogged = await page.waitForFunction(selector => {
        const element = document.querySelector(selector);
        return element && element.innerText && element.innerText.trim() !== '';
    }, {}, ebank);
    if (isLogged){
        log(chalk.green(`User successfully logged in ${user}`));
    } else{
        log(chalk.red('Loggin failed'));
    }

    await fuelPrice(page, idealFuelPrice, qtdFuel);
    await co2Price(page, idealCo2Price, qtdCo2);
    await flightDeparture(page);

    setInterval(async () => {
        await fuelPrice(page, idealFuelPrice, qtdFuel);
    }, 30 * 60000);

    setInterval(async () => {
        await co2Price(page, idealCo2Price, qtdCo2);
    }, 31 * 60000);

    setInterval(async () => {
        await flightDeparture(page);
    }, departureTime * 60 * 60 * 1000);
})();
