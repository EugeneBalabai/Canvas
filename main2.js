class ImgEditor{
	constructor(width, height, variantColors, variantWidth){
		this.width = width;
		this.height = height;
		this.variantColors = variantColors;
		this.variantWidth = variantWidth;
		this.mousePressedCanvas = false;
		this.changeWidth = false;
		this.changeHeight = false;
		this.currentStep = 0;
		this.history = [];
		this.resizeOffsetX = 0;
		this.resizeOffsetY = 0;
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
		document.querySelector('html').addEventListener("mousemove", this.resizeMove.bind(this) );
		document.querySelector('html').addEventListener("mouseup", this.resizePressUp.bind(this) );
		document.querySelector('html').addEventListener("mouseleave", this.resizePressUp.bind(this) );
		

		this.globalWrapper = document.createElement('div');
		this.globalWrapper.classList.add("img-editor");

		this.tools = document.createElement('div');
		this.tools.classList.add("tools");

		this.changeColor = document.createElement('select');
		this.changeColor.classList.add("change-color");
		this.variantColors.forEach(color => {
			let option = document.createElement("option");
			option.value = color;
		    option.text = color;
		    this.changeColor.appendChild(option);
		})

		this.changeWidth = document.createElement('select');
		this.changeWidth.classList.add("change-width");
		this.variantWidth.forEach(color => {
			let option = document.createElement("option");
			option.value = color;
		    option.text = color;
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
		this.undoBtn.innerText = 'undo'
		this.undoBtn.classList.add("btn");
		this.undoBtn.classList.add("disabled");
		this.undoBtn.addEventListener('click', this.undo.bind(this))

		this.redoBtn = document.createElement('a');
		this.redoBtn.href = '#';
		this.redoBtn.innerText = 'redo'
		this.redoBtn.classList.add("btn");
		this.redoBtn.classList.add("disabled");
		this.redoBtn.addEventListener('click', this.redo.bind(this))


		this.canvasWrapper.appendChild(this.canvas);
		this.canvasWrapper.appendChild(this.areaChangeWidth);
		this.canvasWrapper.appendChild(this.areaChangeHeight);
		this.canvasWrapper.appendChild(this.areaChangeBoth);


		this.tools.appendChild(this.changeColor);
		this.tools.appendChild(this.changeWidth);
		this.tools.appendChild(this.clearBtn);
		this.tools.appendChild(this.undoBtn);
		this.tools.appendChild(this.redoBtn);

		this.globalWrapper.appendChild(this.tools);
		this.globalWrapper.appendChild(this.canvasWrapper);

		document.querySelector('body').appendChild(this.globalWrapper);
	}
	clearCanvas(){
    	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	saveHistory(){
		++this.currentStep;
		if ( this.history.length > this.currentStep-1) {
			this.history.length = this.currentStep-1;
		}
		let tempImg = this.canvas.toDataURL();
		this.history.push(tempImg);
		this.checkBtnsStatus();
		
	}
	drawHistoryImg(){
		if (!this.currentStep) {
			this.clearCanvas();
			return;
		}
		let histotyImg = new Image();
		histotyImg.src = this.history[this.currentStep-1];
		histotyImg.onload = () => {
			this.clearCanvas()
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
		this.clearCanvas();
		this.saveHistory();
		this.clearBtn.classList.add("disabled");
	}
	startDraw(e){
		this.mousePressedCanvas = true;
	    this.ctx.beginPath();
	    let x = e.offsetX, y = e.offsetY;
	    this.ctx.moveTo(x, y)
	    this.ctx.lineWidth = this.changeWidth.value;
	    this.ctx.strokeStyle = this.changeColor.value;
	}
	drawing(e){
		if (this.mousePressedCanvas) {
	      let x = e.offsetX, y = e.offsetY;
	      this.ctx.lineTo(x, y);
	      this.ctx.stroke();
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
			this.changeHeight = true;
			this.changeWidth = true;
		}else if (e.target == this.areaChangeHeight) {
			this.changeHeight = true;
		}else if (e.target == this.areaChangeWidth) {
			this.changeWidth = true;
		}
		this.tempPng = this.canvas.toDataURL();
	}
	resizeMove(e){
		if (this.changeHeight == true) {
			let y = this.areaChangeBoth.getBoundingClientRect().bottom + pageYOffset - e.pageY - this.resizeOffsetY
			this.canvas.height -= y;
		}
		if (this.changeWidth == true) {
			let x = this.areaChangeBoth.getBoundingClientRect().right + pageXOffset - e.pageX - this.resizeOffsetX
			this.canvas.width -= x;
		}
	}
	resizePressUp(e){
		if (this.changeWidth == true || this.changeHeight == true) {
			this.changeWidth = false;
			this.changeHeight = false;
			let temp = new Image();
			temp.src = this.tempPng
			temp.onload = () => {
				this.ctx.drawImage(temp, 0 ,0)
			}
		}
	}

};

let variantColors = ['red', 'green', 'black', 'orange'];
let variantWidth = ['1', '2', '3', '4'];
let editor1 = new ImgEditor(400, 300, variantColors, variantWidth);
