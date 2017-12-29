"use strict"
const MINE_CHANCE = 0.4;
var game_over = false;
var newGame;


$(document).ready(function () {
	let maxRow = $("#game-board").data("row");
	let maxCol = $("#game-board").data("column");
	newGame = new Game(maxRow, maxCol, 32);
	newGame.initializeGame();

	$(".tile").click(function () {
		var target = $(this);
		if (newGame.tiles[target.data("row")][target.data("column")].boolRevealed) return;

		if (checkForMine(target.data("row"), target.data("column"))){
			gameOver();
		} else {
			reveal(target.data("row"), target.data("column"), newGame);
		}
	})
});

function checkForMine(row, column) {
	return newGame.tiles[row][column].boolMine;
}

function Game(rows, columns, mineCountInput){
	this.rows = rows;
	this.columns = columns;
	this.tiles = [];
	this.mineCount = mineCountInput;
	// this.mineCount = 0;

	this.initializeGame = function () {
		for (var i = 0; i < this.rows; i++) {
			var singleRowOfTile = [];
			for (var j = 0; j < this.columns; j++) {
				var boolAddMine = (mineCountInput > 0 && Math.random() <= MINE_CHANCE) ? true : false;
				
				//remove
				boolAddMine = false;

				singleRowOfTile.push(new Tile(i, j, boolAddMine, false, 0));
				--mineCountInput;
			}
			this.tiles.push(singleRowOfTile);
		}
		//test remove
this.tiles[0][3].boolMine = true;
this.tiles[1][2].boolMine = true;
this.tiles[10][4].boolMine = true;
this.tiles[10][6].boolMine = true;
this.tiles[11][5].boolMine = true;
this.tiles[2][2].boolMine = true;
this.tiles[3][2].boolMine = true;
this.tiles[4][2].boolMine = true;
this.tiles[4][3].boolMine = true;
this.tiles[5][2].boolMine = true;
this.tiles[5][4].boolMine = true;
this.tiles[6][2].boolMine = true;
this.tiles[6][5].boolMine = true;
this.tiles[7][2].boolMine = true;
this.tiles[7][6].boolMine = true;
this.tiles[8][2].boolMine = true;
this.tiles[8][3].boolMine = true;
this.tiles[8][4].boolMine = true;
this.tiles[8][6].boolMine = true;
this.tiles[9][6].boolMine = true;

// revealEverything();





		console.log(this);

		var targetTiles = this.tiles;
		var listOfMines = targetTiles.reduce(function (accumulator, current) {
			return accumulator.concat(current.filter(elem => elem.boolMine));
		}, []);

		console.log(listOfMines);
		for (let tile of listOfMines){
			//add neigbormines count
			markNeighbouringTiles(tile.row, tile.column, newGame);
		}
		
		// console.log(this);
		
	};
}

function Tile(row, col, mine, revealed, neighbouringMines) {
	this.row = row;
	this.column = col;
	this.boolMine = mine;
	this.boolRevealed = revealed;
	this.neighbouringMines = neighbouringMines;
	this.underRecursion = false;
}

function reveal(row, column, game) {
	if (row < 0 || row >= game.rows
			|| column < 0 || column >= game.columns || game.tiles[row][column].boolMine) {
		return;
	} else {
		var targetTile = game.tiles[row][column];
		if (!checkForMine(row, column) && !targetTile.boolRevealed && targetTile.underRecursion === false){
			targetTile.underRecursion = true;
			targetTile.boolRevealed == true;

			let targetDiv = `div[data-row=${row}][data-column=${column}]`;
			revealNeighbourCount(targetDiv, targetTile)
			// $(target + " .neighbour-mine-count").text(targetTile.neighbouringMines || "");
			// $(target).addClass("revealed-tile");
			// reveal(row, column + 1, game);
			// reveal(row + 1, column, game);
			// reveal(row - 1, column, game);
			// reveal(row, column - 1, game);
			// reveal(row + 1, column - 1, game);
			// reveal(row - 1, column -1, game);
			// reveal(row + 1, column + 1, game);

			reveal(row, column + 1, game);
			reveal(row, column - 1, game);
			reveal(row + 1, column, game);
			reveal(row - 1, column, game);
			// reveal(row + 1, column - 1, game);
			// reveal(row - 1, column -1, game);
			// reveal(row + 1, column + 1, game);
		} else{
			return;
		}
	}
}

// function revertUnderRecursionFlag(row, column) {
// 	newGame.tiles[row][column].underRecursion = false;
// }

function markNeighbouringTiles  (row, column, game) {
	for (var i = -1; i <= 1; i++) {
		let checkRow = row + i;
		if (checkRow >= 0 && checkRow < game.rows){
			for (var j = -1; j <= 1; j++) {
				if (i === 0 && j === 0){
					//do nothing for tiles having the same address as the target
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

function gameOver() {
	revealEverything();
}

function revealNeighbourCount(div, tile) {
	//let targetTile = `div[data-row=${outerIndex}][data-column=${innerIndex}]`;
	$(div + " .neighbour-mine-count").text(tile.neighbouringMines || "");
	$(div).addClass("revealed-tile");
	$(div + " .icon-placeholder").addClass(tile.boolMine ? "fa-bomb" : "");
}

function revealEverything() {
	//reveal everything testing
	newGame.tiles.forEach(function (innerArray, outerIndex) {
		innerArray.forEach(function (elem, innerIndex) {
			if (elem.boolRevealed) return;
			let targetDiv = `div[data-row=${outerIndex}][data-column=${innerIndex}]`;
			revealNeighbourCount(targetDiv, elem);
			// $(targetTile + " .neighbour-mine-count").text(elem.neighbouringMines || "");
			// $(targetTile).addClass("revealed-tile");
			// $(targetTile + " .icon-placeholder").addClass(elem.boolMine ? "fa-bomb" : "");
		})
	})
}