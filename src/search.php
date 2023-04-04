<?php 
	//array_filter($_POST, 'trim_value');
	// $pattern = "/[^A-Za-z0-9\s\.\:\-\+\!\@\,\'\"]/";
	// $searchby = sanitize('textBody',FILTER_SANITIZE_SPECIAL_CHARS,$searchby);
	// $textBody = sanitize('textBody',FILTER_SANITIZE_SPECIAL_CHARS,$pattern);
	// $timef = sanitize('timef',FILTER_SANITIZE_NUMBER_INT,$pattern);
	// $timet = sanitize('timet',FILTER_SANITIZE_NUMBER_INT,$pattern);
	$searchby = $_GET['searchby'];
	$timef = $_GET['timef'];
	$timet = $_GET['timet'];
	$textBody = $_GET['textBody'];

	// $textBody = $_GET['textBody'];
	// $timef = date('Y-m-d', strtotime($_GET['timef']));
	// $timet = date('Y-m-d', strtotime($_GET['timet']));


		
		
	//Connect to db 
	$pgsqlOptions = "host='localhost' dbname='geog5871' user= 'geog5871student' password= 'Geibeu9b'";
		
	$dbconn = pg_connect($pgsqlOptions) or die ('connection failure');
	if(!$timef){
		$timef ='2015-1-1';
	}
	if(!$timet){
		$timet ='2021-1-1';
	}
	if ($searchby==='regionsearch'){
		$query = "SELECT * FROM pirate_attacks WHERE region LIKE '%$textBody%' and date>='$timef' and date<='$timet'";

	}elseif($searchby==='attacksearch'){
		$query = "SELECT * FROM pirate_attacks WHERE attack_type LIKE '%$textBody%' and date>='$timef' and date<='$timet'";

	}else{
		$query = "SELECT * FROM pirate_attacks WHERE vessel_status LIKE '%$textBody%' and date>='$timef' and date<='$timet'";

	}
	
	//Execute query
	$result = pg_query($dbconn, $query) or die ('Query failed: '.pg_last_error());
	
	//Define new array to store results
	
	
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
		$sanStr = preg_replace($pattern,"",$_GET[$str]);
		$sanStr = filter_var($_GET[$str], $filter);
		if (strlen($sanStr) > 255) $sanStr = substr($sanStr,0,255);
		return $sanStr;
	} 
?>

