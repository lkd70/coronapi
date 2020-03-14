'use strict';

const axios = require('axios').default;
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');

const formatNum = (num, float = false) => (float ? parseFloat : parseInt)(num
    .replace(/,/g, '')
    .replace(/\-/g, '')
    .replace(/\+/g, '')) || 0;

const get = (url = 'https://www.worldometers.info/coronavirus') =>
    new Promise((resolve, reject) => axios.get(url).then(res => {
        if (res.status === 200) {
            const body = cheerio.load(res.data);
            cheerioTableparser(body);

            let data = {};
            const table = body('#main_table_countries').parsetable(false, false, true);

            table[0].map((t, i) => {
                if (i !== 0) {
                    t = t.replace(/:/g, '');
                    data[t] = {};
                    data[t].total_cases = formatNum(table[1][i]);
                    data[t].new_cases = formatNum(table[2][i]);
                    data[t].total_deaths = formatNum(table[3][i]);
                    data[t].new_deaths = formatNum(table[4][i]);
                    data[t].total_recovered = formatNum(table[5][i]);
                    data[t].active_cases = formatNum(table[6][i]);
                    data[t].serious_cases = formatNum(table[7][i]);
                    data[t].total_cases_per_million = formatNum(table[8][i], true);
                }
            });

            resolve(data);
        } else {
            reject(res.statusText);
        }
    }));

    module.exports = get;
