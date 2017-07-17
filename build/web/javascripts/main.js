/**
 * Main app code
 */

//var DEBUG = true;

if(!window.userData) {
	window.userData = {
		name : '',			//the user's name
		contacts : null,		//the contact list, initialized by the contactsModule
                contactBookType : 0,
                emailFilter : "None"
	},
        window.animationLock=false,      //ignore input events while in animation.
        window.languageData =null,
        window.heartBeatKey=117,
        window.heartBeatTimer=undefined,
        window.refreshPhotoTime=6000,
        window.screenSaverWaitTime=3*60000,
        window.createDraftTime=10000,
        window.refreshDraftRate=10000,
        window.checkTimeNewMails = 10000,
        window.moveRandomTime=3000,
        window.screenTimer=undefined
        //window.screenSaverWaitTime=120000
}
/**
 *  WE are NOT using this right now.When we call this, we know for sure the user is logged in. We start loding the modules directly.
 */
function initAppDirectly() {

        var deviceAgent = navigator.userAgent.toLowerCase();
        var ios=deviceAgent.match(/(iphone|ipod|ipad)/);
        window.isIos=false;
        var width=screen.width;
        var height=screen.height;
        
        if(ios) {
            //Hack for ios devices
            width=screen.height;
            height=screen.width;
            
            window.isIos=true;
        }

            //var inc=(1280-width)/1280;
            var inc=(800-height)/800;
            if(inc==0) {
              inc=inc*(-1)-0.1;
	      inc=100+inc*100;
            }
            else if(inc<0) {
              inc=inc*(-1)-0.2;
	      inc=100+inc*100;
            }
            else if(inc>0) {
                inc=100-inc*100;
            }
            $('body').css("zoom",""+inc+"%");
	     console.log(width+"::"+$('body').css("zoom"));

	$('#messagePopup').draggable();
	$(document).keydown(
		function(event) {
			
                        if(event.which==27) {
				$('.dialog').hide();
			}
                        if(event.which == 61)
                        {
                                alert("==");
                                sendRequest('EmailServletDemo', {action:'archiveEmail'}, function(response){  });
                        }
                        
		}
	);
        
        $.getScript("javascripts/contactsModule_"+window.userData.contactBookType+".js", function() {
            loadModules();
        });
}

function initApp() {
        sendRequest('ezaccess', {action:"init"}, processLoginResponse);
        
        
        var deviceAgent = navigator.userAgent.toLowerCase();
        var ios=deviceAgent.match(/(iphone|ipod|ipad)/);
        window.isIos=false;
        var width=(screen.width);
        var height=(screen.height);
        
        if(ios) {
            //Hack for ios devices
            width=screen.height;
            height=screen.width;
            
            window.isIos=true;
        }
            //this app is designed on a screen for 1280x800. To fit on 
            //other resolutions we are using the browser zoom functionality
            var inc=(800-height)/800;
            if(inc==0) {
              inc=-0.02;
	      inc=100+inc*100;
            }
            else if(inc<0) {
              inc=inc*(-1)-0.2;
	      inc=100+inc*100;
            }
            else if(inc>0) {
                inc=100-inc*100;
            }
            $('body').css("zoom",""+inc+"%");
            console.log(inc);
    
	    
	    
          
	$('#messagePopup').draggable();
	$(document).keydown(
		
                function(event) {
                        if(event.which==27) {
				$('.dialog').hide();
			}
                        if(event.which==window.heartBeatKey) {
                            if(window.heartBeatTimer!=undefined)
                                clearTimeout(window.heartBeatTimer);
                            window.heartBeatTimer=setTimeout("kill()",20000);
                        } 

		}
	);
            
            
        //screen saver    
        $(document).mousemove(clearScreensaver); 
        $(document).click(clearScreensaver); 
        $(document).keyup(clearScreensaver); 

        clearScreensaver();
}


function login() {
	var form = document.forms.loginForm;
	var request = {action:'login', userKey:form.userKey.value, password:form.password.value};
	//var button = $(form).find('[type=submit]').attr('disabled', true);
	$('#loading').show();
	sendRequest('ezaccess', request, processLoginResponse);
}

/** called when the server responds from initApp() or login() to process the response. */
function processLoginResponse(response) {
                 var array=new Array();
                 array=response.lang;
                 window.language=response.language;
                 window.languageData=array;
                 
        if(response.login) {
		$('#login').show();
		document.forms.loginForm.userKey.focus();
	}
	else if(response.password) {
		$('#login').show();
		//the userKey is passed in already (either via form or url) and a password is still required
		$('#userKeyField').hide();
		$('#passwordField').show().find('.username').html(response.userKey);
		if(response.userKey) {
			document.forms.loginForm.userKey.value = response.userKey;
		}
		document.forms.loginForm.password.focus();
	}
	else if(response.ok){
                if(response.assistant) {
			$('#menu').show();
		}
		log('already logged in with', response.name);
		userData.name = response.name; 
                if(userData.name=="Elaine Trace") //Demo account for Elaine alone :)
                    window.DEMO=true;
//		$('#logout').attr("href", response.logoutURL);
                userData.contactBookType=response.contactBookType;
                userData.emailFilter=response.emailFilter;
                
		$('#login').hide();
                $.getScript("javascripts/contactsModule_"+userData.contactBookType+".js", function() {
                    loadModules();
                });


	}
	else {
		$('#login').show();
		document.forms.loginForm.userKey.focus();
	}
}

function showSignUp() {
	$('#loginForm').fadeOut(200);
	$('#signUpForm').delay(200).fadeIn(200);
}
function hideSignUp() {
	$('#signUpForm').fadeOut(200);
	$('#loginForm').delay(200).fadeIn(200);
}


function signup() {
	$('#loading').show();
	var request = {action:'signup', signUpKey:document.forms.signUpForm.signUpKey.value};
	sendRequest('ezaccess',request, function(response) {
		userData.name = response.name;
		$('#loading').hide();
		window.location.href = "accountSettings.html";
	});
}
function logout() {
	sendRequest('ezaccess', {action:'logout'}, function(response){
		stopEmailCheck(); //kill the request to fetch emails
                logoutChat();
		toggleMenu();
		gotoLoginScreen();
	});
}

function gotoLoginScreen() {
	$('.dialog').hide();
	document.forms.loginForm.reset();
	$('#login').show();
	$('#userKeyField').show();
	$('#passwordField').hide();
	$('#menu').hide();
	$('#contents').hide();
	$('#contents > *').html(''); //clear all data in contents, to prevent snooping after logging out
}

/**
 * Once the user has signed in this will load all the modules and generally setup the app.
 */
function loadModules() {
	/**
	 * Modules are simple objects that have show/hide methods. They are added to this object by name
	 * and initialized in loadModules().
	 */

         $('#login').hide();

        getEmail(); // We want the emails as fast as possible.. So make the request before doing anything

	window.modules = {
		currentModule: null,
		albumModule : {show: showAlbums, hide: hideAlbums},
		emailModule : {show: showEmails, hide: mailin},
		contactsModule : {show: showContacts, hide: contactin},
		contactsModuleEmail : {show: showContactsFromEmail, hide: contactin},
		chatModule: {show:showChat, hide: hideChat},
                videoChatModule: {show: showVideoChat, hide: hideVideoChat}
	};
        //Initialize previous state of contact book
        
        //Draggable
        $('img').draggable({start:function(e){
                e.preventDefault();
        }});

	$('#emailModule').load("emailModule.html", function() {
		initEmailModule();
	});

	$('#albumModule').load("albumModule.html", function() {
               initAlbumModule();
	});

	$('#contactsModule').load("contactsModule.html", function(){
		initContactsModule(); //load and init the contacts
                //If user setting is not English, translate pages
                if(window.language=="English")
                    processLangData();
                else
                    processAndTranslate();
	});

	$('#chatModule').load("chatModule.html", function() {
                initChat();
	});
	$('#videoChatModule').load("videoChatModule.html", function() {

	});
	/*
	var contents = $('#contents');
	contents.load("emailModule.html", function() {
		initEmailModule();
		modules.emailModule = { show: showEmails, hide: mailin};

		jQuery.get("contactsModule.html", function(data) {
			contents.append(data);
			initContactsModule();
			modules.contactsModule = {show: showContacts, hide: contactin};
		})
	});
	*/

	$('#contents').show();
}

/**
 * This handles showing/hiding the different modules.
 * It should be assigned to the big side buttons with the module name as a string parameter, eg 'emailModule'
 */
function clickModuleButton(moduleId) {
	//log(moduleId, 'clicked');
        
        $('#mail_notes').hide();

        if((window.emailModule.fetchingEmails && moduleId=="emailModule" )|| window.animationLock)  //if emails is loading or there is an animation playing, we ignore the user clicks
        {
             console.log("locked");
             return;

        }
        if(moduleId=="emailModule" && emailModule.state=="STICKY") {
            showStuckEmails();
            return;
        }
	var module = modules[moduleId];
        modules.currentModuleId=moduleId;

	if(modules.currentModule===null) {
		module.show();
		modules.currentModule = module;
	}
	else if(modules.currentModule===module) {
		module.hide();
		modules.currentModule = null;
	}
	else {
		modules.currentModule.hide();
		modules.currentModule = module;
		setTimeout(module.show, 500);
	}

}

/**
 * Returns a random number in the range [minVal, maxVal]
 * @param minVal
 * @param maxVal
 * @param decimals	if set this will set the number of decimals, otherwise returns int.
 * @returns
 */
function randomXToY(minVal, maxVal, decimals) {
    var randVal = minVal + (Math.random() * (maxVal - minVal));
    return (decimals === 'undefined' ? Math.round(randVal) : randVal.toFixed(decimals));
}

/** utility method to return the numeric portion of a typical css pixel value, eg 10px */
function getInt(a) {
	if(a) {
		return parseInt((a.substring(0, a.length - 2)));
	}
	else {
		return 0;
	}
}

function showMessagePopup(msg) {
	//alert(msg);
        log(msg);
/*	var popup = $('#messagePopup');
	popup.find('#messagePopupText').html(msg);
	popup.show();*/
}

function toggleMenu() {
	$('#menuBody').toggle(200);
}

/** this will display an email compose screen initialized to the contact */
function writeEmail(contact) {
        if(window.isIos) {
            $('#composeEmail').show();
            $('#composeEmailFacade').show();
        }
        else {
            $('#composeEmailFacade').hide();
            $('#composeEmail').hide();
        }
            
        $('#inputpaper').val('');


        $('#inputpaperFacade').val('');
        $('#inputpaperFacade').focus();
        $('#composeEmailFacade').find('#composeEmailTo').html(contact.name());
        $('#recepientAddress').html(contact.name());
        $('#senderAddress').html(userData.name);
//        clickModuleButton('emailModule');

	composeEmailTo(contact);
}
function writeEmailToUnknown(contact, message) {
    
        
       if(window.isIos) {
            $('#composeEmail').show();
            $('#composeEmailFacade').show();
        }
        else {
            $('#composeEmailFacade').hide();
            $('#composeEmail').hide();
        }
 
        $('#inputpaper').val('');
        var content='';
        if(message!=undefined)
            content=message;
        $('#inputpaperFacade').val(content);
        $('#inputpaperFacade').focusEnd();
        
        
$('#composeEmailFacade').find('#composeEmailTo').html($('#EmailInstructions').find('#name').val());

//        clickModuleButton('emailModule');

if(contact==undefined) { // this is called when the  Write Email button is clicked at the contactsModule.html
        var contact={email: $('#EmailInstructions').find('#email').val(),
                    name:function() {
                        return $('#EmailInstructions').find('#name').val()
                    }

        };
}
// if contact is defined, we call this to write a draft email
$('#recepientAddress').html(contact.name());
$('#senderAddress').html(userData.name);
composeEmailTo(contact);
}


/**
 * Searches for a contact object by email. Returns null if not found.
 * @param email
 * @returns
 */
function getContactWithEmail(email) {
	if(userData.contacts) {
		for(var i=0; i<userData.contacts.length; i++) {
			if(userData.contacts[i].email==email) {
				return userData.contacts[i];
			}
		}
	}
	return null;
}

function showMessagePopup(msg) {
	//alert(msg);
        log(msg);
	/*var popup = $('#messagePopup');
	popup.find('#messagePopupText').html(msg);
	popup.show();*/
}

// This function prefetches the image to browser cache so images aren't loaded while in animation
function prefetch(image) {

    var im = new Image();
    im.src = image;
}
function kill() {
    window.location="about:blank";
}
