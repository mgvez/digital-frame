const path = require('path');
const fs = require('fs');

function loadFiles(rootPath, dir = '') {
	// console.log(dir);
	
	return new Promise(resolve => {
		fs.readdir(rootPath + dir, (err, rawFiles) => {
			if (err || !rawFiles) return resolve();
			const files = rawFiles.map(f => dir + '/' + f);
			console.log(files);
			
			//all images in current folder
			const images = files.filter(file => {
				const ext = path.extname(file).toLowerCase();
				return (ext === '.jpg' || ext === '.png');
			});

			//get all folders
			const subdirectories = files.map((subDir) => {
				const ext = path.extname(subDir).toLowerCase();
				//if extension, not a folder
				if (ext) return false;
				return loadFiles(rootPath, subDir);
			}).filter(Boolean);

			Promise.all(subdirectories).then(r => {
				resolve(r.filter(Boolean).reduce((all, sub) => {
					return all.concat(sub);
				}, images));
			}).catch(e => {
				console.log(e);
			});

		});
	});


}

module.exports = {
	loadFiles,
};