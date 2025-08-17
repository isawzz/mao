<?php
require '../../../vendor/autoload.php';

use Symfony\Component\Yaml\Yaml;

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

define('GAME_DIR', dirname(__DIR__,2) . '/y/tables/');
define('USERS_READ', dirname(__DIR__,2) . '/y/users.yaml'); 
define('USERS_WRITE', 'hallo.yaml'); 
define('CONFIG_READ', dirname(__DIR__,2) . '/y/config.yaml'); 
define('CONFIG_WRITE', 'hallo.yaml'); 
define('YDIR', dirname(__DIR__,2) . '/y/'); 

$stateFile = __DIR__ . '/../../y/state.yaml';

if (!is_dir(GAME_DIR)) mkdir(GAME_DIR, 0777, true);

function arrayToYamlFile(array $data, string $file) {
	// file_put_contents($file, "hallo"); //arrayToYaml($array));
	// file_put_contents($file, Yaml::dump($array)); //, 2, 0, Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK));
	file_put_contents($file, Yaml::dump($data, 4, 2, Yaml::DUMP_OBJECT_AS_MAP)); //Yaml::dump($array,2,0,Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK));
}
function yamlFileToArray(string $file) {
	return Yaml::parse(file_get_contents($file));
}

// #region general functions
function randomColor() {
	return sprintf("#%06X", mt_rand(0, 0xFFFFFF));
}
class UserData {
	public $color;
	public $name;
	public $imgkey;

	public function __construct($name) {
			$this->color = randomColor();
			$this->name = $name;
			$this->imgkey = 'unknown_user';
	}
}

// #region converters
function arrayToObject(array $array) {
	return json_decode(json_encode($array));
}
function arrayToYaml(array $array) {
	return Yaml::dump($array, 2, 0, Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK);
}

function jsonToYaml(string $json): string {
	$data = json_decode($json, true);
	if (json_last_error() !== JSON_ERROR_NONE) {
			throw new InvalidArgumentException("Invalid JSON: " . json_last_error_msg());
	}
	return arrayToYaml($data);
}
function jsonFileToYaml(string $file) {
	return jsonToYaml(file_get_contents($file));
}
function jsonFileToYamlFile(string $file, string $yamlFile) {
	file_put_contents($yamlFile, jsonFileToYaml($file));
}
function jsonToObject(string $json) {
	return arrayToObject(json_decode($json, true));
}
function jsonToYamlFile(string $json, string $file) {
	file_put_contents($file, jsonToYaml($json));
}
function jsonFileToObject(string $file) {
	return jsonToObject(file_get_contents($file));
}
function jsonFileToArray(string $file) {
	return json_decode(file_get_contents($file), true);
}

function objectToArray($object) {
	return json_decode(json_encode($object), true);
}
function objectToJson($object) {
	return json_encode(objectToArray($object), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
function objectToYaml($object) {
	return arrayToYaml(objectToArray($object));
}

function yamlToJson(string $yaml): string {
	$data = Yaml::parse($yaml);
	return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
function yamlToObject(string $yaml) {
	return arrayToObject(Yaml::parse($yaml));
}
function yamlToJsonFile(string $yaml, string $file) {
	file_put_contents($file, yamlToJson($yaml));
}
function yamlFileToJson(string $file) {
	return yamlToJson(file_get_contents($file));
}
function yamlFileToJsonFile(string $file, string $jsonFile) {
	file_put_contents($jsonFile, yamlFileToJson($file));
}
function yamlFileToObject(string $file) {
	return yamlToObject(file_get_contents($file));
}

?>
