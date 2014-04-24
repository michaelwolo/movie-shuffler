<?php
	include("../../config.php");
	header('Content-type: text/xml');
	$search=$_POST["search"];

	$q = urlencode($search);
	$num = 5;

	$endpoint = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey='.$rtkey.'&q='.$q.'&page_limit='.$num;
	$session = curl_init($endpoint);
	
	curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
	$data = curl_exec($session);
	curl_close($session);

	$search_results = json_decode($data);
	if ($search_results === NULL) die('Error parsing JSON');

	$movies = $search_results->movies;

	echo "<response>";
	foreach ($movies as $movie) {
	  echo "<movie><title>" . $movie->title . "</title><year>" . $movie->year . "</year><poster>" . $movie->posters->profile . "</poster></movie>";
	}
	echo "</response>";
?>