
import './style.css'

class ImgEditor{
	constructor(width, height, variantColors, variantWidth){
		this.width = width;
		this.height = height;
		this.variantColors = variantColors;
		this.variantWidth = variantWidth;
		this.mousePressedCanvas = false;
		this.changeWidthStatus = false;
		this.changeHeightStatus = false;
		this.currentStep = 0;
		this.history = [];
		this.resizeOffsetX = 0;
		this.resizeOffsetY = 0;
		this.stackOfCommands= [];
		this.quantityOfCommands = [];
		this.availableLocalStorage = typeof localStorage !== 'undefined';
		this.init();
	}
	init() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.addEventListener('mousedown', this.startDraw.bind(this))
		this.canvas.addEventListener('mousemove', this.drawing.bind(this))
		this.canvas.addEventListener('mouseup', this.endDraw.bind(this))
		this.canvas.addEventListener('mouseleave', this.endDraw.bind(this))

		this.ctx = this.canvas.getContext('2d');

		this.canvasWrapper = document.createElement('div');
		this.canvasWrapper.classList.add("canvas-wr");

		this.areaChangeWidth = document.createElement('div');
		this.areaChangeWidth.classList.add("resize-elem");
		this.areaChangeWidth.classList.add("resize-width");

		this.areaChangeHeight = document.createElement('div');
		this.areaChangeHeight.classList.add("resize-elem");
		this.areaChangeHeight.classList.add("resize-height");

		this.areaChangeBoth = document.createElement('div');
		this.areaChangeBoth.classList.add("resize-elem");
		this.areaChangeBoth.classList.add("resize-both");

		this.areaChangeWidth.addEventListener("mousedown", this.resizePressDown.bind(this) );
		this.areaChangeHeight.addEventListener("mousedown", this.resizePressDown.bind(this) );
		this.areaChangeBoth.addEventListener("mousedown", this.resizePressDown.bind(this) );
		document.body.addEventListener("mousemove", this.resizeMove.bind(this) );
		document.body.addEventListener("mouseup", this.resizePressUp.bind(this) );
		document.body.addEventListener("mouseleave", this.resizePressUp.bind(this) );

		this.globalWrapper = document.createElement('div');
		this.globalWrapper.classList.add("img-editor");

		this.tools = document.createElement('div');
		this.tools.classList.add("tools");

		this.changeColor = document.createElement('select');
		this.changeColor.classList.add("change-color");
		this.variantColors.forEach( (color, index) => {
			let option = document.createElement("option");
			option.value = color;
		    option.text = color;
		    if (!index) {
		    	option.setAttribute("selected", "selected")
		    }
		    this.changeColor.appendChild(option);
		})

		this.changeWidth = document.createElement('select');
		this.changeWidth.classList.add("change-width");
		this.variantWidth.forEach((width, index) => {
			let option = document.createElement("option");
			option.value = width;
		    option.text = width;
		    if (!index) {
		    	option.setAttribute("selected", "selected")
		    }
		    this.changeWidth.appendChild(option);
		})

		this.clearBtn = document.createElement('a');
		this.clearBtn.href = '#';
		this.clearBtn.innerText = 'Clear'
		this.clearBtn.classList.add("btn");
		this.clearBtn.classList.add("disabled");
		this.clearBtn.addEventListener('click', this.clear.bind(this))

		this.undoBtn = document.createElement('a');
		this.undoBtn.href = '#';
		this.undoBtn.innerText = 'Undo'
		this.undoBtn.classList.add("btn");
		this.undoBtn.classList.add("disabled");
		this.undoBtn.addEventListener('click', this.undo.bind(this))

		this.redoBtn = document.createElement('a');
		this.redoBtn.href = '#';
		this.redoBtn.innerText = 'Redo'
		this.redoBtn.classList.add("btn");
		this.redoBtn.classList.add("disabled");
		this.redoBtn.addEventListener('click', this.redo.bind(this))

		this.printBtn = document.createElement('a');
		this.printBtn.href = '#';
		this.printBtn.innerText = 'Print stack of commands'
		this.printBtn.classList.add("btn");
		this.printBtn.classList.add("disabled");
		this.printBtn.addEventListener('click', this.print.bind(this))

		this.saveBtn = document.createElement('a');
		this.saveBtn.href = '#';
		this.saveBtn.innerText = 'Save to LocalStorage'
		this.saveBtn.classList.add("btn");
		this.saveBtn.classList.add("disabled");
		this.saveBtn.addEventListener('click', this.saveToLocalStorage.bind(this))

		this.listOfCommand = document.createElement('ul');
		this.listOfCommand.classList.add("list-of-command");

		this.canvasWrapper.appendChild(this.canvas);
		this.canvasWrapper.appendChild(this.areaChangeWidth);
		this.canvasWrapper.appendChild(this.areaChangeHeight);
		this.canvasWrapper.appendChild(this.areaChangeBoth);

		this.tools.appendChild(this.changeColor);
		this.tools.appendChild(this.changeWidth);
		this.tools.appendChild(this.clearBtn);
		this.tools.appendChild(this.undoBtn);
		this.tools.appendChild(this.redoBtn);
		this.tools.appendChild(this.printBtn);
		this.tools.appendChild(this.saveBtn);

		this.globalWrapper.appendChild(this.tools);
		this.globalWrapper.appendChild(this.canvasWrapper);
		this.globalWrapper.appendChild(this.listOfCommand);

		document.body.appendChild(this.globalWrapper);

		if (!this.availableLocalStorage) {
			alert(`Sorry, but your browser does not available Local Storage`);
			
		}else{
			localStorage.removeItem('stackOfCommand')
		}
	}
	clearCanvas(){
    	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	saveHistory(){
		++this.currentStep;
		this.quantityOfCommands.push(this.stackOfCommands.length)
		if ( this.history.length > this.currentStep-1) {
			this.history.length = this.currentStep-1;
		}
		let tempImg = this.canvas.toDataURL();
		let tempObj = {img: tempImg, width: this.canvas.width, height: this.canvas.height}
		this.history.push(tempObj);
		this.checkBtnsStatus();

	}
	drawHistoryImg(){
		if (!this.currentStep) {
			this.clearCanvas();
			return;
		}
		let histotyImg = new Image();
		histotyImg.src = this.history[this.currentStep-1].img;
		histotyImg.onload = () => {
			this.clearCanvas()
			this.canvas.height = this.history[this.currentStep-1].height;
			this.canvas.width = this.history[this.currentStep-1].width;
			this.ctx.drawImage(histotyImg, 0 ,0)
		}

	}
	checkBtnsStatus(){
		if (this.currentStep > 0) {
			this.undoBtn.classList.remove("disabled");
			this.clearBtn.classList.remove("disabled");
		}else{
			this.undoBtn.classList.add("disabled");
		}
		if (this.currentStep < this.history.length) {
			this.redoBtn.classList.remove("disabled");
		}else{
			this.redoBtn.classList.add("disabled");
		}
		if( this.printBtn.classList.contains('disabled') ){
			this.printBtn.classList.remove("disabled");
		}
		if( this.saveBtn.classList.contains('disabled') ){
			this.saveBtn.classList.remove("disabled");
		}
		
	}
	undo(e){
		e.preventDefault();
		if (this.currentStep > 0) {
			--this.currentStep
			this.drawHistoryImg();
			this.checkBtnsStatus();
		}
	}
	redo(e){
		e.preventDefault();
		if (this.currentStep < this.history.length) {
			++this.currentStep;
			this.drawHistoryImg();
			this.checkBtnsStatus();
		}
	}
	clear(e){
		e.preventDefault();
		this.stackOfCommands.push(`clearRect(0, 0, ${this.canvas.width}, ${this.canvas.height})`);
		this.clearCanvas();
		this.saveHistory();
		
	}
	startDraw(e){
		this.mousePressedCanvas = true;
	    this.ctx.beginPath();
	    let x = e.offsetX, y = e.offsetY;
	    let width = this.changeWidth.value;
	    let color = this.changeColor.value;
	    this.ctx.moveTo(x, y);
	    this.ctx.lineWidth = width;
	    this.ctx.strokeStyle = color;
	    this.stackOfCommands.push('beginPath()');
	    this.stackOfCommands.push(`moveTo(${x}, ${y})`);
	    this.stackOfCommands.push(`lineWidth = ${width}`);
	    this.stackOfCommands.push(`strokeStyle = ${color}`);
	}
	drawing(e){
		if (this.mousePressedCanvas) {
	      let x = e.offsetX, y = e.offsetY;
	      this.ctx.lineTo(x, y);
	      this.ctx.stroke();
	      this.stackOfCommands.push(`lineTo(${x}, ${y})`);
	      this.stackOfCommands.push('stroke()');
	    }
	}
	endDraw(e){
		if (this.mousePressedCanvas) {
			this.mousePressedCanvas = false;
			this.saveHistory();

		}
	}
	resizePressDown(e){
		this.resizeOffsetX = e.offsetX;
		this.resizeOffsetY = e.offsetY;
		if (e.target == this.areaChangeBoth) {
			this.changeHeightStatus = true;
			this.changeWidthStatus = true;
		}else if (e.target == this.areaChangeHeight) {
			this.changeHeightStatus = true;
		}else if (e.target == this.areaChangeWidth) {
			this.changeWidthStatus = true;
		}
		this.tempPng = this.canvas.toDataURL();
		
	}
	resizeMove(e){
		if (this.changeHeightStatus) {
			let y = this.areaChangeBoth.getBoundingClientRect().bottom + pageYOffset - e.pageY - this.resizeOffsetY
			this.canvas.height -= y;
		}
		if (this.changeWidthStatus) {
			let x = this.areaChangeBoth.getBoundingClientRect().right + pageXOffset - e.pageX - this.resizeOffsetX
			this.canvas.width -= x;
		}
	}
	resizePressUp(e){
		if (this.changeWidthStatus || this.changeHeightStatus) {
			this.changeWidthStatus = false;
			this.changeHeightStatus = false;
			let histotyImg = new Image();
			histotyImg.src = this.tempPng;
			histotyImg.onload = () => {
				this.ctx.drawImage(histotyImg, 0 ,0)
				this.saveHistory();
			}
		}
	}
	saveToLocalStorage(e){
		e.preventDefault();
		let temp = this.quantityOfCommands[this.currentStep-1] || 0; //количество комманд на текущем шаге
		let tempStack = this.stackOfCommands;
		tempStack.length = temp;
		localStorage.setItem('stackOfCommand', JSON.stringify(tempStack));
	}
	print(e){
		e.preventDefault();
		if (!this.availableLocalStorage) {
			alert('Sorry, but your browser does not available Local Storage')
			return;
		}
		let arrayCommand = JSON.parse(localStorage.getItem('stackOfCommand'));
		this.listOfCommand.innerHTML = '';
		while(arrayCommand.length){
			let itemList = document.createElement('li');
			itemList.innerText = arrayCommand.pop();
			this.listOfCommand.appendChild(itemList);
		}		
	}

};

let variantColors = ['red', 'green', 'black', 'orange'];
let variantWidth = ['1', '2', '3', '4'];
let editor1 = new ImgEditor(400, 300, variantColors, variantWidth);