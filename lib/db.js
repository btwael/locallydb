(function() {
  var Collection, DB, fs, path;

  fs = require('fs');

  path = require('path');

  Collection = require('./collection');

  DB = (function() {
    function DB(path) {
      var stats;
      this.path = path;
      if (fs.existsSync(path)) {
        stats = fs.lstatSync(path);
        if (!stats.isDirectory()) {
          throw "Path should be a folder";
        }
      } else {
        fs.mkdirSync(path);
      }
    }

    DB.prototype.collection = function(name, autosave) {
      if (autosave == null) {
        autosave = true;
      }
      return new Collection(name, this, autosave);
    };

    DB.prototype.getCollectionNames = function() {
      var file, i, list, res, _i, _len, _path;
      list = fs.readdirSync(this.path);
      res = [];
      for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
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
