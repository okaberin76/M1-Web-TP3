import './index.css';
import nameGenerator from './name-generator';
import colorGenerator from './color-generator';
import isDef from './is-def';

// Store/retrieve the name in/from a cookie.
console.log(cookies)
wsname = cookies.find(function(c) {
  return c.match(/wsname/) !== null;
});

if(isDef(wsname)) {
  wsname = wsname.split('=')[1];
} else {
  wsname = nameGenerator();
  document.cookie = "wsname=" + encodeURIComponent(wsname);
}

// Store/retrieve the color in/from a cookie.
wscolor = cookies.find(function(c) {
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

// We get notified once connected to the server
ws.onopen = (event) => {
  console.log("We are connected.");
};

canvas.width = canvas.parentElement.clientWidth;
canvas.height = window.innerHeight;
ctx.clearRect(0, 0, canvas.width, canvas.height);

// We use the message system already implemented and use it to create rooms with the form
ws.onmessage = (event) => {
  let message = JSON.parse(event.data);
  switch (message.type) {
    case 'SETUP':
      listRoom = message.data;
      for (let room in listRoom) {
        if (Object.hasOwnProperty.call(listRoom, room)) {
          createRoom(room);
        }
      }
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = window.innerHeight - header.offsetHeight - form.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

roomForm.addEventListener('submit', sendRoom, true);
roomForm.addEventListener('blur', sendRoom, true);

window.addEventListener('resize', () => {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousedown', function (e) {
  coordX = e.clientX - canvas.offsetLeft;
  coordY = e.clientY - canvas.offsetTop;
  isDrawing = true;
});

canvas.addEventListener('mouseup', function(e) {
  let pos = {
    type: 'DRAW',
    room: roomId,
    color: wscolor,
    xPos: e.clientX - canvas.offsetLeft,
    yPos: e.clientY - canvas.offsetTop,
    xLastPos: coordX,
    yLastPos: coordY
  }
  ws.send(JSON.stringify(pos));

  coordX = NaN;
  coordY = NaN;
  isDrawing = false;
});

canvas.addEventListener('mousemove', function(e) {
  if(isDrawing) {
    let pos = {
      type: 'DRAW',
      room: roomId,
      color: wscolor,
      xPos: e.clientX - canvas.offsetLeft,
      yPos: e.clientY - canvas.offsetTop,
      xLastPos: coordX,
      yLastPos: coordY
    }
    ws.send(JSON.stringify(pos));

    coordX = e.clientX - canvas.offsetLeft;
    coordY = e.clientY - canvas.offsetTop;
  }
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});