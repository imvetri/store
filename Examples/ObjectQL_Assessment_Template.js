
function persist(value){
    fetch("/store", {
     
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify(value),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}

/*
    This function takes an object and converts to a proxy object.
    It also takes care of proxying nested objectsa and array.
*/
let getProxy = (original) => {
    return new Proxy(original, {
        get(target, name, receiver) {
            let rv = Reflect.get(target, name, receiver);
            // need to store parent for array values as the key is an index not a propert
            parent = name;
            return rv;
        },
        set(target, name, value, receiver) {
            // Proxies new objects 
            if(typeof value === "object"){
                value = getProxy(value);
                // write object
            }
            if(typeof Number(name)!== NaN){
                // use the parent
                console.log(parent);
                // write object in index
            }

            // persist
            persist(assessmentTemplate);
            return Reflect.set(target, name, value, receiver);
        },
        deleteProperty: function(target, property) {
            if (property in target) {
                delete target[property];
                // persist
                persist(assessmentTemplate);
            }
        }
    })
}
let assessmentTemplate = getProxy({}); // Creates Assessment Template

assessmentTemplate.name = "";
assessmentTemplate.description = "";
assessmentTemplate.questions = [];
assessmentTemplate.questions.push({
    question: "",
    answers: [],
    correctAnswer: ""
});

assessmentTemplate.impacts = [];
assessmentTemplate.impacts.push({
    name: "",
    description: ""
});

assessmentTemplate.impacts[0].dimensions = [];
assessmentTemplate.impacts[0].dimensions.push({
    question: "",
    scales: [],
    correctAnswer: ""
});


assessmentTemplate.impacts[0].dimensions[0].scales.push({
    name: "",
    description: "",
    weight: 0
});

assessmentTemplate.thresholds = [];
assessmentTemplate.thresholds.push({
    name: "",
    description: "",
    weight: 0
});

assessmentTemplate.thresholds[0].dimensions = [];
assessmentTemplate.thresholds[0].dimensions.push({
    question: "",
    scales: [],
    correctAnswer: ""
});