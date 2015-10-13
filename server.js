function City (name) {
    this.city = name;
}
City.prototype.search = function (regEx) {
    return this.city.toLowerCase().search(regEx);
};

function CityCollection() {
    this.cities = [];
}
CityCollection.prototype.addCity = function (city) {
    this.cities.push(city);
};
CityCollection.prototype.search = function (sting) {
    var reg = new RegExp("^" + sting.toLowerCase());
    var searchResult = new CityCollection();
    for (var i = 0; i < this.cities.length; i++) {
        var result = this.cities[i].search(reg);
        if (result != -1) {
            searchResult.addCity(this.cities[i]);
        }
    }
    return searchResult.getCities();
};
CityCollection.prototype.getCities = function () {
    return this.cities;
};
CityCollection.prototype.getCount = function () {
    return this.cities.length;
};

var fs = require("fs");
var http = require("http");
var url = require("url");
var ROOT_DIR = "html";

var cities = new CityCollection();
fs.readFile("cities.dat.txt", function (err, data) {
    if (err) throw err;
    var cityStrings = data.toString().split("\n");
    for (var i = 0; i < cityStrings.length; i++) {
        cities.addCity(new City(cityStrings[i]));
    }
    console.log(JSON.stringify(cities.search("pro")));
});

http.createServer(function (request, response) {
    var urlObj = url.parse(request.url, true, false);
    if (urlObj.pathname.toLowerCase() == "/getcity") {
        console.log("Searching for '" + urlObj.query.q + "'");
        try {
            var result = cities.search(urlObj.query.q);
            response.writeHead(200);
            console.log(JSON.stringify(result));
            response.end(JSON.stringify(result));
        }
        catch (e) {
            console.log(e + "\n");
            response.writeHead(404);
            response.end("Error: you did not provide a proper query string.");
            return;
        }
    }
    else {
        fs.readFile(ROOT_DIR + urlObj.pathname, function (err, data) {
            console.log("opening " + ROOT_DIR + urlObj.pathname);
            if (err) {
                response.writeHead(404);
                response.end(JSON.stringify(err));
                return;
            }
            response.writeHead(200);
            response.end(data);
        });
    }
    console.log("---By golly! We've done it!---\n");
}).listen(8008);