/* This is the MyApp constructor. */
 var audio = new Audio('resources/ringbell.mp3');
 var audio2 = new Audio('resources/callout.mp3');
 //var audio3 = new Audio('resources/busytone.mp3');
function MyApp() {
  //this.addressInput = document.getElementById('address-input');
  //this.passwordInput = document.getElementById('password-input');
  this.getChatInfo();
  this.identityForm = document.getElementById('auth-button');
  if(this.identityForm){
  this.identityForm.addEventListener('click', function (e) {
    e.preventDefault();
    //this.getChatInfo();
    this.requestCredentials();
  }.bind(this), false);}

  this.userAgentDiv = document.getElementById('user-agent');
  this.videoCall = document.getElementById('invite-button');
  this.remoteMedia = document.getElementById('remote-media1');
      this.videoCall.addEventListener('click', function(){
      this.remoteMedia = document.getElementById('remote-media');
      this.remoteMedia.volume = 0.5;
      //this.inviteButton = document.getElementById('invite-button');
       this.sendInvite();
      }.bind(this), false);

    this.voiceCall = document.getElementById('invite-button1');
    this.voiceCall.addEventListener('click', 
  function(){
      this.remoteMedia = document.getElementById('remote-media1');
      this.remoteMedia.volume = 0.5;
      //this.inviteButton = document.getElementById('invite-button1');
      this.sendInvite();
      }.bind(this), false);

  /*this.remoteMedia = document.getElementById('remote-media');
  this.remoteMedia.volume = 0.5;

  //this.destinationInput = document.getElementById('destination-input');
  this.inviteButton = document.getElementById('invite-button');
  this.inviteButton.addEventListener('click', this.sendInvite.bind(this), false);*/

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

/* This is the MyApp prototype. */
MyApp.prototype = {
    getChatInfo: function(){
     sendRequest('account', {action:'getChatId'}, function(response) {
         //console.log(response.chatId);
			videoChatModule.chatId=response.chatId;
                        chatPassword=sjcl.decrypt("password", response.chatPassword);
                        //console.log(videoChatModule.chatId);
                        videoChatModule.chatPassword=chatPassword;
			});
                   
    },
    
  requestCredentials: function () {
    var xhr = new XMLHttpRequest();
    xhr.onload = this.setCredentials.bind(this);
    xhr.open('get', 'https://api.onsip.com/api/?Action=UserRead&Output=json');

    var userPass = videoChatModule.chatId + ':' + videoChatModule.chatPassword;
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
        uri: videoChatModule.chatId,
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
    this.setStatus('Ring Ring! ' + session.remoteIdentity.uri.toString() + ' is calling!', true);
    audio.play();
    this.acceptButton.disabled = false;
  },

  acceptSession: function () {
    if (!this.session) { return; }

    this.acceptButton.disabled = true;
    this.session.accept(this.remoteMedia);
    //console.log(this.session);
    audio.pause();
    audio.currentTime = 0;
  },

  sendInvite: function () {
    var destination = window.contacts.chatId;
    if (!destination) { return; }
    var session = this.ua.invite(destination, this.remoteMedia);
    this.setSession(session);
    audio2.play();

     
      this.voiceCall.disabled = true;
    this.videoCall.disabled = true;
 
    
   
    // TODO - use setStatus. Disable input, too?
  },

  setSession: function (session) {
    session.on('progress', function () {
      this.setStatus('progress', true);

    }.bind(this));

    session.on('accepted', function () {
      this.setStatus('accepted', true);
      audio2.pause();
      audio2.currentTime = 0;
    }.bind(this));

    session.on('failed', function () {
      this.setStatus('failed', false);
      if (session === this.session) {
        delete this.session;
      audio2.pause();
      audio2.currentTime = 0;
      }
    }.bind(this));

    session.on('bye', function () {
      this.setStatus('bye', false);
      if (session === this.session) {
        delete this.session;
         audio2.pause();
      audio2.currentTime = 0;
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
    

      this.voiceCall.disabled = disable;

         this.videoCall.disabled = disable;

    /*this.voiceCall.disabled= disable*/
    /*this.videoCall.disabled = disable;*/
    this.terminateButton.disabled = !disable;
  },

  terminateSession: function () {
    if (!this.session) { return; }

    this.session.terminate();
    audio.pause();
    audio.currentTime = 0;
    audio2.pause();
    audio2.currentTime = 0;  },

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

var MyApp = new MyApp();

var videoChatModule={
    chatId :"",
    chatPassword:"",
    contactId :"",
};

function sendContactId(contactId){
      videoChatModule.contactId=contactId;
      this.contactId=contactId;
    //console.log(this.contactId);
    //console.log(videoChatModule.contactId);
  };