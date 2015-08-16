$(document).ready(function() {
    $("input[name='transport_type']").change(function(){
        var id = $(this).attr('id');

        if(id == "bus") {
            $('.tram').hide();
            $('.metro').hide();
            $('.train').hide();

            $(".bus").fadeIn("slow", function() {
                $('.bus').show();
            });
        }
        else if(id == "tram") {
            $('.bus').hide();
            $('.metro').hide();
            $('.train').hide();

            $(".tram").fadeIn("slow", function() {
                $('.tram').show();
            });
        }
        else if(id == "metro") {
            $('.bus').hide();
            $('.tram').hide();
            $('.train').hide();

            $(".metro").fadeIn("slow", function() {
                $('.metro').show();
            });
        }
        else if(id == "train") {
            $('.bus').hide();
            $('.tram').hide();
            $('.metro').hide();

            $(".train").fadeIn("slow", function() {
                $('.train').show();
            });
        }

        $(".bus-line").val('');
        $(".metro-line").val('');
        $(".tram-line").val('');
        $(".train-line").val('');
        $(".dynamic-line-data").html('');
    });

    $(document).on('click', '.close-dynamic-container', function(e) {
        $('.dynamic-container').addClass('hidden');
        $('.ov-right').removeClass('l6').addClass('l9');

        $('.ov-left').removeClass('m6').addClass('m12');
        $('.dynamic-container').removeClass('m6').addClass('m12');

        google.maps.event.trigger(map, "resize");
    });

    $(document).on('click', '.selectable-card-marker', function(e) {
        var latitude = $(this).data('latitude');
        var longitude = $(this).data('longitude');

        google.maps.event.trigger(map, "resize");
        map.setCenter(new google.maps.LatLng(latitude, longitude));
        map.setZoom(16);
    });

    $(document).on('click', '.line-box', function(e) {
        var lineId = $(this).data('lineid');
        var line = lines[lineId];

        $('.line-data-summary').parent().show();

        //console.log("Line:");
        //console.log(line);

        deleteAllMarkers();

        $.each(line.line.StopId, function(_, stopId) {
            var route = stops[stopId];
            $.each(route, function(__, stop) {

                var markerData = addStop(map, "Halte", new google.maps.LatLng(stop.Latitude, stop.Longitude), "<strong>Lijn " + line.line.LinePublicNumber + "</strong><br/>Lijnnaam: " + line.line.LineName + "<br/></br>Halte: " + stop.TimingPointName);
                //markerData.marker.setLabel(stop.UserStopOrderNumber);
            });
        });

        // enable the dynamics!
        $('.dynamic-container').removeClass('hidden');
        $('.ov-right').removeClass('l9').addClass('l6');

        $('.ov-left').removeClass('m12').addClass('m6');
        $('.dynamic-container').removeClass('m12').addClass('m6');

        google.maps.event.trigger(map, "resize");


        toast('Route van ' + line.line.LineName + ' op de map weergegeven', 5000);

        var lineData = getLineActuals(lineId);
        //console.log("LineData:");
        //console.log(lineData);

        // clear
        $(".collapsible.line-data").html('');

        var active = 0;
        var planned = 0;
        var cancelled = 0;

        $.each(lineData, function(lineId, object) {
            $.each(object.Actuals, function(key, actual) {
                //console.log(actual);

                var dataOwnerCode = actual.DataOwnerCode;
                var localServiceLevelCode = actual.LocalServiceLevelCode;
                var linePlanningNumber = actual.LinePlanningNumber;
                var journeyNumber = actual.JourneyNumber;
                var fortifyOrderNumber = actual.FortifyOrderNumber;

                // v0.ovapi.nl/journey/SYNTUS_20141211_203_36132_0
                //console.log(dataOwnerCode + "_" + localServiceLevelCode + "_" + linePlanningNumber + "_" + journeyNumber + "_" + fortifyOrderNumber);

                var colorCode = "";
                if(actual.TripStopStatus == "PASSED" || actual.TripStopStatus == "DRIVING") {
                    colorCode = "white";
                    active++;
                }
                else if(actual.TripStopStatus == "ARRIVED") {
                    colorCode = "blue white-text";
                    active++;
                }
                else if(actual.TripStopStatus == "PLANNED") {
                    colorCode = "teal white-text";
                    planned++;
                }
                else if(actual.TripStopStatus == "CANCEL") {
                    colorCode = "red white-text";
                    cancelled++;
                }

                $(".collapsible.line-data").append('<li> <div class="collapsible-header ' + colorCode + ' actual-data" data-journeyId="' + dataOwnerCode + "_" + localServiceLevelCode + "_" + linePlanningNumber + "_" + journeyNumber + "_" + fortifyOrderNumber + '">' + actual.DestinationName50 + '</div> <div class="collapsible-body"><p>Loading...</p></div> </li>');
            });
        });

        var activeText = "";
        if(active == 0)
            activeText = "rijden op dit moment <strong>geen voertuigen</strong>";
        else if(active == 1)
            activeText = "rijdt op dit moment <strong>1 voertuig</strong>";
        else
            activeText = "rijden op dit moment <strong>" + active + " voertuigen</strong>";

        var plannedText = "";
        if(planned == 0)
            plannedText = "zijn er <strong>geen voertuigen gepland</strong>.";
        else if(planned == 1)
            plannedText = "is er <strong>1 voertuig gepland</strong>.";
        else
            plannedText = "zijn er <strong>" + planned + " voertuigen</strong> gepland.";

        $('.line-data-summary').html('Er ' + activeText + '</strong>. Ook ' + plannedText);

        if(active == 0 && planned == 0 && cancelled == 0) {
            //$(".collapsible.line-data").remove();
        }
        else {
            // enable collapsible
            $('.collapsible.line-data').collapsible();
        }

    });

    // clicked on a riding bus line
    $(document).on('click', '.actual-data', function(e) {
        var body = $(this).next();
        var journeyId = $(this).data('journeyid');

        var nextStopFound = false;

        $.ajax({
            type: "get",
            url: "http://v0.ovapi.nl/journey/" + journeyId,
            dataType: 'json',

            success: function (json) {
                body.html('');
                //console.log(json);
                $.each(json, function (jId, object) {
                    $.each(object.Stops, function (stopId, stopObject) {
                        //console.log(stopObject)
                        var targetArrivalTime = stopObject.TargetArrivalTime.split('T');
                        var targetDepartureTime = stopObject.TargetDepartureTime.split('T');
                        var expectedArrivalTime = stopObject.ExpectedArrivalTime.split('T');
                        var expectedDepartureTime = stopObject.ExpectedDepartureTime.split('T');

                        var divConstructor = "";

                        if(stopObject.TripStopStatus == "PASSED")
                            divConstructor = "<div class='card-panel grey no-border selectable-card-marker' data-latitude='"+ stopObject.Latitude +"' data-longitude='"+ stopObject.Longitude +"'><div class='card-panel white black-text'><h5 class='no-margin'>GEPASSEERD</h5></div><strong>" + stopObject.TimingPointName + "</strong><br/>Doel aankomsttijd: " + targetArrivalTime[1] + "<br/>Doel vertrektijd: " + targetDepartureTime[1] + "<br/><br/>Verwachte aankomsttijd: " + expectedArrivalTime[1] + "<br/>Verwachte vertrektijd: " + expectedDepartureTime[1];
                        else if(stopObject.TripStopStatus == "DRIVING") {
                            if(!nextStopFound) {
                                divConstructor = "<div class='card-panel white no-border selectable-card-marker' data-latitude='"+ stopObject.Latitude +"' data-longitude='"+ stopObject.Longitude +"'><div class='card-panel red white-text'><h5 class='no-margin'>VOLGENDE STOP</h5></div><strong>" + stopObject.TimingPointName + "</strong><br/>Doel aankomsttijd: " + targetArrivalTime[1] + "<br/>Doel vertrektijd: " + targetDepartureTime[1] + "<br/><br/>Verwachte aankomsttijd: " + expectedArrivalTime[1] + "<br/>Verwachte vertrektijd: " + expectedDepartureTime[1];
                                nextStopFound = true;
                            }
                            else {
                                divConstructor = "<div class='card-panel teal no-border white-text selectable-card-marker' data-latitude='"+ stopObject.Latitude +"' data-longitude='"+ stopObject.Longitude +"'><div class='card-panel white black-text'><h5 class='no-margin'>GEPLAND</h5></div><strong>" + stopObject.TimingPointName + "</strong><br/>Doel aankomsttijd: " + targetArrivalTime[1] + "<br/>Doel vertrektijd: " + targetDepartureTime[1] + "<br/><br/>Verwachte aankomsttijd: " + expectedArrivalTime[1] + "<br/>Verwachte vertrektijd: " + expectedDepartureTime[1];
                            }
                        }
                        else if(stopObject.TripStopStatus == "PLANNED")
                            divConstructor = "<div class='card-panel teal no-border white-text selectable-card-marker' data-latitude='"+ stopObject.Latitude +"' data-longitude='"+ stopObject.Longitude +"'><div class='card-panel white black-text'><h5 class='no-margin'>GEPLAND</h5></div><strong>" + stopObject.TimingPointName + "</strong><br/>Doel aankomsttijd: " + targetArrivalTime[1] + "<br/>Doel vertrektijd: " + targetDepartureTime[1] + "<br/><br/>Verwachte aankomsttijd: " + expectedArrivalTime[1] + "<br/>Verwachte vertrektijd: " + expectedDepartureTime[1];
                        else if(stopObject.TripStopStatus == "CANCEL")
                            divConstructor = "<div class='card-panel red no-border white-text selectable-card-marker' data-latitude='"+ stopObject.Latitude +"' data-longitude='"+ stopObject.Longitude +"'><div class='card-panel white black-text'><h5 class='no-margin'>GEANNULEERD</h5></div><strong>" + stopObject.TimingPointName + "</strong><br/>Doel aankomsttijd: " + targetArrivalTime[1] + "<br/>Doel vertrektijd: " + targetDepartureTime[1] + "<br/><br/>Verwachte aankomsttijd: " + expectedArrivalTime[1] + "<br/>Verwachte vertrektijd: " + expectedDepartureTime[1];
                        else if(stopObject.TripStopStatus == "ARRIVED")
                            divConstructor = "<div class='card-panel blue no-border white-text selectable-card-marker' data-latitude='"+ stopObject.Latitude +"' data-longitude='"+ stopObject.Longitude +"'><div class='card-panel white black-text'><h5 class='no-margin'>GEARRIVEERD</h5></div><strong>" + stopObject.TimingPointName + "</strong><br/>Doel aankomsttijd: " + targetArrivalTime[1] + "<br/>Doel vertrektijd: " + targetDepartureTime[1] + "<br/><br/>Verwachte aankomsttijd: " + expectedArrivalTime[1] + "<br/>Verwachte vertrektijd: " + expectedDepartureTime[1];

                        var expected = expectedArrivalTime[1];
                        var target = targetArrivalTime[1];

                        var expectedUnix = new Date(expectedArrivalTime[0] + " " + expectedArrivalTime[1].replace(/-/g, "/")).valueOf();
                        var targetUnix = new Date(targetArrivalTime[0] + " " + targetArrivalTime[1].replace(/-/g, "/")).valueOf();

                        var delay;

                        // late
                        if(expectedUnix >= targetUnix) {
                            delay = moment.utc(moment(expected,"HH:mm:ss").diff(moment(target,"HH:mm:ss"))).format("HH:mm:ss");

                            if(delay != "00:00:00") {
                                divConstructor += '<div class="card-panel white"><span class="red-text"><strong>Vertraging van ' + delay + '</strong></span></div>';
                            }
                        }
                        else {
                            delay = moment.utc(moment(target,"HH:mm:ss").diff(moment(expected,"HH:mm:ss"))).format("HH:mm:ss");

                            if(delay != "00:00:00") {
                                divConstructor += '<div class="card-panel white"><span class="purple-text"><strong>Versnelling van ' + delay + '</strong></span></div>';
                            }
                        }

                        divConstructor += "</div>";

                        body.append(divConstructor);
                    });
                });
            }
        });
    });

    $(document).on('click', '.station-box', function(e) {
        var stationCode = $(this).data('codeid');

        $('.line-data-summary').parent().hide();
        $(".collapsible.line-data").html('');

        var latitude = $(this).data('lat');
        var longitude = $(this).data('long');

        $.ajax({
            type: "get",
            url: "ajax/ajax.php",
            data: { action: "get_station", code: stationCode },
            dataType: 'xml',

            success: function(xml) {
                $(xml).find("VertrekkendeTrein").each(function() {
                    var trainInfo = "";
                    if($(this).find("RouteTekst").length > 0) {
                        trainInfo += "Via " + $(this).find("RouteTekst").text() + "<br/>";
                    }
                    trainInfo += "Vertrekt van spoor " + $(this).find("VertrekSpoor").text() + "<br/>";

                    var extraContent = "";
                    if($(this).find("VertrekVertragingTekst").length > 0) {
                        extraContent += "Vertraging van " + $(this).find("VertrekVertragingTekst").text() + "<br/>";
                    }
                    if($(this).find("ReisTip").length > 0) {
                        extraContent += "Bevat een reistip<br/>";
                        trainInfo += "<br/>Reistip: " + $(this).find("ReisTip").text() + "<br/>";
                    }
                    if($(this).find("Opmerkingen").length > 0) {
                        trainInfo += "<br/><span class='red-text'>";
                        $(this).find("Opmerkingen").each(function() {
                            trainInfo += $(this).find("Opmerking").text() + "<br/>";
                        });
                        trainInfo += "</span><br/>";

                        extraContent += "Bevat een opmerking<br/>";
                    }
                    trainInfo += "Uitgevoerd door " + $(this).find("Vervoerder").text()

                    if(extraContent.length <= 0) {
                        $(".collapsible.line-data").append('<li> <div class="collapsible-header" style="padding-bottom: 15px;">' + $(this).find("EindBestemming").text() + '<span class="pull-right grey-text">' + $(this).find("TreinSoort").text() + '</span><div class="card-panel white">Vertrekt om ' + $(this).find("VertrekTijd").text().split('T')[1].split('+')[0] + '</div></div> <div class="collapsible-body"><p>'+trainInfo+'</p></div> </li>');
                    }
                    else {
                        $(".collapsible.line-data").append('<li> <div class="collapsible-header" style="padding-bottom: 15px;">' + $(this).find("EindBestemming").text() + '<span class="pull-right grey-text">' + $(this).find("TreinSoort").text() + '</span><div class="card-panel white">Vertrekt om ' + $(this).find("VertrekTijd").text().split('T')[1].split('+')[0] + '<br/><span class="red-text">' + extraContent + '</span></div></div> <div class="collapsible-body"><p>'+trainInfo+'</p></div> </li>');
                    }
                });

                $('.collapsible.line-data').collapsible();
            }
        });

        // enable the dynamics!
        $('.dynamic-container').removeClass('hidden');
        $('.ov-right').removeClass('l9').addClass('l6');

        $('.ov-left').removeClass('m12').addClass('m6');
        $('.dynamic-container').removeClass('m12').addClass('m6');

        google.maps.event.trigger(map, "resize");

        deleteAllMarkers();
        addStop(map, "Station", new google.maps.LatLng(latitude, longitude), "<strong>Station</strong>");

        map.setCenter(new google.maps.LatLng(latitude, longitude));
        map.setZoom(16);
    });

    $('.bus-line').keyup(function(){
        var line = getBusLine($(".bus-line").val());

        $(".dynamic-line-data").html('');
        $.each(line, function(_, object) {
            $(".dynamic-line-data").append('<div class="card-panel white line-box" data-lineid="'+ object.LineId +'"><strong><span class="black-text">' + object.DestinationName + '</span></strong><br/><span class="grey-text">' + object.LineName + '</span></div>');
        });
    });

    $('.tram-line').keyup(function(){
        var line = getTramLine($(".tram-line").val());

        $(".dynamic-line-data").html('');
        $.each(line, function(_, object) {
            $(".dynamic-line-data").append('<div class="card-panel white line-box" data-lineid="'+ object.LineId +'"><strong><span class="black-text">' + object.DestinationName + '</span></strong><br/><span class="grey-text">' + object.LineName + '</span></div>');
        });
    });

    $('.metro-line').keyup(function(){
        var line = getMetroLine($(".metro-line").val());

        $(".dynamic-line-data").html('');
        $.each(line, function(_, object) {
            $(".dynamic-line-data").append('<div class="card-panel white line-box" data-lineid="'+ object.LineId +'"><strong><span class="black-text">' + object.DestinationName + '</span></strong><br/><span class="grey-text">' + object.LineName + '</span></div>');
        });
    });

    $('.train-line').keyup(function(){
        var stations = getTrainStation($(".train-line").val());

        $(".dynamic-line-data").html('');
        $.each(stations, function(_, object) {
            //console.log(object);
            $(".dynamic-line-data").append('<div class="card-panel white station-box" data-codeid="'+ object.code +'" data-lat="'+ object.lat +'" data-long="'+ object.long +'"><strong><span class="black-text">' + object.name + '</span></strong><br/><span class="grey-text">' + object.code + '</span></div>');
        });
    });
});
