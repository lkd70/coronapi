'use strict';

import { request } from 'https';
import { parse } from 'parse5';

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

interface Icountries {
    [name: string]: Icountry
}

interface Idata {
    countries: Icountries,
    total: Icountry
}

interface Idocnode {
    nodeName: string,
    name: string,
    publicId: string,
    systemId: string,
    parent: Idocnode
    childNodes: Idocnode
}

interface Idoc {
    nodeName: string,
    mode: string,
    childNodes: Array<Idocnode>
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
    const url = 'https://www.worldometers.info/coronavirus/';
    const req = request(url, res => {
        let da = '';
        res.on('data', d => da += d);
        req.on('error', reject);

        res.on('end', () => {
            let data: Idata = {
                countries: {},
                total: null
            };
            const doc = parse(da);
            const body = (doc as Idoc).childNodes[4].childNodes[2];
            const container = body.childNodes.filter(r =>
                r.nodeName === 'div' && r.attrs[0].value === 'container')[0];
            const c_row = container.childNodes.filter(r =>
                r.nodeName === 'div' && r.attrs[0].value === 'row')[2];
            const c = c_row.childNodes.filter(r =>
                r.nodeName === 'div')[0].childNodes.filter(r => r.nodeName === 'div')[0];
            const [countries, totals] = c.childNodes.filter(r =>
                r.nodeName === 'table')[0].childNodes.filter(r => r.nodeName === 'tbody');

            const country_rows = countries.childNodes.filter(row => row.nodeName === 'tr');
            country_rows.forEach(row => {
                const cols = row.childNodes.filter(col => col.nodeName === 'td');
                const country = formatName(cols[0].childNodes.length > 1 ?
                    cols[0].childNodes[1].childNodes[0].value :
                    cols[0].childNodes[0].value);
                data.countries[country] = {
                    total_cases: cols[1].childNodes.length ?
                        formatNum(cols[1].childNodes[0].value) : 0,
                    new_cases: cols[2].childNodes.length ?
                        formatNum(cols[2].childNodes[0].value) : 0,
                    total_deaths: cols[3].childNodes.length ?
                        formatNum(cols[3].childNodes[0].value) : 0,
                    new_deaths: cols[4].childNodes.length ?
                        formatNum(cols[4].childNodes[0].value) : 0,
                    total_recovered: cols[5].childNodes.length ?
                        formatNum(cols[5].childNodes[0].value) : 0,
                    active_cases: cols[6].childNodes.length ?
                        formatNum(cols[6].childNodes[0].value) : 0,
                    serious_cases: cols[7].childNodes.length ?
                        formatNum(cols[7].childNodes[0].value) : 0,
                    cases_per_million: cols[8].childNodes.length ?
                        formatNum(cols[8].childNodes[0].value, true) : 0,
                }
            });

            const total_row = totals.childNodes.filter(row => row.nodeName === 'tr')[0];
            const total_cols = total_row.childNodes.filter(col => col.nodeName === 'td');
            data.total = {
                total_cases: total_cols[1].childNodes.length ?
                    formatNum(total_cols[1].childNodes[0].value) : 0,
                new_cases: total_cols[2].childNodes.length ?
                    formatNum(total_cols[2].childNodes[0].value) : 0,
                total_deaths: total_cols[3].childNodes.length ?
                    formatNum(total_cols[3].childNodes[0].value) : 0,
                new_deaths: total_cols[4].childNodes.length ?
                    formatNum(total_cols[4].childNodes[0].value) : 0,
                total_recovered: total_cols[5].childNodes.length ?
                    formatNum(total_cols[5].childNodes[0].value) : 0,
                active_cases: total_cols[6].childNodes.length ?
                    formatNum(total_cols[6].childNodes[0].value) : 0,
                serious_cases: total_cols[7].childNodes.length ?
                    formatNum(total_cols[7].childNodes[0].value) : 0,
                cases_per_million: total_cols[8].childNodes.length ?
                    formatNum(total_cols[8].childNodes[0].value, true) : 0
            }

            resolve(data);
        });
    });

    req.end()
});

module.exports = get;
