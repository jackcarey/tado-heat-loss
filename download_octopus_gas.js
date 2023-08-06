const creds = require('./octopus.creds.json');
const fs = require('node:fs');
const { Parser } = require('@json2csv/plainjs');

function objectToQueryParameters(obj) {
    return "?" + Object.entries(obj).filter(([k, v]) => (v || v == 0 || v == false) ?? false).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  }

async function callOctopusAPI(endpoint, parameters) {
    if (!endpoint) { throw new Error("no Octopus endpoint"); }
    const basicAuthStr = btoa(`${creds.api_key}:`);
    const paramStr = objectToQueryParameters(parameters);
    const fullURL = creds.origin + endpoint + paramStr;
    const response = await fetch(fullURL, {
      method: "get", 
      headers: {
        "Authorization": `Basic ${basicAuthStr}`,
      }
    });
    const respCode = response.status;
    if (respCode < 200 || respCode >= 300) {
      throw new Error(`Error HTTP ${respCode}`);
    }
    return await response.json();
  }
  
async function getGasUsage(period_from = new Date(), period_to = null, page_size = 25000) {
    const endpoint = `/v1/gas-meter-points/${creds.gas.mprn}/meters/${creds.gas.serial_number}/consumption/`;
    const parameters = {
      "period_from": new Date(period_from).toISOString(),
      "period_to": period_to ? new Date(period_to).toISOString() : "",
      "page_size": Math.min(25000, Math.max(100, page_size)),
      "order_by": "period", //most recent last
    };
    return (await callOctopusAPI(endpoint, parameters)).results;
  }

  getGasUsage(new Date().setFullYear(new Date().getFullYear() - 1)).then(gas_data=>{
    const parser = new Parser({});
    const csv = parser.parse(gas_data);
    fs.writeFileSync("octopus-gas.csv",csv);
    console.log("Finished.");
    process.exit(0);
  });
