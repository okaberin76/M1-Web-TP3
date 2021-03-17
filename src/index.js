import './index.css';
import nameGenerator from './name-generator';
import colorGenerator from './color-generator';
import isDef from './is-def';

// Store/retrieve the name in/from a cookie.
const cookies = document.cookie.split(';');
console.log(cookies)
let wsname = cookies.find(function(c) {
  return c.match(/wsname/) !== null;
});

if(isDef(wsname)) {
  wsname = wsname.split('=')[1];
} else {
  wsname = nameGenerator();
  document.cookie = "wsname=" + encodeURIComponent(wsname);
}

// Store/retrieve the color in/from a cookie.
let wscolor = cookies.find(function(c) {
  return c.match(/wscolor/) !== null;
});

if(isDef(wscolor)) {
  wscolor = wscolor.split('=')[1];
} else {
  wscolor = colorGenerator();
  document.cookie = "wscolor=" + encodeURIComponent(wscolor);
}

// Set the name in the header
document.querySelector('header>p').textContent = decodeURIComponent(wsname);
// Set the color in the header
document.querySelector('header>p').style.color = wscolor;

// Create a WebSocket connection to the server
const ws = new WebSocket("ws://" + window.location.host + "/socket");

// We get notified once connected to the server
ws.onopen = (event) => {
  console.log("We are connected.");
};

// List of all room with a canvas inside
let listRoom = {};
// Board - Canvas
const canvas = document.getElementById("canvas");
// Header
const header = document.getElementsByTagName("header")[0];
// Create a form who will allow the user to write a room name and create a new room
const form = document.getElementsByTagName("form")[0];
const ctx = canvas.getContext("2d");

function canvasDefaultSettings() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = window.innerHeight - header.offsetHeight - form.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

canvasDefaultSettings();

// We use the message system already implemented and use it to create rooms with the form
ws.onmessage = (event) => {
  let message = JSON.parse(event.data);
  switch(message.type) {
    case 'SETUP':
      listRoom = message.data;
      for(let room in listRoom) {
        if(Object.hasOwnProperty.call(listRoom, room)) {
          createRoom(room);
        }
      }
      canvasDefaultSettings();
      listRoom[roomId].forEach(line => {
        draw(line[0], line[1], line[2], line[3], line[4]);
      });
      break;
    case 'ROOM':
      listRoom[message.room] = [];
      createRoom(message.room);
      break;
    case 'DRAW':
      listRoom[message.room].push([message.xPos, message.yPos, message.xLastPos, message.yLastPos, message.color]);
      draw(message.xLastPos, message.yLastPos, message.xPos, message.yPos, message.color);
      break;
  }
};

const roomForm = document.querySelectorAll('form')[0];
const roomInput = document.querySelectorAll('form input')[0];
const allRooms = document.querySelector('#allRooms');

roomForm.addEventListener('submit', sendRoom);
roomForm.addEventListener('blur', sendRoom);

window.addEventListener('resize', () => {
  canvasDefaultSettings();
});

let roomId = 'Room_1';
let isDrawing = false;
let coordX;
let coordY;

function draw(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

canvas.addEventListener('mousedown', function (e) {
  coordX = e.clientX - canvas.offsetLeft;
  coordY = e.clientY - canvas.offsetTop;
  isDrawing = true;
});

function sendData(e) {
  return {
    type: 'DRAW',
    room: roomId,
    color: wscolor,
    xPos: e.clientX - canvas.offsetLeft,
    yPos: e.clientY - canvas.offsetTop,
    xLastPos: coordX,
    yLastPos: coordY
  };
}

canvas.addEventListener('mouseup', function(e) {
  ws.send(JSON.stringify(sendData(e)));
  coordX = 0;
  coordY = 0;
  isDrawing = false;
});

canvas.addEventListener('mousemove', function(e) {
  if(isDrawing) {
    ws.send(JSON.stringify(sendData(e)));
    coordX = e.clientX - canvas.offsetLeft;
    coordY = e.clientY - canvas.offsetTop;
  }
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

function createRoom(roomName) {
  let button = document.createElement('li');
  button.textContent = roomName;
  button.setAttribute("id", roomName);
  button.addEventListener("click", () => {
    roomId = roomName;
    canvasDefaultSettings();
    listRoom[roomId].forEach(line => {
      draw(line[0], line[1], line[2], line[3], line[4]);
    });
  });
  allRooms.appendChild(button);
}

function sendRoom() {
  let message = {
    type: 'ROOM',
    room: roomInput.value
  }
  ws.send(JSON.stringify(message));
}

