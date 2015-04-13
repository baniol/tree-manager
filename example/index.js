var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

var TreeManager = require('../lib/treemanager');


var rootDir = __dirname + '/root_dir';
var treeManager = new TreeManager(rootDir);

server.listen(5000);

// Serve static files for frontend
app.use(express.static(__dirname + '/public'));

// Tree Manager API

app.get('/', function (req, res) {
  res.sendFile(__dirname + projectDir + '/index.html');
});

app.use(bodyParser.urlencoded({extended: false}));

app.get('/readdir', function (req, res) {
  treeManager.walkDir(rootDir, function (err, tree) {
    res.json(tree);
  });
});

app.get('/create_node', function (req, res) {
  var type = req.query.type === 'default' ? 'folder' : 'file';
  var filename = path.join(req.query.id, req.query.text);
  treeManager.createNode(filename, type, function (response) {
    res.send(response);
  });
});

app.get('/rename_node', function (req, res) {
  treeManager.renameNode(req.query.id, req.query.text, function (response) {
    res.send(response);
  });
});

app.get('/delete_node', function (req, res) {
  treeManager.deleteNode(req.query.id, function (response) {
    console.log(response);
  });
});

app.get('/move_node', function (req, res) {
  treeManager.moveNode(req.query.id, req.query.parent, function (response) {
    res.send(response);
  });
});

app.get('/getfilecontent', function (req, res) {
  treeManager.readFile(req.query.filename, function (response) {
    res.send(response);
  });
});
