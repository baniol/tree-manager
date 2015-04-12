/*!
 * tree-manager
 * Copyright(c) 2015 Marcin Baniowski
 * MIT Licensed
 */

var fs = require('fs');
var path = require('path');

module.exports = fileModule;

/**
 * Constructor
 *
 * @param {String} rootDir Root directory. 
 */
function fileModule(rootDir) {
  this.root = rootDir;
}

/**
 * Set a root directory. 
 *
 * @param {String} root Path to the root directory. 
 */
fileModule.prototype.setRoot = function(root) {
  this.root = root;
};

/**
 * Goes through the root directory  
 * and returns json object with its structure. 
 *
 * @param {String} dir Path to the root directory.
 * @param {Function} done Callback
 */
fileModule.prototype.walkDir = function(dir, done) {
  var self = this;
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) {
      return done(err);
    }
    var pending = list.length;
    if(!pending) {
      return done(null, results);
    }
    list.forEach(function(file) {
      var dfile = path.join(dir, file);
      var el = {};
      var fid = path.join(dir.replace(self.root, ''), file);
      el.text = file;
      el.id = fid;
      fs.stat(dfile, function(err, stat) {
        if(err) {
          throw err;
        }
        if(stat.isDirectory()) {
          return self.walkDir(dfile, function(err, res) {
            el.children = res;
            results.push(el);
            !--pending && done(null, results);
          });
        }
        el.icon = 'file'; // @TODO - to settings
        el.a_attr = {id: fid};
        results.push(el);
        !--pending && done(null, results);
      });
    });
  });
};

/**
 * Creates a new node, file or directory. 
 * The callback returns a new file name.
 *
 * @param {String} name Path of the new node relative to the root directory 
 * @param {String} type Node type: file or folder 
 * @param {Function} db Callback with error or new filename as parameter
 */
fileModule.prototype.createNode = function(name, type, cb) {
  var filePath = path.join(this.root, name);

  // File
  if (type === 'file') {
    fs.open(filePath, "wx", function (err, fd) {
      if (err) {
        cb(err);
      }
      else {
        fs.close(fd, function (err) {
            if (err) {
              cb(err);
            }
            else {
              cb(name);
            }
        });
      }
    });
  }
  // Folder
  else if (type === 'folder') {
    fs.exists(filePath, function (exists) {
      if (!exists) {
        fs.mkdir(filePath, function () {
          cb(name);
        });
      }
    });
  }
  else {
    cb(new Error('Unknown node type'));
  }
};

/**
 * Rename node.
 *
 * @param {String} oldPath Path of the current node 
 * @param {String} newName New file name 
 * @param {Function} db Callback with changed name
 */
fileModule.prototype.renameNode = function(oldPath, newName, cb) {
  // @TODO check if exists
  // @TODO use separator variable
  var self = this;

  fs.exists(path.join(self.root, oldPath), function (exists) {
    if (exists) {
      var oldName = oldPath.split('/').pop();
      var newPath = oldPath.replace(oldName, newName);
      fs.rename(path.join(self.root, oldPath), path.join(self.root, newPath), function () {
        cb(newPath);
      });
    }
    else {
      cb(new Error ('Node does not exist'));
    }
  });
};

fileModule.prototype.deleteNode = function(query, cb) {
  var file = path.join(this.root, query.id);
  fs.stat(file, function(err, stat) {
    if(err) {
      throw err;
    }
    if(stat.isDirectory()) {
      rmdirAsync(file, function () {
        cb('Directory removed');
      });
    }
    else {
      fs.unlink(file, function () {
        cb('File removed');
      });
    }
  });
};

fileModule.prototype.moveNode = function(query, cb) {
  var fileName = query.id.split('/').pop();
  var newName = path.join(this.root, query.parent, fileName);
  fs.rename(path.join(this.root, query.id), newName, function () {
    cb(query.parent, fileName);
  });
};

fileModule.prototype.getFileContent = function (file, cb) {
  fs.readFile(path.join(this.root, file), {encoding: 'utf-8'}, function (err, data) {
    if (err) {
      console.log(err);
    }
    cb(data);
  });
};

// From: https://gist.github.com/geedew/48a4888e30271b930d33#file-node-rm-rf-async-js
function rmdirAsync(path, callback) {
  fs.readdir(path, function(err, files) {
    if(err) {
      // Pass the error on to callback
      callback(err, []);
      return;
    }
    var wait = files.length,
      count = 0,
      folderDone = function(err) {
      count++;
      // If we cleaned out all the files, continue
      if( count >= wait || err) {
        fs.rmdir(path,callback);
      }
    };
    // Empty directory to bail early
    if(!wait) {
      folderDone();
      return;
    }
    
    // Remove one or more trailing slash to keep from doubling up
    path = path.replace(/\/+$/,"");
    files.forEach(function(file) {
      var curPath = path + "/" + file;
      fs.lstat(curPath, function(err, stats) {
        if( err ) {
          callback(err, []);
          return;
        }
        if( stats.isDirectory() ) {
          rmdirAsync(curPath, folderDone);
        } else {
          fs.unlink(curPath, folderDone);
        }
      });
    });
  });
};
