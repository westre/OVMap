<?php

class NSApi {

    public function __construct() {

    }

    public function getStations() {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://webservices.ns.nl/ns-api-stations");
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_USERPWD, 'kevdekorte@hotmail.com:i_v4qmQMROaM0Ypi-cUBWxRGuOpSTBHcp--euD-WGWkmHvx_xIjJMg');//GB veranderen in gebruikersnaam en WW veranderen in wachtwoord. Dubbele punt laten staan

        $response = curl_exec($ch);

        curl_close($ch);

        return $response;
    }

    public function getStation($code) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://webservices.ns.nl/ns-api-avt?station=" . $code);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_USERPWD, 'kevdekorte@hotmail.com:i_v4qmQMROaM0Ypi-cUBWxRGuOpSTBHcp--euD-WGWkmHvx_xIjJMg');//GB veranderen in gebruikersnaam en WW veranderen in wachtwoord. Dubbele punt laten staan

        $response = curl_exec($ch);

        curl_close($ch);

        return $response;
    }
}

?>