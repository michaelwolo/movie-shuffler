<?php

include("../../config.php");
$mysqli = new mysqli("localhost",$dbuser,$dbpass,$dbname);
if($mysqli->connect_errno) {
  echo "Connection Failed: " . $mysqli->connect_errno;
}

$tagList = $_GET['tag'];

if (!$tagList) {

	$randomQuery = "SELECT `MovieID` FROM `MOVIES_TAGS` ORDER BY RAND() LIMIT 1";

	$result = $mysqli->query($randomQuery);

	$randomChoice = array();
	$index = 0;

	while ($row = $result->fetch_assoc()) {
	    $randomChoice[$index] = $row['MovieID'];
    	$index++;
	};

	$result->free();

	$movieChoice = $randomChoice[0];

} else {

	$tags = explode(',', $tagList); //take a string with items separated by a comma and make an array of the items

	$tagListLength = count($tags); //determine the number of items in an array (for use in the for loop below?)

	for ($i = 0; $i < $tagListLength; $i++) {
		$tagsSafe[$i] = $mysqli->real_escape_string($tags[$i]); //escape each item's special characters before entering the values into sql queries
	};
	
	$tagsList = implode('\',\'', $tagsSafe); //take an array of items and make a string, separating the items with a comma

	$tagIDQuery = "SELECT `ID` FROM `TAGS` WHERE `Tag` IN ('$tagsList');";

	if ($result = $mysqli->query($tagIDQuery)) {

		$tagIDList = array();
		$index = 0;

		while ($row = $result->fetch_assoc()) { //place the result in a list ($tagIDList) for the next sql command
		    $tagIDList[$index] = $row['ID'];
	    	$index++;
		};

		$result->free();

		$IDListLength = count($tagIDList);

		$tagIDsString = implode('\',\'', $tagIDList);

		$noResults = true;

		while ($noResults) {

			$matchingMovies = "SELECT `MovieID` FROM `MOVIES_TAGS` WHERE `TagID` IN ('$tagIDsString') GROUP BY `MovieID` HAVING count(distinct `TagID`) = $IDListLength;";

			if ($stmt = $mysqli->prepare($matchingMovies)) {

		  $stmt->execute();

		  $stmt->store_result();

		  $returnedResults = $stmt->num_rows;

		  if ($returnedResults > 0) {
		  	
		    $stmt->bind_result($movieID);

		    $movieIDArray = array();
				$index = 0;

		    while ($row = $stmt->fetch()) {
		    	$movieIDArray[$index] = $movieID;
		    	$index++;
		    };

		    $noResults = false;

		  } else {

		  	$IDListLength--;

		  };

		  $stmt->close();

			};

		};

			shuffle($movieIDArray);

			$movieChoice = $movieIDArray[0];

	};

};

//find the matching movie row from the Movies tables and save the results

$selectionQuery = "SELECT * FROM `MOVIES` WHERE `ID` = '$movieChoice';";

$result = $mysqli->query($selectionQuery);

while($row = $result->fetch_assoc()) {

	$title = $row['Title'];
	$year = $row['Year'];
	$critic = $row['CriticRating'];
	$audience = $row['AudienceRating'];
	$trailer = $row['Trailer'];
	$link = $row['RTLink'];

};

$result->free();

$mysqli->close();

?>