/** @license

 WebAnywhere :: Mini HTML5
 --------------------------------------------
 http://webanywhere.googlecode.com

 Copyright (c) 2011, Jeffrey P. Bigham. All rights reserved.
 Code provided under the BSD License.

 V0.01
*/

// Start a closure so WebAnywhere doesn't interfere with existing code.
(function() {
  // Google, only works on Chrome
  // var sound_base_url = "http://www.google.com/speech-api/v1/synthesize?lang=en-us&enc=mpeg&client=vizwiz.cs.rochester.edu&text=";

  // WebAnywhere; works on Chrome/Firefox/IE but cannot be deployed w/out agreement with Ivona.
  //var sound_base_url = "http://webanywhere.cs.washington.edu/cgi-bin/ivona/getsound-ogg.pl?text=";
  
  var sound_base_url = "http://webanywhere.cs.washington.edu/cgi-bin/ivona/getsound.pl?text=";
  
  // Color of Background
  var highlight_color = "#FFA";

  // What should trigger speaking - space-separated list.
  var events_to_bind = "rightclick contextmenu";

  // Returns a boolean value indicating whether this node should be played
  // or not.  Currently only checks a couple of node names, and defaults to
  // yes, but could be made smarter.
  function playableNode(node) {
    var name = node.nodeName;
    if(/body|html/i.test(name)) {
      return false;
    }
    return true;
  }

  // ==========================================
  // Ideally, you wouldn't need to chang much below this line.

  var audioId = "voice-audio";
  var currentNode = "null";
  var highlightClassName = "wahighlight";

  function getContent(node) {
    return node.textContent;
  }

  function getSoundURL(text) {
    return sound_base_url + encodeURIComponent(text);
  }

  function playNode(node) {
    if(!playableNode(node)) return;
    var content="";
    var talk=getTalkData();
    if(talk[$(node).attr('id')]!=undefined)
        content=talk[$(node).attr('id')];
    else
        content=$(node).text();
   //alert($(node).attr('id'));
   
   // var text="hello world";
    var url = getSoundURL(content);
    //alert($(node).attr('id'));
    playSound(url);
    // highlighting.
    removeHighlight();
    $(node).addClass(highlightClassName);
    currentNode = node;
    
  }

  function removeHighlight() {
    if(currentNode != null) {
      $(currentNode).removeClass(highlightClassName);
    }
  }
  function getTalkData() {
    var talk=new Array();
    
    var content="Mail box. You have "+emailModule.numNewEmails+" new mail!";
    if(emailModule.numNewEmails==0)
        content="Mail box. You have no new mail";
        
    talk['mailbox']=content;
    talk['mail']=content;
    return talk;

  }
  function playSound(url) {

    var audio;
    if($("#" + audioId).length) {
      $("#" + audioId).remove();
    }

    audio = $("<audio/>");
    audio.attr('autoplay', 'autoplay');
    audio.attr('id', audioId);
    audio.bind('ended', function(e) {
      removeHighlight();
    });

    $(document.body).append(audio);

    audio.attr('src', url);
    document.getElementById(audioId).load();
    audio.load(function() { audio.play(); });
  }

  $(document).ready(function() {
    // Add the new style, could/should put in .css file.


	
	
    $(document.body).append($("<div/>").attr("id", "wa-style-div"));
    $("#wa-style-div").html("<p>&nbsp;</p><style>." + highlightClassName +
                             "{background-color: "+highlight_color+" !important;}</style>"
                            );

    // Add right-click to everything.
    $(document).bind(events_to_bind, function(e) {
      e.preventDefault();
      e.stopPropagation();
      playNode(e.target);
      return false;
    });
  });
})();