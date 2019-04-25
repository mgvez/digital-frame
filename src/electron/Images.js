
const { getOrientation } = require('get-orientation');
const sizeOf = require('image-size');
const logger = require(__dirname + '/logger.js');

function getImageRotated(img, orientation, sz) {

	if (orientation === 1) return Promise.resolve(img);
	const tmpCanvas = document.createElement('canvas');

	const width = tmpCanvas.width = sz.width;
	const height = tmpCanvas.height = sz.height;
	
	const tmpCtx = tmpCanvas.getContext('2d');
	if (orientation > 4) {
		tmpCanvas.width = height
		tmpCanvas.height = width
	}
	switch (orientation) {
		case 2:
		// horizontal flip
		tmpCtx.translate(width, 0)
		tmpCtx.scale(-1, 1)
		break
		case 3:
		// 180° rotate left
		tmpCtx.translate(width, height)
		tmpCtx.rotate(Math.PI)
		break
		case 4:
		// vertical flip
		tmpCtx.translate(0, height)
		tmpCtx.scale(1, -1)
		break
		case 5:
		// vertical flip + 90 rotate right
		tmpCtx.rotate(0.5 * Math.PI)
		tmpCtx.scale(1, -1)
		break
		case 6:
		// 90° rotate right
		tmpCtx.rotate(0.5 * Math.PI)
		tmpCtx.translate(0, -height)
		break
		case 7:
		// horizontal flip + 90 rotate right
		tmpCtx.rotate(0.5 * Math.PI)
		tmpCtx.translate(width, -height)
		tmpCtx.scale(-1, 1)
		break
		case 8:
		// 90° rotate left
		tmpCtx.rotate(-0.5 * Math.PI)
		tmpCtx.translate(-width, 0)
		break
	}
	tmpCtx.drawImage(img, 0, 0, sz.width, sz.height);

	return new Promise((resolve) => {
		const resImg = new Image();
		const onLoadUnload = () => {
			resImg.removeEventListener('load', onLoadUnload);
			resolve(resImg);
		};
		resImg.addEventListener('load', onLoadUnload);
		resImg.src = tmpCanvas.toDataURL();
	});
}

module.exports = {

	getDrawCoordinates(imgSrc) {
		if (!imgSrc) return Promise.resolve();
		logger.log({
			level: 'info',
			message: 'getting coords ' + imgSrc,
		});
		const sz = sizeOf(imgSrc);
		logger.log({
			level: 'info',
			message: 'sz ' + sz.width + 'x' + sz.height,
		});
		const stream = fs.createReadStream(imgSrc);
		const onOrientation = getOrientation(stream);
		return onOrientation.then((orientation) => {
			
			const imW = orientation < 5 ? sz.width : sz.height;
			const imH = orientation < 5 ? sz.height : sz.width;
			// console.log(orientation, sz.width, sz.height);
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
			const coords = {
				x,
				y,
			};

			//if image is exactly or very near frame size, don't resize it.
			//if (Math.abs(imW - cW) > (cW * 0.02) && Math.abs(imH - cH) > (cH * 0.02)) {
				coords.w = rW;
				coords.h = rH;
			//}

			return {
				coords,
				orientation,
			};
		});

	},

	getSingleImage(src, orientation = 1) {
		return new Promise((resolve) => {
			const img = new Image()
			const onLoadUnload = () => {
				img.removeEventListener('load', onLoadUnload);
				if (orientation === 1) return resolve(img);
				resolve(getImageRotated(img, orientation, sizeOf(src)));
			};
			img.addEventListener('load', onLoadUnload);
			img.src = src;
		});
	},
	
};
