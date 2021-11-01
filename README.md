# store
A ready to use backend based on JSON. This design works well for applications where the data is shared among all the users.

## Getting started

```
// Initialise the store with the configuration
Store.init(config);

// Allows get, set (create, update), delete operations
// Creates an item at the end of list if id doesnt exist
Store.set("assessmentTemplate",{id:"1234-4321-1234"}); 
Store.get("assessmentTemplate",0)

// Delete
Store.delete("assessmentTemplate",{id:"1234-4321-1234"})


```
