fs = require 'fs'
path = require 'path'

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

	getCollectionNames: () ->
		list = fs.readdirSync(@path)
		res = []
		for file, i in list
			_path = path.join @path, file
			try
				JSON.parse(fs.readFileSync(_path, 'utf8'))
				res.push file
		return res

module.exports = DB