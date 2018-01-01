"use strict"
const MINE_CHANCE = 0.4;
const GAME_WON = true;
var boolGameOver = false;
var newGame;
var boolFirstMove = true;

var runningTime = 0;
var timer;

function setTimer() {
	timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
	$("#time-count").text(++runningTime);
}


$(document).ready(function () {
	let maxRow = $("#game-board").data("row");
	let maxCol = $("#game-board").data("column");
	let mineCount = Math.floor((maxRow * maxCol) * 0.15) || 1;
	newGame = new Game(maxRow, maxCol, mineCount);
	newGame.initializeGame();


	//Left click events
	$(".tile").mousedown(function (e) {
		if (e.which===1) {
			var target = $(this);
			
			//Ignore already revealed tiles
			if (newGame.tiles[target.data("row")][target.data("column")].boolRevealed) return;

			//Ignore already flagged tiles
			if (target.children(".icon-placeholder").hasClass("flagged")) return;

			target.addClass("pressed");

			firstMove();

			let boolSteppedOnMine = checkForMine(target.data("row"), target.data("column"));
			if (boolSteppedOnMine){
				gameOver(!GAME_WON);
			} else {
				reveal(target.data("row"), target.data("column"), newGame);
			}
		}

	});

	//Right click events
	$(".tile").contextmenu(function (e) {
		e.preventDefault();
		if (boolGameOver) return;
		firstMove();

		var target = $(this);

		//Ignore already revealed tiles
		if (newGame.tiles[target.data("row")][target.data("column")].boolRevealed) return;

		//Toggle between putting a flag on the tile
		var targetIconPlaceholder = target.find(".icon-placeholder");
		if (targetIconPlaceholder.hasClass("flagged")){
			targetIconPlaceholder.removeClass("fa-flag flagged");
			$("#mine-count").text(++newGame.suspectedMineCount);
			newGame.tiles[target.data("row")][target.data("column")].boolFlagged = false;
		} else {
			targetIconPlaceholder.addClass("fa-flag flagged");
			$("#mine-count").text(--newGame.suspectedMineCount);
			newGame.tiles[target.data("row")][target.data("column")].boolFlagged = true;
		}
	});

	//Click event to restart game
	$("#restart").click(function () {
		$(".revealed-tile").removeClass("revealed-tile");
		$(".neighbour-mine-count").text("");
		$(".fa-flag.flagged").removeClass("fa-flag flagged");
		$(".fa-bomb").removeClass("fa-bomb");
		$("#time-count").text(0);
		$(".fa-times.crossed").removeClass("fa-times crossed");
		$(".pressed").removeClass("pressed");

		//Remove all classes starting with "mine-"
		let classesOfMineCount = [];
		for (var i = 0; i < 9; i++) {
			classesOfMineCount.push("mines-" + i);
		}
		$(".neighbour-mine-count").removeClass(classesOfMineCount.join(" "));

		clearInterval(timer);
		boolFirstMove = true;
		boolGameOver = false;
		//newGame = new Game(maxRow, maxCol, mineCount);
		newGame.initializeGame();
		$("#time-count").removeClass("start-timer");

	});



});

//Function to call when user make its first move.
//This initialises the timer.
function firstMove() {
	if (boolFirstMove) {
		boolFirstMove = false;
		runningTime = 0;
		setTimer();
		$("#time-count").addClass("start-timer");
	}
}

function checkForMine(row, column) {
	return newGame.tiles[row][column].boolMine;
}

function Game(rows, columns, mineCountInput){
	this.rows = rows;
	this.columns = columns;
	this.tileCount = rows * columns;
	this.tiles = [];
	this.mineCount = mineCountInput;
	this.suspectedMineCount = mineCountInput;
	this.revealedTileCount = 0;
	this.boolCompleted = false;
	this.initializeGame = function () {
		this.tiles = [];
		this.suspectedMineCount = mineCountInput;
		this.revealedTileCount = 0;
		this.boolCompleted = false;
		for (var i = 0; i < this.rows; i++) {
			var singleRowOfTile = [];
			for (var j = 0; j < this.columns; j++) {
				singleRowOfTile.push(new Tile(i, j, false, false, 0));
			}
			this.tiles.push(singleRowOfTile);
		}
		putMinesInRandomTiles(this);
		$("#mine-count").text(this.suspectedMineCount);

		var targetTiles = this.tiles;
		var listOfMines = targetTiles.reduce(function (accumulator, current) {
			return accumulator.concat(current.filter(elem => elem.boolMine));
		}, []);

		for (let tile of listOfMines){
			markNeighbouringTiles(tile.row, tile.column, newGame);
		}
	};
}

function Tile(row, col, mine, revealed, neighbouringMines) {
	this.row = row;
	this.column = col;
	this.boolMine = mine;
	this.boolRevealed = revealed;
	this.neighbouringMines = neighbouringMines;
	this.underRecursion = false;
	this.boolFlagged = false;
}

function reveal(row, column, game) {
	if (row < 0 || row >= game.rows
			|| column < 0 || column >= game.columns || game.tiles[row][column].boolMine || game.boolCompleted
			|| game.tiles[row][column].boolFlagged) {
		return;
	} else {
		var targetTile = game.tiles[row][column];
		if (!checkForMine(row, column) && !targetTile.boolRevealed && targetTile.underRecursion === false){
			targetTile.underRecursion = true;
			targetTile.boolRevealed = true;
			game.revealedTileCount++;
			if (game.revealedTileCount === game.tileCount - game.mineCount) {
				game.boolCompleted = true;
				gameOver(GAME_WON);
				return;
			}

			let targetDiv = `div[data-row=${row}][data-column=${column}]`;
			revealNeighbourCount(targetDiv, targetTile);

			if (targetTile.neighbouringMines > 0){
				return;
			} else {
				reveal(row, column + 1, game);
				reveal(row, column - 1, game);
				reveal(row + 1, column, game);
				reveal(row - 1, column, game);
			}
		} else{
			return;
		}
	}
}

function markNeighbouringTiles  (row, column, game) {
	for (var i = -1; i <= 1; i++) {
		let checkRow = row + i;
		if (checkRow >= 0 && checkRow < game.rows){
			for (var j = -1; j <= 1; j++) {
				if (i === 0 && j === 0){
					//do nothing for tiles having the same coordinates as the target
					continue;
				} else {
					let checkColumn = column + j;
					let gameTile = game.tiles;
					if (checkColumn >= 0 && checkColumn < game.columns && !gameTile[checkRow][checkColumn].boolMine) {
						++gameTile[checkRow][checkColumn].neighbouringMines;
					}
				}
			}
		}
	}
}

function gameOver(boolWinGame) {
	boolGameOver = true;
	clearInterval(timer);
	boolFirstMove = true;
	$("#time-count").removeClass("start-timer");

	revealEverything();
	if (boolWinGame){
		alert("You won.")
	} else {
		alert("You lose. \n Try again.")
	}
}

function revealEverything() {
	newGame.tiles.forEach(function (innerArray, outerIndex) {
		innerArray.forEach(function (elem, innerIndex) {
			if (elem.boolRevealed) return;
			let targetDiv = `div[data-row=${outerIndex}][data-column=${innerIndex}]`;
			revealNeighbourCount(targetDiv, elem);
		})
	})
}

function revealNeighbourCount(div, tile) {

	$(div + " .icon-placeholder").addClass(tile.boolMine ? "fa-bomb" : "");
	if ($(div + " .icon-placeholder").hasClass("flagged") && tile.neighbouringMines >= 0){
		$(div + " .icon-placeholder").removeClass("flagged fa-flag").addClass("fa-times crossed");

	} else {
		$(div + " .neighbour-mine-count").text(tile.neighbouringMines || "").addClass("mines-" + tile.neighbouringMines);
	}
	$(div).addClass("revealed-tile");
}

function putMinesInRandomTiles(game) {
	let minesSoFar = 0;
	while(minesSoFar < game.mineCount){

		let randRow = getRandomInteger(0, game.rows);
		let randColumn = getRandomInteger(0, game.columns);
		let targetTile = game.tiles[randRow][randColumn];

		if (!targetTile.boolMine) {
			targetTile.boolMine = true;
			++minesSoFar;
			
		} else {
			continue;
		}

	}
}


function getRandomInteger(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}