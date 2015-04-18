# tree-manager

nodejs connector for jstree library.

To run the example go to `example` folder run `npm install` and point your browser to `localhost:5000`.

## Initialization

```javascript
var TreeManager = require('../lib/treemanager');
var rootDir = __dirname + '/test_dir_root';
var treeManager = new TreeManager(rootDir);
```

Set the root path whil instantiating the module.

You can change the root directory on the fly by calling `treeManager.setRoot(path)` with a path as an argument.

## Methods

### `walkDir`
_Walks down recursivelly the root folder._

__Example:__

```javascript
treeManager.walkDir(rootDir, function (err, tree) {
  console.log(tree);
});
```

__Parameters__:
* rootDirectory - absolute path to rd
* callback - function called on success or error, returns error object or an object with the directory structure


-----

### `createNode`

_Creates a new file or folder_

__Example:__

```javascript
var type = 'file';
var filename = path.join(req.query.id, req.query.text);
treeManager.createNode(filename, type, function (res) {
  console.log(res);
});
```

__Parameters__:
* name - path to a new file or folder
* type - file or folder
* callback - function called on success or error, returns error object or new folder or file name.

-----

### `renameNode`

_Renames a file or folder_

__Example:__

```javascript
treeManager.renameNode('some_dir/note.txt', 'note_changed.txt', function (res) {
  console.log(res);
});
```

__Parameters__:

* oldPath - path to the current file or folder
* newName - new name for the file or folder
* callback - function called on success or error, returns error object or changed file path

-----

### `deleteNode`

_Removes file or folder. Folders are removed recursivelly._

__Example:__

```javascript
treeManager.deleteNode('some_dir/notes.txt', function (res) {
  console.log(res);
});
```

__Parameters:__

* nodePath Relative path of the node to be removed
* callback - function called on success or error, returns error object or path of the removed node

-----

### `moveNode`

_Moves node_

__Example:__

```javascript
treeManager.moveNode('some_dir/notes.txt', 'next_level/other_dir', function (res) {
  res.send(res);
});
```

__Parameters:__

* nodePath Relative path of the node to be moved
* nodeParent Relative path of the parent target node
* callback - function called on success returns new path to the node

## Tests

To perform tests run `npm test` in the `tree-manager` root directory.

## TODO

* 2 option for folder removal - recursive with all subfolders and files and only empty
* check performance of walkDir function for larger directory structure
* check uniqueness after renaming and moving - server side
* write file to example