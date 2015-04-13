var assert = require('assert');
var path = require('path');
var execSync = require('exec-sync');

var fs = require('fs');

var TreeManager = require('../lib/treemanager');
var rootDir = __dirname + '/test_dir_root';
var treeManager = new TreeManager(rootDir);

function readDir (cb) {
  treeManager.walkDir(rootDir, function (err, tree) {
    cb(err, tree);
  });
}

function checkIfExists (nodeName, cb) {
  var nodePath = path.join(rootDir, nodeName);
  fs.exists(nodePath, function (exists) {
    cb(exists);
  });
}

function setup () {
  execSync("mkdir test/test_dir_root; cp -r test/test_dir/* test/test_dir_root");
  execSync("mkdir test/test_dir_root/empty_dir");
}
function teardown () {
  execSync("rm -fr test/test_dir_root");
}

suite('Tree Manager', function() {

  suiteSetup(function () {
    setup();
  });
  suiteTeardown(function () {
    teardown();
  });

  test('Read Dir Success', function(done){
    treeManager.walkDir(rootDir, function (err, tree) {
      assert.equal(err, null, 'Error should be null');
      assert.equal(tree[0].text, 'one.js', 'First file');
      assert.equal(tree[0].icon, 'file', 'Icon of the first file');
      assert.equal(tree[0].a_attr.id, 'one.js', 'Anchor id attribute');
      assert.equal(tree[3].text, 'second_dir', 'Dir nested in the root dir.');
      assert.equal(tree[3].children[0].text, 'three.js', 'File in the nested dir');
      done();
    });
  });

  test('Read root dir - empty', function(done){
    treeManager.walkDir(path.join(rootDir, 'empty_dir'), function (err, tree) {
      assert.equal(err, null, 'Error should be null');
      assert.equal(tree.length, 0, 'Empty array');
      done();
    });
  });

  test('Read Dir Error', function(done){
    treeManager.walkDir('some_dir', function (err, tree) {
      assert.equal(err.code, 'ENOENT', 'Error ')
      done();
    });
  });

});

suite('Creating a new node', function () {

  suiteSetup(function () {
    setup();
  });
  suiteTeardown(function () {
    teardown();
  });

  test('Add a new file', function (done) {
    treeManager.createNode('new_name', 'file', function (res) {
      assert.equal(res, 'new_name', 'Response should equal the new file name');
      checkIfExists('new_name', function (exists) {
        assert.ok(exists);
        done();
      });
    });
  });

  test('Add a new folder', function (done) {
    treeManager.createNode('new_folder', 'folder', function (res) {
      assert.equal(res, 'new_folder', 'Response should equal the new folder name');
      checkIfExists('new_folder', function (exists) {
        assert.ok(exists);
        done();
      });
    });
  });

  test('Add a new file with wrong type', function (done) {
    treeManager.createNode('new_name', 'notype', function (res) {
      assert.ok(res instanceof Error, 'Wrong type throws Error');
      assert.equal(res.toString(), 'Error: Unknown node type', 'Display error message');
      done();
    })
  });

});

suite('Renaming node', function () {

  suiteSetup(function () {
    setup();
  });
  suiteTeardown(function () {
    teardown();
  });

  test('Rename a node with success', function (done) {
    treeManager.renameNode('/second_dir/three.js', 'changed.js', function (res) {
      readDir(function (err, tree) {
        assert.equal(err, null, 'Error is null');
        assert.equal(tree[3].children[0].text, 'changed.js', 'Checking changed filename');
        done();
      });
    })
  });

  // @TODO change title
  test('Rename a node from non existent path', function (done) {
    treeManager.renameNode('/second_dir/three_not.js', 'changed.js', function (res) {
      assert.ok(res instanceof Error, 'Throw an error');
      assert.equal(res.toString(), 'Error: Node does not exist', 'Display error message');
      done();
    })
  });

});

suite('Deleting nodes', function () {

  suiteSetup(function () {
    setup();
  });
  suiteTeardown(function () {
    teardown();
  });

  test('Try to delete non existent node', function (done) {
    treeManager.deleteNode('/non_existent_node', function (res) {
      assert.ok(res instanceof Error, 'Throw an error');
      assert.equal(res.toString(), 'Error: File to remove do not exist', 'Display error message');
      done();
    })
  });

  test('Deleting a file', function (done) {
    treeManager.deleteNode('/one.js', function (res) {
      assert.equal(res, '/one.js', 'Response should equal the removed file name');
      checkIfExists('one.js', function (exists) {
        assert.ok(!exists);
        done();
      });
    });
  });

  test('Deleting a folder', function (done) {
    treeManager.deleteNode('/second_dir', function (res) {
      assert.equal(res, '/second_dir', 'Response should equal the removed folder name');
      checkIfExists('second_dir', function (exists) {
        assert.ok(!exists);
        done();
      });
    });
  });
});

suite('Moving nodes', function () {

  suiteSetup(function () {
    setup();
  });
  suiteTeardown(function () {
    teardown();
  });

  test('Move node', function (done) {
    treeManager.moveNode('one.js', 'second_dir', function (res) {
      var newPath = path.join('second_dir', 'one.js');
      checkIfExists(newPath, function (exists) {
        assert.ok(exists);
        done();
      });
    });
  });

});

suite('File content manipulation', function () {

  suiteSetup(function () {
    setup();
  });
  suiteTeardown(function () {
    teardown();
  });

  test('Read file', function (done) {
    treeManager.readFile('second_dir/three.js', function (res) {
      assert.equal(res, 'three content', 'Reading file content');
      done();
    });
  });

});