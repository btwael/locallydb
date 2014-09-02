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

	collection: (name, autosave =true) ->
		return new Collection(name, @, autosave)

module.exports = DB
