Document = require './document'
{now} = require './utils'

class Collection
    constructor: (name, @database) ->
        @meta =
            name: name
            _created: now()
            _updated: now()
            _lid: 0
        @documents = []

    # Get collection name
    getName: ->
        @meta.name

    # Rename collection
    setName: (name) ->
        @meta.name = name

    # Create a new document
    createDocument: (obj = {}) ->
        obj._id = @meta._lid++
        obj._created = now()
        obj._updated = now()
        document = new Document(obj, @collection)
        @$update()
        @documents.push document
        document

    # Update system date
    $update: (time = null) ->
        time = now() if time is null
        @meta._updated = time
        @database.$update(time)

module.exports = Collection