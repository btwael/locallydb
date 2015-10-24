Collection = require './collection'
ErrorManager = require './errormanager'
{now} = require './utils'

class Database
    constructor: ->
        @meta =
            _created: now()
            _updated: now()
        @collections = []

    collection: (name) ->
        if @hasCollection(name)
            @getCollection(name)
        else
            @createCollection(name, on)

    # Add a new collection to this database
    createCollection: (name, skipLook = off) ->
        if not skipLook
            if @hasCollection(name)
                return ErrorManager.throw(101, [name])
        collection = new Collection(name, @)
        @$update()
        @collections.push collection
        collection

    # Get a collection from name
    getCollection: (name) ->
        for collection in @collections
            if collection.getName() is name
                return collection
        ErrorManager.throw(104, [name])

    # Check if database has a collection
    hasCollection: (name) ->
        found = off
        for collection in @collections
            if collection.getName() is name
                found = on
                break
        found

    # Remove a collection
    removeCollection: (name) ->
        for collection, index in @collections
            if collection.getName() is name
                @$update()
                delete @collections[index]
                return on
        ErrorManager.throw(102, [name])

    # List collections names
    getCollectionNames: ->
        collection.getName() for collection in @collections

    # Update system date
    $update: (time = null) ->
        time = now() if time is null
        @meta._updated = time

module.exports = Database