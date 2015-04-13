## tree-manager

nodejs connector for jstree library.

To run the example go to `example` folder run `npm install` and point your browser to `localhost:8080`.

The module allows folders and files manipulation via http api.

You can change the root directory on the fly by calling `treeManager.setRoot(path)` with a path as an argument.

### Init

```javascript
var TreeManager = require('../lib/treemanager');
var rootDir = __dirname + '/test_dir_root';
var treeManager = new TreeManager(rootDir);
```

Methods

`walkDir`
Returns object with dir structure representation.
Example of the object ....

Parameters:
* rootDirectory - absolute path to rd
* callback - function called on success or error, return 2 aguments: error and the list

#### Example
```javascript
treeManager.walkDir(rootDir, function (err, tree) {
  res.json(tree);
});
```

#### Example
```javascript
treeManager.createNode(filename, type, function (response) {
  res.send(response);
});
```

<hr>

## TODO

* output textarea in the example for displaying file contents
* modyfying and saving file content from textarea in the example
* 2 option for folder removal - recursive with all subfolders and files and only empty
* investigate error handling
* search npm modules for api description in readme
* load tests - check if walkDir is async
* search for best practices for npm modules
* check uniqueness after renaming and moving - server side