<?php
include 'helpers.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($data === null) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if ($data['action'] === 'savey' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $path = YDIR . $data['file'] . '.yaml';
    $o = $data['o'];
    //echo json_encode(["path" => $path, "code" => $data['file'], 'o' => $o]); die;
    //if (startsWith($data['file'], 'tables')) { $o['modified'] = time(); }
    arrayToYamlFile($o, $path);
    echo json_encode(["path" => $path, "code" => $data['file'], "o" => $o]);
    exit;
}

if ($data['action'] === 'saverace' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $path = YDIR . $data['file'] . '.yaml';
    $table = yamlFileToArray($path);
    $savedStep = $table['step'] ?? 0;
    $newTable = $data['newTable'];
    $move = $data['move'];
    $success = $move['success'];
    $valid = $newTable['step'] > $savedStep;
    if ($success && $valid) {
        $newTable['step'] = $savedStep + 1; // Ensure step is incremented correctly
        arrayToYamlFile($newTable, $path);
        echo json_encode(["message" => "YEAH!", "table" => $newTable, "path" => $path]); //, "code" => $data['file']]);
    } elseif ($valid && $newTable['status'] === 'over') {
        $newTable['step'] = $savedStep + 1; // Ensure step is incremented correctly
        arrayToYamlFile($newTable, $path);
        echo json_encode(["message" => "OVER", "table" => $newTable, "path" => $path]); //, "code" => $data['file']]);
    } elseif (!$success) {
        $name = $move['name'];
        $table['players'][$name]['score'] -= 1; // Decrease score on failure
        $table['modified'] = $newTable['modified']; // Update modified time
        arrayToYamlFile($table, $path);
        echo json_encode(["message" => "-1", "table" => $table, "path" => $path]); //, "code" => $data['file']]);
    }else {
        echo json_encode(["message" => "too late!", "table" => $table, "path" => $path]);
    }

    exit;
}

if ($data['action'] === 'dir' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $dir= $data['dir'] ?? '';
    if (strpos($dir, 'assets') !== false) {
        $dir = ASSETS . $data['dir']; 
    }else{
      $dir = YDIR . $data['dir'];  
    }
    //echo json_encode(["dir" => $dir, "files" => []]); die;
    //$dir = YDIR . $data['dir']; // replace with your path
    $files = scandir($dir);
    $filesInfo = [];

    foreach ($files as $file) {
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        if (is_file($path)) {
            $filesInfo[] = ['name' => $file, 'modified' => filemtime($path)];
        }
    }
    echo json_encode(["data" => $data, "dir" => $filesInfo, "files" => $files]);
    exit;
}

if ($data['action'] === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $data['username'];
    if (!$username || $username == 'null') {
        echo json_encode(["error" => "Username required"]);
        exit;
    }
    $users = yamlFileToArray(USERS_READ);
    if (!isset($users[$username])) {
        $users[$username] = $data['data'];
        arrayToYamlFile($users, USERS_READ);
    }
    $userdata = $users[$username];
    $arr = ["username" => $username];
    $arr["users"] = $users;
    $arr["userdata"] = $userdata;
    echo json_encode($arr);
    exit;
}

if ($data['action'] === 'deletey' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $path = YDIR . $data['file'] . '.yaml';
    unlink($path);
    echo json_encode(["path" => $path, "code" => 'deleted']);
    exit;
}

if ($data['action'] === 'delete_dir' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $path = realpath(dirname(__DIR__, 2) . '/y/' . $data['dir']);
    // echo json_encode(["path" => $path, "msg" => 'deleted all files']); die;
    $path = YDIR . $data['dir'];
    $files = scandir($path);
    $files = array_diff(scandir($path), array('.', '..')); // Exclude '.' and '..'
    foreach ($files as $file)
        unlink($path . '/' . $file);
    echo json_encode(["files" => $files, "path" => $path, "msg" => 'deleted all files']);
    exit;
}


if ($data['action'] === 'test_array' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $arr = ["users" => 1]; //, "typeConfig" => ["a" => "du"], "parsedData" => "wer", "typeParse" => "hallo"];
    arrayToYamlFile($arr, "hallo.yaml");
    echo json_encode(["users" => USERS_READ]);
    die;
    echo json_encode(["users" => "success"]);
    exit;
}

if ($data['action'] === 'test_config' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    //echo json_encode(["users" => USERS_READ]); die;
    $username = 'dieter';
    $userdata = new UserData($username);
    $users = yamlFileToArray(USERS_READ);
    //echo json_encode(["users" => $users]); die;
    $users["users"][$username] = $userdata;
    arrayToYamlFile($users, "hallo.yaml");
    echo json_encode(["users" => $users, "username" => $username, "userdata" => $userdata]);
    die;
    exit;
}

if ($data['action'] === 'test_final' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    //echo json_encode(["users" => USERS_READ]); die;
    $username = 'dieter';
    $userdata = new UserData($username);
    $users = yamlFileToArray(USERS_READ);
    //echo json_encode(["users" => $users]); die;
    $users["users"][$username] = $userdata;
    arrayToYamlFile($users, "hallo.yaml");
    echo json_encode(["users" => $users, "username" => $username, "userdata" => $userdata]);
    die;


    $typeConfig = gettype($users);
    $parsedData = Yaml::parse($users);
    $typeParse = gettype($parsedData);
    echo json_encode(["users" => $users, "typeConfig" => $typeConfig, "parsedData" => $parsedData, "typeParse" => $typeParse]);
    die;

    $json = yamlToJson($users);
    $php = json_decode($json, true);
    $yaml = jsonToYaml($json);
    echo json_encode(["o" => $parsedData]);
    die;
    $jsonString = '{"name":"Alice","age":30,"address":{"street":"123 Maple St","city":"New York"}}';
    $php = json_decode($jsonString, true);
    $s = json_encode($php, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $yamlString = jsonToYaml($s);
    echo json_encode(["yaml" => $yamlString, "o" => $php, "json" => $s]);
    die;

    echo json_encode(["user" => "hallo"]);
    die;
    $user = new UserData('test', 'unknown_user');
    echo json_encode(["user" => $user]);
    die;

    saveAsYaml(["users" => ["test" => new UserData('test', 'unknown_user')]], "hallo.yaml");
    exit;
}

if ($data['action'] === 'test' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $jsonString = '{"name":"Alice","age":30,"address":{"street":"123 Maple St","city":"New York"}}';
    $php = json_decode($jsonString, true);
    $s = json_encode($php, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $yamlString = jsonToYaml($s);
    echo json_encode(["yaml" => $yamlString, "o" => $php, "json" => $s]);
    die;

    echo json_encode(["user" => "hallo"]);
    die;
    $user = new UserData('test', 'unknown_user');
    echo json_encode(["user" => $user]);
    die;

    saveAsYaml(["users" => ["test" => new UserData('test', 'unknown_user')]], "hallo.yaml");
    exit;
}


// 📥 3. Submit a move
if ($data['action'] === 'move' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $player = $input['player'] ?? '';
    $gameFile = GAME_DIR . "{$input['tid']}.yaml";

    $users = file_exists(USERS_READ) ? from_yaml(file_get_contents(USERS_READ)) : [];

    if (!in_array($player, $users)) {
        echo json_encode(["error" => "Invalid authentication"]);
        exit;
    }

    if (!file_exists($gameFile)) {
        echo json_encode(["error" => "Game not found"]);
        exit;
    }

    file_put_contents($gameFile, to_yaml($input['state']));

    echo json_encode(["success" => true]);
    exit;
}

// 🔄 4. Get the game state
if ($data['action'] === 'state' && isset($data['id'])) {
    $gameFile = GAME_DIR . "{$_GET['id']}.yaml";

    if (!file_exists($gameFile)) {
        echo json_encode(["error" => "Game not found"]);
        exit;
    }

    $state = from_yaml(file_get_contents($gameFile));
    echo json_encode(["state" => $state]);
    exit;
}

// 🚫 Invalid request
echo json_encode(["error" => "Invalid API request"]);
?>