'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("https");
const $ = require("cheerio");
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
const get = new Promise((resolve, reject) => {
    const req = https_1.request('https://www.worldometers.info/coronavirus/', res => {
        let da = '';
        res.on('data', d => da += d);
        req.on('error', reject);
        res.on('end', () => {
            let data = { countries: {} };
            const body = $.load(da);
            body('#main_table_countries > tbody > tr').each((_ri, row) => {
                const cols = $(row).find('td');
                const name = formatName($(cols[0]).text());
                if (name === 'Total') {
                    data.total = {
                        total_cases: formatNum($(cols[1]).text()),
                        new_cases: formatNum($(cols[2]).text()),
                        total_deaths: formatNum($(cols[3]).text()),
                        new_deaths: formatNum($(cols[4]).text()),
                        total_recovered: formatNum($(cols[5]).text()),
                        active_cases: formatNum($(cols[6]).text()),
                        serious_cases: formatNum($(cols[7]).text()),
                        cases_per_million: formatNum($(cols[8]).text(), true)
                    };
                }
                else {
                    data.countries[name] = {
                        total_cases: formatNum($(cols[1]).text()),
                        new_cases: formatNum($(cols[2]).text()),
                        total_deaths: formatNum($(cols[3]).text()),
                        new_deaths: formatNum($(cols[4]).text()),
                        total_recovered: formatNum($(cols[5]).text()),
                        active_cases: formatNum($(cols[6]).text()),
                        serious_cases: formatNum($(cols[7]).text()),
                        cases_per_million: formatNum($(cols[8]).text(), true)
                    };
                }
            });
            resolve(data);
        });
    });
    req.end();
});
module.exports = get;
