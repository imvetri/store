# store
A ready to use backend based on JSON. This design works well for applications where the data is shared among all the users.

## Getting started

```
// configuration example

let config = {
  "assessmentTemplate" : {
    "GET" : ()=>{
      return graphQL_query_for_get
    },
    "SET" : (id,value)=>{
      // update if id is passed
      if(id){
        return ()=>{
          return graphQL_Mutation_for_set(id,value)
        }
      }
      // create if no id is passed
      return ()=>{
        return graphQL_Mutation_for_set(value)
      }
    },
    "DELETE": (id)=>{
      return ()=>{
        return graphQL_mutation_for_delete(id)
      }
    }
  }
}

// Initialise the store with the configuration
Store.init(config);

// Allows get, set (create, update), delete operations

// Creates an item at the end of list if id doesnt exist
Store.set("assessmentTemplate",{id:"1234-4321-1234"}); 
Store.get("assessmentTemplate",0)

// Delete
Store.delete("assessmentTemplate",{id:"1234-4321-1234"})

```
