function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.innerText);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var workflowContainer = document.getElementById("workflow-container");
    var workflowItem = document.createElement("div");
    workflowItem.classList.add("workflow-item");
    workflowItem.innerText = data;
    workflowContainer.appendChild(workflowItem);
    updateStepsInput();
}

function updateStepsInput() {
    var workflowContainer = document.getElementById("workflow-container");
    var workflowItems = workflowContainer.getElementsByClassName("workflow-item");
    var stepsInput = document.getElementById("steps");
    var steps = "";
    for (var i = 0; i < workflowItems.length; i++) {
        steps += workflowItems[i].innerText + ",";
    }
    stepsInput.value = steps;
}
