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
  initialize: function (element, options) {
    options || (options = {});
    this.callSuper('initialize', element, options);
  },
  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'));
  },
  _render: function (ctx) {
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
      fill: 'black',
      stroke: 'black',
      originX: 'center',
      originY: 'center',
      hasBorders: false,
      hasControls: false
    });

    inst.canvas.add(line).setActiveObject(line);
  };

  Arrow.prototype.isEnable = function () {
    return this.isDrawing;
  };

  Arrow.prototype.enable = function () {
    this.isDrawing = true;
  };

  Arrow.prototype.disable = function () {
    this.isDrawing = false;
  };

  return Arrow;
}());

var arrow = new Arrow(canvas);
window.canvas = canvas;

function addRect() {
  canvas.defaultCursor = 'default';
  drawingMode = false;
  var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'white',
    width: 200,
    height: 100,
    stroke: 'black',
    strokeWidth: 2
  });
  canvas.add(rect);
  canvas.renderAll();
}

function addSquare() {
  var rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 2
  });

  canvas.add(rect);
  canvas.renderAll();
}

function addTriangle() {
  var triangle = new fabric.Triangle({
    left: 200,
    top: 200,
    width: 100,
    height: 100,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 2
  });

  canvas.add(triangle);
  canvas.renderAll();
}

function duplicateObj() {
  var activeObjs = canvas.getActiveObjects();
  if (activeObjs.length === 0) return;

  var clones = [];
  activeObjs.forEach(function (activeObj) {
    var clone = fabric.util.object.clone(activeObj);
    clone.set({
      left: activeObj.left + 100,
      top: activeObj.top + 100
    });
    if (activeObj.type === 'activeSelection') {
      clone.canvas = canvas;
      clone.forEachObject(function (obj) {
        canvas.add(obj);
        clones.push(obj);
      });
    } else {
      canvas.add(clone);
      clones.push(clone);
    }
  });

  canvas.setActiveObjects(clones);
  canvas.requestRenderAll();
}

function deleteObj() {
  var activeObjs = canvas.getActiveObjects();
  if (activeObjs.length === 0) return;

  activeObjs.forEach(function (activeObj) {
    canvas.remove(activeObj);
  });

  canvas.discardActiveObject();
  canvas.renderAll();
}

function addArrow() {
  drawingMode = !drawingMode;
  if (drawingMode) {
    canvas.defaultCursor = 'crosshair';
  } else {
    canvas.defaultCursor = 'default';
  }
}

function addText() {
  canvas.add(new fabric.IText('Example text', {
    fontFamily: 'Delicious_500',
    left: 50,
    top: 50
  }));
  canvas.renderAll();
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
  xhr.onload = function () {
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

function addSendMailButton() {
  var envelopeSVG = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-mail" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>' +
    '<rect x="3" y="5" width="18" height="14" rx="2"></rect>' +
    '<polyline points="3 7 12 13 21 7"></polyline>' +
    '</svg>';

  fabric.loadSVGFromString(envelopeSVG, function (objects, options) {
    var envelopeIcon = fabric.util.groupSVGElements(objects, options);
    envelopeIcon.set({
      left: 50,
      top: 50,
      scaleX: 2,  // Adjust the scale as needed
      scaleY: 2,  // Adjust the scale as needed
      fill: 'blue'
    });

    envelopeIcon.sendMail = function () {
      var recipient = prompt("Recipient:");
      var subject = prompt("Subject:");
      var body = prompt("Body:");
      // Perform the send mail functionality using the recipient, subject, and body

      // Save the mail object to the database
      saveObjectToDatabase(envelopeIcon);
    };

    envelopeIcon.on('mousedown', function () {
      envelopeIcon.sendMail();
    });

    canvas.add(envelopeIcon);
    canvas.renderAll();
  });
}


function dragStart(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData("text");

  if (data === "send-mail-btn") {
    var sendMailButton = new fabric.IText('Send Mail', {
      left: event.clientX - canvasOffset.left,
      top: event.clientY - canvasOffset.top,
      fontSize: 20,
      fill: 'blue',
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true
    });

    sendMailButton.on('mousedown', function () {
      var recipient = prompt("Recipient:");
      var subject = prompt("Subject:");
      var body = prompt("Body:");
      // Perform the send mail functionality using the recipient, subject, and body
    });

    canvas.add(sendMailButton);
  }
}

function allowDrop(event) {
  event.preventDefault();
}

