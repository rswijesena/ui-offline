# Boomi Flow UI Offline

Services and components used by the [ManyWho](https://manywho.com) UI framework to support running flows offline.

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

Where `--tenant` is the id of the tenant that contains the flow and flow `--flow` is the flow name.

```
npm run offline -- --username=example@example.com --password=example --flow=abc123 --tenant=abc123
```

This will create a metadata.js file in `../ui-html5/build/js`.

To include the offline components you will need to add the following references to debug.html in the ui-html5 repo:

```
<script src="build/js/metadata.js"></script>
<script src="build/js/ui-offline.js"></script>
```

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-offline is released under our shared source license: https://manywho.com/sharedsource