# Boomi Flow UI Offline

<<<<<<< HEAD
Services and components used by the [Boomi Flow](https://boomi.com/flow) UI framework to support running flows offline.

## How it Works

The offline functionality works by intercepting network requests that would have gone to the API, inspecting the metadata of the flow
(that is cached locally) then simulating a response. The rest of the UI framework is unaware of this and continues to function
as normal by interpretting the response and rendering components.

A build task, described further down, pulls down the package of the flow which contains all the metadata. This allows the offline
simulation to respond e.g. the user clicked a button and the next map element is a page so generate a page response etc.

As the user moves through the flow any request that would have gone to the API is saved to the client. When the user goes back
online the list of saved requests is displayed, the user can choose to replay all of the requests in sequence, replay requests
out of sequence, or delete the requests.

If the flow is protected with an authentication mechanism and the user's previous session has timed out they will be asked
to re-authenticate before they can replay the saved requests. 

### Data Caching

If the flow contains any data loads either in load map elements or objectdata requests from a table (or other component) when
the user goes offline each data load is fired immediately to cache a local copy of the data.

By default 250 records from each data load will be cached on the client. This is controlled by the `offline.cache.requests.limit` setting.

### Data Storage

By default cached data will be stored using the IndexedDB mechnaism, with a fallback to WebSQL. More information on these when
running in a cordova environment can be found here: https://cordova.apache.org/docs/en/latest/cordova/storage/storage.html
=======
Services and components used by the [Boomi Flow](https://boomi.com/platform/flow/) UI framework to support running flows offline.
>>>>>>> feature/CORE-4441

## Usage

### Building

To build the ui-offline you will need to have [nodejs](http://nodejs.org/) installed.

Then install dependencies:

```
npm install
```

Then run the dev build:

```
npm start
```

Or dist build:

```
npm run dist
```

### Running locally

Before you can run a flow offline you will need to grab a copy of the flow's metadata:

Where `--tenant` is the id of the tenant that contains the flow, `--flow` is the flow id and `--flowVersionId` is the flow version id.

```
npm run offline -- --username=example@example.com --password=example --flow=abc123 --tenant=abc123 --flowVersionId=abc123
```

This will create a metadata.js file in `../ui-html5/build/js`.

To include the offline components you will need to add the following references to debug.html in the ui-html5 repo:

```
<script src="build/js/metadata.js"></script>
<script src="build/js/ui-offline.js"></script>
```

### Running Unit Tests

This project uses the [Jest](https://jestjs.io/) and [Enzyme](https://github.com/airbnb/enzyme) testing libraries. Run the tests with the following:

```
npm run test
```

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-offline is released under our shared source license: https://manywho.com/sharedsource