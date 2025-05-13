const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function (req, res) {
  const cityId = String(req.body.cityIdInput);
  const units = "imperial";
  const apiKey = "7bd0f3dfa769a0108247a91a4b5d3a0b";

  const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&units=${units}&appid=${apiKey}`;
  console.log("Calling URL:", url);

  https
    .get(url, function (response) {
      let rawData = "";

      response.on("data", function (chunk) {
        rawData += chunk;
      });

      response.on("end", function () {
        try {
          const weatherData = JSON.parse(rawData);
          console.log("API response:", weatherData);

          if (!weatherData.main || !weatherData.weather) {
            res.send("<h1>Invalid City ID or no data found.</h1>");
            return;
          }

          const temp = weatherData.main.temp;
          const city = weatherData.name;
          const description = weatherData.weather[0].description;
          const icon = weatherData.weather[0].icon;
          const imageURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;
          const humidity = weatherData.main.humidity;
          const windSpeed = weatherData.wind.speed;
          const windDeg = weatherData.wind.deg;
          const cloudiness = weatherData.clouds.all;

          res.setHeader("Content-Type", "text/html");
          res.write(`<h1>Weather in ${city}</h1>`);
          res.write(`<p>${description}</p>`);
          res.write(`<h2>Temperature: ${temp} °F</h2>`);
          res.write(`<p>Humidity: ${humidity}%</p>`);
          res.write(`<p>Wind: ${windSpeed} mph at ${windDeg}°</p>`);
          res.write(`<p>Cloudiness: ${cloudiness}%</p>`);
          res.write(`<img src="${imageURL}" alt="Weather icon">`);
          res.send();
        } catch (error) {
          console.error("Error parsing JSON:", error);
          res.send("<h1>Error retrieving weather data.</h1>");
        }
      });
    })
    .on("error", function (err) {
      console.error("Request failed:", err);
      res.send("<h1>Failed to reach weather service.</h1>");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server running on port ${PORT}`);
});
