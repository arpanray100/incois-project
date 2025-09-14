const mongoose = require("mongoose");
const Location = require("./models/Location");

mongoose.connect("mongodb://127.0.0.1:27017/incois", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

const locations = [
  { name: "Shelter A", type: "shelter", latitude: 10.610, longitude: 75.220, address: "Near Main Street, City" },
  { name: "Shelter B", type: "shelter", latitude: 10.615, longitude: 75.225, address: "East Side Park, City" },
  { name: "NGO Help Center 1", type: "ngo", latitude: 10.620, longitude: 75.230, address: "Downtown, City" },
  { name: "NGO Help Center 2", type: "ngo", latitude: 10.625, longitude: 75.235, address: "West Side, City" }
];

Location.insertMany(locations)
  .then(() => {
    console.log("Locations inserted ✅");
    mongoose.connection.close();
  })
  .catch(err => console.log(err));
