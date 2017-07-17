/** 
 * Check and handle any errors returned by the server. if there were errors this will display a dialog.
 * Returns true if there were errors, false otherwise.
 */
function serverRespondedWithErrors(data) {
	var result = data.error || data.timeout;
	//log('result ' + result);
	if(data.error) {
		showMessagePopup(data.error);
	}
	else if(data.timeout) {
		showMessagePopup('Your session has timed out. Please log back in.');
		gotoLoginScreen();
	}
	return result;
}
//A shake animation
function adjustOffset(el, offset) {
    /* From http://stackoverflow.com/a/8928945/611741 */
    var val = el.value, newOffset = offset;
    if (val.indexOf("\r\n") > -1) {
        var matches = val.replace(/\r\n/g, "\n").slice(0, offset).match(/\n/g);
        newOffset += matches ? matches.length : 0;
    }
    return newOffset;
}

$.fn.setCursorPosition = function(position){
    /* From http://stackoverflow.com/a/7180862/611741 */
    if(this.lengh == 0) return this;
    return $(this).setSelection(position, position);
}

$.fn.setSelection = function(selectionStart, selectionEnd) {
    /* From http://stackoverflow.com/a/7180862/611741 
       modified to fit http://stackoverflow.com/a/8928945/611741 */
    
    if(this.lengh == 0) return this;
    input = this[0];

    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        selectionStart = adjustOffset(input, selectionStart);
        selectionEnd = adjustOffset(input, selectionEnd);
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
}

$.fn.focusEnd = function(){
    /* From http://stackoverflow.com/a/7180862/611741 */
    if(BrowserDetect.browser=="Firefox") {
        //this.focus();
        var caretPos=this.val().length;
        var elem=this;
        try {
            $(elem).attr('selectionStart', caretPos);
            $(elem).attr('selectionEnd',  caretPos);
            $(elem).focus();
        }
        catch (err) {
            //alert(err.description);
        }
        
    }
        
    else
    this.setCursorPosition(this.val().length);
    
}
/*
function setCursorPosition(elem, caretPos) {
    //var elem = document.getElementById(elemId);
    
    if(elem != null) {
        $(elem).attr('selectionStart', caretPos);
        $(elem).attr('selectionEnd',  caretPos);
        $(elem).focus();
        //alert(caretPos);
    }
    return false;
}*/
/**
 * Send a JSON request to the server and handle any errors.
 * @param url		any url, usually the name of the servlet
 * @param data		data sent, usually includes 'action'
 * @param onSuccess	method to execute on success (optional)
 * @return returns the XMLHttpRequest request (so it can be cancelled, etc)
 */
function sendRequest(url, data, onSuccess) {
                return jQuery.post(
			url,
			data,
			function(data) {
				$('#loading').hide(); //hide it in case it was shown
				//log(data);
				if(!data) {
					showMessagePopup('server failed to respond');
				}
				else if(!serverRespondedWithErrors(data) && onSuccess) {
					onSuccess(data);
				}
			},
			'json'
	);
}



/** method to hide an html node identitied by id (any jquery selector actually), useful
 * when calling in an href, eg href="javascript:hide('#something')". This is needed because
 * firefox doesn't like calling $(..).hide() directly. */
function hide(id) {
	$(id).hide();
}

/** see documentation for hide(id). */
function show(id) {
	$(id).show();
}

function log(val1, val2) {
	if(this.console) {
		if(val2!==undefined)
			console.log(val1, val2);
		else
			console.log(val1);
	}
}
function err(val1, val2) {
	if(console && console.error) {
		if(val2)
			console.error(val1, val2);
		else
			console.error(val1);
	}
}


/** gets the size and position of a jQuery node, used for recalling a nodes position/size.*/
function getSizeAndPosition(node) {
	return {
		left: node.css('left'),
		top: node.css('top'),
		height: node.css('height'),
		width: node.css('width')
	};
}

function getPosition(node) {
	return {
		left: node.css('left'),
		top: node.css('top')
	}
}

function animateToPositionAndSize(node, destinationNode, duration, onComplete) {
	node.animate(getSizeAndPosition(destinationNode), duration, onComplete);
}
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

function validateEmail(emailId) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(emailId);
}
//Browser detect taken from http://www.quirksmode.org/js/detect.html

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();