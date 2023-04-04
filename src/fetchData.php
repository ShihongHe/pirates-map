<?php 
	//Returns JSON data to Javascript file
	header("Content-type:application/json");
	$judges=$_GET['judges'];

	//Connect to db 

	$pgsqlOptions = "host='localhost' dbname='geog5871' user='geog5871student' password='Geibeu9b'";
	$dbconn = pg_connect($pgsqlOptions) or die ('connection failure');
	
	//Define sql query
	$query = "SELECT oid,  latitude, longitude ,vessel_type ,vessel_status ,attack_type ,attack_description,shore_longitude ,shore_latitude , shore_distance ,country,region FROM pirate_attacks ";

	

	//Execute query
	$result = pg_query($dbconn, $query) or die ('Query failed: '.pg_last_error());
	
	//Define new array to store results
	$pirateData = array();
	
	//Loop through query results 
	while ($row = pg_fetch_array($result, null, PGSQL_ASSOC))	{
	
		//Populate tweetData array 
		$pirateData[] = array("id" => $row["oid"],  "lat" => $row["latitude"], "lon" => $row["longitude"],"vessel_type" => $row["vessel_type"],"vessel_status" => $row["vessel_status"],"attack_type" => $row["attack_type"],"description" => $row["attack_description"]);
	}
	
	//Encode tweetData array in JSON
	echo json_encode($pirateData); 
	
	//Close db connection
	pg_close($dbconn);
?>
