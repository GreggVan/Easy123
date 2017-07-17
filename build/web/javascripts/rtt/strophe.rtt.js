/* 
An RTT plugin (XEP-0301) for Strophe using MUCs (Multi-User Chats)
Created by Bobbie Stump @ INdigital telecom, 2011

This plugin listens for (handles), creates and sends RTT messages

- Call newMessage to create a new RTT element
- Call sendMessage when your message is built and ready to be sent (store messages being built in rttMessages[userName])

*/

var rttMessages = [];

Strophe.addConnectionPlugin('rtt', {
	// set connection and register handlers
	init: function (connection) {
		this.connection = connection;

		// Listen for non-MUC messages
		this.connection.addHandler(this.handleRTTMessage.bind(this), 'urn:xmpp:rtt:0', 'message', 'chat');
    },

	// Handle RTT message(s)
	handleRTTMessage: function (message) {
		var result;
		var mess = $(message);

		var RTTstring = (new XMLSerializer()).serializeToString(message.getElementsByTagName("rtt")[0]);
                console.log("REceived: "+RTTstring);
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(RTTstring,"text/xml");

		// Get RTT messages in this tag
		var rttTags = xmlDoc.getElementsByTagName("rtt")[0].childNodes;
		
		// Get RTT event
		var rttEvent = xmlDoc.getElementsByTagName("rtt")[0].getAttribute('event');

		// Create message and send to RTT trigger
		if (rttTags.length > 0) {
			if (mess.attr('type') == "chat")
			{
				result = {
					room: mess.attr('from').split('/')[0],
					nick: mess.attr('from').split('@')[0],
					event: rttEvent,
					type: mess.attr('type'),
					body: rttTags
	            };
                            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@ "+result.room+"   "+result.nick);
	            $(document).trigger('messageReceived.rtt', result);
			}
		}

		// Return true so Strophe doesn't delete the handler stays
		return true;
	},
	
	// Create a new message
	newMessage: function(room, nick, event) {
		var msgid = this.connection.getUniqueId();
		rttMessages[room.split('@')[0]] = $msg({
			to: room,
			from: nick,
			type: "chat",
			id: msgid
		});
		rttMessages[room.split('@')[0]].c("rtt", {"xmlns":"urn:xmpp:rtt:0", "event":event});
	},

	// Send an RTT message to a room
	sendMessage: function (room) {
		// Send RTT message
		this.connection.send(rttMessages[room]);
                console.log("Sent" +":"+rttMessages[room])
		// Clear RTT message
		rttMessages[room] = null;
	}
});