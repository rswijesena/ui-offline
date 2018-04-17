# ManyWho UI Offline

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

### Running

To include the offline components you will need to add the following references to debug.html in the ui-html5 repo:

```
<script src="build/js/ui-offline.js"></script>
```

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-offline is released under our shared source license: https://manywho.com/sharedsource