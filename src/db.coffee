fs = require 'fs'

Collection = require './collection'

class DB
	constructor: (@path) ->
		if fs.existsSync(path)
			stats = fs.lstatSync(path);
			if not stats.isDirectory()
				throw "Path should be a folder"
		else
			fs.mkdirSync(path)

	collection: (name) ->
		return new Collection(name, @)

module.exports = DB
