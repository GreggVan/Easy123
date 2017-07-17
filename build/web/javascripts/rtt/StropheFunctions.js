// BOSH config stuff
var BOSH_SERVICE = 'http://bosh.metajack.im:5280/xmpp-httpbind';
var BOSH_HOST = 'gmail.com';
var BOSH_RESOURCE = "chat-user";
var presenceInfo=new Object;
var connection = null;
var userNick = null;
var before="";
var after="";
var pos;
var addChar;

//gtalk wants the full jid in the from part
var FULL_JID=null;
var toContact=null;

// RTT position
var startNewMessage;
var oldPosition = [];
var oldString = [];
var newPosition = [];
var shiftKey = false;
var messageSendIntervals = [];
var sendInterval=250;
		var toUser = "";
		var fontSize = "14px";
		var fontFamily = "Arial";
		var fontColor = "#000";
$(document).bind('messageReceived.rtt', function (e, msg) {
	// RTT message received, display it
	RTT.incomingMessage(msg);
});

function makeReadyChat(contact) {
	
//var parameters=getUrlVars();

	// Focus on username box

	//toUser=document.getElementById("touser").innerHtml;
       // alert(toUser);
	// Connect when connect button is clicked
//	$('#connect').bind('click', function () {
		// Set username and login user
		//userLogin($('#jid').val(),$('#pass').val());

                toUser="gregg.vanderheiden";
                toContact=contact.name();
		bindChatEvents("easyone.trace","easyone2345");
//	});

	// Disconnect from server
	$('#disconnect').bind('click', function () {
		// Logout user
		userLogout();
	});
}
/*
function userLogin(userName,userPass) {
    	connection = new Strophe.Connection(BOSH_SERVICE);
        connection.connect(userName+'@'+BOSH_HOST, userPass, StropheFunctions.onConnect);
	userNick = userName+'@'+BOSH_HOST+'/'+BOSH_RESOURCE;
	userNick = userNick.split("@");
	userNick = userNick[0];
	$('#connect').val('Login');

}
     */
// Connect to server
/*
function bindChatEvents(userName, userPass) {
        oldPosition[toUser]=0;


        $('#sendtext').bind("input", function(e) {
   //oldPosition[toUser] = RTT.getCursorPosition('sendtext');
            newPosition[toUser] = RTT.getCursorPosition('sendtext');
            after=e.target.value;


            var leadingSame = 0;
            var trailingSame = 0;
            var i = 0;
            var j = 0;

            // Find number of characters at start that remains the same
            while ((before.length > i) && (after.length > i))
            {
                if (before.charAt(i) != after.charAt(i))
                {
                    break;
                }
                i++;
                leadingSame++;
            }

            // Find number of characters at end that remains the same
            i = before.length;
            j = after.length;
            while ((i > leadingSame) && (j > leadingSame))
            {
                i--;
                j--;
                if (before.charAt(i) != after.charAt(j))
                {
                    break;
                }
                trailingSame++;
            }

            // Delete text if a deletion is detected anywhere in the string.
            var charsRemoved = before.length - trailingSame - leadingSame;

            if (charsRemoved > 0)
            {
                var posEndOfRemovedChars = before.length - trailingSame;
                var posStartOfRemovedChars = posEndOfRemovedChars - charsRemoved;
                if ((oldPosition[toUser] == posEndOfRemovedChars) ||
                    (posEndOfRemovedChars == before.length))
                {

                        //Backward Delete
                        console.log("!!!!!!!!!!!!!!!!!back space pressed");
                        if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
			{

                                                rttMessages[toUser].up().c("e", {"n": charsRemoved, "p": (posEndOfRemovedChars)});
			}
			else
			{
				// No current message, create new message

				if (startNewMessage == true)
				{
					connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "new");
					startNewMessage = false;
				}
				else
				{
					connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "");
				}

                                rttMessages[toUser].c("e", {"n": charsRemoved, "p": (posEndOfRemovedChars)});

			}

                }
                else
                {
                        // Forward delete
                    	if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
			{



						//alert('delete '+(selEnd-selStart)+' chars starting at position '+selEnd);
                 			rttMessages[toUser].up().c("d", {"n": charsRemoved, "p": posStartOfRemovedChars});


				// rttMessages[toUser].up().c("e");
			}
			else
			{
				// No current message, create new message
                                console.log("new message fd");
				if (startNewMessage == true)
				{
					connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "new");
					startNewMessage = false;
				}
				else
				{
					connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "");
				}

				// Add deleted character to RTT message
                 			rttMessages[toUser].c("d", {"n": charsRemoved, "p": posStartOfRemovedChars});
			}

                }
            oldPosition[toUser] =newPosition[toUser];
            before=after;
                return;
            }




            //Do an <t> INSERT operation if any text insertion is detected anywhere in the string
            var charsInserted = after.length - trailingSame - leadingSame;
            addChar = after.substring(leadingSame, leadingSame + charsInserted);

				if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
				{
                                        console.log("!!!!!!!!!!!!!!!!!back space pressed");
					if (newPosition[toUser]+1 < document.getElementById('sendtext').value.length)
					{
						rttMessages[toUser].up().c("t",{"p":newPosition[toUser]}).t(addChar);
					}
					else
					{
						rttMessages[toUser].up().c("t").t(addChar);
					}
				}
				else
				{
					if (startNewMessage == true)
					{
						connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "new");
						startNewMessage = false;
					}
					else
					{
						connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "");
					}

					// Add RTT element to message
					if ( newPosition[toUser]+1 < document.getElementById('sendtext').value.length)
					{
						rttMessages[toUser].c("t",{"p":newPosition[toUser]}).t(addChar);
					}
					else
					{
						rttMessages[toUser].c("t").t(addChar);
					}
				}






            oldPosition[toUser] =newPosition[toUser];
            before=after;

            //console.log(document.getElementById('sendtext').selectionStart+"**"+ e.target.value +"**"+leadingSame+","+trailingSame);
            console.log(document.getElementById('sendtext').selectionStart+"****" +addChar);

        },
        true);


	// Listen for key down event
	$('#sendtext').keydown(function(e) {

                //console.log(document.getElementById('sendtext').value+"***"+RTT.getCursorPosition('sendtext'));
		// Set old cursor position and value

		oldString[toUser] = $('#sendtext').val();

		// Listen for keys
		if(e.keyCode == 13) {
			// Prevent default action for enter key in textarea (new line)
			e.preventDefault();

                        $('#sendButton').addClass("tryActive");
                        //$('#sendButtonText').css('color','#ffffff');
                        setTimeout(function() {
                            $('#sendButton').removeClass("tryActive");
                        },300);
                        
			// Enter key pressed, send RTT message
                        sendRTTMessage();
		}
		if (e.keyCode == 16)
		{
			// Shift key pushed down
			shiftKey = true;
		}
		if (e.keyCode == 8 || e.keyCode == 46)
		{
/*			// Delete position if character isn't blank
			if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
			{
				if(e.keyCode == 8) {
					// Backspace key down - backward delete
                                        console.log(" BAckspace key pressed");
					var subject = document.getElementById('sendtext');
					var selStart = subject.selectionStart;
					var selEnd = subject.selectionEnd;

		 if (selStart == selEnd)
					{
						// alert('delete 1 character starting at position '+RTT.getCursorPosition(toUser+'_msg'));
						rttMessages[toUser].up().c("e", {"n":"1", "p":RTT.getCursorPosition('sendtext')});
					}
					else
					{
						//alert('delete '+(selEnd-selStart)+' chars starting at position '+selEnd);
						rttMessages[toUser].up().c("e", {"n":(selEnd-selStart), "p":selEnd});
					}
				}
				if(e.keyCode == 46) {
					// Delete key down - forward delete
                                        console.log(" BAckspace key pressed");
					var subject = document.getElementById('sendtext');
					var selStart = subject.selectionStart;
					var selEnd = subject.selectionEnd;

					if (selStart == selEnd)
					{
						// alert('delete 1 character starting at position '+RTT.getCursorPosition(toUser+'_msg'));
						rttMessages[toUser].up().c("d", {"n":"1", "p":RTT.getCursorPosition('sendtext')});
					}
					else
					{
						//alert('delete '+(selEnd-selStart)+' chars starting at position '+selEnd);
						rttMessages[toUser].up().c("d", {"n":(selEnd-selStart), "p":selEnd});
					}
				}
				// rttMessages[toUser].up().c("e");
			}
			else
			{
				// No current message, create new message
				if (startNewMessage == true)
				{
					connection.rtt.newMessage(toUser+'@'+BOSH_HOST, userNick, "new");
					startNewMessage = false;
				}
				else
				{
					connection.rtt.newMessage(toUser+'@'+BOSH_HOST, userNick, "");
				}

				// Add deleted character to RTT message
				if(e.keyCode == 8) {
					// Backspace key down - backward delete
                                        console.log("2.backspace pressed");
					var subject = document.getElementById('sendtext');
					var selStart = subject.selectionStart;
					var selEnd = subject.selectionEnd;

					if (selStart == selEnd)
					{
						rttMessages[toUser].c("e", {"n":"1", "p":RTT.getCursorPosition('sendtext')});
					}
					else
					{
						rttMessages[toUser].c("e", {"n":(selEnd-selStart), "p":selEnd});
					}
				}
				if(e.keyCode == 46) {
					// Delete key down - forward delete
					var subject = document.getElementById('sendtext');
					var selStart = subject.selectionStart;
					var selEnd = subject.selectionEnd;

					if (selStart == selEnd)
					{
						rttMessages[toUser].c("d", {"n":"1", "p":RTT.getCursorPosition('sendtext')});
					}
					else
					{
						rttMessages[toUser].c("d", {"n":(selEnd-selStart), "p":selEnd});
					}

				}
			}
		}
	});

	// Listen for key up event
	$('#sendtext').keyup(function(e) {
		if(e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40 && e.keyCode != 16 && e.keyCode != 13) { // ignore arrow keys, shift key and enter key
			/*newPosition[toUser] = RTT.getCursorPosition('sendtext');
			if (newPosition[toUser] > oldPosition[toUser])
			{
				// var addChar = $('#sendtext').val().substring(oldPosition[toUser],newPosition[toUser]);
                                //console.log(pos+"***"+newPosition[toUser] +"***"+ oldPosition[toUser]);
				var addChar = String.fromCharCode(e.keyCode);
				if (shiftKey == false)
				{
					if (e.keyCode >= 65 && e.keyCode <= 90)
					{
						addChar = String.fromCharCode(e.keyCode).toLowerCase();
					}
				}
				if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
				{
					if (newPosition[toUser] < $('#sendtext').val().length)
					{
						rttMessages[toUser].up().c("t",{"p":oldPosition[toUser]}).t(addChar);
					}
					else
					{
						rttMessages[toUser].up().c("t").t(addChar);
					}
				}
				else
				{
					if (startNewMessage == true)
					{
						connection.rtt.newMessage(toUser+'@'+BOSH_HOST, userNick, "new");
						startNewMessage = false;
					}
					else
					{
						connection.rtt.newMessage(toUser+'@'+BOSH_HOST, userNick, "");
					}

					// Add RTT element to message
					if (newPosition[toUser] < $('#sendtext').val().length)
					{
						rttMessages[toUser].c("t",{"p":oldPosition[toUser]}).t(addChar);
					}
					else
					{
						rttMessages[toUser].c("t").t(addChar);
					}
				}
			}
		}
		if (e.keyCode == 16)
		{
			// Shift key let up
			shiftKey = false;
		}
	});

	// Flag to setup new message
	startNewMessage = true;

	/// Set for focus of sendbox
	$('#sendtext').focus(function()
	{
		if ($(this).val() == $(this)[0].title)
		{
			$(this).addClass("sendbox");
			$(this).val("");
		}
	});

	// Set for blur of sendbox
	$('#sendtext').blur(function()
	{
		if ($(this).val() == "" || $(this).val() == $(this)[0].title)
		{
			$(this).addClass("sendbox_blur");
			$(this).val($(this)[0].title);
		}
	});

//	$('#sendtext').blur();

	// Start sending RTT messages
	messageSendIntervals[toUser] = setInterval("StropheFunctions.sendMessage('"+toUser+"')",sendInterval);
}
*/
function userLogout() {
	// Disconnect
	connection.send($pres({type: "unavailable"}).tree());
	connection.flush();
	connection.disconnect();
	$('#disconnect').val('Logout');

	// Focus on username box
	$('#jid').focus();
}
function sendInsertMessages(text,pos,len)
{

}
function incomingMessage(msg) {
    var from = msg.getAttribute('from');
    var msgtype = msg.getAttribute('type');
    var msgbody="";
   
if(msg.getElementsByTagName('body')[0]!=undefined)
{

    msgbody = msg.getElementsByTagName('body')[0].childNodes[0].nodeValue;
    
	var result = {
		room: from.split('/')[0],
		nick: from.split('@')[0],
		type: msgtype,
		body: msgbody
	};
	RTT.incomingMessage(result);
}
    return true;
}
function updatePresence(msg) {
    presenceInfo[msg.getAttribute('from').split('/')[0]]="available";
    //console.log(presenceInfo);
    //console.log(msg.getAttribute('from').split('/')[0]);
    return true;
}
/*var StropheFunctions = {
	log: function(msg) {
		$('#log').append('<div>'+msg+'</div>');
	},
	randString: function()
	{
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 25; i++ )
		{
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	},
	onConnect: function(status) {
		if (status == Strophe.Status.CONNECTING)
		{
			$('#connect').val('Logging In...');
		}
		else if (status == Strophe.Status.CONNFAIL)
		{
			$('#connect').val('Login Failed');
		}
		else if (status == Strophe.Status.DISCONNECTING)
		{
			$('#disconnect').val('Logging out...');
		}
		else if (status == Strophe.Status.DISCONNECTED)
		{
			$('#disconnect').val('Logout');
			$('#loginform').css('display','block');
			$('#connect').val('Login');
		}
		else if (status == Strophe.Status.CONNECTED)
		{
			$('#connect').val('Login');
			$('#loginform').css('display','none');
                        FULL_JID=connection.jid;
                        connection.send($pres().tree());
			connection.addHandler(incomingMessage, null, 'message', 'chat', null,  null);
			connection.addHandler(updatePresence, null, 'presence', null, null,  null);                        
		}
	},
	sendMessage: function(toUser) {
		if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
		{
			// Send RTT message
			connection.rtt.sendMessage(toUser);

			// Scroll to bottom of messages
			var objDiv = document.getElementById('chatroom');
			objDiv.scrollTop = objDiv.scrollHeight;
		}
	},
	formatUser: function(userToFormat) {
		// Format incoming user
		var returnUser = "";
		if (isNaN(userToFormat))
		{
			returnUser = userToFormat;
		}
		else
		{
			returnUser = '('+userToFormat.substring(0,3)+') ';
			returnUser += userToFormat.substring(3,6)+'-';
			returnUser += userToFormat.substring(6,10);
		}
		return returnUser;
	}

};*/
function sendRTTMessage() {
			connection.send($msg({to: toUser+'@'+BOSH_HOST, from: FULL_JID, type: 'chat'}).c('body').t($('#sendtext').val()));
			$('#chatroom').append('<div class="user_message_container"><div class="triangle-border-outgoing left"><strong>Me:</strong> <span id="'+toUser+'_'+userNick+'_'+window[toUser+'_'+userNick+'_message']+'_messages">'+$('#sendtext').val()+'</span></div>');
			startNewMessage = true;

			// Send RTT reset message
			var msgid = connection.getUniqueId();
			var resetMessage = $msg({
				to: toUser+'@'+BOSH_HOST,
				from: FULL_JID,
				type: "chat",
				id: msgid
			});
			resetMessage.c("rtt", {"xmlns":"urn:xmpp:rtt:0", "event":"reset"});
			resetMessage.c("t").t($('#sendtext').val());
			connection.send(resetMessage);

			// Reset text box
			$('#sendtext').val('');
			$('#sendtext').focus();

			// Reset character positions and string
			oldPosition[toUser] = 0;
			newPosition[toUser] = 0;
			oldString[toUser] = "";
                        before="";
			// Scroll to bottom of messages
			var objDiv = document.getElementById('chatroom');
			objDiv.scrollTop = objDiv.scrollHeight;
			return false;
    
}
function getUrlVars() { // Read a page's GET URL variables and return them as an associative array.
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}