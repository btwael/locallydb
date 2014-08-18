fs = require 'fs'
path = require 'path'
_ = require 'underscore'

class Collection
	constructor: (@name, @db) ->
		@items = []
		@header = {
			'$created': (new Date).toJSON(),
			'$updated': (new Date).toJSON(),
			'lcid': -1
		}
		@_cpath = path.join @db.path, @name
		if fs.existsSync(@_cpath)
			data = JSON.parse(fs.readFileSync(@_cpath, 'utf8'))
			@items = data.items
			@header = data.header
		else
			fs.writeFileSync(@_cpath, JSON.stringify({
				'header': @header,
				'items': @items
			}))

	save: ->
		@header['$updated'] = (new Date).toJSON()
		fs.writeFileSync(@_cpath, JSON.stringify({
			'header': @header
			'items': @items
		}))

	# Add data
	insert: (element) ->
		if element instanceof Array
			for elem in element
				date = (new Date).toJSON()
				@header.lcid++
				elem['cid'] = @header.lcid
				elem['$created'] = date
				elem['$updated'] = date
				@items.push elem
		else
			date = (new Date).toJSON()
			@header.lcid++
			element['cid'] = @header.lcid
			element['$created'] = date
			element['$updated'] = date
			@items.push element

	# Retrieving data functions
	get: (cid) ->  _.findWhere(@items, {'cid': cid})

	where: (selection) ->
		selection = selection.replace(/@/g, 'element.')
		if typeof selection is 'string'
			return _.filter(@items, (element) ->
				_ = require 'underscore'
				return eval(selection)
			)
		else
			return _.where(@items, selection)

	# Deleting data
	remove: (cid) ->
		for element, i in @items
			if element.cid is cid
				`delete this.items[i]`
				return true
		return false

module.exports = Collection