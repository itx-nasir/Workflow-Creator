// Drag and Drop functions
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.innerText);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var workflowItem = document.createElement("div");
    workflowItem.className = "workflow-item";
    workflowItem.innerText = data;
    event.target.appendChild(workflowItem);
}
