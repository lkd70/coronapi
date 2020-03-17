'use strict';

import { request } from 'https';

interface IArea {
    totalConfirmed: number,
    totalDeaths: number,
    totalRecovered: number,
    id: string,
    lastUpdated: string,
    areas: [IArea],
    displayName: string,
    lat: number,
    long: number,
    country: string,
    parentId: string,
}

const get = new Promise<IArea>((resolve, reject) => {
    const req = request('https://bing.com/covid/data', res => {
        let da = '';
        res.on('data', d => da += d);
        req.on('error', reject);

        res.on('end', () => {
            const data = JSON.parse(da);
            resolve(data);
        });
    });
    req.end()
});

module.exports = get;
