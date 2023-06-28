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


function addUploadDocumentIcon() {
  var uploadSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="upload-folder"><path d="M12.71,10.79a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-2,2a1,1,0,0,0,1.42,1.42l.29-.3V16.5a1,1,0,0,0,2,0V13.91l.29.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42ZM19,5.5H12.72l-.32-1a3,3,0,0,0-2.84-2H5a3,3,0,0,0-3,3v13a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V8.5A3,3,0,0,0,19,5.5Zm1,13a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5.5a1,1,0,0,1,1-1H9.56a1,1,0,0,1,.95.68l.54,1.64A1,1,0,0,0,12,7.5h7a1,1,0,0,1,1,1Z"></path></svg>';

  fabric.loadSVGFromString(uploadSVG, function (objects, options) {
    var uploadIcon = fabric.util.groupSVGElements(objects, options);
    uploadIcon.set({
      left: 50,
      top: 50,
      scaleX: 2,  // Adjust the scale as needed
      scaleY: 2,  // Adjust the scale as needed
      fill: 'blue'
    });

    uploadIcon.uploadDocument = function () {
      // Perform the upload document functionality
      var fileInput = document.createElement('input');
      fileInput.type = 'file';

      fileInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        // Process the uploaded file

        // Save the document object to the database
        saveObjectToDatabase(uploadIcon);
      });

      fileInput.click();
    };

    uploadIcon.on('mousedown', function () {
      uploadIcon.uploadDocument();
    });

    canvas.add(uploadIcon);
    canvas.renderAll();
  });
}

function addWaitIcon() {
  // Specify the path of the SVG file
  var svgFilePath = '/static/images/Wait-Previous.svg';

  // Load the SVG file as an image
  fabric.Image.fromURL(svgFilePath, function (waitIcon) {
    waitIcon.set({
      left: 50,
      top: 50,
      scaleX: 2,  // Adjust the scale as needed
      scaleY: 2,  // Adjust the scale as needed
      fill: 'clear',
      stroke: 'black',
    });

    waitIcon.waitForPreviousStep = function () {
      // Implement the logic to wait for the previous step to be completed
      // For example, you can show a loading spinner or disable interactions until the previous step is completed

      // Once the previous step is completed, you can proceed with the next actions
      proceedWithNextActions(waitIcon);
    };

    waitIcon.on('mousedown', function () {
      waitIcon.waitForPreviousStep();
    });

    canvas.add(waitIcon);
    canvas.renderAll();
  });
}


function showDateTimePicker() {
  var dateTimePicker = $('#datetimepicker');
  dateTimePicker.show();

  // Initialize the date and time picker library or implement your own logic here
  // For example, you can use libraries like jQuery UI Datepicker combined with a time picker plugin
  dateTimePicker.datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    autoclose: true,
    todayBtn: true,
    startDate: new Date(),
    minuteStep: 15,
  });

  // Attach an event listener to capture the selected date and time
  dateTimePicker.on('change.datetimepicker', function (e) {
    var selectedDateTime = dateTimePicker.datetimepicker('getDate');
    updateDueDate(selectedDateTime);
    hideDateTimePicker();
  });
}


function addAlarmClockIcon() {
  // Specify the path of the SVG or ICO file
  var iconFilePath = '/static/images/Alarm-Clock.svg';

  fabric.Image.fromURL(iconFilePath, function (icon) {
    icon.set({
      left: 50,
      top: 50,
      scaleX: 0.25,  // Adjust the scale as needed
      scaleY: 0.25,  // Adjust the scale as needed
      fill: 'white',
      stroke: 'black',
    });

    icon.on('mousedown', function () {
      // Show the Bootstrap Datepicker as a popup
      $('#date-picker-example').datepicker('show');
    });

    canvas.add(icon);
    canvas.renderAll();
  });
}

function openPopup() {
  // Show the overlay
  $("#overlay").css("display", "flex");

  // Initialize the DateTimePicker
  let datetimepicker = new ej.calendars.DateTimePicker({
    format: "dd-MMM-yy hh:mm a",
    value: new Date(),
    placeholder: "Select a date and time",
    width: "233px"
  });
  datetimepicker.appendTo("#datetimepicker");
  datetimepicker.show("time");
}

function closePopup() {
  // Hide the overlay
  $("#overlay").css("display", "none");

  // Remove the DateTimePicker instance
  ej.base.remove($("#datetimepicker").children()[0]);
}

function submitForm() {
  // Get the selected date and time from the DateTimePicker
  let selectedDate = $("#datetimepicker").children().val();
  console.log("Selected Date:", selectedDate);

  // Close the popup
  closePopup();

  // Perform any additional actions or submit the form data to the backend
}
