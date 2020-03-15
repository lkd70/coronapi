'use strict';

import axios from 'axios';
import * as cheerio from 'cheerio';

interface Icountry {
    total_cases: number,
    new_cases: number,
    total_deaths: number,
    new_deaths: number,
    total_recovered: number,
    active_cases: number,
    serious_cases: number,
    total_cases_per_million: number,
}

interface Idata {
    [name: string]: Icountry
}

const formatNum = (number: string, float: boolean = false) => 
    (float ? parseFloat : parseInt)(number.replace(/,/g, '')
    .replace(/\-/g, '').replace(/\+/g, '')) || 0;

const get = (url = 'https://www.worldometers.info/coronavirus') =>
    new Promise<Idata>((resolve, reject) => axios.get(url).then(res => {
        if (res.status === 200) {
            const body = cheerio.load(res.data);

            let data: Idata = {};
            body('#main_table_countries > tbody > tr').each((_ri, row) => {
                const cols = cheerio(row).find('td');
                data[cheerio(cols[0]).text().replace(/:/g, '')] = {
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
        } else {
            reject(res.statusText);
        }
    }));

module.exports = get;
