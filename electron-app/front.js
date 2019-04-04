const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { TweenMax } = require('gsap');


function getImage(src, isHidden) {
	const img = document.createElement('img');
	// console.log(src);
	img.style.position = 'absolute';
	img.style.top = '0';
	img.style.left = '0';
	img.src = src;
	return img;
}

function loadFiles(dir) {
	fs.readdir(dir, (err, files) => {
		const images = files.filter(file => {
			const ext = path.extname(file).toLowerCase();
			return (ext === '.jpg' || ext === '.png');
		});


		const container = document.getElementById('main');
		const img = getImage(dir + '/' + images.pop(), false);
		container.appendChild(img);


		setTimeout(() => {
			const img2 = getImage(dir + '/' + images.pop(), true);
			container.insertBefore(img2, container.childNodes[0]);
			TweenMax.to(img, 0.6, {opacity: 0});
		}, 5000);
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
