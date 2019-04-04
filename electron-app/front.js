const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');


function loadFiles(dir) {
	fs.readdir(dir, (err, files) => {
		const images = files.filter(file => {
			const ext = path.extname(file).toLowerCase();
			return (ext === '.jpg' || ext === '.png');
		});


		const container = document.getElementById('main');
		const img = document.createElement('img');
		const src = dir + '/' + images.pop();
		// console.log(src);
		img.src = src;
		container.appendChild(img);

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
