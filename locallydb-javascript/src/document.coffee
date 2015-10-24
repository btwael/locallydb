ErrorManager = require './errormanager'
{now} = require './utils'

class Document
    constructor: (obj, @_collection) ->
        for key, value of obj
            if not key in Document.properties.reserved
                @[key] = value

    # Get collection where document is stored
    getCollection: ->
        @_collection

    # Check if has property
    hasProperty: (key) ->
        @hasOwnProperty(key)

    # Get a property value
    getProperty: (key) ->
        if key in Document.properties.reserved
            return ErrorManager.throw(201, [key])
        if @hasProperty(key)
            return @[key]
        ErrorManager.throw(204, [key])

    # Set property value
    setProperty: (key, value) ->
        if key in Document.properties.reserved
            return ErrorManager.throw(202, [key])
        if key in Document.properties.unchangeable
            return ErrorManager.throw(203, [key])
        @$update()
        @[key] = value

    # Update system date
    $update: (time = null) ->
        time = now() if time is null
        @meta._updated = time
        @getCollection().$update(time)

Document.properties =
    reserved: [
        'getCollection'
        'hasProperty', 'getProperty', 'setProperty'
        '$update'
    ]
    unchangeable: ['_collection', '_id', '_created', '_updated']

module.exports = Document