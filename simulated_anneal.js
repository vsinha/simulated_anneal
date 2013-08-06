var c = document.getElementById("canvas1");
var p1 = document.getElementById("p1");
var p2 = document.getElementById("p2");
var p3 = document.getElementById("p3");
var tempBox = document.getElementById("tempBox");
var width = c.width;
var height = c.height;
var ctx = c.getContext("2d");
var cities = [];
var numPts = width/2;
var numCities = 10;
var bestSol;
var best = Number.MAX_VALUE;

var temp = 100;


function coordinate(x, y) {
	this.x = x;
	this.y = y;
}

//so we can get random elements easily
Array.prototype.randomElement = function () {
	return this[Math.floor(Math.random() * this.length)]
}

//to copy the array
Array.prototype.clone = function() {
	return this.slice(0);
};

//let's do this with the traveling salesman problem
function generateCities() {
	var i, newX, newY;
	for (i = 0; i < numCities; i++) {
		newX = Math.random() * (width - 10) + 10;
		newY = Math.random() * (height - 10) + 10;
		cities.push(new coordinate(newX, newY));
	}
}

function drawCities() {
	var i;
	for (i = 0; i < numCities; i++) {
		drawCircle(cities[i].x, cities[i].y);
	}
}

function drawCircle(x, y) {
	ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#0000ff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#444444';
    ctx.stroke();
}

//draw the connecting line between cities
function connectCities() {
	var i;
	for (i = 0; i < numCities - 1; i++) {
		drawLine(cities[i], cities[i+1]);
	}
}

function drawLine(city1, city2) {
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#aaaaaa';

	for (var i = 0; i < numCities - 1; i++) {
		ctx.beginPath();
		ctx.moveTo(cities[i].x, cities[i].y); 
		ctx.lineTo(cities[i + 1].x, cities[i + 1].y);
		ctx.stroke();
	}
}

function setupGraph() {
	var i;
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#DDDDDD';

	for (i = 0; i < height; i+=50) { //draw horizontal line every 10 pixels for reference
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(width, i);
		ctx.stroke();
	}

	for (i = 0; i < width; i+=50) { //draw horizontal line every 10 pixels for reference
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, height);
		ctx.stroke();
	}
}

function redraw() {
	//draw the indicator line if we have a better one
	ctx.canvas.width = ctx.canvas.width; //reset graph?
	setupGraph();
	connectCities();
	drawCities();
	p2.innerHTML = energy(cities).toFixed(2);
	//write to best solution div
	if (energy(cities) < best) {
		best = energy(cities);
		bestSol = cities.slice(0);
		p3.innerHTML = best.toFixed(2);
	}
}

function energy(solution) { //sum distance between cities in order
	var i;
	var sum = 0;
	for (i = 0; i < numCities-1; i++) {
		//distance forumula sqrt((x1 - x2)^2 + (y1 - y2)^2)
		sum += Math.sqrt( Math.pow(solution[i].x - solution[i + 1].x, 2) + Math.pow(solution[i].y - cities[i+1].y, 2));
	}
	return sum;
}

//make a single change to the current cities list
//randomly swap order of 2 cities
//be stateful about it
function neighbor(currentSolution) {
	//pick 2 randoms
	var rand1 = Math.floor(Math.random() * numCities);
	var rand2 = rand1;
	while (rand2 === rand1) {
		rand2 = Math.floor(Math.random() * numCities);
	}

	//work with a clone of the cities array
	neighborSolution = cities.slice(0);

	//swap them
	var temp = neighborSolution[rand1];
	neighborSolution[rand1] = neighborSolution[rand2];
	neighborSolution[rand2] = temp;
	return neighborSolution;
}

function simulateStep(temp) { //do it one step at a time for animation
	var currentSolution = cities;
	var neighborSolution = neighbor(currentSolution);
	
	if (energy(neighborSolution) < energy(currentSolution)) {
		currentSolution = neighborSolution;
	} else if (probFunc(neighborSolution, currentSolution, temp)) { //accept anyways
		currentSolution = neighborSolution;
	}

	cities = currentSolution;  //store to global var

	redraw();
}

function probFunc(neighborSolution, currentSolution, temp) {
	return (Math.random() < Math.exp(-(energy(neighborSolution)-energy(currentSolution))/temp));
}

function simulateAnneal() {

	animate({
		delay: 1,
    	duration: 1000, // 1 sec by default
    	temp: function linear(temp) {
    		return temp - 0.1;
    	},
    	step: function(temp) {
    		simulateStep(temp);
    	}
	});

}

function animate(opts) {
	var start = new Date   

	var id = setInterval(function() {
		var timePassed = new Date - start
		var progress = timePassed / opts.duration

		temp = opts.temp(temp)

		if (temp <= 0) {
			temp = 0;
		}

		opts.step(temp)
		p1.innerHTML = temp.toFixed(2);

		if (temp == 0) {
			clearInterval(id);
			displayFinalSolution();
		}
	}, opts.delay || 10)

}

function displayFinalSolution() {
	cities = bestSol;
	redraw();
}

function resimulate() {
	temp = tempBox.value;
	simulateAnneal();
	displayFinalSolution();
}

function repick() {
	generateCities();
	setupGraph();
	connectCities();
	drawCities();
}

function start() {
	tempBox.value = temp;
	generateCities();
	setupGraph();
	connectCities();
	drawCities(); //draw the cities on top of the connecting lines

	simulateAnneal();
}