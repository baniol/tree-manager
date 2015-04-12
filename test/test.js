var assert = require('assert');
var path = require('path');
var execSync = require('exec-sync');

var TreeManager = require('../lib/treemanager');
var rootDir = __dirname + '/test_dir_root';
var treeManager = new TreeManager(rootDir);

function readDir (cb) {
  treeManager.walkDir(rootDir, function (err, tree) {
    cb(err, tree);
  });
}

suite('Tree Manager', function() {

  suiteSetup(function () {
    execSync("mkdir test/test_dir_root; cp -r test/test_dir/* test/test_dir_root");
  });
  suiteTeardown(function () {
    execSync("rm -fr test/test_dir_root");
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
    execSync("mkdir test/test_dir_root; cp -r test/test_dir/* test/test_dir_root");
  });
  suiteTeardown(function () {
    execSync("rm -fr test/test_dir_root");
  });

  test('Add a new file', function (done) {
    treeManager.createNode('new_name', 'file', function (res) {
      readDir(function (err, tree) {
        assert.equal(tree[0].text, 'new_name', 'File added');
        done();
      });
    })
  });

  test('Add a new folder', function (done) {
    treeManager.createNode('new_folder', 'folder', function (res) {
      readDir(function (err, tree) {
        assert.equal(tree[4].text, 'new_folder', 'Folder added');
        assert.equal(tree[4].children.length, 0, 'Check if it\'s a folder');
        done();
      });
    })
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
    execSync("mkdir test/test_dir_root; cp -r test/test_dir/* test/test_dir_root");
  });
  suiteTeardown(function () {
    execSync("rm -fr test/test_dir_root");
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
      assert.ok(res instanceof Error, 'Throm an error');
      assert.equal(res.toString(), 'Error: Node does not exist', 'Display error message');
      done();
    })
  });

});