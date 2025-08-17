<?php
include 'helpers.php';

if (!file_exists($stateFile)) {
  $initial = [
    'message' => 'Initial state',
    'version' => 0,
    'last_modified' => time()
  ];
  arrayToYamlFile($initial, $stateFile); //file_put_contents($stateFile, json_encode($initial));
}
header('Content-Type: application/json');
echo json_encode(yamlFileToArray($stateFile)); //file_get_contents($stateFile);
