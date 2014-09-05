fs = require 'fs'
path = require 'path'
_ = require 'underscore'

class Collection
	constructor: (@name, @db, @autosave = true) ->
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
			result = []
			for elem in element
				date = (new Date).toJSON()
				@header.lcid++
				elem['cid'] = @header.lcid
				elem['$created'] = date
				elem['$updated'] = date
				@items.push elem
				result.push @header.lcid
		else
			date = (new Date).toJSON()
			@header.lcid++
			element['cid'] = @header.lcid
			element['$created'] = date
			element['$updated'] = date
			@items.push element
			result = @header.lcid
		@save() if @autosave
		return result

	upsert: (element, key, value) ->
		check = @where("(@" + key + " ==  '" + value + "')")
		if check.length > 0
			@update check[0].cid, element
			return true
		else
			@insert element
			return @header.lcid

	# Retrieving data functions
	get: (cid) ->  _.findWhere(@items, {'cid': cid})

	where: (selection) ->
		if typeof selection is 'string'
			selection = selection.replace(/@/g, 'element.')
			return _.filter(@items, (element) ->
				_ = require 'underscore'
				return eval(selection)
			)
		else
			return _.where(@items, selection)

	# Updatig data
	update: (cid, obj) ->
		for element, i in @items
			if element.cid is cid
				obj['cid'] = `this.items[i]['cid']`
				obj['$created'] = `this.items[i]['$created']`
				obj['$updated'] = (new Date).toJSON()
				for key of obj
					`this.items[i][key] = obj[key]`
				@save() if @autosave
				return true
		return false

	replace: (cid, obj) -> # the element at cid well be remplaced with obj with the same cid an $created property
		for element, i in @items
			if element.cid is cid
				obj['cid'] = `this.items[i]['cid']`
				obj['$created'] = `this.items[i]['$created']`
				for key of `this.items[i]`
					`delete this.items[i][key]`
				obj['$updated'] = (new Date).toJSON()
				for key of obj
					`this.items[i][key] = obj[key]`
				@save() if @autosave
				return true
		return false

	# Deleting data
	remove: (cid) ->
		for element, i in @items
			if element.cid is cid
				`delete this.items[i]`
				return true
			@save() if @autosave
		return false

	deleteProperty: (cid, property) ->
		for element, i in @items
			if element.cid is cid
				if property instanceof Array
					properties = property
					for property in properties
						if element[property]?
							`delete this.items[i][property]`
				else
					if element[property]?
						`delete this.items[i][property]`
				@save() if @autosave
				return true
		return false

module.exports = Collection
