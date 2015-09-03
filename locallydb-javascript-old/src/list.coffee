_ = require 'underscore'

class List
	constructor: (@items = []) ->

	toArray: -> @items

	length: -> @items.length
		
	push: (element) -> @items.push element
	pop: (element) -> @items.pop element
	shift: (element) -> @items.shift element
	unshift: (element) -> @items.unshift element

	clear: -> @items = []

	remove: (from, to) ->
		rest = @items.slice((to || from) + 1 || @items.length)
		@items.length = if from < 0 then @items.length + from else from
		return @items.push.apply @items, rest

	where: (selection) ->
		if typeof selection is 'string'
			selection = selection.replace(/@/g, 'element.')
			return new List _.filter(@items, (element) ->
				_ = require 'underscore'
				return eval(selection)
			)
		else
			return new List _.where(@items, selection)

	sort: (method) ->
		method = method.replace(/@/g, 'element.')
		return new List _.sortBy(@items, (element) ->
			_ = require 'underscore'
			return eval(method)
		)

	group: (method) ->
		method = method.replace(/@/g, 'element.')
		return _.groupBy(@items, (element) ->
			_ = require 'underscore'
			return eval(method)
		)

module.exports = List