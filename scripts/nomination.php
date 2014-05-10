<?php

include("../../config.php");
header('Content-type: application/json');
$mysqli = new mysqli("localhost",$dbuser,$dbpass,$dbname);
if($mysqli->connect_errno) {
  echo "Connection Failed: " . $mysqli->connect_errno;
}

$title = urldecode($_POST['title']);
$year = $_POST['year'];
$tags = $_POST['tags'];
$tagArray = checkTags($tags);

if ($tagArray) {
  $stmt = $mysqli->prepare("SELECT `ID` FROM `movies` WHERE `Title` = ? AND `Year` = ?");
  $stmt->bind_param("si", $title, $year);
  $stmt->execute();
  $stmt->store_result();
  $returned = $stmt->num_rows;
  if ($returned) {
    $stmt->bind_result($result);
    while ($stmt->fetch()) {
      $id = $result;
    }
    $stmt->close();
    addTags($tagArray, $id);
    lookup($id);
  } else if (checkTitle($title)) {
    $movie = checkTitle($title);
    $stmt = $mysqli->prepare("INSERT INTO `movies` (Title,Year,AudienceRating,Trailer,RTID) VALUES (?,?,?,?,?)");
    $stmt->bind_param("siisi", $movie["title"], $movie["year"], $movie["rating"], youtube($movie["title"]), $movie["id"]);
    $stmt->execute();
    $id = $mysqli->insert_id;
    addTags($tagArray, $id);
    echo '{"title":"' . $movie["title"] . '","year":' . $movie["year"] . ',"rating":' . $movie["rating"] . ',"trailer":"' . youtube($movie["title"]) . '"}';
  } else {
    echo "Error";
  }
} else {
  echo "Error";
}

function checkTitle($title) {
  global $rtkey;
  global $year;
  $q = urlencode($title);
  $num = 5;
  $endpoint = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey='.$rtkey.'&q='.$q.'&page_limit='.$num;
  $session = curl_init($endpoint);
  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
  $data = curl_exec($session);
  curl_close($session);
  $search_results = json_decode($data);
  if ($search_results === NULL) die('Error parsing JSON');
  $movies = $search_results->movies;
  $confirm = false;
  foreach ($movies as $movie) {
    $char = strrpos($movie->title, " (");
    $sub = substr($movie->title, 0, $char); // Check against title without parentheses
    if (($movie->title === $title || $sub === $title) AND $movie->year == $year) {
      $mov["title"] = $title;
      $mov["year"] = $movie->year;
      $mov["rating"] = $movie->ratings->audience_score;
      $mov["id"] = $movie->id;
      break;
    }
  }
  return $mov;
}

function checkTags($tags) {
  global $mysqli;
  $tagList = explode(',', $tags);
  $total = count($tagList);
  $array = array();
  $checked = 0;
  for ($i = 0; $i < $total; $i++) {
    $stmt = $mysqli->prepare("SELECT `ID` FROM `tags` WHERE `Tag` = ?");
    $stmt->bind_param("s", $tagList[$i]);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
      $stmt->bind_result($tagID);
      $stmt->fetch();
      $stmt->close();
      $object = new stdClass();
      $object->id = $tagID;
      $object->name = $tagList[$i];
      $array[] = $object;
      $checked++;
    } else {
      $stmt->close();
      break; // row not found, stop checking and drop the request
    }
  }
  if (!($checked === $total)) {
    $array = false;
  }
  return $array;
}

function addTags($array, $id) {
  global $mysqli;
  for ($i = 0; $i < count($array); $i++) {
    $count = checkDuplicates($id, $array[$i]->id);
    if ($count) {
      increaseCount($id, $array[$i]->id, $count);
    } else {
      $stmt = $mysqli->prepare("INSERT INTO `movies_tags` (MovieID,TagID) VALUES (?,?)");
      $stmt->bind_param("ii", $id, $array[$i]->id);
      $stmt->execute();
      $stmt->close();
    }
  }
}

function increaseCount($mid, $tid, $count) {
  global $mysqli;
  $stmt = $mysqli->prepare("UPDATE `movies_tags` SET `Count` = ? WHERE `MovieID` = ? AND `TagID` = ?");
  $stmt->bind_param("iii", $count, $mid, $tid);
  $stmt->execute();
  $stmt->close();
}

function checkDuplicates($mid, $tid) {
  global $mysqli;
  $count = 0;
  $stmt = $mysqli->prepare("SELECT `Count` FROM `movies_tags` WHERE `MovieID` = ? AND `TagID` = ?");
  $stmt->bind_param("ii", $mid, $tid);
  $stmt->execute();
  $stmt->bind_result($count);
  $stmt->fetch();
  $stmt->close();
  if ($count > 0) {
    $count++;
    return $count;
  } else {
    return false;
  }
}

function lookup($id) {
  global $mysqli;
  $stmt = $mysqli->prepare("SELECT `Title`,`Year`,`AudienceRating`,`Trailer`,`RTID` FROM `movies` WHERE `ID` = ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $stmt->bind_result($ti, $y, $ar, $tr, $rt);
  while($stmt->fetch()) {
    $title = $ti;
    $year = $y;
    $oldrating = $ar;
    $trailer = $tr;
    $RTID = $rt;
  }
  $stmt->close();
  $rating = rotten($RTID);
  if ($rating) {
    $stmt = $mysqli->prepare("UPDATE `movies` SET `AudienceRating` = ? WHERE `ID` = ?");
    $stmt->bind_param("ii", $rating, $id);
    $stmt->execute();
    $stmt->close();
  } else {
    $rating = $oldrating;
  }
  $json = '{"title":"' . $title . '","year":' . $year . ',"rating":' . $rating . ',"trailer":"' . $trailer . '"}';
  echo $json;
}

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

function youtube($title) {
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
        'q' => $title . " official trailer",
        'maxResults' => $max,
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