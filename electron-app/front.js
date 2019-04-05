const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { TweenMax, Expo } = require('gsap');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext("2d");

let images;
let curImg;
let nextImg;
let coordinates;

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	coordinates = refreshCoordinates();
	if (curImg) {
		const coords = getDrawCoordinates(curImg);
		ctx.drawImage(curImg, ...coords);
	}
});

function getImage(src, onLoad) {
	const img = document.createElement('img');
	// console.log(src);
	// img.style.position = 'absolute';
	// img.style.top = '0';
	// img.style.left = '0';
	const onLoadUnload = () => {
		img.removeEventListener('load', onLoadUnload);
		onLoad(img);
	};
	img.addEventListener('load', onLoadUnload);
	img.src = src;
	return img;
}

function refreshCoordinates() {
	return [curImg, nextImg].map(getDrawCoordinates);
}

function getDrawCoordinates(img) {
	if (!img) return null;
	const imW = img.width;
	const imH = img.height;
	const cW = canvas.width;
	const cH = canvas.height;
	const imR = imW / imH;
	const cR = cW / cH;
	let rW = cW;
	let rH = cH;
	let x = 0;
	let y = 0;
	if(imR < cR) {
		rH = cH;
		rW = imW * (rH / imH);
		x = (cW - rW) / 2;
		y = 0;
	} else if(imR > cR) {
		rW = cW;
		rH = imH * (rW / imW);
		x = 0;
		y = (cH - rH) / 2;
	}
	return [
		x,
		y,
		// rW,
		// rH,
	];
}


function draw() {
	coordinates = refreshCoordinates();

	//no fillrect if new image covers old one
	const covers = coordinates[0] && (coordinates[1][0] <= coordinates[0][0] && coordinates[1][1] <= coordinates[0][1]);
	const props = { alpha: 0 };

	TweenMax.fromTo(props, 5, { alpha:0, ease: Expo.easeIn }, { 
		alpha: 1, 
		onUpdate: () => {
			ctx.globalAlpha = props.alpha;
			if(!covers) {
				ctx.fillStyle = 'black';
				ctx.globalAlpha = props.alpha / 4;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				// ctx.drawImage(curImg, ...coordinates[0]);
			}
			// console.log(props.alpha);
			ctx.globalAlpha = props.alpha;
			ctx.drawImage(nextImg, ...coordinates[1]);
		},
		onComplete: () => {
			ctx.globalAlpha = 1;
			ctx.drawImage(nextImg, ...coordinates[1]);
			curImg = nextImg;
			setSwap();
		},
	});
	// let alpha = 0;
	// function update() {
	// 	alpha += 0.002;
	// 	if (alpha > 1) alpha = 1;
	// 	ctx.globalAlpha = alpha;
	// 	if(!covers) {
	// 		ctx.fillStyle = 'black';
	// 		ctx.globalAlpha = alpha / 4;
	// 		ctx.fillRect(0, 0, canvas.width, canvas.height);
	// 		// ctx.drawImage(curImg, ...coordinates[0]);
	// 	}
	// 	ctx.globalAlpha = alpha;
	// 	ctx.drawImage(nextImg, ...coordinates[1]);
	// 	if (alpha == 1) {
	// 		console.log('over');
	// 		curImg = nextImg;
	// 		setSwap();

	// 	} else {
	// 		window.requestAnimationFrame(update);
	// 	}
	// }
	// window.requestAnimationFrame(update);

};

function swap() {
	nextImg = getImage(images.pop(), draw);
}

function setSwap() {
	if (!images.length) return;
	setTimeout(swap, 2000);
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function loadFiles(dir) {
	fs.readdir(dir, (err, files) => {
		images = files.filter(file => {
			const ext = path.extname(file).toLowerCase();
			return (ext === '.jpg' || ext === '.png');
		}).map(f => dir + '/' + f);

		shuffle(images);
		swap();
	});
}

ipcRenderer.on('load', function(event, arg) {
	// console.log(arg);
	const container = document.getElementById('main');
	container.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	loadFiles(arg + '/../../images');
});
