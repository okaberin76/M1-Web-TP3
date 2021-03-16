// Cookies for the name and the color
const cookies = document.cookie.split(';');
let wsname;
let wscolor;

// Create a WebSocket connection to the server
const ws = new WebSocket("ws://" + window.location.host + "/socket");

// List of all room with a canvas inside
let listRoom = {};
// Board - Canvas
const canvas = document.getElementById("canvas");
// Header
const header = document.getElementsByTagName("header")[0];
// Create a form who will allow the user to write a room name and create a new room
const form = document.getElementsByTagName("form")[0];
const ctx = canvas.getContext("2d");

const roomForm = document.querySelectorAll('form')[0];
const roomInput = document.querySelectorAll('form input')[0];
const allRooms = document.querySelector('#allRooms');

// id of the default room
let roomId = 'index';
// boolean to know when the user is drawing something
let isDrawing = false;
// x and x coordinates for the drawing
let coordX = NaN;
let coordY = NaN;