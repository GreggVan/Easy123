// BOSH config stuff
var BOSH_SERVICE = 'http://bosh.metajack.im:5280/xmpp-httpbind/';
var BOSH_HOST = 'gmail.com';
var BOSH_RESOURCE = "chat-user";
var connection = null;
var userNick = null;

// RTT position
var startNewMessage;
var oldPosition = [];
var oldString = [];
var newPosition = [];
var shiftKey = false;
var messageSendIntervals = [];

//gtalk wants the full jid in the from part
var FULL_JID=null;


$(document).bind('messageReceived.rtt', function (e, msg) {
	// RTT message received, display it
	RTT.incomingMessage(msg);
});

$(document).ready(function () {

    	connection = new Strophe.Connection(BOSH_SERVICE);

	// Focus on username box

	//toUser=document.getElementById("touser").innerHtml;
       // alert(toUser);
	// Connect when connect button is clicked
//	$('#connect').bind('click', function () {
		// Set username and login user
		//userLogin($('#jid').val(),$('#pass').val());

                toUser=document.getElementById('touser').value;
		userLogin(document.getElementById('user').value,document.getElementById('pass').value);
//	});




	connection = new Strophe.Connection(BOSH_SERVICE);

	// Focus on username box
	$('#jid').focus();

	// Connect when connect button is clicked
	$('#connect').bind('click', function () {
		// Set username and login user
		userLogin($('#jid').val(),$('#pass').val());
	});

	// Disconnect from server
	$('#disconnect').bind('click', function () {
		// Logout user
		userLogout();
	});
});

// Connect to server
function userLogin(userName, userPass) {
	connection.connect(userName+'@'+BOSH_HOST, userPass, StropheFunctions.onConnect);
	userNick = userName+'@'+BOSH_HOST+'/'+BOSH_RESOURCE;
	userNick = userNick.split("@");
	userNick = userNick[0];
	$('#connect').val('Login');

	// Listen for key down event
	$('#sendtext').keydown(function(e) {
		// Set old cursor position and value
		oldPosition[toUser] = RTT.getCursorPosition('sendtext');
		oldString[toUser] = $('#sendtext').val();

		// Listen for keys
		if(e.keyCode == 13) {
			// Prevent default action for enter key in textarea (new line)
			e.preventDefault();

			// Enter key pressed, send RTT message
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

			// Scroll to bottom of messages
			var objDiv = document.getElementById('chatroom');
			objDiv.scrollTop = objDiv.scrollHeight;
			return false;
		}
		if (e.keyCode == 16)
		{
			// Shift key pushed down
			shiftKey = true;
		}
		if (e.keyCode == 8 || e.keyCode == 46)
		{
			// Delete position if character isn't blank
			if (rttMessages[toUser] != undefined && rttMessages[toUser] != null)
			{
				if(e.keyCode == 8) {
					// Backspace key down - backward delete
					var subject = document.getElementById(toUser+'_msg');
					var selStart = subject.selectionStart;
					var selEnd = subject.selectionEnd;
	
					if (selStart == selEnd)
					{
						// alert('delete 1 character starting at position '+RTT.getCursorPosition(toUser+'_msg'));
						rttMessages[toUser].up().c("e", {"n":"1", "p":RTT.getCursorPosition(toUser+'_msg')});
					}
					else
					{
						alert('delete '+(selEnd-selStart)+' chars starting at position '+selEnd);
						rttMessages[toUser].up().c("e", {"n":(selEnd-selStart), "p":selEnd});
					}
				}
				if(e.keyCode == 46) {
					// Delete key down - forward delete
				}
				// rttMessages[toUser].up().c("e");
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

				// Add deleted character to RTT message
				if(e.keyCode == 8) {
					// Backspace key down - backward delete
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
				}
			}
		}
	});

	// Listen for key up event
	$('#sendtext').keyup(function(e) {
		if(e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40 && e.keyCode != 16 && e.keyCode != 13) { // ignore arrow keys, shift key and enter key
			newPosition[toUser] = RTT.getCursorPosition('sendtext');
			if (newPosition[toUser] > oldPosition[toUser])
			{
				// var addChar = $('#sendtext').val().substring(oldPosition[toUser],newPosition[toUser]);
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
						connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "new");
						startNewMessage = false;
					}
					else
					{
						connection.rtt.newMessage(toUser+'@'+BOSH_HOST, FULL_JID, "");
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

	$('#sendtext').blur();

	// Start sending RTT messages
	messageSendIntervals[toUser] = setInterval("StropheFunctions.sendMessage('"+toUser+"')",1000);
}

function userLogout() {
	// Disconnect
	connection.send($pres({type: "unavailable"}).tree());
	connection.flush();
	connection.disconnect();
	$('#disconnect').val('Logout');

	// Focus on username box
	$('#jid').focus();
}

function incomingMessage(msg) {
    var from = msg.getAttribute('from');
    var msgtype = msg.getAttribute('type');
    var msgbody="";
    
        msgbody = msg.getElementsByTagName('body')[0].childNodes[0].nodeValue;
    
	var result = {
		room: from.split('/')[0],
		nick: from.split('@')[0],
		type: msgtype,
		body: msgbody
	};
	RTT.incomingMessage(result);

    return true;
}

var StropheFunctions = {
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
};