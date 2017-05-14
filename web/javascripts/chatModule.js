/**
 *
 */

//var chatModule = {
//	xmppServer : "http://im911-sandbox.im911.com/vintcerf/chat/",
//	xmppFromUser : "eleanor",
//	xmppFromPass : "eleanor101",
//	xmppToUser : "ezhere"
//       }


/*function initChat() {


	sendRequest('account', {action:'getChatId'}, function(response) {
		chatModule.chatId = response.chatId;
		chatModule.chatPassword = response.chatPassword;
                userLogin("easyone.trace","easyone2345");
	});
}
*/
var checkMessages;
var gtalkContacts = new Array();
var incomingProfilePic;


//initChat is used to login to gtalk and making your presence available.
function initChat() {
    jQuery.post(
        "Chat",
        {
            action:'connect'
        },
        function(response) {
            //alert(response.length);
            gtalkContacts = response.allContacts;
            log('gtalkContacts :: '+gtalkContacts);
            for(var i = 0;i<gtalkContacts.length;i++){

                console.log('<br/>'+gtalkContacts[i].userName);
                console.log('<br/>'+gtalkContacts[i].emailId);
            }
            console.log("in chat");
        },
        'json'
        );
    checkMessages = setTimeout("checkMessage()",5000);
}

function startChat (contact){
    console.log("clicked" + contact.email);
    console.log('name :: '+ contact.name());
    console.log('profile :: '+contact.profilePicture());
    //clickModuleButton('contactsModule');
    //Clearing the text if the contact is new
    if(contact.email!=$('#ipmessage').attr("name")){
        $('#ipmessage').html('');
        $('#ipmessage').attr("name", contact.email);
    }
    $("#chatWithName").append(contact.name());
    $("#contactImage").attr("src",contact.profilePicture());
    $("#contactImage").css("width","150px");
    $("#contactImage").css("height","150px");
    incomingProfilePic = contact.profilePicture();

    $("#ipmessage").keyup(function(e){
        console.log("entered");
        if((e.keyCode || e.which) == 13) { //Enter keycode
            sendMessage();
        }
    });

    clickModuleButton('chatModule');
//$('#initiateChat').show();

}

function showChat() {

    $('#chatWrapper').show();
// $('#sendtext').focus();
}

function hideChat() {
    $('#chatWrapper').fadeOut(0);
}

function chatWithContact(contact) {
    $('#chatWrapper').show();
    $('#chatFrame').show();
    $('#chatroom').html('');
    $('#sendtext').focus();
    clickModuleButton('chatModule');
    $('#chatWrapper #contactName').html(contact.name());

    //$('#chatFrame').attr('src', "chat.html?user=easyone.trace&pass=easyone2345&touser=gregg.vanderheiden&tocontact="+contact.name());
    $('#chatFrame').find('#contact').html(contact.name());
    var sendtext=$('#chatFrame').find('#sendtext');
    sendtext.unbind('keyup');
    sendtext.unbind('keydown');

    sendtext.unbind('input');
    sendtext.unbind('blur');

    makeReadyChat(contact);
}

function sendMessage (){
    
    var to = $('#ipmessage').attr("name");
    if($.trim($('#ipmessage').val())){
        var textMessage = $.trim($('#ipmessage').val());
        jQuery.post(
            "Chat",
            {
                action:'sendMessages',
                to:to ,
                message:textMessage
            },
            function(response) {
                if(response!=null || response!='notsent'){
                    try{
                        $('#chatconvo').append('<table width="100%"><tr><td width="75%"><span class="borderRadius10 dropShadow outgoingChat">'+textMessage+'</span></td><td width="25%"><img src="images/contacts/unknownUser.jpg" class="senderImageClass" /></td></tr></table>');
                        $('#chatconvo').animate({
                            scrollTop: $("#chatconvo span").last().offset().top
                            }, 500);
                        $('#ipmessage').val('');
                        console.log(response);
                    }catch(e){
                        console.log(e.toLocaleString());
                        console.log(e.toString());
                    }
                }else{
                    console.log('could not send message');
                }
            },
            'json'
            );
    }else{
        $('#ipmessage').val('');
    }
}


function checkMessage(){
    jQuery.post(
        "Chat",
        {
            action:'checkMessages'
        },
        function(response) {

            if(response!=null || response != 'null' ||response != '' ){

                console.log(response);
                var message = new Array();
                message = response.response;
                if(message!=null){
                    for(var i = 0;i<message.length;i++){
                        console.log('<br/>'+message[i].userName);
                        console.log('<br/>'+message[i].message);

                        //$('#chatconvo').append('<br/>'+message[i].userName);
                        $('#chatconvo').append('<table width="100%"><tr><td width="25%"><img src="'+incomingProfilePic+'" class="profileImageClass" /></td><td width="75%"><span class="borderRadius10 dropShadow incomingChat">'+message[i].message+'</span></td></tr></table>');
                        $('#chatconvo').animate({
                            scrollTop: $("#chatconvo span").last().offset().top
                            }, 500);
                    }
                    console.log(message);
                    console.log(message.length);
                }

            }
        },
        'json'
        );
    checkMessages = setTimeout("checkMessage()",5000);
}


Array.prototype.containsJsonObj = function(name,value) {
    var isExists=false;
    $.each(this,function(){
        if(this[name]==value){
            isExists=true;
            return false;
        }
    });
    return isExists;
};


function isavailable(contact){
    if(gtalkContacts.containsJsonObj("emailId",contact.email))
    {
        jKarma.display($('#person').show(), contact);
    }
    else
    {
        jKarma.display($('#personNotAvailable').show(), contact);
    }
}

window.onbeforeunload = function(){
    logoutChat();
}

function logoutChat(){
    $.ajax({
        url: 'Chat',
        type: 'POST',
        data: 'action=close',
        async: false,
        timeout: 4000
    });
}
