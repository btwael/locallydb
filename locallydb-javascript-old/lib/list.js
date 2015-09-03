(function() {
  var List, _;

  _ = require('underscore');

  List = (function() {
    function List(items) {
      this.items = items != null ? items : [];
    }

    List.prototype.toArray = function() {
      return this.items;
    };

    List.prototype.length = function() {
      return this.items.length;
    };

    List.prototype.push = function(element) {
      return this.items.push(element);
    };

    List.prototype.pop = function(element) {
      return this.items.pop(element);
    };

    List.prototype.shift = function(element) {
      return this.items.shift(element);
    };

    List.prototype.unshift = function(element) {
      return this.items.unshift(element);
    };

    List.prototype.clear = function() {
      return this.items = [];
    };

    List.prototype.remove = function(from, to) {
      var rest;
      rest = this.items.slice((to || from) + 1 || this.items.length);
      this.items.length = from < 0 ? this.items.length + from : from;
      return this.items.push.apply(this.items, rest);
    };

    List.prototype.where = function(selection) {
      if (typeof selection === 'string') {
        selection = selection.replace(/@/g, 'element.');
        return new List(_.filter(this.items, function(element) {
          _ = require('underscore');
          return eval(selection);
        }));
      } else {
        return new List(_.where(this.items, selection));
      }
    };

    List.prototype.sort = function(method) {
      method = method.replace(/@/g, 'element.');
      return new List(_.sortBy(this.items, function(element) {
        _ = require('underscore');
        return eval(method);
      }));
    };

    List.prototype.group = function(method) {
      method = method.replace(/@/g, 'element.');
      return _.groupBy(this.items, function(element) {
        _ = require('underscore');
        return eval(method);
      });
    };

    return List;

  })();

  module.exports = List;

}).call(this);
