const API_KEY = "99bfaa1002e5b0c82478c87d88df4f99";
let today = dayjs();

startApp();

function startApp() {
  recentlySearched();
}

$("#forecast-button").on("click", function (event) {
  event.preventDefault();
  let city = $(this).siblings(".city").val();

  city = city.trim().toLowerCase();

  if (city === "") {
    alert("Please enter a city!");
    return;
  } else {
    cities = getCities();
    getCurrentWeather(city);
    getForecast(city);
    //checking to see if the searched city is already in local storage, if not then add it
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem("cities", JSON.stringify(cities));
      recentlySearched();
    }
  }
});

$(".recent-button").on("click", function (event) {
  event.preventDefault();
  getCurrentWeather($(this).attr("data-city"));
  getForecast($(this).attr("data-city"));
});

function getCities() {
  if ("cities" in localStorage) {
    return JSON.parse(localStorage.getItem("cities"));
  } else {
    return [];
  }
}

function recentlySearched() {
  const cities = getCities();
  $(".recently-searched").empty();
  if (cities.length != 0) {
    $(".recently-searched").append(
      $("<h6>").addClass("mt-3").text("Recently Searched")
    );
    for (let i = 0; i < 5; i++) {
      if (cities[i]) {
        $(".recently-searched").append(
          $("<button>")
            .addClass("m-2 btn btn-secondary recent-button")
            .text(cities[i].toUpperCase())
            .attr("data-city", cities[i])
        );
      }
    }
  }
}

function getCurrentWeather(city) {
  let queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric&appid=" +
    API_KEY;

  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      $("#today").empty();
      $("#today").append(
        $("<div>").addClass(
          "mt-4 p-5 bg-success text-white rounded current-weather col-8"
        )
      );
      $(".current-weather").append($("<h1>").text(city.toUpperCase()));
      $(".current-weather").append(
        $("<p>").text(today.format("D MMM YYYY")).addClass("fw-bold bg-primary")
      );
      $(".current-weather").append(
        $("<p>")
          .text("Temp: " + data.main.temp + "°C")
          .addClass("fw-bold bg-secondary")
      );
      $(".current-weather").append(
        $("<p>").text("Feels Like: " + data.main.feels_like + "°C")
      );
      $(".current-weather").append(
        $("<p>")
          .text("Min Temp: " + data.main.temp_min + "°C")
          .addClass("fw-bold bg-info")
      );
      $(".current-weather").append(
        $("<p>")
          .text("Max Temp: " + data.main.temp_max + "°C")
          .addClass("fw-bold bg-danger")
      );
      $(".current-weather").append(
        $("<p>").text("Humidity: " + data.main.humidity + "%")
      );
    });
}

function getForecast(city) {
  let queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&units=metric&appid=" +
    API_KEY;
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let forecastArray = bulidForecastArray(data.list);
      let datesArray = generateDates();
      displayWeeks(datesArray, forecastArray);
    });
}

function displayWeeks(datesArray, forecastArray) {
  $("#forecast").empty();
  for (let i = 0; i < 5; i++) {
    let weatherCard = createWeatherCard(
      datesArray[i],
      forecastArray[i].main.temp,
      forecastArray[i].main.feels_like,
      forecastArray[i].main.temp_min,
      forecastArray[i].main.temp_max,
      forecastArray[i].main.humidity
    );
    $("#forecast").append(weatherCard);
  }
}

function createWeatherCard(
  date,
  temperature,
  feels_like,
  temp_min,
  temp_max,
  humidity
) {
  var card = `<div class="col-md-2 mt-3">
                        <div class="card bg-info" >
                            <div class="card-body">
                                <h5 class="card-title">${date}</h5>
                                <p class="card-text">Temperature: ${temperature}°C</p>
                                <p class="card-text">Feels Like: ${feels_like}°C</p>
                                <p class="card-text">Min Temp: ${temp_min}°C</p>
                                <p class="card-text">Max Temp: ${temp_max}°C</p>
                                <p class="card-text">Humidity: ${humidity}%</p>
                            </div>
                        </div>
                    </div>`;
  return card;
}

function generateDates() {
  dates = [];
  for (let i = 0; i < 6; i++) {
    let date = dayjs().add(i, "day").format("D/MMM/YYYY");
    dates.push(date);
  }
  return dates;
}

function bulidForecastArray(forecastDump) {
  forecastArray = [];
  prev_date = "";
  for (let i = 0; i < forecastDump.length; i++) {
    let current_day =
      forecastDump[i].dt_txt.charAt(8) + forecastDump[i].dt_txt.charAt(9);
    if (current_day !== prev_date) {
      forecastArray.push(forecastDump[i]);
    }
    prev_date = current_day;
  }
  return forecastArray;
}
