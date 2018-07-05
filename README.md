# Boomi Flow UI Offline

Services and components used by the [Boomi Flow](https://boomi.com/platform/flow/) UI framework to support running flows offline.

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