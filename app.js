var express = require('express');
var path = require('path');

var app = express();

app.set('views', path.normalize(__dirname + '/app/server/views/'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/app/public'));

app.get('/', function(req, res){
	res.render('home', {title : 'minesweeper', inputRow : 9, inputColumn : 9});
});

app.get('/game', function (req, res) {
	res.render('home', {title : 'minesweeper', inputRow : req.query.row, inputColumn : req.query.column});
});


app.listen(8085);
console.log('listening at 8085');