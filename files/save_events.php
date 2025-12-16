<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = file_get_contents('php://input');
  $jsonData = json_decode($data, true);
  if ($jsonData) {
    file_put_contents('events.json', json_encode($jsonData, JSON_PRETTY_PRINT));
    echo json_encode(['status' => 'success']);
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
  }
} else {
  echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>