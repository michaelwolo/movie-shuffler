<?php

include("../../config.php");
header('Content-type: application/json');
$mysqli = new mysqli("localhost",$dbuser,$dbpass,$dbname);
if($mysqli->connect_errno) {
  echo "Connection Failed: " . $mysqli->connect_errno;
}

$tagList = $_POST['tags'];
if (isset($_POST['ids'])) {
  $idList = $_POST['ids'];
}

$tags = explode(',', $tagList); // Make an array of tags
if (isset($idList)) {
  $ids = explode(',', $idList); // Make an array of previously suggested movie ids
}
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
for ($i = 0; $i < $count; $i++) {
  // Increment count of each tag to track popularity of each
  $stmt = $mysqli->prepare("UPDATE `tags` SET `Count` = `Count` + 1 WHERE `ID` = ?");
  $stmt->bind_param("i", $safe[$i]);
  $stmt->execute();
  $stmt->close();
}
$tagsList = implode('\',\'', $safe); // Make a string, separating the tags with a comma
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
$year = null; // Fix for the issue where $year was mysteriously not showing up
while (!$year) {
  if (count($midArray)) {
    if (isset($ids) && count($ids) < count($midArray)) {
      for ($j = 0; $j < count($ids); $j++) {
        if (count($midArray)) {
          $pos = array_search($ids[$j], $midArray);
          if ($pos || $pos >= 0) {
            array_splice($midArray, $pos, 1);
          }
        }
      }
    }
    shuffle($midArray);
    $choice = $midArray[0];
  } else {
    $stmt = $mysqli->prepare("SELECT `MovieID` FROM `movies_tags` ORDER BY RAND() LIMIT 1");
    $stmt->execute();
    $stmt->bind_result($choice);
    $stmt->fetch();
    $stmt->close();
  }
  $stmt = $mysqli->prepare("SELECT `Title`,`Year`,`RTID` FROM `movies` WHERE `ID` = ?");
  $stmt->bind_param("i", $choice);
  $stmt->execute();
  $stmt->bind_result($ti, $y, $rt);
  while($stmt->fetch()) {
    $title = $ti;
    $year = $y;
    $RTID = $rt;
  }
  $stmt->close();
}
$json = '{"id":' . $choice . ',"title":"' . $title . '","year":' . $year . ',"rating":' . rotten($RTID) . ',"trailer":"' . youtube($title, $year) . '","tags":"' . $tagList . '"}';
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

function youtube($title, $year) {
  global $ytkey;
  $video = '';
  if ($title) {
    require_once 'Google/Client.php';
    require_once 'Google/Service/YouTube.php';
    $DEVELOPER_KEY = $ytkey;
    $max = 1;
    $client = new Google_Client();
    $client->setDeveloperKey($DEVELOPER_KEY);
    $youtube = new Google_Service_YouTube($client);
    try {
      $searchResponse = $youtube->search->listSearch('id', array(
        'q' => $title . " " . $year . " official trailer",
        'maxResults' => $max,
        'regionCode' => 'CA',
        'type' => 'video',
        'videoDuration' => 'short'
      ));
      foreach ($searchResponse['items'] as $searchResult) {
        switch ($searchResult['id']['kind']) {
          case 'youtube#video':
            $video = sprintf('%s',$searchResult['id']['videoId']);
            break;
        }
      }
    } catch (Google_ServiceException $e) {
      $video = "Google Service Exception?";
    } catch (Google_Exception $e) {
      $video = "Google Exception?";
    }
  }
  return $video;
}

$mysqli->close();

?>