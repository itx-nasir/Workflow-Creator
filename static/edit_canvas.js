// Function to delete the selected object
function deleteObj() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
    }
}

// Function to duplicate the selected object
function duplicateObj() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        var clone = activeObject.clone();
        clone.set({
            left: activeObject.left + 10,
            top: activeObject.top + 10
        });
        canvas.add(clone);
    }
}

// Function to add a rectangle to the canvas
function addRect() {
    var rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 2,
        left: 10,
        top: 10
    });
    canvas.add(rect);
}

// Function to add an arrow to the canvas
function addArrow() {
    var arrow = new fabric.LineArrow([0, 0, 50, 0], {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 5,
        left: 10,
        top: 10
    });
    canvas.add(arrow);
}

// Function to add text to the canvas
function addText() {
    var text = new fabric.Textbox('Text', {
        left: 10,
        top: 10,
        fontSize: 20
    });
    canvas.add(text);
}

// Function to add a square to the canvas
function addSquare() {
    var square = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        left: 10,
        top: 10
    });
    canvas.add(square);
}

// Function to add a triangle to the canvas
function addTriangle() {
    var triangle = new fabric.Triangle({
        width: 100,
        height: 100,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        left: 10,
        top: 10
    });
    canvas.add(triangle);
}

// Function to update the workflow
function updateWorkflow() {
    // Retrieve the canvas data
    var canvasData = JSON.stringify(canvas.toJSON());

    // Set the canvas data in a hidden input field for form submission
    document.getElementById('canvas-data').value = canvasData;
}

// Initialize the canvas
var canvas = new fabric.Canvas('canvas', { width: 800, height: 500 });

// Load the existing workflow data onto the canvas
var workflowData = JSON.parse('{{ workflow["canvas_data"]|safe|replace("\'", "\\\'") }}');
canvas.loadFromJSON(workflowData, function () {
    canvas.renderAll();
});

// Bind button click events to the respective functions
document.getElementById('delete-btn').addEventListener('click', deleteObj);
document.getElementById('duplicate-btn').addEventListener('click', duplicateObj);
document.getElementById('add-rect-btn').addEventListener('click', addRect);
document.getElementById('add-arrow-btn').addEventListener('click', addArrow);
document.getElementById('add-text-btn').addEventListener('click', addText);
document.getElementById('add-square-btn').addEventListener('click', addSquare);
document.getElementById('add-triangle-btn').addEventListener('click', addTriangle);
document.getElementById('update-btn').addEventListener('click', updateWorkflow);
