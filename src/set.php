<?php 
    array_filter($_POST, 'trim_value');
		
    $pattern = "/[^A-Za-z0-9\s\.\:\-\+\!\@\,\'\"]/";
    $user		= sanitize('user',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $password 	= sanitize('password',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $pattern = "/[^A-Za-z0-9\s\.\:\-\+\.\�\,\'\"]/";
    $lat 	= sanitize('lat',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $lon 	= sanitize('lon',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $vesselType 	= sanitize('vesselType',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);  
    $textBody 	= sanitize('textBody',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $country 	= sanitize('country',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 

    $shoreLat 	= sanitize('shoreLat',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $shoreLon 	= sanitize('shoreLon',FILTER_SANITIZE_SPECIAL_CHARS,$pattern); 
    $date=$_POST['date'];
    $time=$_POST['time'];
    $attackType=$_POST['attackType'];
    $region=$_POST['region'];
    $vesselStatus=$_POST['vesselStatus'];
    $dic= 0;
    $location='null';


    
    
         
    //Connect to db 
    $pgsqlOptions = "host='localhost' dbname='geog5871' user= '$user' password= '$password'";
    $dbconn = pg_connect($pgsqlOptions) or die ('connection failure');
    
    //Return current maximum ID
    $getOID = pg_query($dbconn, "SELECT MAX(oid) FROM pirate_attacks") or die ('Query 1 failed: '.pg_last_error());
    $oid = pg_fetch_result($getOID, 0, 0);
    
    //Increment ID by one to create new row ID
    $oid++; 
    
    $dbconn = pg_connect($pgsqlOptions);
    // $sql=" INSERT INTO pirate_attacks (oid, date, vessel_status, time, longitude, latitude, attack_type,location_description,country,region,shore_distance,shore_longitude,shore_latitude,attack_description,vessel_type) VALUES($oid,$date,$vesselStatus,$time,$lon,$lat,$attackType,$location,$country,$region,$dic,$shoreLon,$shoreLat,$textBody,$vesselType)";
    // $result = pg_query($dbconn, $sql);
    $insertQuery = pg_prepare($dbconn, "my_query", "INSERT INTO pirate_attacks (oid, date, vessel_status, time, longitude, latitude, attack_type,location_description,country,region,shore_distance,shore_longitude,shore_latitude,attack_description,vessel_type) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)");
    $result = pg_execute($dbconn, "my_query", array($oid,$date,$vesselStatus,$time,$lon,$lat,$attackType,$location,$country,$region,$dic,$shoreLon,$shoreLat,$textBody,$vesselType))  or die ('Insert Query failed: '.pg_last_error()); 

    
    if (is_null($result))	{
        echo 'Data insert failed, please try again';
    }
    
    else {
        echo 'Data insert successful';
    }
    
    //Close db connection
    pg_close($dbconn);
    
    
    function trim_value(&$value){
       $value = trim($value);
       $pattern = "/[\(\)\[\]\{\}]/";
       $value = preg_replace($pattern," - ",$value);
    }

    

    function sanitize($str,$filter,$pattern) {
       $sanStr = preg_replace($pattern,"",$_POST[$str]);
       $sanStr = filter_var($_POST[$str], $filter);
       if (strlen($sanStr) > 255) $sanStr = substr($sanStr,0,255);
       return $sanStr;
    } 

?>
