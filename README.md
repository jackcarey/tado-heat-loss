# tado-heat-loss
Tools to collect historical data for determining residential heatloss using Tado thermostats, OpenWeatherMap data, and Octopus energy gas consumption.

High-level details have been given below with a view to explaining how data was collected for one address using a specific set of technology. If your set-up and technical knowledge allows then you may be able to replicate the steps, however they're intended to operate as a reference when creating your own implementation. If you'd like to ask a question, feel free to [start a discussion](https://github.com/jackcarey/tado-heat-loss/discussions).

## Prerequisites

- Node.js v18+

## Data Sources

- Hourly Weather: [openweathermap.com](https://home.openweathermap.org/history_bulks/new)
- Half-hourly Gas Consumption: [Octopus Energy API](https://developer.octopus.energy/docs/api/)
- Hourly Room Temperatures: [heatsheet (Tado)](https://github.com/orangecoding/heatsheet)

## Files

- `heatsheet/` - A submodule for [orangecoding/heatsheet](https://github.com/orangecoding/heatsheet). Used to connect to Tado's API and provide useful reports. Internal temperature data is extracted from here.
- `nodered/` - An optional submodule from [node-red/node-red](https://github.com/node-red/node-red) for collecting live weather data.
- `flows.json` - The NodeRED flow used to collect realtime weather data.
- `download_octopus_gas.{js,sh}` - The script used to connect to Octopus for energy consumption.
- `heatsheet-json2csv.{js,sh}` - The script used to transfrom heatsheet JSON into CSV format.
- `octopus.example.creds.json`- Credentials consumed by the Octopus API. See details below.
- `run_heatsheet.sh` - Convenience script to run the heatsheet application.

## Steps Taken

1. Weather: Download hourly weather for your location from OpenWeatherMap. Since the amount of data doesn't affect the cost of bulk data, you may as well select an earlier start date than you think you need in case it becomes useful later.
    - NodeRED can be configured to collect weather data using the free API to collect this data in realtime. Follow the [instructions](https://nodered.org/#get-started) to get started, then [import `flows.json`](https://nodered.org/docs/user-guide/editor/workspace/import-export) and enter your [OpenWeather API key](https://home.openweathermap.org/api_keys). With default settings, you can navigate to `localhost:1880/openweather` to download the most recent CSV data, though it will contain only a description of the weather, a timestamp, and the temperatures measured in degrees celcius.
2. Indoor Temperatures: 
    1. Follow the steps in [`heatsheet/README`](/heatsheet/README.md) to start the server. 
        - Don't use InfluxDB, stick with the default JSON data storage.
        - Once you've configured credentials in `config.json`, you can use `run_heatsheet.sh` to quickly start the server again.
        - Let the server run a migration of all data it can access. This will update each time it is run.
    2. Run `extract_heatsheet_csv.sh` to transform the data collected into a digestable CSV format.
        - This CSV does *not* contain daily information. Modify the scripts or aggregate the hourly data to get this.
3. Gas Consumption:
    1. Rename `octopus.example.creds.json` to `octopus.creds.json`.
    2. Add your API key, obtained from your [dashboard](https://octopus.energy/dashboard/new/accounts/personal-details/api-access), and meter details.
    3. Run `download_octopus_gas.sh`. This will create `octopus-gas.csv`.

**Downstream use:** Any spreadsheet software can be used to modify and combine the data sources into one document.

//todo: add example spreadsheet for calculating heat loss