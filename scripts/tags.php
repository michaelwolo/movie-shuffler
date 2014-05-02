<?php

include("../../config.php");
header('Content-type: application/json');
$mysqli = new mysqli("localhost",$dbuser,$dbpass,$dbname);
if($mysqli->connect_errno) {
  echo "Connection Failed: " . $mysqli->connect_errno;
}
$query = "SELECT DISTINCT `ID`,`Tag` FROM `tags` ORDER BY RAND()";
$result = $mysqli->query($query);
$tags = array();
while ($row = $result->fetch_assoc()) {
  $tags[] = $row['Tag'];
};
echo json_encode($tags);
$result->free();
$mysqli->close();

?>