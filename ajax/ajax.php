<?php
include '../classes/NSApi.php';

if(isset($_GET["action"]) && $_GET["action"] == "get_station") {
    $api = new NSApi();

    echo $api->getStation($_GET["code"]);
}
?>