// (function(){

	const CANVAS = document.querySelector('#img-editor');
	const CTX = CANVAS.getContext('2d');
	const UNDOBTN = document.querySelector('#undo');
	const REDOBTN = document.querySelector('#redo');
	const CLEARBTN = document.querySelector('#clear');
	const FORMSAVE = document.querySelector('form');
	const TABLESAVEDIMG = document.querySelector('table');
	const RESIZEELEMENT = document.querySelectorAll('.resize-elem');

	const RESIZEHEIGHT = document.querySelector('.resize-height');
	const RESIZEWIDTH = document.querySelector('.resize-width');
	const RESIZEBOTH = document.querySelector('.resize-both');


	let mousePressedCanvas = false;
	let mousePressedResize = false;
	let resizeOffsetX = 0;
	let resizeOffsetY = 0;
	let currentStep = 0;
	let history = [];
	
	let curentImgCommand = [];
	let currentPath = {color:'',width:'',path:[] };
	


	/* */
	/* functions */
	/* */
	function clearCanvas(){
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
	};

	function saveHistory(){
		++currentStep;
		if ( history.length > currentStep-1) {
			history.length = currentStep-1;
		}
		let tempImg = CANVAS.toDataURL();
		history.push(tempImg);
		checkBtnsStatus();
		
	};

	function drawImg(){
		if (!currentStep) {
			clearCanvas();
			return;
		}
		let histotyImg = new Image();
		histotyImg.src = history[currentStep-1];
		histotyImg.onload = () => {
			clearCanvas()
			CTX.drawImage(histotyImg, 0 ,0)
		}
	}

	function checkBtnsStatus(){
		if (currentStep > 0) {
			UNDOBTN.classList.remove("disabled");
			CLEARBTN.classList.remove("disabled");
		}else{
			UNDOBTN.classList.add("disabled");
		}

		if (currentStep < (history.length) ) {
			REDOBTN.classList.remove("disabled");
		}else{
			REDOBTN.classList.add("disabled");
		}

	}

	function undo(){
		if (currentStep > 0) {
			--currentStep
			drawImg();
			checkBtnsStatus();
		}
	};

	function redo(){
		if (currentStep < (history.length) ) {
			++currentStep;
			drawImg();
			checkBtnsStatus();
		}
	};

	function clear(){
		clearCanvas();
		saveHistory();
		CLEARBTN.classList.add("disabled");
		curentImgCommand = [];
	}

	function SaveImg(){
		let imgName = (FORMSAVE.querySelector('input').value).trim();
		if (imgName) {
				localStorage.setItem(imgName, JSON.stringify(curentImgCommand));
				
				let row = document.createElement('tr');

				let removeBtn = document.createElement('a');
				removeBtn.classList.add("remove-img");
				removeBtn.href = '#';
				removeBtn.innerText = 'remove';
				removeBtn.addEventListener("click", removeImg);

				let openBtn = document.createElement('a');
				openBtn.classList.add("open-img");
				openBtn.href = '#';
				openBtn.innerText = 'open';
				openBtn.addEventListener("click", openImg);

				let firstRow = document.createElement('td');
				firstRow.innerText = imgName;
				firstRow.classList.add("name-img");

				let secondRow = document.createElement('td');
				secondRow.appendChild(removeBtn);

				let thirdRow = document.createElement('td');
				thirdRow.appendChild(openBtn);

				row.appendChild(firstRow)
				row.appendChild(secondRow)
				row.appendChild(thirdRow)
				
				TABLESAVEDIMG.querySelector('tbody').appendChild(row);


		}else{
			alert('Please, enter picture name')
		}
	}

	function removeImg(e){
		e.preventDefault();
		let imgName = e.target.parentNode.parentNode.querySelector('.name-img').innerText;
		localStorage.removeItem(imgName);
	}

	function openImg(e){
		clearCanvas();
		let imgName = e.target.parentNode.parentNode.querySelector('.name-img').innerText;
		let selectedImg = JSON.parse(localStorage.getItem(imgName));
		console.dir(selectedImg)
		selectedImg.forEach(el => {
			CTX.beginPath();
			CTX.moveTo(el.path[0].x, el.path[0].y);
			CTX.lineWidth = el.with;
    	CTX.strokeStyle = el.color;
			el.path.forEach(path => {
				CTX.lineTo(path.x, path.y);
      	CTX.stroke();
			})
		})
	}

	function changeCanvasSize(x,y){
		
	}


	/* */
	/* events */
	/* */
	CLEARBTN.onclick = (e) => {
		e.preventDefault();
		clear();
	};

	UNDOBTN.onclick = (e) => {
		e.preventDefault();
		undo()
	};
	REDOBTN.onclick = (e) => {
		e.preventDefault();
		redo()
	};
	// FORMSAVE.onsubmit = (e) => {
	// 	SaveImg();
	// }


	
	CANVAS.onmousedown = (e) => {
    mousePressedCanvas = true;
    CTX.beginPath();
    let x = e.offsetX, y = e.offsetY;
    CTX.moveTo(x, y)
    CTX.lineWidth = document.querySelector('#width').value;
    CTX.strokeStyle = document.querySelector('#color').value;
    currentPath.color = CTX.strokeStyle;
    currentPath.width = CTX.lineWidth;
	}

	CANVAS.onmousemove = (e) => {
    if (mousePressedCanvas) {
      let x = e.offsetX, y = e.offsetY;
      CTX.lineTo(x, y);
      CTX.stroke();
      currentPath.path.push({x:x, y:y});
    }
	}

	CANVAS.onmouseup = (e) => {
	  if (mousePressedCanvas) {
			mousePressedCanvas = false;
			saveHistory();
			curentImgCommand.push(currentPath);
			currentPath = currentPath = {color:'',width:'',path:[] };
		}
	}

	CANVAS.onmouseleave = (e) => {
		if (mousePressedCanvas) {
			mousePressedCanvas = false;
			saveHistory();
			curentImgCommand.push(currentPath);
			currentPath = currentPath = {color:'',width:'',path:[] };
		}
	}
	
	RESIZEELEMENT.forEach(el => {
		el.addEventListener("mousedown", ResizePressDown);
		el.addEventListener("mousemove", ResizeMouseMove);
		el.addEventListener("mouseup", ResizePressUp);
		el.addEventListener("mouseleave", ResizePressUp);
	})



	function ResizePressDown(e){
		mousePressedResize = true;
		resizeOffsetX = e.offsetX;
		resizeOffsetY = e.offsetY;
	}

	function ResizeMouseMove(e){
		if (mousePressedResize) {
			if(e.target == RESIZEHEIGHT){
				let x = 0, y = e.offsetY-resizeOffsetY;
				CANVAS.width += x;
				CANVAS.height += y;
			}
			if (e.target == RESIZEWIDTH) {
				let x = e.offsetX, y = 0;
				CANVAS.width += x;
				CANVAS.height += y;
			}
			if (e.target == RESIZEBOTH) {
				let x = e.offsetX-resizeOffsetX, y = e.offsetY-resizeOffsetY;
				CANVAS.width += x;
				CANVAS.height += y;
			}
			

		}
	}
	function ResizePressUp(e){
		mousePressedResize = false;
	}



// })()