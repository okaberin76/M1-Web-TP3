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

const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");

canvas.width = canvas.parentElement.clientWidth;
canvas.height = window.innerHeight;
ctx.clearRect(0, 0, canvas.width, canvas.height);

window.addEventListener('resize', () => {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

let isDrawing = false;
let coordX = NaN;
let coordY = NaN;

canvas.addEventListener('mousedown', function (e) {
  coordX = e.clientX - rect.left;
  coordY = e.clientY - rect.top;
  isDrawing = true;
});

canvas.addEventListener('mouseup', function(e) {
  coordX = NaN;
  coordY = NaN;
  isDrawing = false;
});

canvas.addEventListener('mousemove', function(e) {
  if(isDrawing) {
    draw(coordX, coordY, e.clientX - rect.left, e.clientY - rect.top);
    coordX = e.clientX - rect.left;
    coordY = e.clientY - rect.top;
  }
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

function draw(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
