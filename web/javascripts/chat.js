/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var checkMessages;
var gtalkContacts = new Array();
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
    console.log("clicked");
    clickModuleButton('contactsModule');
    $('#initiateChat').show();
    $('#ipmessage').attr("name", contact.email);
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

                        $('#chatconvo').append('<br/>'+message[i].userName);
                        $('#chatconvo').append('<br/>'+message[i].message);
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

function sendMessage (){
    var textMessage = $('#ipmessage').val();
    var to = $('#ipmessage').attr("name");
    log('sending message');
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
                    $('#chatconvo').append(textMessage);
                    $('#ipmessage').val('');
                    console.log(response);
                }catch(e){
                    consolge.log(e.toLocaleString());
                    console.log(e.toString());
                }
            }else{
                console.log('could not send message');
            }
        },
        'json'
        );
}

window.onbeforeunload = function(){
    $.ajax({
        url: 'Chat',
        type: 'POST',
        data: 'action=close',
        async: false,
        timeout: 4000
    });
}

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