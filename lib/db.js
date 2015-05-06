(function() {
  var Collection, DB, fs, path;

  fs = require('fs');

  path = require('path');

  Collection = require('./collection');

  DB = (function() {
    function DB(path1) {
      var stats;
      this.path = path1;
      if (fs.existsSync(this.path)) {
        stats = fs.lstatSync(this.path);
        if (!stats.isDirectory()) {
          throw "Path should be a folder";
        }
      } else {
        fs.mkdirSync(this.path);
      }
    }

    DB.prototype.collection = function(name, autosave) {
      if (autosave == null) {
        autosave = true;
      }
      return new Collection(name, this, autosave);
    };

    DB.prototype.removeCollection = function(name) {
      var collection;
      collection = this.collection(name);
      return fs.unlinkSync(collection._cpath);
    };

    DB.prototype.getCollectionNames = function() {
      var _path, file, i, j, len, list, res;
      list = fs.readdirSync(this.path);
      res = [];
      for (i = j = 0, len = list.length; j < len; i = ++j) {
        file = list[i];
        _path = path.join(this.path, file);
        try {
          JSON.parse(fs.readFileSync(_path, 'utf8'));
          res.push(file);
        } catch (_error) {}
      }
      return res;
    };

    return DB;

  })();

  module.exports = DB;

}).call(this);
