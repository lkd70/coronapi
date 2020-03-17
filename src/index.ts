'use strict';

import { request } from 'https';
import * as $ from 'cheerio';

interface Icountry {
    total_cases: number,
    new_cases: number,
    total_deaths: number,
    new_deaths: number,
    total_recovered: number,
    active_cases: number,
    serious_cases: number,
    cases_per_million: number,
}

interface Idata {
    countries?: {
        [name: string]: Icountry
    },
    total?: Icountry
}

const formatNum = (number: string, float: boolean = false) =>
    (float ? parseFloat : parseInt)(number.replace(/,/g, '')
        .replace(/\-/g, '').replace(/\+/g, '')) || 0;

const formatName = (name: string) => {
    name = name.replace(/:/g, '');
    if (name[0] === ' ') name = name.substr(1);
    if (name[name.length - 1] === ' ') name = name.slice(0, -1);
    return name;
}

const get = new Promise<Idata>((resolve, reject) => {
    const req = request('https://www.worldometers.info/coronavirus/', res => {
        let da = '';
        res.on('data', d => da += d);
        req.on('error', reject);

        res.on('end', () => {
            let data: Idata = { countries: {} };
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
                    }
                } else {
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
    req.end()
});

module.exports = get;
