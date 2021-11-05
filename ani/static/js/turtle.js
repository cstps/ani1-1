class Turtle {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
		this.commands = new CommandManager();
		this.position = new Position(this.canvas.width / 2, this.canvas.height / 2);
		this.nextPosition = this.position.copy();
		this.nextAngle = this.angle = 0;
		this.nextVisibility = this.visibility = true;
		//this.speedint = Number($("#speedvalue").val());
		//this.speed(this.speedint);
		this.delay = 500;
		this.pen = new Pen();
		this.drawList = [];
		this.animate();
	}
	
	animate() {
		if (!_turtlestop) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			for (let i of this.drawList) {
				/*
				if (this.speedint != Number($("#speedvalue").val())) {
					this.speedint = Number($("#speedvalue").val());
					this.speed(this.speedint);
					//alert(this.speedint);
				}
				*/
				i.draw(this.context);
			}
			this.drawTurtle();
			this.commands.executeCommand();
			requestAnimationFrame(() => {
				this.animate();
			});
			if (this.commands.history.length == 0 && this.commands.undoList.length > 0) {
				running_off();
				turtle_stop(1);
				print_action("작성된 코드가 오류 없이 실행되었습니다.");
			}
		}
	}
	
	drawTurtle() {
		if (this.visibility) {
			this.context.save();
			this.context.beginPath();
			this.context.fillStyle = '#000';
			this.context.translate(this.position.x, this.position.y);
			this.context.rotate(this.angle * Math.PI / 180);
			this.context.moveTo(0, 0);
			this.context.lineTo(-10, 5);
			this.context.lineTo(-10, -5);
			this.context.fill();
			this.context.restore();
		}
	}
	
	setDelay(delay = 500) {
		this.delay = delay;
	}
	//setSpeed(speed) {
	speed(speed) {
		this.delay = (10-speed+1) * 50;
	}
	
	//setPenSize(size) {
	pensize(size) {
		if (size>=10) {
			size=10;
		}
		if (size<1) {
			size=1;
		}
		this.pen.setSize(size);
	}
	
	//setPenColor(color) {
	pencolor(color) {
		this.pen.setColor(color);
	}
	
	penup() {
		this.pen.penup();
	}
	
	pendown() {
		this.pen.pendown();
	}
	
	hide() {
		this.visible(false);
	}
	
	show() {
		this.visible(true);
	}
	
	visible(visibility) {
		if (this.nextVisibility == visibility) return;
		this.nextVisibility = visibility;
		const undoState = {
			visibility,
		};
		this.commands.undoList.push([
			VisibleState,
			undoState,
		]);
		this.commands.add(
			new Command(() => {
				this.visibility = visibility;
				this.commands.next();
			})
		);
	}
	
	forward(distance) {
		const forwardX = Math.cos(this.nextAngle * Math.PI / 180) * distance;
		const forwardY = Math.sin(this.nextAngle * Math.PI / 180) * distance;
		//this.delay=distance/100*1000;
		//this.delay=distance/100*(10-this.speedint+1) * 50;
		//this.delay=distance/100*500;
		this.delay=1;
		this.goto(this.nextPosition.x + forwardX, this.nextPosition.y + forwardY);
	}
	
	backward(distance) {
		this.forward(-distance);
	}
	
	goto(x, y) {
		const position = this.nextPosition.copy();
		const delay = this.delay;
		const pen = this.pen.copy();
		
		this.nextPosition.x = x;
		this.nextPosition.y = y;
		
		const nextPosition = this.nextPosition.copy();
		
		const undoState = {
			nextPosition: nextPosition.copy(),
			forward: position.copy(),
			pen,
		};
		
		this.commands.undoList.push([
			GoState,
			undoState,
		]);
		
		this.commands.add(
			new Command((start, current) => {
				const endTime = current - start;
				const distanceX = nextPosition.x - position.x;
				const distanceY = nextPosition.y - position.y;
				
				new Line(pen, position, this.position).draw(this.context);
				
				if (endTime < delay) {
					this.position.x = position.x + (endTime / delay) * distanceX;
					this.position.y = position.y + (endTime / delay) * distanceY;
				} else {
					this.drawList.push(new Line(pen, position, nextPosition));
					this.position.x = nextPosition.x;
					this.position.y = nextPosition.y;
					this.commands.next();
				}
			})
		);
	}
	
	left(angle) {
		const nextAngle = this.nextAngle;
		
		//const delay = this.delay;
		//const delay = this.speedint/2;
		//const delay=(10-this.speedint+1) * 50;
		const delay = 1;
		
		this.nextAngle -= angle;
		
		const undoState = {
			nextAngle: this.nextAngle,
			angle: -angle,
		};
		
		this.commands.undoList.push([
			RotateState,
			undoState,
		]);
		
		this.commands.add(
			new Command((start, current) => {
				const endTime = current - start;
				this.angle = nextAngle;
				if (endTime < delay) {
					this.angle -= (endTime / delay) * angle;
				} else {
					this.angle -= angle;
					this.commands.next();
				}
			})
		);
	}
	
	right(angle) {
		this.left(-angle);
	}
	
	towards(x, y) {
		const distanceX = x - this.nextPosition.x;
		const distanceY = y - this.nextPosition.y;
		return -(Math.atan2(distanceY, distanceX) * 180 / Math.PI);
	}
	
	setHeading(angle) {
		this.left(angle + this.nextAngle);
	}
	
	heading() {
		return this.nextAngle;
	}
	
	position() {
		return this.nextPosition.copy();
	}
	
	_undoRotate(state) {
		const delay = this.delay;
		this.nextAngle = state.nextAngle - state.angle;
		this.commands.add(
			new Command((start, current) => {
				const endTime = current - start;
				this.angle = state.nextAngle;
				if (endTime < delay) {
					this.angle -= (endTime / delay) * state.angle;
				} else {
					this.angle -= state.angle;
					this.commands.next();
				}
			})
		);
	}
	
	_undoGo(state) {
		const position = state.nextPosition.copy();
		const delay = this.delay;
		
		state.nextPosition = state.forward.copy();
		
		this.nextPosition = state.nextPosition.copy();
		
		this.commands.add(
			new Command(() => {
				if (state.pen.isDown()) {
					this.drawList.pop();
				}
				this.commands.next();
			})
		);
		
		this.commands.add(
			new Command((start, current) => {
				const endTime = current - start;
				const distanceX = state.nextPosition.x - position.x;
				const distanceY = state.nextPosition.y - position.y;
				
				new Line(state.pen, state.nextPosition, this.position).draw(this.context);
				
				if (endTime < delay) {
					this.position.x = position.x + (endTime / delay) * distanceX;
					this.position.y = position.y + (endTime / delay) * distanceY;
				} else {
					this.position.x = state.nextPosition.x;
					this.position.y = state.nextPosition.y;
					this.commands.next();
				}
			})
		);
	}
	
	_undoVisible(state) {
		this.commands.add(
			new Command(() => {
				this.visibility = !state.visibility;
				this.commands.next();
			})
		);
	}
	
	undo() {
		this.commands.undo(this);
	}
}

class GoState {
	constructor(turtle) {
		this.turtle = turtle;
	}
	
	action(state) {
		this.turtle._undoGo(state);
	}
}

class RotateState {
	constructor(turtle) {
		this.turtle = turtle;
	}
	
	action(state) {
		this.turtle._undoRotate(state);
	}
}

class VisibleState {
	constructor(turtle) {
		this.turtle = turtle;
	}
	
	action(state) {
		this.turtle._undoVisible(state);
	}
}

class Pen {
	constructor() {
		this.lineSize = 1;
		this.color = '#000';
		this.isDrawing = true;
	}
	
	setSize(size) {
		this.lineSize = size;
	}
	
	setColor(color) {
		this.color = color;
	}
	
	isDown() {
		return this.isDrawing;
	}
	
	pendown() {
		this.isDrawing = true;
	}
	
	penup() {
		this.isDrawing = false;
	}
	
	copy() {
		return Object.assign(Object.create(this), this);
	}
}

class Line {
	constructor(pen, start, end) {
		this.pen = pen;
		this.start = start;
		this.end = end;
	}
	
	draw(context) {
		if (this.pen.isDown()) {
			context.beginPath();
			context.lineCap = 'round';
			context.lineWidth = this.pen.lineSize;
			context.strokeStyle = this.pen.color;
			context.moveTo(this.start.x, this.start.y);
			context.lineTo(this.end.x, this.end.y);
			context.stroke();
		}
	}
}

class Position {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	
	copy() {
		return new Position(this.x, this.y);
	}
}

class CommandManager {
	constructor() {
		this.history = [];
		this.undoList = [];
	}
	
	add(command) {
		this.history.push(command);
	}
	
	next() {
		this.history.shift();
	}
	
	executeCommand() {
		if (!this.history.length) return;
		const command = this.history[0];
		command.execute(new Date().getTime());
	}
	
	undo(turtle) {
		if (!this.undoList.length) return;
		const item = this.undoList.pop();
		const State = item[0];
		new State(turtle).action(item[1]);
	}
}

class Command {
	constructor(action) {
		this.action = action;
		this.start = null;
	}
	
	execute(current) {
		if (!this.start) this.start = new Date().getTime();
		this.action(this.start, current);
	}
}

