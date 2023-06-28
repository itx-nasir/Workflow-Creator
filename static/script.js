function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData("text");
  var canvasOffset = canvas.getOffset();

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
  } else if (data === "square-btn") {
    addSquare();
  } else if (data === "triangle-btn") {
    addTriangle();
  }
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

function sendMail() {
  var toEmail = "recipient@example.com";  // Update with the recipient's email address
  var subject = "Example Subject";  // Update with the desired email subject
  var message = "Example message body";  // Update with the desired email message

  // Create the "Send Mail" object on the canvas
  var sendMailObject = new fabric.Text("Send Mail", {
    left: 100,
    top: 100,
    fill: "white",
    fontSize: 16,
    fontFamily: "Arial",
    backgroundColor: "blue",
    padding: 10,
    selectable: false
  });

  // Add the "Send Mail" object to the canvas
  canvas.add(sendMailObject);
  canvas.renderAll(); // Render the canvas to show the newly added object

  // Send the email via an AJAX request to the server
  $.ajax({
    url: "/send-mail",
    type: "POST",
    data: {
      to_email: toEmail,
      subject: subject,
      message: message
    },
    success: function(response) {
      if (response.success) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email. Please try again.");
      }
    },
    error: function() {
      alert("Failed to send email. Please try again.");
    }
  });
}


function findObjectAtPosition(x, y) {
  // Iterate through all objects in the canvas
  var objects = canvas.getObjects();
  for (var i = objects.length - 1; i >= 0; i--) {
    var obj = objects[i];
    // Check if the object contains the drop position
    if (obj.containsPoint({ x: x, y: y })) {
      return obj; // Return the found object
    }
  }
  return null; // Return null if no object is found
}

function saveObjectToDatabase(obj) {
  // Make an AJAX request to save the object data to the server or database
  // Customize this function based on your backend implementation

  // Example AJAX request using jQuery
  $.ajax({
    url: "/save-object", // Replace with your server endpoint URL
    type: "POST",
    data: {
      object_id: obj.id, // Pass the object ID or any other identifier
      // Pass any other relevant data you want to save, such as recipient, subject, body, etc.
    },
    success: function (response) {
      // Handle the success response from the server
      console.log("Object saved to the database!");
    },
    error: function () {
      // Handle the error case
      console.error("Failed to save object to the database.");
    },
  });
}

function addSendMail() {
  // Create the "Send Mail" button object
  var sendMailButton = new fabric.IText('Send Mail', {
    left: 50,
    top: 50,
    fontSize: 20,
    fill: 'blue'
  });

  // Assign the desired functionality to the "Send Mail" button
  sendMailButton.sendMail = function () {
  var formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <form id="mailForm">
      <input type="text" id="recipient" name="recipient" placeholder="Recipient" required><br>
      <input type="text" id="subject" name="subject" placeholder="Subject" required><br>
      <textarea id="body" name="body" placeholder="Body" required></textarea><br>
      <input type="submit" value="Send">
    </form>
  `;

  var form = formContainer.querySelector("#mailForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var recipient = form.querySelector("#recipient").value;
    var subject = form.querySelector("#subject").value;
    var body = form.querySelector("#body").value;

    // Perform the send mail functionality using the recipient, subject, and body

    // Save the mail object to the database
    saveObjectToDatabase(sendMailButton, recipient, subject, body);

    // Close the popup form
    document.body.removeChild(popupContainer);
  });

  var popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");
  popupContainer.appendChild(formContainer);
  document.body.appendChild(popupContainer);
};

  // Add the "Send Mail" button to the canvas
  canvas.add(sendMailButton);
}

canvas.on('mouse:down', function (options) {
  if (options.target && typeof options.target.sendMail === 'function') {
    options.target.sendMail();
  }
});

function dragStart(event) {
  event.dataTransfer.setData("text", event.target.id);
  if (event.target.id === "square-btn") {
    event.dataTransfer.setData("text", "square-btn");
  } else if (event.target.id === "triangle-btn") {
    event.dataTransfer.setData("text", "triangle-btn");
  }
}


function allowDrop(event) {
  event.preventDefault();
}