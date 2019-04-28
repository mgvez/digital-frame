const path = require('path');
const fs = require('fs');

function loadFiles(rootPath, dir = '') {
	// console.log(dir);
	
	return new Promise(resolve => {
		fs.readdir(rootPath + dir, (err, rawFiles) => {
			if (err || !rawFiles) return resolve();
			const files = rawFiles.map(f => dir + '/' + f);
			// console.log(files);
			
			//all images in current folder
			const images = files.filter(file => {
				const ext = path.extname(file).toLowerCase();
				return (ext === '.jpg' || ext === '.png');
			});

			//get all folders
			const subdirectories = files.map((candidate) => {
				const stats = fs.statSync(rootPath + candidate);
				if (!stats.isDirectory()) return false;
				return loadFiles(rootPath, candidate);
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

function getDirectoryTree(rootPath, parent = '', dir = '') {
	const thisPath = (parent && `/${parent}`) + (dir && `/${dir}`);
	return new Promise(resolve => {
		fs.readdir(rootPath + thisPath, (err, files) => {
			if (err || !files) return resolve();

			const subdirectories = files.map((candidate) => {
				// console.log(rootPath + thisPath + '/' + candidate);
				const stats = fs.statSync(rootPath + thisPath + '/' + candidate);
				if (!stats.isDirectory()) return false;
				return candidate;
			}).filter(Boolean).map(subDir => getDirectoryTree(rootPath, thisPath, subDir));


			Promise.all(subdirectories).then(children => {
				resolve({
					dir,
					children,
				});
			}).catch(e => {
				console.log(e);
			});

		});
	});
}

module.exports = {
	loadFiles,
	getDirectoryTree,
};