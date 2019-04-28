const reqwest = require('reqwest');

const socket = io();

function sendMessage(e) {
	const clicked = e.currentTarget;
	const msg = clicked.dataset.msg;
	console.log(msg);
	socket.emit('message', msg, (answer) => {
		console.log(answer);
	});
}
function changeFolder(e) {
	const clicked = e.currentTarget;
	const path = clicked.dataset.path;
	// console.log(path);
	socket.emit('changedir', path, (answer) => {
		console.log(answer);
	});
}

const btns = document.querySelectorAll('[data-msg]');
btns.forEach(btn => {
	btn.addEventListener('click', sendMessage);
});


const treeContainer = document.querySelector('[data-tree]');
function showTree(tree, parentContainer = treeContainer, parentPath = '') {
	// console.log(tree);

	if (parentContainer === treeContainer) {
		while (parentContainer.firstChild) {
			parentContainer.removeChild(parentContainer.firstChild);
		}
	}

	const { dir, children } = tree;

	const container = document.createElement('li');
	container.classList = 'list-group-item';

	const btn = document.createElement('button');
	// console.log(btn);
	btn.innerText = parentPath + dir || 'ROOT';
	btn.classList = 'btn btn-primary btn-sm';
	btn.dataset.path = parentPath + dir;
	btn.addEventListener('click', changeFolder);


	container.appendChild(btn);
	parentContainer.appendChild(container);

	const childrenContainer = document.createElement('ul');
	childrenContainer.classList = 'list-group';
	container.appendChild(childrenContainer);

	children.forEach((subDir) => {
		showTree(subDir, childrenContainer, parentPath + dir + '/');
	});
}

const getTreeCta = document.querySelector('[data-gettree]');
getTreeCta.addEventListener('click', () => {
	console.log('getting tree...')
	reqwest({
		url: '/getTree',
		method: 'get',
		success: showTree,
	});
});

