

const sizeOf = require('image-size');
const { getDrawCoordinates, getSingleImage } = require(__dirname + '/Images.js'); 

function mountPortraitImages(src, coords, remainIndex, remain, images) {

	const imgIndex = remain[remainIndex];

	let remainWidth = canvas.width - coords.coords.w;
	// console.log('mount portrait', remain, coords.coords.w);

	function getCandidate(lst, i) {
		return new Promise((resolve) => {
			// console.log(remain, coords.coords.w);
			if (remainWidth < coords.coords.w || i === 11) return resolve(lst);
			const candidateIdx = remainIndex - 5 + i;
			if (candidateIdx < 0 || candidateIdx >= remain.length || candidateIdx === remainIndex) return resolve(getCandidate(lst, i + 1));
			const candidateImgIdx = remain[candidateIdx];

			const candidateSrc = images[candidateImgIdx];
			if (!candidateSrc) return resolve(getCandidate(lst, i + 1));
			getDrawCoordinates(candidateSrc).then((candidateCoord) => {
				// console.log(candidateCoord);
				//found an image that fits
				if (candidateCoord.coords.w < remainWidth) {
					remainWidth -= candidateCoord.coords.w;
					lst.push({
						src: candidateSrc,
						coords: candidateCoord,
						index: candidateImgIdx,
					});
				}
				resolve(getCandidate(lst, i + 1));
			});

		});
	}

	return getCandidate([ {
		src,
		coords,
		index: imgIndex,
	}], 0).then((imgList) => {
		//place the images evenly on the canvas's width
		const margin = remainWidth / imgList.length;
		imgList.reduce((curX, im, i) => {
			im.coords.coords.x = curX;
			return curX + margin + im.coords.coords.w;
		}, margin / 2);

		const allLoaded = imgList.map((imDef) => {
			return getSingleImage(imDef.src, imDef.coords.orientation);
		});

		return Promise.all(allLoaded).then((res) => {
			const imCanvas = document.createElement('canvas');
			imCanvas.width = canvas.width;
			imCanvas.height = canvas.height;
			const imCtx = imCanvas.getContext("2d");
			imCtx.fillStyle = 'black';
			imCtx.globalAlpha = 1;
			imCtx.fillRect(0, 0, canvas.width, canvas.height);
			//draw each image in its position.
			res.reduce((carryCtx, im, i) => {
				carryCtx.drawImage(im, ...(Object.values(imgList[i].coords.coords)));

				return carryCtx;
			}, imCtx);//.getImageData(0, 0, imCanvas.width, imCanvas.height);

			return getSingleImage(imCanvas.toDataURL());
		}).then((finalImg) => {
			return {
				img: finalImg,
				index: imgList.map(item => item.index),
			};
		});
	});
}




function getSlideshowPanel(remain, images) {


	const remainIndex = Math.floor(Math.random() * (remain.length));
	const imgIndex = remain[remainIndex];

	const src = images[imgIndex];
	const sz = sizeOf(src);

	return getDrawCoordinates(src).then((coords) => {
		// console.log(coords.w, canvas.width);
		//if image is so small that two of the same dimension would fit the canvas, attemps to mount more than one image side to side
		if (coords.coords.w < canvas.width) return mountPortraitImages(src, coords, remainIndex, remain, images);

		return getSingleImage(src, coords.orientation).then((im) => {
			const imCanvas = document.createElement('canvas');
			imCanvas.width = canvas.width;
			imCanvas.height = canvas.height;
			const imCtx = imCanvas.getContext("2d");
			imCtx.fillStyle = 'black';
			imCtx.globalAlpha = 1;
			imCtx.fillRect(0, 0, canvas.width, canvas.height);
			imCtx.drawImage(im, ...(Object.values(coords.coords)));
			// return imCtx.getImageData(0, 0, imCanvas.width, imCanvas.height);
			return getSingleImage(imCanvas.toDataURL()).then((finalImg) => {
				return {
					img: finalImg,
					index: [imgIndex],
				};
			});
		});
	});
}

module.exports = getSlideshowPanel;