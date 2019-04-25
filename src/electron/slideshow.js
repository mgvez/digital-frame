const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { TweenMax, Expo } = require('gsap');
const { IMAGE_ROOT, SLIDESHOW_DURATION, SLIDESHOW_TRANSITION_DURATION, HISTORY_SIZE, LOG_FILE } = require(__dirname + '/../../config.js');
const { loadFiles } = require(__dirname + '/files.js');
const getSlideshowPanel = require(__dirname + '/SlideshowPanel.js');

const logger = require(__dirname + '/logger.js');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext("2d");

let images;
let remain;
let history;
let rootPath;
let currentPath;

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});


function draw(img) {

	//no fillrect if new image covers old one
	const props = { alpha: 0 };
	logger.log({
		level: 'info',
		message: 'tweening',
	});

	TweenMax.fromTo(props, SLIDESHOW_TRANSITION_DURATION, { alpha:0, ease: Expo.easeIn }, { 
		alpha: 1, 
		onUpdate: () => {
			//console.log(props.alpha);
			ctx.globalAlpha = props.alpha;
			ctx.drawImage(img, 0, 0);
			// ctx.putImageData(imgData, 0, 0);
		},
		onComplete: () => {
			// ctx.globalAlpha = 1;
			// ctx.drawImage(img, 0, 0);
			// ctx.putImageData(imgData, 0, 0);
			setSwap();
		},
	});

};

function swap() {

	//finished seeing all the images. Reset
	if (remain.length === 0) {
		remain = resetRemaining(images.length);
	}

	// console.log(currentIndex);
	// nextImg = getSlideshowPanel(currentIndex, draw);
	// console.profile('get image');
	getSlideshowPanel(currentPath, remain, images).then((res) => {
		// ipcRenderer.send('slide', 'loaded');

		logger.log({
			level: 'info',
			message: 'loaded ' + res.index.join(', '),
		});

		// console.profileEnd();
		// console.log(res.index);
		//remove displayed images from available images
		res.index.forEach(imgIndex => {
			const remainIndex = remain.indexOf(imgIndex);
			if (remainIndex > -1) {
				remain.splice(remainIndex, 1);
			}
		});
		//adds displayed images to history
		history.unshift(res.index);

		//make sure history is no longer than x length
		if (history.length > HISTORY_SIZE) history.length = HISTORY_SIZE;

		// console.log(remain);
		// console.log(history);
		draw(res.img);
	});
}

function setSwap() {
	logger.log({
		level: 'info',
		message: 'setting timeout ' + images.length + 'imgs',
	});
	if (!images.length) return;
	setTimeout(swap, SLIDESHOW_DURATION * 1000);
}

function resetRemaining(n) {
	return Array.apply(null, {length: n}).map(Number.call, Number);
}

function loadDirectory(dir) {
	currentPath = rootPath + dir;
	loadFiles(currentPath).then(loadedImages => {
		images = loadedImages;
		remain = resetRemaining(images.length);
		history = [];
		swap();
	});
}

ipcRenderer.on('load', function(event, arg) {
	const container = document.getElementById('main');
	container.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	// console.log(arg);
	rootPath = arg;
	loadDirectory(IMAGE_ROOT);
});

ipcRenderer.on('message', function(event, arg) {
	console.log(event);
	console.log(arg);
	
});
// 
