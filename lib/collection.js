(function() {
  var Collection, fs, path, _;

  fs = require('fs');

  path = require('path');

  _ = require('underscore');

  Array.prototype.remove = function(from, to) {
    var rest;
    rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

  Collection = (function() {
    function Collection(name, db, autosave) {
      var data;
      this.name = name;
      this.db = db;
      this.autosave = autosave != null ? autosave : true;
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
      var date, elem, result, _i, _len;
      if (element instanceof Array) {
        result = [];
        for (_i = 0, _len = element.length; _i < _len; _i++) {
          elem = element[_i];
          date = (new Date).toJSON();
          this.header.lcid++;
          elem['cid'] = this.header.lcid;
          elem['$created'] = date;
          elem['$updated'] = date;
          this.items.push(elem);
          result.push(this.header.lcid);
        }
      } else {
        date = (new Date).toJSON();
        this.header.lcid++;
        element['cid'] = this.header.lcid;
        element['$created'] = date;
        element['$updated'] = date;
        this.items.push(element);
        result = this.header.lcid;
      }
      if (this.autosave) {
        this.save();
      }
      return result;
    };

    Collection.prototype.upsert = function(element, key, value) {
      var check;
      check = this.where("(@" + key + " ==  '" + value + "')");
      if (check.length > 0) {
        this.update(check[0].cid, element);
        return true;
      } else {
        this.insert(element);
        return this.header.lcid;
      }
    };

    Collection.prototype.get = function(cid) {
      return _.findWhere(this.items, {
        'cid': cid
      });
    };

    Collection.prototype.where = function(selection) {
      if (typeof selection === 'string') {
        selection = selection.replace(/@/g, 'element.');
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
          if (this.autosave) {
            this.save();
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
          if (this.autosave) {
            this.save();
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
          this.items.remove(i);
          return true;
        }
        if (this.autosave) {
          this.save();
        }
      }
      return false;
    };

    Collection.prototype.deleteProperty = function(cid, property) {
      var element, i, properties, _i, _j, _len, _len1, _ref;
      _ref = this.items;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        element = _ref[i];
        if (element.cid === cid) {
          if (property instanceof Array) {
            properties = property;
            for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
              property = properties[_j];
              if (element[property] != null) {
                delete this.items[i][property];
              }
            }
          } else {
            if (element[property] != null) {
              delete this.items[i][property];
            }
          }
          if (this.autosave) {
            this.save();
          }
          return true;
        }
      }
      return false;
    };

    return Collection;

  })();

  module.exports = Collection;

}).call(this);
