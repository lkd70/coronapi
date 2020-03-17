'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("https");
const get = new Promise((resolve, reject) => {
    const req = https_1.request('https://bing.com/covid/data', res => {
        let da = '';
        res.on('data', d => da += d);
        req.on('error', reject);
        res.on('end', () => {
            const data = JSON.parse(da);
            resolve(data);
        });
    });
    req.end();
});
module.exports = get;
