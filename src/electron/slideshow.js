const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');
const { TweenMax, Expo } = require('gsap');
const { IMAGE_ROOT, FRAME_WIDTH, FRAME_HEIGHT, SLIDESHOW_DURATION, SLIDESHOW_TRANSITION_DURATION } = require(__dirname + '/../../config.js');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext("2d");

let images;
// let currentIndex;
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

function mountPortraitImages(src, coords, idx, onLoad) {
	let remain = canvas.width - coords.w;
	const all = [ {
		src,
		coords,
	}];
	for (let i = 0; i < 11; i++) {
		//no point in attempting to find an image that fits a width smaller than the original image
		if (remain < coords.w) break;
		const candidateIdx = idx - 5 + i;
		if (candidateIdx === idx) continue;
		if (candidateIdx < 0 || candidateIdx >= images.length) continue;
		const candidateSrc = images[candidateIdx];
		if (candidateSrc) {
			const candidateCoord = getDrawCoordinates(sizeOf(candidateSrc));
			//found an image that fits
			if (candidateCoord.w < remain) {
				remain -= candidateCoord.w;
				all.push({
					src: candidateSrc,
					coords: candidateCoord,
				});
			}
		}
	}

	const margin = remain / all.length;
	all.reduce((curX, im, i) => {
		im.coords.x = curX;
		return curX + margin + im.coords.w;
	}, margin / 2);

	const allLoaded = all.map((imDef) => {
		return getSingleImage(imDef.src);
	});

	console.log(canvas.width, margin, remain);

	return Promise.all(allLoaded).then((res) => {
		console.log(res);
		const imCanvas = document.createElement('canvas');
		imCanvas.width = canvas.width;
		imCanvas.height = canvas.height;
		const imCtx = canvas.getContext("2d");
		imCtx.fillStyle = 'black';
		imCtx.globalAlpha = 1;
		imCtx.fillRect(0, 0, canvas.width, canvas.height);

		res.reduce((ctx, im, i) => {
			ctx.drawImage(im, ...(Object.values(all[i].coords)));
			return ctx;
		}, imCtx)
		// .getImageData(0, 0, imCanvas.width, imCanvas.height);
		const resImg = new Image();
		resImg.src = imCanvas.toDataURL();
		return resImg;
	});

	// console.log(all);
}

function getSlideshowPanel(idx, onLoad) {

	const src = images[idx];
	const sz = sizeOf(src);
	const coords = getDrawCoordinates(sz);
	// console.log(coords.w, canvas.width);
	//if image is so small that two of the same dimension would fit the canvas, attemps to mount more than one image side to side
	if (coords.w <= (canvas.width / 2)) return mountPortraitImages(src, coords, idx, onLoad);

	return getSingleImage(src, onLoad);
}

function getSingleImage(src) {
	return new Promise((resolve) => {
		const img = document.createElement('img');
		const onLoadUnload = () => {
			img.removeEventListener('load', onLoadUnload);
			resolve(img);
		};
		img.addEventListener('load', onLoadUnload);
		img.src = src;
	});
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
		//portrait
		rH = cH;
		rW = imW * (rH / imH);
		x = (cW - rW) / 2;
		y = 0;
	} else if(imR > cR) {
		//landscape
		rW = cW;
		rH = imH * (rW / imW);
		x = 0;
		y = (cH - rH) / 2;
	}
	const res = {
		x,
		y,
	};

	//if image is exactly or very near frame size, don't resize it.
	if (Math.abs(imW - cW) > (cW * 0.02) && Math.abs(imH - cH) > (cH * 0.02)) {
		res.w = rW;
		res.h = rH;
	}

	return res;
}


function draw() {
	coordinates = refreshCoordinates();

	//no fillrect if new image covers old one
	const covers = coordinates[0] && (coordinates[1].x <= coordinates[0].x && coordinates[1].y <= coordinates[0].y);
	const props = { alpha: 0 };

	TweenMax.fromTo(props, SLIDESHOW_TRANSITION_DURATION, { alpha:0, ease: Expo.easeIn }, { 
		alpha: 1, 
		onUpdate: () => {
			ctx.globalAlpha = props.alpha;
			if(!covers) {
				ctx.fillStyle = 'black';
				ctx.globalAlpha = props.alpha / 2;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				// ctx.drawImage(curImg, ...coordinates[0]);
			}
			// console.log(props.alpha);
			ctx.globalAlpha = props.alpha;
			ctx.drawImage(nextImg, ...(Object.values(coordinates[1])));
		},
		onComplete: () => {
			ctx.globalAlpha = 1;
			ctx.drawImage(nextImg, ...(Object.values(coordinates[1])));
			curImg = nextImg;
			setSwap();
		},
	});

};

function swap(atInit) {

	const currentIndex = atInit ? 3 : Math.floor(Math.random() * (images.length));
	console.log(currentIndex);
	// nextImg = getSlideshowPanel(currentIndex, draw);
	getSlideshowPanel(currentIndex).then((img) => {
		nextImg = img;
		draw();
	});
}

function setSwap() {
	if (!images.length) return;
	setTimeout(swap, SLIDESHOW_DURATION * 1000);
}

// function shuffle(array) {
// 	for (let i = array.length - 1; i > 0; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		const temp = array[i];
// 		array[i] = array[j];
// 		array[j] = temp;
// 	}
// }

function loadFiles(dir) {
	fs.readdir(dir, (err, files) => {
		images = files.filter(file => {
			const ext = path.extname(file).toLowerCase();
			return (ext === '.jpg' || ext === '.png');
		}).map(f => dir + '/' + f);

		// shuffle(images);

		swap(true);
	});
}

ipcRenderer.on('load', function(event, arg) {
	const container = document.getElementById('main');
	container.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	loadFiles(arg + IMAGE_ROOT);
});

ipcRenderer.on('message', function(event, arg) {
	console.log(event);
	console.log(arg);
	
});
// 