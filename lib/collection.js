(function() {
  var Collection, _, fs, list, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs');

  path = require('path');

  _ = require('underscore');

  list = require('./list');

  Array.prototype.remove = function(from, to) {
    var rest;
    rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

  Collection = (function(superClass) {
    extend(Collection, superClass);

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
      var date, elem, j, len, result;
      if (element instanceof Array) {
        result = [];
        for (j = 0, len = element.length; j < len; j++) {
          elem = element[j];
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

    Collection.prototype.update = function(cid, obj) {
      var element, i, j, key, len, ref;
      ref = this.items;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        element = ref[i];
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
      var element, i, j, key, len, ref;
      ref = this.items;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        element = ref[i];
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
      var element, i, j, len, ref;
      ref = this.items;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        element = ref[i];
        if (element.cid === cid) {
          this.items.remove(i);
          if (this.autosave) {
            this.save();
          }
          return true;
        }
      }
      return false;
    };

    Collection.prototype.deleteProperty = function(cid, property) {
      var element, i, j, k, len, len1, properties, ref;
      ref = this.items;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        element = ref[i];
        if (element.cid === cid) {
          if (property instanceof Array) {
            properties = property;
            for (k = 0, len1 = properties.length; k < len1; k++) {
              property = properties[k];
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

  })(list);

  module.exports = Collection;

}).call(this);
