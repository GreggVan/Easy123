var videoChatModule={
    contactId :""
};


function callContact(contact) {

//alert(contact.name());
var str=contact.name();
var str1=str.split(" ");

videoChatModule.contactId=str1[0];
clickModuleButton('videoChatModule');
                  $("#loading").show();
}

function showVideoChat() {
                $("#loading").show();
                
		var flashvars = {
			name:"rpn2142",
			callee:"ramraj",
                        calleeTmp: videoChatModule.contactId,
			service:"http://easy1234.org/cgi-bin/reg.py"
		};
		var params = {
			menu: "false",
			scale: "noScale",
			allowFullscreen: "true",
			allowScriptAccess: "always",
			bgcolor: "",
			wmode: "transparent" // can cause issues with FP settings & webcam
		};
		var attributes = {
			id:"VideoPhoneLabs"
		};

                //$('#videoChatModule').css('position','absolute');
                //$('#videoChatModule').css('left','300px');

		swfobject.embedSWF(
			"flash/VideoPhoneLabs.swf",
			"videochatswf", "820", "700", "10.0.0",
			"flash/expressInstall.swf",
			flashvars, params, attributes,onSWFLoad);



}
function onSWFLoad() {
                $('#videoChatModule').show();
                $('.videoChatContents').show();
                $("#loading").hide();
                setTimeout("$('#videoClose').show()",5000);
    
}
function hideVideoChat(){
    $('.videoChatContents').hide();
    $('#videoClose').hide();
    $("#videochatWrapper").remove();
    $("#videoChatModule").append("<div style='position: absolute;z-index:1' id='videochatWrapper' class='videoChatContents'><div id='videochatswf'></div></div>");
    
}