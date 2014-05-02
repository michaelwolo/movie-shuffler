<?php

include("../../config.php");
header('Content-type: application/json');
$mysqli = new mysqli("localhost",$dbuser,$dbpass,$dbname);
if($mysqli->connect_errno) {
  echo "Connection Failed: " . $mysqli->connect_errno;
}

$tagList = $_POST['tags'];

$tags = explode(',', $tagList); //take a string with items separated by a comma and make an array of the items
$safe = array();
for ($i = 0; $i < count($tags); $i++) {
	$stmt = $mysqli->prepare("SELECT `ID` FROM `tags` WHERE `Tag` = ?");
  $stmt->bind_param("s", $tags[$i]);
  $stmt->execute();
  $stmt->store_result();
  if ($stmt->num_rows > 0) {
    $stmt->bind_result($tagID);
    $stmt->fetch();
    $safe[] = $tagID;
  }
  $stmt->close();
}
$count = count($safe);
$tagsList = implode('\',\'', $safe); //take an array of items and make a string, separating the items with a comma
$midArray = array();
while ($count) {
	$query = "SELECT `MovieID` FROM `movies_tags` WHERE `TagID` IN ('$tagsList') GROUP BY `MovieID` HAVING count(distinct `TagID`) = $count";
	$stmt = $mysqli->prepare($query);
  $stmt->execute();
  $stmt->store_result();
  if ($stmt->num_rows > 0) {
		$stmt->bind_result($mid);
    while ($row = $stmt->fetch()) {
    	$midArray[] = $mid;
    }
    break;
  }
  $count--;
  $stmt->close();
}
if ($midArray) {
	shuffle($midArray);
	$choice = $midArray[0];
} else {
	$stmt = $mysqli->prepare("SELECT `MovieID` FROM `movies_tags` ORDER BY RAND() LIMIT 1");
  $stmt->execute();
  $stmt->bind_result($choice);
  $stmt->fetch();
  $stmt->close();
}
$stmt = $mysqli->prepare("SELECT `Title`,`Year`,`Trailer`,`RTID` FROM `movies` WHERE `ID` = ?");
$stmt->bind_param("i", $choice);
$stmt->execute();
$stmt->bind_result($ti, $y, $tr, $rt);
while($stmt->fetch()) {
	$title = $ti;
	$year = $y;
	$trailer = $tr;
	// <iframe width="560" height="315" src="//www.youtube.com/embed/bLBSoC_2IY8" frameborder="0" allowfullscreen></iframe>
	$RTID = $rt;
}
$stmt->close();
$json = '{"title":"' . $title . '","year":' . $year . ',"rating":' . rotten($RTID) . ',"trailer":"' . $trailer . '"}';
echo $json;

function rotten($id) {
	global $rtkey;
	$endpoint = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'.$id.'.json?apikey='.$rtkey;
	$session = curl_init($endpoint);
	curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
	$data = curl_exec($session);
	curl_close($session);
	$movie = json_decode($data);
	if ($movie === NULL) die('Error parsing JSON');
	$rating = $movie->ratings->audience_score;
	return $rating;
}

$mysqli->close();

?>