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

if (isDef(wsname)) {
  wsname = wsname.split('=')[1];
} else {
  wsname = nameGenerator();
  document.cookie = "wsname=" + encodeURIComponent(wsname);
}

// Store/retrieve the color in/from a cookie.
let wscolor = cookies.find(function(c) {
  return c.match(/wscolor/) !== null;
});

if (isDef(wscolor)) {
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

const canvas = document.querySelector('canvas')
let rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");
let isDrawing = false;

// Data
let room = "Bienvenue !";
let roomId = 0;
let coords = [2];

function sendData(mode) {
  let json = JSON.stringify({
    "x": coords[0],
    "y": coords[1],
    "color": wscolor,
    "mode": mode,
    "roomName": room,
    "roomId": roomId
  });
  ws.send(json);
}

canvas.addEventListener('mousedown', function (e) {
  isDrawing = true;
  rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mousemove', e => {
  if(isDrawing) {
    ctx.strokeStyle = wscolor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }
});

canvas.addEventListener('mouseleave', e => {
  if(isDrawing) {
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if(x < 0) {
      x = 0;
    } else if(x >= rect.right) {
      x = rect.right - 1;
    }
    if(y < 0) {
      y = 0;
    } else if(y >= rect.bottom) {
      y = rect.bottom - 1;
    }
    ctx.strokeStyle = wscolor;
    ctx.lineTo(x, y);
    ctx.stroke();
    isDrawing = false;
  }
});
