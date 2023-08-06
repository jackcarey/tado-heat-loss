const {data} = require('./heatsheet/db.json');
const fs = require('node:fs');
const { Parser } = require('@json2csv/plainjs');

let hourly_transformed_data = [];

Object.values(data).forEach((x,idx)=>{
    delete x.days
    const hourly_rows = [];
    Object.entries(x.hours).forEach(([k,v],idx)=>{
        hourly_rows.push({
            "zone":x.name,
            "timestamp":k,
            "timestamp-iso": new Date(parseInt(k)).toISOString(),
            "heating-low-mins":v.heating.low,
            "heating-medium-mins":v.heating.medium,
            "heating-high-mins":v.heating.high,
            "temperature-c":v.temperature,
            "states-on-mins": v.states.on,
            "states-off-mins":v.states.off,
            "states-away-mins":v.states.away
        });
    });
    hourly_rows.forEach(row=>hourly_transformed_data.push(row));
});
console.log(hourly_transformed_data?.length,"hourly entries");

const parser = new Parser({});
const csv = parser.parse(hourly_transformed_data);
fs.writeFileSync("tado-hourly.csv",csv);
console.log("Finished.");
process.exit(0);