// canvas.js

let box = document.querySelector('#workflow-container');
let width = box.offsetWidth;
let height = box.offsetHeight;
let canvas = new fabric.Canvas('canvas', {
  width,
  height
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
  
    initialize: function(points, options) {
      options || (options = {});
      this.callSuper('initialize', points, options);
    },
  
    _render: function(ctx) {
      this.callSuper('_render', ctx);
  
      var xDiff = this.x2 - this.x1;
      var yDiff = this.y2 - this.y1;
      var angle = Math.atan2(yDiff, xDiff);
  
      ctx.beginPath();
      ctx.moveTo(this.x2, this.y2);
      ctx.lineTo(
        this.x2 - Math.cos(angle - Math.PI / 6) * 20,
        this.y2 - Math.sin(angle - Math.PI / 6) * 20
      );
      ctx.lineTo(
        this.x2 - Math.cos(angle + Math.PI / 6) * 20,
        this.y2 - Math.sin(angle + Math.PI / 6) * 20
      );
      ctx.closePath();
      ctx.fillStyle = this.stroke;
      ctx.fill();
    },
  
    toObject: function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {});
    }
  });
  




fabric.LineArrow.fromObject = function (object, callback) {
  callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};

fabric.LineArrow.async = true;

var Arrow = (function () {
  function Arrow(canvas) {
    this.canvas = canvas;
    this.className = 'Arrow';
    this.isDrawing = false;
    this.bindEvents();
  }

  Arrow.prototype.bindEvents = function () {
    var inst = this;
    inst.canvas.on('mouse:down', function (o) {
      inst.onMouseDown(o);
    });
    inst.canvas.on('mouse:move', function (o) {
      inst.onMouseMove(o);
    });
    inst.canvas.on('mouse:up', function (o) {
      inst.onMouseUp(o);
    });
    inst.canvas.on('object:moving', function (o) {
      inst.disable();
    });
  };

  Arrow.prototype.onMouseUp = function (o) {
    var inst = this;
    drawingMode = false;
    canvas.defaultCursor = 'default';
    inst.disable();
  };

  Arrow.prototype.onMouseMove = function (o) {
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

  Arrow.prototype.onMouseDown = function (o) {
    if (!drawingMode) return;
    var inst = this;
    inst.enable();
    var pointer = inst.canvas.getPointer(o.e);

    var points = [pointer.x, pointer.y, pointer.x, pointer.y];
    var line = new fabric.LineArrow(points, {
      strokeWidth: 5,
      fill: 'red',
      stroke: 'red',
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasBorders: true,
      hasControls: true,
      evented: true
    });

    inst.canvas.add(line).setActiveObject(line);
  };

  Arrow.prototype.isEnable = function () {
    return this.isDrawing;
  };

  Arrow.prototype.enable = function () {
    this.isDrawing = true;
    canvas.selection = false;
  };

  Arrow.prototype.disable = function () {
    this.isDrawing = false;
    canvas.selection = true;
  };

  return Arrow;
})();

var arrow = new Arrow(canvas);
window.canvas = canvas;

// Add rect function...
// Delete object function...
// Add arrow function...
// Add text function...
// Create workflow function...


//Add rect

function addRect() {
    canvas.defaultCursor = 'default';
    drawingMode = false;
    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        width: 200,
        height: 100,
        stroke:'black',
        strokeWidth:2
    });
    canvas.add(rect);
    canvas.renderAll();
}

function deleteObj() {
let obj = canvas.getActiveObject();
if(!obj) return;
canvas.remove(obj);
canvas.renderAll();
}

function addArrow() {
drawingMode = !drawingMode;
if(drawingMode){
    canvas.defaultCursor = 'crosshair'
}
else{
    canvas.defaultCursor = 'default'
}
}


function addText() {
    canvas.add(new fabric.IText('Example text', {
        fontFamily: 'Delicious_500',
        left: 50,
        top: 50
    }));
    canvas.renderAll()
}


function createWorkflow() {
    event.preventDefault(); // Prevent the default form submission behavior

    var workflowData = {
        canvasData: JSON.stringify(canvas.toJSON()),
        workflow_name: document.querySelector('input[name="workflow_name"]').value // Get the value of the workflow_name field
    };

    // Send the workflow data to the server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/create-workflow');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            // Workflow created successfully
            window.location.href = '/user-dashboard';
        } else {
            // Error occurred while creating the workflow
            console.error('Error:', xhr.responseText);
        }
    };
    xhr.send(JSON.stringify(workflowData));
}

