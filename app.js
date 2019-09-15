var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	nicknames = [];
	
app.use(express.static('public'));
var mongoose = require('mongoose');
var credentials = require('./credentials.js');
var dbUrl=credentials.MONGOURL;
mongoose.connect(dbUrl , {useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  console.log('mongodb connected',err);
})
var Message = mongoose.model('Message',{
  msg : String,
  nick : String,
  dateAdded : {type: Date, default: Date.now}
})
	
server.listen(3000);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	});
	
io.sockets.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if (nicknames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames();
			io.sockets.emit('is_online', '🔵 <i>' + socket.nickname + ' se unió a la conversación...</i><br/>');
		}
	});
	
	// recarga la lista de nicks
	function updateNicknames(){
		io.sockets.emit('usernames', nicknames);
	}
	
	// envía el nombre de usuario junto con el mensaje
	socket.on('send message', function(data){
		var message = new Message({msg: data, nick: socket.nickname});
		 message.save((err) =>{
			if(!err)
				io.sockets.emit('new message', message);
		  })
		
		
	});
	
	// controla la desconexión de los usuarios
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
		io.sockets.emit('is_offline', '🔴 <i>' + socket.nickname + ' dejó la conversación...</i><br/>');
	});
});

