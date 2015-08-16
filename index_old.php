<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include 'classes/NSApi.php';
include 'classes/Mobile_Detect.php';

$detect = new Mobile_Detect;

if($detect->isMobile()){
    header('Location: http://m.ovactueel.nl');
}
?>

<!DOCTYPE html>
<html>
    <head>
        <link type="text/css" rel="stylesheet" href="css/style.css">
        <link type="text/css" rel="stylesheet" href="css/materialize.min.css"  media="screen,projection"/>

        <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAIL6KOpnqPQC94QjAaExGRfdBy7pwcCa8"></script>
        <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
        <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js"></script>

        <script type="text/javascript" src="js/materialize.min.js"></script>
        <script type="text/javascript" src="js/marker.js"></script>
        <script type="text/javascript" src="js/map.js"></script>
        <script type="text/javascript" src="js/events.js"></script>
    </head>
    <body>
        <div id="ov-container">
            <div class="ov-container-left main-container">
                <div class="row">
                    <div class="col l12 m12 s12">
                        <div class="card-panel red">
                            <h3 class="white-text center">OV Actueel</h3>
                        </div>
                        <div class="card-panel white main-menu hidden">
                            <div class="row">
                                <div class="col l3 m6 s12">
                                    <input name="transport_type" type="radio" id="bus" />
                                    <label for="bus">Bus</label>
                                </div>
                                <div class="col l3 m6 s12">
                                    <input name="transport_type" type="radio" id="train" />
                                    <label for="train">Trein</label>
                                </div>
                                <div class="col l3 m6 s12">
                                    <input name="transport_type" type="radio" id="tram" />
                                    <label for="tram">Tram</label>
                                </div>
                                <div class="col l3 m6 s12">
                                    <input name="transport_type" type="radio" id="metro" />
                                    <label for="metro">Metro</label>
                                </div>
                            </div>
                            <!-- BUS -->
                            <div class="bus">
                                <div class="row">
                                    <div class="input-field col l12 m12 s12">
                                        <input id="line" class="bus-line" type="text" required>
                                        <label for="line">Lijnnummer</label>
                                    </div>
                                </div>
                            </div>
                            <!-- END OF BUS -->
                            <!-- TRAM -->
                            <div class="tram">
                                <div class="row">
                                    <div class="input-field col l12 m12 s12">
                                        <input id="line" class="tram-line" type="text" required>
                                        <label for="line">Lijnnaam</label>
                                    </div>
                                </div>
                            </div>
                            <!-- END OF TRAM -->
                            <!-- METRO -->
                            <div class="metro">
                                <div class="row">
                                    <div class="input-field col l12 m12 s12">
                                        <input id="line" class="metro-line" type="text" required>
                                        <label for="line">Lijnnaam</label>
                                    </div>
                                </div>
                            </div>
                            <!-- END OF METRO -->
                            <!-- TRAIN -->
                            <div class="train">
                                <div class="row">
                                    <div class="input-field col l12 m12 s12">
                                        <input id="line" class="train-line" type="text" required>
                                        <label for="line">Station</label>
                                    </div>
                                </div>
                            </div>
                            <!-- END OF TRAIN -->
                        </div>
                        <div class="dynamic-line-data"></div>
                        <?php
                        $api = new NSApi();
                        $xml = new SimpleXMLElement($api->getStations());
                        ?>
                        <script>
                            nsStations = <?php echo json_encode($xml);?>;
                        </script>
                    </div>
                </div>
            </div>
            <div class="ov-container-left dynamic-container hidden">
                <div class="row">
                    <div class="col l12 m12 s12">
                        <a class="waves-effect waves-light btn close-dynamic-container no-border">X</a>
                    </div>
                </div>
                <div class="row">
                    <div class="col l12 m12 s12">
                        <div class="card-panel white">
                            <h6 class="black-text center line-data-summary">undefined</h6>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col l12 m12 s12">
                        <ul class="collapsible line-data">
                            <li>
                                <div class="collapsible-header">First</div>
                                <div class="collapsible-body"><p>Lorem ipsum dolor sit amet.</p></div>
                            </li>
                            <li>
                                <div class="collapsible-header">Second</div>
                                <div class="collapsible-body"><p>Lorem ipsum dolor sit amet.</p></div>
                            </li>
                            <li>
                                <div class="collapsible-header">Third</div>
                                <div class="collapsible-body"><p>Lorem ipsum dolor sit amet.</p></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div id="ov-container-right" class="ov-container-right-static">
                <div id="map-canvas" class="hidden"></div>
                <div id="preload">
                    <div class="container">
                        <div class="row">
                            <div class="col l8 offset-l2">
                                <div class="card-panel white center">
                                    <span class="black-text">
                                        We zijn even alle actuele data aan het ophalen. Een ogenblikje a.u.b.
                                    </span><br/><br/><br/>
                                    <div class="preloader-wrapper big active">
                                        <div class="spinner-layer spinner-blue">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>

                                        <div class="spinner-layer spinner-red">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>

                                        <div class="spinner-layer spinner-yellow">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>

                                        <div class="spinner-layer spinner-green">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <br/><br/><br/>
                                    <span class="blue-grey-text loading-status"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="clear"></div>
        </div>

        <a class="waves-effect white black-text waves-red btn feedback-btn z-depth-3 modal-trigger" href="#feedback-modal">Feedback</a>

        <div id="feedback-modal" class="modal">
            <div class="row">
                <div class="col s12">
                    <h4>Feedback</h4>
                    <p>Gezien het feit dat dit een nieuwe website is, ontvangen we graag uw feedback. Denkt u dat informatie beter kan worden weergegeven of dat het niet allemaal fijn werkt of heeft u misschien andere verbeterpunten? Laat het ons weten door het hieronder op te schrijven. Bij voorbaat dank!</p>
                </div>
            </div>

            <div class="row">
                <form class="col s12">
                    <div class="row">
                        <div class="input-field col s12">
                            <textarea class="materialize-textarea" required></textarea>
                            <label>Feedback</label>
                        </div>
                    </div>
                </form>
            </div>
            <a href="#" class="waves-effect waves-red btn-flat modal-close">Sluiten</a>
        </div>
    </body>
</html>