<?php 
	array_filter($_POST, 'trim_value');
	// $pattern = "/[^A-Za-z0-9\s\.\:\-\+\!\@\,\'\"]/";
	// $searchby = sanitize('textBody',FILTER_SANITIZE_SPECIAL_CHARS,$searchby);
	// $textBody = sanitize('textBody',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
	// $timef = sanitize('timef',FILTER_SANITIZE_NUMBER_INT,$pattern);
	// $timet = sanitize('timet',FILTER_SANITIZE_NUMBER_INT,$pattern);
	// $searchby=$_POST['searchby'];
	// $textBody=$_POST['textBody'];
	// $timef=$_POST['timef'];
	// $timet=$_POST['timet'];
	$sw_lat = $_GET['sw_lat'];
	$ne_lat = $_GET['ne_lat'];
	$sw_lng = $_GET['sw_lng'];
	$ne_lng = $_GET['ne_lng'];

		
		
	//Connect to db 
	$pgsqlOptions = "host='localhost' dbname='geog5871' user= 'geog5871student' password= 'Geibeu9b'";
		
	$dbconn = pg_connect($pgsqlOptions) or die ('connection failure');

	if(!$timef){
		$timef ='2015-1-1';
	}
	if(!$timet){
		$timet ='2021-1-1';
	}
	
	//Define sql query
	$query = "SELECT * FROM pirate_attacks WHERE latitude BETWEEN $sw_lat AND $ne_lat AND longitude BETWEEN $sw_lng AND $ne_lng  and date>='$timef' and date<='$timet'";
	//$query = "SELECT oid, body, latitude, longitude  FROM tweets WHERE latitude BETWEEN 0 AND 100 and longitude BETWEEN -100 AND 0";

	

	//Execute query
	$result = pg_query($dbconn, $query) or die ('Query failed: '.pg_last_error());
	
	//Define new array to store results
	$Data = array();
	
	//Loop through query results 
	while ($row = pg_fetch_array($result, null, PGSQL_ASSOC))	{
	
		//Populate tweetData array 
		$Data[] = array("id" => $row["oid"],  "lat" => $row["latitude"], "lon" => $row["longitude"],
		"vessel_type" => $row["vessel_type"],"vessel_status" => $row["vessel_status"],
		"attack_type" => $row["attack_type"],"description" => $row["attack_description"],
		);
	}
	
	//Encode tweetData array in JSON
	echo json_encode($Data); 
	
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

