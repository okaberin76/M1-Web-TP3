function draw(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function canvasDefaultSettings() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = window.innerHeight - header.offsetHeight - form.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

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

function sendRoom(event) {
    event.preventDefault();
    event.stopPropagation();
    if (roomInput.value !== '') {
        let message = {
            type: 'ROOM',
            room: roomInput.value
        }
        ws.send(JSON.stringify(message));
    }
    roomInput.value = '';
}