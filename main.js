const HTMLTemplate = `
<div class="task-content">Content</div>
<div class="divider"></div>
<div class="actions">
    <button class="save hide">Save</button>
    <button class="edit">Edit</button>
    <button class="done">Done</button>
</div>
`;

if(localStorage.length > 1) {
    document.querySelector("#no-tasks-msg").classList.add("hide");
    
    // making an array of all saved tasks
    let savedTasks = [];
    for (let i = 0; i < localStorage.length; i++) {
         if(localStorage.key(i) !== "currID") {
            savedTasks.push(localStorage.getItem(localStorage.key(i))); 
         };
    }
    
    // sorting saved tasks by date
    savedTasks.sort((x, y) => {
        xDate = JSON.parse(x);
        yDate = JSON.parse(y);
        
        if(xDate.date > yDate.date) return 1;
        else if(xDate.date < yDate.date) return -1;
        else return 0;
    })


    // creating new elements in "#tasks-container" from data in localStorage
    // by looping through saved tasks
    savedTasks.forEach((item) => {
        let newTask = document.createElement("div");
        newTask.classList.add("task");
        newTask.id = JSON.parse(item).key;
        newTask.innerHTML = HTMLTemplate;
        newTask.querySelector(".task-content").textContent = JSON.parse(item).content;

        document.querySelector("#tasks-container").appendChild(newTask);

        let date = JSON.parse(item).date;
        let key = JSON.parse(item).key;
        buttonsFunctionality(newTask, date, key);
    })
}
// resetting the current ID if there are no active tasks
else localStorage.setItem("currID", 0);



// called on submit ("Add task" button)
document.querySelector("#form").addEventListener("submit", e => {
    e.preventDefault();
    const taskVal = document.querySelector("#new-task-input").value;
    
    // alert and return if input is empty
    if(taskVal.length < 1) {
        alert("Please specify the task");
        return;
    };
    // if didn't return after checking input length, then hide "You have no active tasks" message
    document.querySelector("#no-tasks-msg").classList.add("hide");    

    // emptying input field
    document.querySelector("#new-task-input").value = "";

    // creating HTML template
    const newTask = createNewTask(taskVal);    

    // appending new task to main container
    document.querySelector("#tasks-container").appendChild(newTask);
    
    // adding event listeners to buttons
    const date = Date.now();
    const key = parseInt(newTask.id);
    buttonsFunctionality(newTask, date, key);

    // setting key-value pair in localStorage
    // key is the task's id
    // value is a JSON file containing date, content and key
    // key is for the for loop that adds content to "#tasks-container" if the page was refreshed
    localStorage.setItem(
        parseInt(newTask.id), 
        JSON.stringify({ 
            date: Date.now(), 
            content: taskVal,
            key: key
            }
        )
    );

    // incrementing current ID in localStorage
    localStorage.setItem("currID", parseInt(localStorage.getItem("currID")) + 1)
});

function buttonsFunctionality(passedNewTask, passedDate, passedKey) {
    const edit = passedNewTask.querySelector(".edit");
    const save = passedNewTask.querySelector(".save");
    const done = passedNewTask.querySelector(".done");
    const passedContent = passedNewTask.querySelector(".task-content");
    const container = document.querySelector("#tasks-container");
    const msg = container.querySelector("#no-tasks-msg");
    
    // event listeners for action buttons
    edit.addEventListener("click", () => {
        passedContent.setAttribute("contenteditable", "true");
        edit.classList.add("hide"); // hide edit button
        save.classList.remove("hide"); // unhide save button
        done.setAttribute("disabled", "");
        done.classList.add("disabled");
        
        // setting up range to move the cursor to the end of contenteditable div
        let range = document.createRange();
        range.setStart(passedContent.firstChild, passedContent.firstChild.length);
        range.setEnd(passedContent.firstChild, passedContent.firstChild.length);

        // removing and adding new selection
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);
        
        // call saveFun if users presses enter 
        passedContent.addEventListener("keydown", e => { if(e.key === "Enter") saveFun(); })
    });


    save.addEventListener("click", () => {
        // writing updated content to database
        console.log("save");
        localStorage.setItem(
            passedNewTask.id, 
            JSON.stringify(
            { date: passedDate, content: passedContent.textContent, key: passedKey }
        ));

        passedContent.setAttribute("contenteditable", "false");
        done.removeAttribute("disabled");
        done.classList.remove("disabled");

        edit.classList.remove("hide");
        save.classList.add("hide");
    })

    done.addEventListener("click", () => {
        // removes task from document
        container.removeChild(passedNewTask);
        localStorage.removeItem(passedNewTask.id);

        // checks if there are any tasks left (checks if greater than 1 because "1" is the message itself),
        // and either hides or shows the message
        if(container.children.length <= 1) msg.classList.remove("hide");
    })
};

function createNewTask(content) {
    const newTask = document.createElement("div");
    newTask.classList.add("task");
    newTask.id = localStorage.getItem("currID");
    newTask.innerHTML = HTMLTemplate;
    newTask.querySelector(".task-content").textContent = content;
    return newTask;
}