# ManyWho UI Offline

Services and components used by the [ManyWho](https://manywho.com) UI framework to support running flows offline.

## Usage

### Building

To build the ui-offline you will need to have [nodejs](http://nodejs.org/), [gulp](http://gulpjs.com/) and [typings](https://github.com/typings/typings) installed.

Then install dependencies:

```
npm install
typings install
```

Then run the dev build:

```
gulp watch
```

Or dist build:

```
gulp dist
```

### Running

Before you can run a flow offline you will need to grab a copy of the flow's metadata via the metadata task:

```
gulp metadata --username="" --password="" --flow=""
```

This will create a metadata.ts file which will be included as part of the regular build. After getting the metadata start the normal build process with:

```
gulp watch
```

To include the offline components you will need to add the following references to debug.html in the ui-html5 repo:

```
<link rel="stylesheet" href="build/css/ui-offline.css" />
<script src="build/js/ui-offline.js"></script>
```

These references assume that the build was run with --build switch pointing to the `ui-html5/build` directory.

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-offline is released under our shared source license: https://manywho.com/sharedsource