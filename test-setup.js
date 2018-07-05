const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-14");

enzyme.configure({ adapter: new Adapter() });