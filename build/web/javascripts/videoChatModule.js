/* This is the MyApp constructor. */
 /*var audio = new Audio('resources/ringbell.mp3');
function MyApp() {
  //this.addressInput = document.getElementById('address-input');
  //this.passwordInput = document.getElementById('password-input');
 
  this.identityForm = document.getElementById('auth-button');
  if(this.identityForm){
  this.identityForm.addEventListener('click', function (e) {
    e.preventDefault();
    this.requestCredentials();
  }.bind(this), false);}

  this.userAgentDiv = document.getElementById('user-agent');
  this.remoteMedia = document.getElementById('remote-media');
  this.remoteMedia.volume = 0.5;

  //this.destinationInput = document.getElementById('destination-input');
  this.inviteButton = document.getElementById('invite-button');
  this.inviteButton.addEventListener('click', this.sendInvite.bind(this), false);

  this.acceptButton = document.getElementById('accept-button');
  this.acceptButton.addEventListener('click', this.acceptSession.bind(this), false);

  this.terminateButton = document.getElementById('terminate-button');
  this.terminateButton.addEventListener('click', this.terminateSession.bind(this), false);

  document.addEventListener('keydown', function (e) {
    this.sendDTMF(String.fromCharCode(e.keyCode));
  }.bind(this), false);

  this.volumeRange = document.getElementById('volume-range')
  this.volumeRange.addEventListener('change', this.setVolume.bind(this), false);

  this.muteButton = document.getElementById('mute-button');
  this.muteButton.addEventListener('click', this.toggleMute.bind(this), false);
}

/* This is the MyApp prototype. 
MyApp.prototype = {

  requestCredentials: function () {
    var xhr = new XMLHttpRequest();
    xhr.onload = this.setCredentials.bind(this);
    xhr.open('get', 'https://api.onsip.com/api/?Action=UserRead&Output=json');

    var userPass = 'lishaliu94@easy123.onsip.com' + ':' + 'lls1994@UMD';
    xhr.setRequestHeader('Authorization',
                         'Basic ' + btoa(userPass));
    xhr.send();
  },

  setCredentials: function (e) {
    var xhr = e.target;
    var user, credentials;

    if (xhr.status === 200) {
      user = JSON.parse(xhr.responseText).Response.Result.UserRead.User;
      credentials = {
        uri: "lishaliu94@easy123.onsip.com",
        authorizationUser: user.AuthUsername,
        password: user.Password,
        displayName: user.Contact.Name
      };
    } else {
      alert('Authentication failed! Proceeding as anonymous.');
      credentials = {};
    }

    this.createUA(credentials);
  },

  createUA: function (credentials) {
    this.identityForm.style.display = 'none';
    this.userAgentDiv.style.display = 'block';
    this.ua = new SIP.UA(credentials);

    this.ua.on('invite', this.handleInvite.bind(this));
  },

  handleInvite: function (session) {
    if (this.session) {
      session.reject();
      return;
    }

    this.setSession(session);

    this.setStatus('Ring Ring! ' + session.remoteIdentity.uri.toString() + ' is calling!', true);
    audio.play();
    this.acceptButton.disabled = false;
  },

  acceptSession: function () {
    if (!this.session) { return; }

    this.acceptButton.disabled = true;
    this.session.accept(this.remoteMedia);
    console.log('mute');
    audio.pause();
    audio.currentTime = 0;
  },

  sendInvite: function () {
    var destination = "lu.gan2@umdeasy123.onsip.com";
    if (!destination) { return; }
    var session = this.ua.invite(destination, this.remoteMedia);
    this.setSession(session);
    this.inviteButton.disabled = true; // TODO - use setStatus. Disable input, too?
  },

  setSession: function (session) {
    session.on('progress', function () {
      this.setStatus('progress', true);
    }.bind(this));

    session.on('accepted', function () {
      this.setStatus('accepted', true);
    }.bind(this));

    session.on('failed', function () {
      this.setStatus('failed', false);
      if (session === this.session) {
        delete this.session;
      }
    }.bind(this));

    session.on('bye', function () {
      this.setStatus('bye', false);
      if (session === this.session) {
        delete this.session;
      }
    }.bind(this));

    session.on('refer', session.followRefer(function (req, newSession) {
      this.setStatus('refer', true);
      this.setSession(newSession);
    }.bind(this)));

    this.session = session;
  },

  setStatus: function (status, disable) {
    this.userAgentDiv.className = status;
    this.inviteButton.disabled = disable;
    this.terminateButton.disabled = !disable;
  },

  terminateSession: function () {
    if (!this.session) { return; }

    this.session.terminate();
    audio.pause();
    audio.currentTime = 0;
  },

  sendDTMF: function (tone) {
    if (this.session) {
      this.session.dtmf(tone);
    }
  },

  setVolume: function () {
    console.log('Setting volume:', this.volumeRange.value, parseInt(this.volumeRange.value, 10));
    this.remoteMedia.volume = (parseInt(this.volumeRange.value, 10) || 0) / 100;
  },

  toggleMute: function () {
    if (!this.session) { return; }

    if (this.muteButton.classList.contains('on')) {
      this.session.unmute();
      this.muteButton.classList.remove('on');
    } else {
      this.session.mute();
      this.muteButton.classList.add('on');
    }
  },

};

var MyApp = new MyApp();*/



var videoChatModule={
    contactId :""
};


function callContact(contact) {
    window.contacts={
    //contactName="",
    chatId:"",
    };

//alert(contact.name());
var str=contact.chatId;

window.contacts.chatId=str;
//console.log(window.contacts.chatId);
//console.log(contact);
sendContactId(str);
$("#personNotAvailable").hide();
$("#contacts").hide();
$("#Header").hide();
$("#videoscreen").show();
$("#videoscreen").load('videoChatModule.html');
//$('#videoChatModule').show();
                  //$("#loading").show();
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
   // $('.videoChatContents').hide();
   // $('#videoClose').hide();
   // $("#videochatWrapper").remove();
   //$("#page").unload('videoChatModule.html');
    $("#page").hide();
    initContactsModule();
    showContacts();
    //$("#videoChatModule").append("<div style='position: absolute;z-index:1' id='videochatWrapper' class='videoChatContents'><div id='videochatswf'></div></div>");
    
}