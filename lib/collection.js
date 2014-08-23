(function() {
  var Collection, fs, path, _;

  fs = require('fs');

  path = require('path');

  _ = require('underscore');

  Collection = (function() {
    function Collection(name, db) {
      var data;
      this.name = name;
      this.db = db;
      this.items = [];
      this.header = {
        '$created': (new Date).toJSON(),
        '$updated': (new Date).toJSON(),
        'lcid': -1
      };
      this._cpath = path.join(this.db.path, this.name);
      if (fs.existsSync(this._cpath)) {
        data = JSON.parse(fs.readFileSync(this._cpath, 'utf8'));
        this.items = data.items;
        this.header = data.header;
      } else {
        fs.writeFileSync(this._cpath, JSON.stringify({
          'header': this.header,
          'items': this.items
        }));
      }
    }

    Collection.prototype.save = function() {
      this.header['$updated'] = (new Date).toJSON();
      return fs.writeFileSync(this._cpath, JSON.stringify({
        'header': this.header,
        'items': this.items
      }));
    };

    Collection.prototype.insert = function(element) {
      var date, elem, _i, _len, _results;
      if (element instanceof Array) {
        _results = [];
        for (_i = 0, _len = element.length; _i < _len; _i++) {
          elem = element[_i];
          date = (new Date).toJSON();
          this.header.lcid++;
          elem['cid'] = this.header.lcid;
          elem['$created'] = date;
          elem['$updated'] = date;
          _results.push(this.items.push(elem));
        }
        return _results;
      } else {
        date = (new Date).toJSON();
        this.header.lcid++;
        element['cid'] = this.header.lcid;
        element['$created'] = date;
        element['$updated'] = date;
        return this.items.push(element);
      }
    };

    Collection.prototype.get = function(cid) {
      return _.findWhere(this.items, {
        'cid': cid
      });
    };

    Collection.prototype.where = function(selection) {
      selection = selection.replace(/@/g, 'element.');
      if (typeof selection === 'string') {
        return _.filter(this.items, function(element) {
          _ = require('underscore');
          return eval(selection);
        });
      } else {
        return _.where(this.items, selection);
      }
    };

    Collection.prototype.update = function(cid, obj) {
      var element, i, key, _i, _len, _ref;
      _ref = this.items;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        element = _ref[i];
        if (element.cid === cid) {
          obj['cid'] = this.items[i]['cid'];
          obj['$created'] = this.items[i]['$created'];
          obj['$updated'] = (new Date).toJSON();
          for (key in obj) {
            this.items[i][key] = obj[key];
          }
          return true;
        }
      }
      return false;
    };

    Collection.prototype.replace = function(cid, obj) {
      var element, i, key, _i, _len, _ref;
      _ref = this.items;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        element = _ref[i];
        if (element.cid === cid) {
          obj['cid'] = this.items[i]['cid'];
          obj['$created'] = this.items[i]['$created'];
          for (key in this.items[i]) {
            delete this.items[i][key];
          }
          obj['$updated'] = (new Date).toJSON();
          for (key in obj) {
            this.items[i][key] = obj[key];
          }
          return true;
        }
      }
      return false;
    };

    Collection.prototype.remove = function(cid) {
      var element, i, _i, _len, _ref;
      _ref = this.items;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        element = _ref[i];
        if (element.cid === cid) {
          delete this.items[i];
          return true;
        }
      }
      return false;
    };

    return Collection;

  })();

  module.exports = Collection;

}).call(this);
