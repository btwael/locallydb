ErrorManager =
    errors:
        # Collection related errors
        101: (name) -> "Can't create collection with name `#{name}`, Another collection exists with the some name."
        102: (name) -> "Can't delete collection with name `#{name}`, There are no collectiion with such name."

        104: (name) -> "Collection with name `#{name}` not found."

        # Document
        201: (key) -> "Can't look for property with key `#{key}`, it's reserve for the system."
        201: (key) -> "Can't set property with key `#{key}`, it's reserved for the system."
        203: (key) -> "Can't set property with key `#{key}`, it's automatically set by the system."
        204: (key) -> "Property with key `#{key}` not found."

    throw: (number, parameters = []) ->
        throw "Error #{number}: " + @error[number].apply(null, parameters)

module.exports = ErrorManager