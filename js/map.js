var map;

function initialize() {
    var mapOptions = {
        center: { lat: 52.088301, lng: 5.122719 },
        minZoom: 8,
        maxZoom: 16,
        zoom: 10,
        streetViewControl: false
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    $(document).ready(function() {
        getLines();
    });
}
google.maps.event.addDomListener(window, 'load', initialize);

function addStop(map, name, latLong, content) {
    var marker = new google.maps.Marker({
        position: latLong,
        map: map,
        title: 'Hello World!'
    });

    var infoWindow = new google.maps.InfoWindow({
        content: content
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map, marker);
    });

    var markerData = {};
    markerData.marker = marker;
    markerData.infoWindow = infoWindow;

    markers.push(marker);

    return markerData;
}

var lines = {};
var stops = {};
var markers = [];

var nsStations = {};

function getLines() {
    $.ajax({
        type: "get",
        url: "http://v0.ovapi.nl/line/",
        dataType: 'json',

        success: function(json) {
            var lineRequests = [];

            var index = 0;
            $.each(json, function(lineNumber, line) {
                lines[lineNumber] = {};
                lines[lineNumber].line = line;
                lines[lineNumber].line.StopId = "NotYetGenerated";

                index++;
            });

            index = 0;
            var cutOff = 150;
            var string = "line/";

            $.each(lines, function(line, _) {
                if(index == cutOff) {
                    string = string.slice(0, -1);
                    lineRequests.push(string);

                    index = 0;
                    string = "line/";
                }

                string += line + ",";

                index++;
            });

            string = string.slice(0, -1);
            lineRequests.push(string);

            //console.log(lines);

            getStops(lineRequests);
        }
    });
}

function getStops(lineRequests) {
    $.each(lineRequests, function(index, data) {
        //toast('I am a toast!', 3000)
        setTimeout(function() {
            $.ajax({
                type: "get",
                url: "http://v0.ovapi.nl/" + data,
                dataType: 'json',
                async: false, // let's synchronize

                success: function (json) {
                    $.each(json, function (lineNumber, data) {
                        lines[lineNumber].line.StopId = [];
                        $.each(data, function (key, value) {
                            if (key == "Network") {
                                $.each(value, function (stopNumber, object) {
                                    stops[stopNumber] = object;
                                    lines[lineNumber].line.StopId.push(stopNumber);
                                });
                            }
                        });
                    });

                    var currentContent = $('.loading-status').html();
                    var newContent = currentContent + "Data Blok " + (index + 1) + ", ";
                    $('.loading-status').html(newContent);

                    if(index == lineRequests.length - 1) {
                        newContent = currentContent + "GEREED!";
                        $('.loading-status').html(newContent);

                        prepareUI();
                    }
                }
            });
        }, 0);
    });
}

function prepareUI() {
    // remove preload
    $('#preload').remove();
    // enable the map
    $('#map-canvas').removeClass('hidden');
    // regenerate the map
    google.maps.event.trigger(map, "resize");

    $('.bus').hide();
    $('.tram').hide();
    $('.metro').hide();
    $('.train').hide();

    // enable mainmenu
    $('.main-menu').removeClass('hidden');

    // enable modal
    $('.modal-trigger').leanModal();

    /*
    var index = 0;
    $.each(lines, function(lineNumber, object) {
        if(object.line.StopId in stops) {
            var route = stops[object.line.StopId];

            $.each(route, function(_, stop) {
                var markerData = addStop(map, "BusStop", new google.maps.LatLng(stop.Latitude, stop.Longitude), "bushalte");
                markerData.marker.setLabel(object.line.LinePublicNumber);
            });

            index++;
            if(index == 10) {
                return false;
            }
        }
    });*/
}

// Gets actual line data
function getLineActuals(lineId) {
    var jsonObject;

    $.ajax({
        type: "get",
        url: "http://v0.ovapi.nl/line/" + lineId,
        dataType: 'json',
        async: false,

        success: function(json) {
            jsonObject = json;
        }
    });

    return jsonObject;
}

/*function addMarkers() {
    $.each(stops, function(stopNumber, value) {
        $.each(value, function(stopStepId, object) {
            //console.log(object);
            var content = "IsTimingStop: " + object.IsTimingStop + "<br/>Code: " + object.TimingPointCode + "<br/>Name: " + object.TimingPointName + "<br/>Town: " + object.TimingPointTown;
            var contentWindow = addStop(map, "BusStop", new google.maps.LatLng(object.Latitude, object.Longitude), content);

            addLinesByStop(stopNumber, contentWindow);
        });
    });
}

function addLinesByStop(stopId, contentWindow) {
    $.each(lines, function(lineNumber, object) {
        if(object.line.StopId == stopId) {
            var content = contentWindow.getContent();

            content += "<hr/>LineNumber: " + lineNumber + "<br/>LineName: " + object.line.LineName + "<br/>PublicLineNumber: " + object.line.LinePublicNumber + "<br/>Type: " + object.line.TransportType;

            contentWindow.setContent(content);
        }
    });
    return false;
}*/

function getStopsByLine(lineNumber) {
    //console.log(lines[lineNumber].line);

    if(lines[lineNumber].line.StopId in stops) {
        console.log("Found stop! This line drives through: ");
        console.log(stops[lines[lineNumber].line.StopId]);
    }
    else {
        console.log("Didnt find stop!");
    }
}

function getBusLine(lineNumber) {
    var busLines = [];

    $.each(lines, function(_lineNumber, object) {
        if(lineNumber == object.line.LinePublicNumber && object.line.TransportType == "BUS") {
            var busLine = {};
            busLine.LineId = _lineNumber;
            busLine.DestinationName = object.line.DestinationName50;
            busLine.LineName = object.line.LineName;
            busLine.LineDirection = object.line.LineDirection;
            busLine.StopId = object.line.StopId;

            busLines.push(busLine);
        }
    });

    return busLines;
}

function getTramLine(destination) {
    var tramLines = [];

    $.each(lines, function(_lineNumber, object) {
        if(object.line.TransportType == "TRAM") {
            if(destination.length > 0 && (object.line.DestinationName50.toLowerCase().indexOf(destination.toLowerCase()) != -1 || object.line.LineName.toLowerCase().indexOf(destination.toLowerCase()) != -1)) {
                var tramLine = {};
                tramLine.LineId = _lineNumber;
                tramLine.DestinationName = object.line.DestinationName50;
                tramLine.LineName = object.line.LineName;
                tramLine.LineDirection = object.line.LineDirection;
                tramLine.StopId = object.line.StopId;

                tramLines.push(tramLine);
            }
        }
    });

    return tramLines;
}

function getMetroLine(destination) {
    var metroLines = [];

    $.each(lines, function(_lineNumber, object) {
        if(object.line.TransportType == "METRO") {
            if(destination.length > 0 && (object.line.DestinationName50.toLowerCase().indexOf(destination.toLowerCase()) != -1 || object.line.LineName.toLowerCase().indexOf(destination.toLowerCase()) != -1)) {
                var metroLine = {};
                metroLine.LineId = _lineNumber;
                metroLine.DestinationName = object.line.DestinationName50;
                metroLine.LineName = object.line.LineName;
                metroLine.LineDirection = object.line.LineDirection;
                metroLine.StopId = object.line.StopId;

                metroLines.push(metroLine);
            }
        }
    });

    return metroLines;
}

function getTrainStation(destination) {
    var trainStations = [];

    $.each(nsStations.station, function(index, object) {
        if(destination.length > 0 && (object.name.toLowerCase().indexOf(destination.toLowerCase()) != -1)) {
            trainStations.push(object);
        }
    });

    return trainStations;
}

function deleteAllMarkers() {
    $('.map-marker-label').remove();

    for(var i = 0; i < markers.length; i++) {
        markers[i].setLabel("");
        markers[i].setMap(null);
    }
}


