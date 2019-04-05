const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { TweenMax } = require('gsap');


function getImage(src, onLoad) {
	const img = document.createElement('img');
	// console.log(src);
	img.style.position = 'absolute';
	img.style.top = '0';
	img.style.left = '0';
	const onLoadUnload = () => {
		img.removeEventListener('load', onLoadUnload);
		onLoad();
	};
	img.addEventListener('load', onLoadUnload);
	img.src = src;
	return img;
}

const canvas = document.createElement('canvas');

let images;
let curImg;

function swap() {

	const ctx = canvas.getContext("2d");
	const props = { alpha: 0 };

	const onDraw = () => {

		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;

		const coords = [curImg, newImg].map((img) => {
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
			return [ x, y, rW, rH ];

		});


		TweenMax.fromTo(props, 2, { alpha:0 }, { 
			alpha: 1, 
			onUpdate: () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				if(curImg) {
					ctx.globalAlpha = 1 - props.alpha;
					ctx.drawImage(curImg, ...coords[0]);
				}
				ctx.globalAlpha = props.alpha;
				ctx.drawImage(newImg, ...coords[1]);
			},
			onComplete: () => {
				curImg = newImg;
				setSwap();
			},
		});

	};

	const newImg = getImage(images.pop(), onDraw);
	
}

function setSwap() {
	if (!images.length) return;
	setTimeout(swap, 5000);
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
	loadFiles(arg + '/../../images');
});
