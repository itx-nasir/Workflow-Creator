function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.innerText);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var dropzone = document.getElementById("workflow-dropzone");
    var stepsInput = document.getElementById("steps");

    var step = document.createElement("div");
    step.innerText = data;
    step.className = "workflow-item";

    dropzone.appendChild(step);

    // Update the steps input value
    var steps = Array.from(dropzone.getElementsByClassName("workflow-item")).map(function(item) {
        return item.innerText;
    });
    stepsInput.value = steps.join(", ");
}
