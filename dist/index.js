'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio = require("cheerio");
const formatNum = (number, float = false) => (float ? parseFloat : parseInt)(number.replace(/,/g, '')
    .replace(/\-/g, '').replace(/\+/g, '')) || 0;
const formatName = (name) => {
    name = name.replace(/:/g, '');
    if (name[0] === ' ')
        name = name.substr(1);
    if (name[name.length - 1] === ' ')
        name = name.slice(0, -1);
    return name;
};
const get = (url = 'https://www.worldometers.info/coronavirus') => new Promise((resolve, reject) => axios_1.default.get(url).then(res => {
    if (res.status === 200) {
        const body = cheerio.load(res.data);
        let data = {};
        body('#main_table_countries > tbody > tr').each((_ri, row) => {
            const cols = cheerio(row).find('td');
            data[formatName(cheerio(cols[0]).text())] = {
                total_cases: formatNum(cheerio(cols[1]).text()),
                new_cases: formatNum(cheerio(cols[2]).text()),
                total_deaths: formatNum(cheerio(cols[3]).text()),
                new_deaths: formatNum(cheerio(cols[4]).text()),
                total_recovered: formatNum(cheerio(cols[5]).text()),
                active_cases: formatNum(cheerio(cols[6]).text()),
                serious_cases: formatNum(cheerio(cols[7]).text()),
                total_cases_per_million: formatNum(cheerio(cols[8]).text(), true)
            };
        });
        resolve(data);
    }
    else {
        reject(res.statusText);
    }
}));
module.exports = get;
