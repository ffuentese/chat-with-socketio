jQuery(function($){
			var socket = io.connect();
			var $nickForm = $('#setNick');
			var $nickError = $('#nickError');
			var $nickBox = $('#nickname');
			var $users = $('#users');
			var $messageForm = $('#send-message');
			var $messageBox = $('#message');
			var $chat = $('#chat');
			
			// funcion que controla creación de nick
			$nickForm.submit(function(e){
				e.preventDefault();
				socket.emit('new user', $nickBox.val(), function(data){
					if(data){
						$('#nickWrap').hide();
						$('#contentWrap').show();
					} else {
						$nickError.html('Ese usuario esta siendo usado');
					}
				});
				$nickBox.val('');
			});
			
			socket.on('usernames', function(data){
				var html = '';
				for(i=0; i < data.length; i++){
					html += data[i] + '<br/>';
				}
				$users.html(html); // shows the userlist
			});
			
			$messageForm.submit(function(e){
				e.preventDefault(); // so that it doesn't refresh the page
				socket.emit('send message', $messageBox.val());
				$messageBox.val('');
			});
			
			socket.on('new message', function(data){
				$chat.append('<li><b>' + data.nick + ': </b>' + data.msg + "</li>");
				$('#chat').stop ().animate ({
					scrollTop: $('#chat')[0].scrollHeight
				});
			}); // pone el texto en la ventana. La animación va a hacer que siempre puedas ver la última frase.
			
			socket.on('is_online', function(data){
				$chat.append(data);
			}); // pone el texto en la ventana.
			
			socket.on('is_offline', function(data){
				$chat.append(data);
			}); 
		});