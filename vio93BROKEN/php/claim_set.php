<?php
include 'helpers.php';

$incoming = json_decode(file_get_contents("php://input"), true);
$clientVersion = $incoming['version'];
$update = $incoming['update'];

$state = json_decode(file_get_contents($stateFile), true);
$currentVersion = $state['version'];

if ($clientVersion !== $currentVersion) {
  echo json_encode(['success' => false, 'reason' => 'Stale version']);
  exit;
}

// Apply update directly from client
foreach ($update as $key => $value) {
  $state[$key] = $value;
}

$state['version'] += 1;
$state['last_modified'] = time();

file_put_contents($stateFile, json_encode($state));
echo json_encode(['success' => true, 'new_version' => $state['version'], 'last_modified' => $state['last_modified']]);
