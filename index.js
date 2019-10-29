var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Define the pages we are serving
app.get('/', function(req, res){ res.sendFile(__dirname + '/index.html'); });
app.get('/player', function(req, res){ res.sendFile(__dirname + '/player.html'); });
app.get('/remote', function(req, res){ res.sendFile(__dirname + '/remote.html'); });
app.get('/logo_sm.png', function(req, res){ res.sendFile(__dirname + '/logo_sm.png'); });
app.get('/style.css', function(req, res){ res.sendFile(__dirname + '/style.css'); });
app.get('/touch', function(req, res){ res.sendFile(__dirname + '/touch.html'); });



//An array to hold all of the client objects
var clients =[];

io.on('connection', function(socket){
  	
  	//We have a new connection
	console.log('New Connection');

	//The client is disconnecting
	socket.on('disconnect', function(){
		console.log('Disconnection');
		//Remove Client from array
		for( var i=0, len=clients.length; i<len; ++i ){
			var c = clients[i];
			if(c.clientId == socket.id){
				clients.splice(i,1);
				break;
			}
		}
		//Send a disconnect message to all monitors
		sendLog('['+ socket.id + '] disconnected');
	});

	//The Client is requesting the list of all clients
	socket.on('getClients', function (data) {
		io.to(socket.id).emit('clients', clients);
	});

	//The Client is connecting by setting their ID
	socket.on('setClientID', function (data) {
		console.log('Setting ID to: ' + data.customId + ' (' + data.type + ')');
		//Create a new client
		var clientInfo = new Object();
		clientInfo.customId = data.customId;
		clientInfo.type = data.type;
		clientInfo.description = data.description;
		clientInfo.clientId = socket.id;
		var now = new Date();
		clientInfo.connectTime = now.toLocaleString();	
		clientInfo.ipAddress = socket.handshake.address;  
		clients.push(clientInfo);

		//Send log to all monitors
		sendLog('[' + socket.id +'] '+ data.type +  ' added with id: "' + data.customId + '"' );
	});

	//The Client is sending a command to forward to all clients with the same ID
	socket.on('command', function(msg){


		//Find my unique Identifier
		for( var i=0, len=clients.length; i<len; ++i ){
			var c = clients[i];
			if(c.clientId == socket.id){
				var myId = c.customId;
				break;
			}
		}
		
		//Send log to all monitors
		sendLog('Received from [' + socket.id + ']: "' + msg + '" Targetting ID: "' + myId + '"');

		//Loop through all the connected devices if they are a player with my ID send the message to them
		var count = 0;
		for( var i=0, len=clients.length; i<len; ++i ){
			var c = clients[i];
			if(c.customId == myId && c.clientId != socket.id && c.type == 'player'){
				io.to(c.clientId).emit('command', msg);
				count++;

				//Send log to all monitors
				sendLog('Sent to [' + c.clientId + '] (ID: "' + myId + '"): "' + msg +'"');
			}
		}

		console.log('Sent: <' + msg + '> to: <' + myId + '> (' + count +' players)');	
		//Send response back to the controller
		io.to(socket.id).emit('response', 'Sent: "' + msg + '" to: "' + myId + '" (' + count +' players)');
	});


	//Receiving a command from an echo is slightly different as it does not maintain a connection
	socket.on('echoCommand', function(msg){

		//The message is a text string at the moment myID|Command
		data = msg.split("||");
		console.log( data[0]);
		myId = data[0];
		msg = data[1];

		//Send log to all monitors
		sendLog('[' + socket.id +'] ECHO emitted "'  +msg+  '" with id: "' + myId + '"');

		//Loop through all the connected devices if they are a player with my ID send the message to them
		var count = 0;
		for( var i=0, len=clients.length; i<len; ++i ){
			var c = clients[i];
			if(c.customId == myId && c.clientId != socket.id && c.type == 'player'){
				
				
				//HACK to start video if in the menu..
				if (msg == 'play') io.to(c.clientId).emit('command', 'play_0');
				
				
				io.to(c.clientId).emit('command', msg);
				count++;
				
				//Send log to all monitors
				sendLog('[' + socket.id + '] sent: "' + msg + '" to: "' + myId + '" [' + c.clientId + ']');
			}
		}

		console.log('Sent: <' + msg + '> to: <' + myId + '> (' + count +' players)');
		//Send response back to the controller
		io.to(socket.id).emit('response', 'Sent: "' + msg + '" to: "' + myId + '" (' + count +' players)');
	});
});

//Send a log to any listening monitors
function sendLog(msg){
	for( var j=0, len=clients.length; j<len; ++j ){
		var cc = clients[j];
		if (cc != null) if(cc.type == 'monitor') io.to(cc.clientId).emit('command', msg);
	}
}

//Update any monitors - this happens every 1.5 seconds
function updateMonitor() {
  for( var i=0, len=clients.length; i<len; ++i ){
      var c = clients[i];
      if (c != null) if(c.type == 'monitor'){
        io.to(c.clientId).emit('clients', clients);
      }
    }
}
setInterval(updateMonitor, 1500);

http.listen(3000, function(){
  console.log('listening on *:3000');
});
