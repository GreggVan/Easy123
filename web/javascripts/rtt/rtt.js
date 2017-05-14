//Real Time Text (RTT) plugin for Strophe
var showMsgs = [];
var msgIndex = [];
var RTTelements = [];
var currentMessage = [];
var showCorr = true;
var doReset = [];
var sendInterval= 250;
var RTT = {
        
        
	incomingMessage: function(RTTMessage) {
		// Assign RTT elements to user's variable
                
		RTTelements[RTTMessage.room.split("@")[0]+"_"+RTTMessage.nick] = RTTMessage.body;
                
		// Set initial user message increment
		if (isNaN(window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']))
		{
			window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message'] = 0;
		}

		// Check if this is a new message or not
		if (RTTMessage.event == "new")
		{
			doReset[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick] = false;
                        if (RTTMessage.type == "chat" && $('#messages_'+RTTMessage.room.split("@")[0]).length == 0)
			{
				startNewMessage = true;
				clearInterval(messageSendIntervals[RTTMessage.room.split("@")[0]]);
				messageSendIntervals[RTTMessage.room.split("@")[0]] = setInterval("StropheFunctions.sendMessage('"+RTTMessage.room.split("@")[0]+"')",sendInterval);
			}
			window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']++;
                        var window_id=RTTMessage.room.split("@")[0].split(".")[0]+'_'+RTTMessage.nick.split(".")[0]+'_'+window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']+'_messages';

//			$('#chatroom').append('<div class="user_message_container"><div class="triangle-border-incoming right"><strong>'+StropheFunctions.formatUser(RTTMessage.nick)+':</strong> <span id="'+window_id+'"></span></div>');
			$('#chatroom').append('<div class="user_message_container"><div class="triangle-border-incoming right"><strong>'+toContact+':</strong> <span id="'+window_id+'"></span></div>');
                        
		}
		
		// RTT reset event, reset text in current message
		if (RTTMessage.event == "reset")
		{
                                doReset[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick] = true;
				$("#"+RTTMessage.room.split("@")[0].split(".")[0]+'_'+RTTMessage.nick.split(".")[0]+'_'+window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']+"_messages").html(RTTelements[RTTMessage.room.split("@")[0]+"_"+RTTMessage.nick][0].childNodes[0].nodeValue);
                                
                                                       
				
		}

		// Show RTT message
		if (typeof(RTTMessage.body) == "string" && RTTMessage.nick != undefined)
		{
			if (RTTMessage.type == "chat" && $('#messages_'+RTTMessage.room.split("@")[0]).length == 0)
			{
				startNewMessage = true;
				clearInterval(messageSendIntervals[RTTMessage.room.split("@")[0]]);
				messageSendIntervals[RTTMessage.room.split("@")[0]] = setInterval("StropheFunctions.sendMessage('"+RTTMessage.room.split("@")[0]+"')",sendInterval);
			}
			window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']++;
//			$('#chatroom').append('<div class="user_message_container"><div class="triangle-border-incoming right"><strong>'+StropheFunctions.formatUser(RTTMessage.nick)+':</strong> <span id="'+RTTMessage.room.split("@")[0].split(".")[0]+'_'+RTTMessage.nick.split(".")[0]+'_'+window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']+'_messages">'+RTTMessage.body+'</span></div>');
			$('#chatroom').append('<div class="user_message_container"><div class="triangle-border-incoming right"><strong>'+toContact+':</strong> <span id="'+RTTMessage.room.split("@")[0].split(".")[0]+'_'+RTTMessage.nick.split(".")[0]+'_'+window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']+'_messages">'+RTTMessage.body+'</span></div>');
                        //alert($('#chatroom').scrollTop()+$('#chatroom').css('height'));
                        $('#chatroom').scrollTop(409);
                        
                }

		else
		{
			if (doReset[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick] == true)
			{

			}
			else
			{
				msgIndex[RTTMessage.room.split("@")[0]+"_"+RTTMessage.nick] = 0;
				showMsgs[RTTMessage.room.split("@")[0]+"_"+RTTMessage.nick] = setInterval("RTT.parseMessage('"+RTTMessage.room.split("@")[0].split(".")[0]+'_'+RTTMessage.nick.split(".")[0]+'_'+window[RTTMessage.room.split("@")[0]+'_'+RTTMessage.nick+'_message']+"_messages','"+RTTMessage.nick+"','"+RTTMessage.room.split("@")[0]+"')", 1);
			}
		}
	},
	parseMessage: function(roomId, currentUser, currentRoom) {

                if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]]!=undefined && RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].hasOwnProperty('tagName')) {

                if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].tagName == "t")
		{
			// Add text to page -- Insert specified text at position 'p' in message
                        
			var addPosition = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('p');
                        var stringLength=-1;
                        if( RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]]!=undefined)
                             stringLength = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].childNodes[0].nodeValue.length;
                        
			if ($('#'+roomId+' span').size() == 0)
			{
				for (np = 0; np < stringLength; np++)
				{
					$('#'+roomId).append('<span class="addchar">'+RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].childNodes[0].nodeValue[np]+'</span>');
				}
			}
			else
			{
				var charLength = $('#'+roomId+' span.addchar').size();
				var spanCharLength = $('#'+roomId+' span').size();
				for (ns = 0; ns < stringLength; ns++)
				{
					if (addPosition == null)
					{
						$('#'+roomId).append('<span class="addchar">'+RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].childNodes[0].nodeValue[ns]+'</span>');
					}
					else
					{
						// Add character(s) to message
						var newPos = parseInt(addPosition)+parseInt(ns)-1;
						$('#'+roomId+' span.addchar:eq('+parseInt(newPos)+')').after('<span class="addchar">'+RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].childNodes[0].nodeValue[ns]+'</span>');
					}
				}
			}
		}
		if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].tagName == "e")
		{
			// Delete character(s) -- Remove 'n' characters of text to the left of position 'p' in message
			var deleteChars = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('n') || 1;
			var deletePosition = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('p');
			for (dp=0; dp < deleteChars; dp++)
			{
				if (deletePosition == null)
				{
					// Delete last character
					// $('#'+roomId+' span.addchar:last').html('<strike style="color: #ff0000">'+$('#'+roomId+' span.addchar:last').text()+'</strike>');
					$('#'+roomId+' span.addchar:last').html('');
					$('#'+roomId+' span.addchar:last').addClass('delchar');
					$('#'+roomId+' span.addchar:last').removeClass('addchar');
				}
				else
				{
					// Delete character(s)
					var delPosition = parseInt(deletePosition)-parseInt(dp)-1;
					// $('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').html('<strike style="color: #ff0000">'+$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').text()+'</strike>');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').html('');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').addClass('delchar');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').removeClass('addchar');
				}
			}

			/* // Delete character(s) -- Remove 'n' characters of text to the left of position 'p' in message
			var deleteChars = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('n') || 1;
			var deletePosition = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('p');
			for (dp=0; dp < deleteChars; dp++)
			{
				if (deletePosition == null)
				{
					// Delete last character
					$('#'+roomId+' span.addchar:last').html('<strike style="color: #ff0000">'+$('#'+roomId+' span.addchar:last').text()+'</strike>');
					$('#'+roomId+' span.addchar:last').addClass('delchar');
					$('#'+roomId+' span.addchar:last').removeClass('addchar');
				}
				else
				{
					// Delete character(s)
					var delPosition = parseInt(deletePosition)-parseInt(dp)-1;
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').html('<strike style="color: #ff0000">'+$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').text()+'</strike>');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').addClass('delchar');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').removeClass('addchar');
				}
			} */
		}
		if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].tagName == "d")
		{
			// Delete character(s) -- Remove 'n' characters of text to the left of position 'p' in message
			var deleteChars = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('n') || 1;
			var deletePosition = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('p');
			for (dp=0; dp < deleteChars; dp++)
			{
				if (deletePosition == null)
				{
					// Delete last character
					// $('#'+roomId+' span.addchar:last').html('<strike style="color: #ff0000">'+$('#'+roomId+' span.addchar:last').text()+'</strike>');
					$('#'+roomId+' span.addchar:last').html('');
					$('#'+roomId+' span.addchar:last').addClass('delchar');
					$('#'+roomId+' span.addchar:last').removeClass('addchar');
				}
				else
				{
					// Delete character(s)
					var delPosition = parseInt(deletePosition)+parseInt(dp);
					// $('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').html('<strike style="color: #ff0000">'+$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').text()+'</strike>');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').html('');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').addClass('delchar');
					$('#'+roomId+' span.addchar:eq('+parseInt(delPosition)+')').removeClass('addchar');
				}
			}

		}
		if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].tagName == "w")
		{
			var keystrokeDelay = parseInt(RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('n'));
			RTT.showDelay(keystrokeDelay);
		}
		if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].tagName == "c")
		{
			// Cursor position -- Move cursor to position p in message
			// alert('cursor position');
			// var cursorPosition = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('p');
			// $('#'+roomId).append("(C="+cursorPosition+")");
		}
		if (RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].tagName == "g")
		{
			// Notification -- Execute a visual flash, beep, or buzz
			// alert('show notification');
			// var cursorPosition = RTTelements[currentRoom+"_"+currentUser][msgIndex[currentRoom+"_"+currentUser]].getAttribute('p');
			// $('#'+roomId).append("(G="+cursorPosition+")");
		}
                }
		if(msgIndex[currentRoom+"_"+currentUser] >= RTTelements[currentRoom+"_"+currentUser].length-1){
			// alert('clear interval');
			clearInterval(showMsgs[currentRoom+"_"+currentUser]);
		}
		// alert('interval: '+msgIndex[currentRoom+"_"+currentUser]);
		msgIndex[currentRoom+"_"+currentUser]++;
		
		// Scroll to bottom of messages
		var objDiv = document.getElementById('chatroom');
		objDiv.scrollTop = objDiv.scrollHeight;
	},
	replaceText: function(orig, index, numchars) {
		var strToReplace = orig.substr(index-numchars,index);
		return orig.substr(0, index-numchars) + orig.substr(index+numchars+strToReplace.length);
	},
	showDelay: function(delay) {
		var now = new Date();
		var milliNow = now.getTime();
		while((milliNow+delay) > new Date().getTime()){}
	},
	showCorrections: function() {
		if (showCorr == false)
		{
			$('.delchar').css("visibility","hidden");
			$('#showhide').html('Corrections');
			showCorr = true;
		}
		else
		{
			$('.delchar').css("visibility","visible");
			$('#showhide').html('<strike>Corrections</strike>');
			showCorr = false;
		}
	},
	getCursorPosition: function(elementId) {
		var obj = document.getElementById(elementId);
		CurPos = obj.selectionStart;
		return CurPos;
	}
}