let box = document.querySelector('#workflow-container');
let width = box.offsetWidth;
let height = box.offsetHeight;
let canvas = new fabric.Canvas('workflow-canvas', {
    width: width,
    height: height
});
let drawingMode = false;
let scaleProps = {
    fontWeight: 500,
    height: 20,
    lineHeight: 41.36,
    lineSelectorHeight: 20,
    strokeWidth: 10,
    width: 56,
    top: 407
};

fabric.LineArrow = fabric.util.createClass(fabric.Line, {
    type: 'lineArrow',

    initialize: function(element, options) {
        options || (options = {});
        this.callSuper('initialize', element, options);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'));
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        if (this.width === 0 || this.height === 0 || !this.visible) return;

        ctx.save();

        var xDiff = this.x2 - this.x1;
        var yDiff = this.y2 - this.y1;
        var angle = Math.atan2(yDiff, xDiff);
        ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-20, 15);
        ctx.lineTo(-20, -15);
        ctx.closePath();
        ctx.fillStyle = this.stroke;
        ctx.fill();
        ctx.restore();
    }
});

fabric.LineArrow.fromObject = function(object, callback) {
    callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};

fabric.LineArrow.async = true;

var Arrow = (function() {
    function Arrow(workflowCanvas) {
        this.canvas = workflowCanvas;
        this.className = 'Arrow';
        this.isDrawing = false;
        this.bindEvents();
    }

    Arrow.prototype.bindEvents = function() {
        var inst = this;
        inst.canvas.on('mouse:down', function(o) {
            inst.onMouseDown(o);
        });
        inst.canvas.on('mouse:move', function(o) {
            inst.onMouseMove(o);
        });
        inst.canvas.on('mouse:up', function(o) {
            inst.onMouseUp(o);
        });
        inst.canvas.on('object:moving', function(o) {
            inst.disable();
        });
    };

    Arrow.prototype.onMouseUp = function(o) {
        var inst = this;
        drawingMode = false;
        workflowCanvas.defaultCursor = 'default';
        inst.disable();
    };

    Arrow.prototype.onMouseMove = function(o) {
        var inst = this;
        if (!inst.isEnable()) {
            return;
        }

        var pointer = inst.canvas.getPointer(o.e);
        var activeObj = inst.canvas.getActiveObject();
        activeObj.set({
            x2: pointer.x,
            y2: pointer.y
        });
        activeObj.setCoords();
        inst.canvas.renderAll();
    };

    Arrow.prototype.onMouseDown = function(o) {
        if (!drawingMode) return;
        var inst = this;
        inst.enable();
        var pointer = inst.canvas.getPointer(o.e);

        var points = [pointer.x, pointer.y, pointer.x, pointer.y];
        var line = new fabric.LineArrow(points, {
            strokeWidth: 5,
            fill: 'black',
            stroke: 'black',
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false
        });

        inst.canvas.add(line).setActiveObject(line);
    };

    Arrow.prototype.isEnable = function() {
        return this.isDrawing;
    };

    Arrow.prototype.enable = function() {
        this.isDrawing = true;
    };

    Arrow.prototype.disable = function() {
        this.isDrawing = false;
    };

    return Arrow;
}());
var arrow = new Arrow(canvas);
window.workflowCanvas = canvas;

// Add rect
function addRect() {
    workflowCanvas.defaultCursor = 'default';
    drawingMode = false;
    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        width: 200,
        height: 100,
        stroke: 'black',
        strokeWidth: 2
    });
    workflowCanvas.add(rect);
    workflowCanvas.renderAll();
}

function deleteObj() {
    let obj = workflowCanvas.getActiveObject();
    if (!obj) return;
    workflowCanvas.remove(obj);
    workflowCanvas.renderAll();
}

function addArrow() {
    drawingMode = !drawingMode;
    if (drawingMode) {
        workflowCanvas.defaultCursor = 'crosshair';
    } else {
        workflowCanvas.defaultCursor = 'default';
    }
}

function addText() {
    workflowCanvas.add(new fabric.IText('Example text', {
        fontFamily: 'Delicious_500',
        left: 50,
        top: 50
    }));
    workflowCanvas.renderAll();
}

function createWorkflow() {
    event.preventDefault(); // Prevent the default form submission behavior

    var workflowData = {
        canvasData: JSON.stringify(workflowCanvas.toJSON()),
        workflow_name: document.querySelector('input[name="workflow_name"]').value, // Get the value of the workflow_name field
    };

    // Send the workflow data to the server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/create-workflow');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            // Workflow created successfully
            var response = JSON.parse(xhr.responseText);
            loadWorkflowData(response.workflowData); // Load the workflow data into the canvas
            window.location.href = '/user-dashboard';
        } else {
            // Error occurred while creating the workflow
            console.error('Error:', xhr.responseText);
        }
    };
    xhr.send(JSON.stringify(workflowData));
}

function loadWorkflowData(workflowData) {
    workflowCanvas.loadFromJSON(workflowData, function() {
        workflowCanvas.renderAll();
    });
}
