const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { TweenMax } = require('gsap');


function getImage(src) {
	const img = document.createElement('img');
	// console.log(src);
	img.style.position = 'absolute';
	img.style.top = '0';
	img.style.left = '0';
	img.src = src;
	return img;
}

let container;
let images;
function swap() {
	if (!images.length) return;
	setTimeout(() => {
		const old = container.childNodes[0];
		const img = getImage(images.pop());
		container.insertBefore(img, old);
		const onready = () => {
			img.removeEventListener('load', onready);
			TweenMax.to(old, 0.6, {
				opacity: 0, 
				onComplete: () => {
					container.removeChild(old);
					swap();
				}
			});
		};
		img.addEventListener('load', onready);
		
	}, 5000);
}

function loadFiles(dir) {
	fs.readdir(dir, (err, files) => {
		images = files.filter(file => {
			const ext = path.extname(file).toLowerCase();
			return (ext === '.jpg' || ext === '.png');
		}).map(f => dir + '/' + f);


		container = document.getElementById('main');
		const img = getImage(images.pop(), false);
		container.appendChild(img);
		swap();
		// const canvas = document.getElementById("main");
		// const ctx = canvas.getContext("2d");
		// img.addEventListener('load', () => {
		// 	console.log('loaded');
		// 	ctx.drawImage(img, 0, 0, 400, 200);
		// });
		
	});
}

ipcRenderer.on('load', function(event, arg) {
	// console.log(arg);
	loadFiles(arg + '/../../images');
});
