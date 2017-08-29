/**
 * Manages communication of the email module to the server and manages the email module.  
 * It essentially wraps mail.js (which was taken from original project).
 * 
 * Moving/managing emails:
 * When an action is performed on an email its status is set to 'waiting'. All actions should check for this status
 * and let the user know to try again in a little while. The contant is emailModule.STATUS_WAITING
 */


/** global vars for the email module */
window.emailModule = {
	STATUS_WAITING: 'waiting',	//this constant is set to email.status while a response from the server is pending
	shouldCheckForNewEmails: false,
	emailCheckTimer:null,		//the id for the setTimeout email check
	newEmailsRequest:null,		//while logged in this is the ajax request. if logging out, cancel it.
	fetchingEmails:false,		//set to true when fetching
	emails:null,				//list of all the emails
	numNewEmails:-1,				//used to check if we need to prefetch emails
	prefetchedEmails:null,		//if new emails arrive they are prefetched.
	contact:null,				//the contact object to whom to send a new email
	replyIndex:null,				//if set, a new email will be sent as a reply to this one
        noEmail:false,
        draftCreated:false,
        writingEmail:false,          //we use this in showEmails to decide whether to show the composeEmail node
        DEMO:false
};

/** call this once to initialize email module. */
function initEmailModule() {
        
        //Prefetching some images so the browser doesn't download the image in the middle of animation and play spoil sport
        prefetch("images/mail/mailbox_o.png");
        prefetch("images/mail/mail_in_mailbox.png");
        prefetch("images/mail/tray_envelope1.png");
        prefetch("images/mail/tray_envelope2.png");
	
        initMail(); //init the Mail environment like tray, trash etc..,
	emailModule.shouldCheckForNewEmails = true;
        checkForNewEmails();
}

/** fetches the emails from server, and inits them. */
function getEmail() {
	if(window.DEBUG) {
		initEmails(getTestData());
	}
	else {
        
        emailModule.fetchingEmails = true;
        var emailAction="getEmail";
        
        if(window.DEMO)  
            emailAction="getDemoEmail";
        //console.log(emailAction);
            sendRequest('email', {action:emailAction}, function(response) {
                    //Start prefetching images for emailContents
                    prefetch("images/mail/paper.png");
                    prefetch("images/mail/trash_ball.png");
                    prefetch("images/mail/inputpaper.png");
                    userData.name = response.name;
                    
                    //var emails=response.emails;
                    var emails=filterEmails(response.emails);
                    
                    console.log(emails.length);
                    initEmails(emails);
                     
                    if(emails=="")
                        emailModule.noEmail=true;
                    else
                        emailModule.noEmail=false;
                    emailModule.fetchingEmails = false;

            });
        }
}

/** if the client has pre-fetched some emails this will updates the data. */ 
function updateEmails() {
	if(emailModule.prefetchedEmails) {
		initPrefetchedEmails(emailModule.prefetchedEmails);
		emailModule.prefetchedEmails = null;
	}
}

/** sets and inits the email data, renders the html, sets their mouse handlers, updates new emails badge. */  
function initEmails(emails) {
	
        
        emailModule.emails = emails;
        
        var emailTemplate = $('#anEmail');

	//reset to default state, in case the template is in the trash or in the tray, etc
	setEmailToDefaultState(emailTemplate, true);

	//set the user's name on the template
	emailTemplate.find('#emailToAddress').html(userData.name);

	jKarma.display(emailTemplate, emails); //this generates the email html nodes

	//init the new email nodes and their buttons
	var emailNodes = $('.emailWrapper');
	emailNodes.draggable({
        drag: function () {
            lastDragged = $(this);
        },
        containment: "parent",
        scroll: false,
        disabled:false
    });
	emailNodes.mousedown(envelopeMousedown);
	emailNodes.mouseup(envelopeMouseup);
	initKeepButtons();
	
	

	//add attributes to the email nodes based on the email values.
	var newEmails = 0;
	var emailNode;
	for(var i=0; i<emails.length; i++) {
		//log(emails[i].folder);
		emailNode = $(emailNodes[i]);
		if(emails[i].status=='unread') {
			newEmails++;
		}
                console.log(newEmails);
		emailNode.attr('r', emails[i].status);
		emailNode.attr('t', emails[i].folder);
		emailNode.attr('emailIndex', i);

		//set the user image
		var contact = getContactWithEmail(emails[i].from);
		if(contact) {
			emailNode.find('.senderProfilePicture').attr('src', contact.profilePicture());
			emailNode.find('.\\$from').html(contact.name());
			emailNode.find('.\\$name').html(contact.name());
			emails[i].name = contact.name();
		}
                else
                    emailNode.find('.\\$name').html(emails[i].from.split('@')[0]);
                
                if(emails[i].folder=="Drafts")
                    emailNode.find('#emailToAddress').html(emails[i].to);
                emailNode.find('#fromInLetter').html(emailNode.find('#fromInLetter').html().trim()+": ");
	}
        
        updateMailCallout(emailModule.numNewEmails,newEmails);
        emailModule.numNewEmails = newEmails;
        
	log('done inting mail');
        setTimeout(checkForNewEmails,window.checkTimeNewMails);
}
function filterEmails(emails) {
    console.log(userData.emailFilter);
    if(userData.emailFilter=="None"||userData.emailFilter=="none") 
        return emails;
    else {
        var newEmails=new Array();
        console.log(emails.length);

        for(var i=0,j=0;i<emails.length;i++) {
            console.log(emails[i].from);
            if(getContactWithEmail(emails[i].from)!=null || emails[i].folder=="Drafts") {
                newEmails[j++]=emails[i];
            }    
            else
                deleteEmailFromUnknownContact(emails[i]);
        }

        console.log(newEmails.length);
        return newEmails;
    }     
}
/*
 *You got to "filterPhantomEmails" because when you read a email the unread count changes locally
 *before it gets updated on the mail server, a checkEmailCount request on the way might fetch the previous unread count.
 *This will result in phantom unread emails being fetched.
 */
function filterPhantomEmails(emails) {
        var newEmails=new Array();
        //console.log("!!!!!!"+emails.length);
        var uidList=new Array();
        for(var i=0;i<emailModule.emails.length;i++)
            uidList[i]=emailModule.emails[i].uid;
        console.log(uidList);
        //TODO: try to use hashMap here to reduce complexity to o(n).. Right now it coud be o(n^2)
        for(var i=0,j=0;i<emails.length;i++) {
            console.log(emails[i].uid);
            if($.inArray(emails[i].uid,uidList)==-1) {
                newEmails[j++]=emails[i];
            }    
        }

        console.log("!!!!!!"+newEmails.length);
        return newEmails;
   
}
function appendPrefetched(emails) {
        if(emails!=null) {
        //alert(emailModule.emails.length);
        var len=emailModule.emails.length;
        for(var i=0;i<emails.length;i++)
            emailModule.emails[len+i]=emails[i];
        //alert(emailModule.emails.length);
        initEmails(emailModule.emails);
        emailModule.prefetchedEmails=null;
        }
}





/** sets and inits the email data, renders the html, sets their mouse handlers, updates new emails badge. */  
function initPrefetchedEmails() {
	var emails=emailModule.prefetchedEmails;
        //emailModule.emails = emails;
        //alert(emailModule.emails.length);
        var len=emailModule.emails.length;
        for(var i=0;i<emails.length;i++)
            emailModule.emails[len+i]=emails[i];
        emailModule.prefetchedEmails=null;
        //alert(emailModule.emails.length);
        
        //I am not using jkarma to create new nodes because it ain't working for no reason
        //Instead I am appending the html of an Email
        for(var i=0;i<emails.length;i++) 
            $('#emailContents').append("<div id='anEmail' class='emailWrapper' r='read' t='none' in='c'> 		<!-- angled envelope coming from inbox --> 		<img src='images/mail/mailinbox.png' class='mailinbox' style='display:none'>  		<div class='envcontents' style='display:none; width:355px'> 			<img src='images/mail/envelope.png'   id='envelope' style='position:absolute;'/> 			<img src='images/mail/fullback2_1.png'  id='rot2' style='position:absolute; display:none; top:11px;' /> 			<div id='letter' style='display:none; top:132px;left:25px; position:absolute; '> 				<img id='paper' src='images/mail/paper2.png' /> 		    	<div id='message' style='position:absolute; width:400px; padding: 35px;  font:Times New Roman; font-size:18px; '> 		    		<div class='addressField'><span id='fromInLetter'>From </span><span class='$name'></span></div> 		    		<div class='$body' style='white-space: pre-wrap; height: 500px; overflow-y: auto;'>Please wait for a moment while we get your mail...</div> 				                                         <button class='reply' style=' position:absolute; top:580px;left: 10px;'><span id='replyButtonContent'> Reply</span></button> 					<button class='close' style=' position:absolute; top:580px; margin-left:130px; '><span id='keepButtonContent'> Keep</span></button> 					<button class='throwaway' style='position:absolute; top:580px; left: 315px; position: absolute; '><span id='throwAwayButtonContent'> Throw Away</span></button> 		        </div> 			</div> 			<img src='images/mail/back2_2.png'   id='rot3' style='position:absolute; top: 128px; display:none;'/> 			<img src='images/mail/uflap.png'  id='rot1' style='position:absolute; top: 128px; display:none '/> 		</div>  		<div id='frontcontents' style='display:none;'> 			<div style='position:absolute; left: 12px; top: 5px; font:Times New Roman; font-size:18px' id='from'> From</div>  			<div style='position:absolute; left: 12px; top: 29px; font-size:18px;width:191px' class='$from'></div> 			<div style='position:absolute; left: 90px; top: 104px; font-size:18px' id='to'> To</div> 			<div id='emailToAddress' style='position:absolute; left: 90px; top: 128px; font-size:18px; width: 250px;'></div> 			<div style='position:absolute; width:330px; left: 10px; top:200px; font:Times New Roman; font-size:18px; color:#333333'>                             <span id='about'>About: </span><span class='$subject'></span> 			</div>  			<!-- profile picture and frame --> 			<div style='position:absolute;  left: 281px; top: 5px; width:62px; height:68px; overflow:hidden;'> 				<img class='senderProfilePicture' src='images/contacts/unknownUser.jpg'  style='margin:7px; max-width:54px; max-height:60px;'> 				<img src='images/mail/sframe1.png' style='position:absolute; top:0px; left:0px;'> 			</div>  			<img src='images/mail/seal2_1.png' style='position:absolute; left: 285px; top: 15px;'> 			<img src='images/mail/seal3_2.png'style='position:absolute; left: 195px; top: 40px;'> 			<div class='$dateSent' style='position:absolute; left: 204px; top: 68px; font-weight: bold;font-size:11px; width:75px; text-align: center;'></div>  		</div> 	</div> ");
        
	//emailNodes.mousedown(envelopeMousedown);
	//emailNodes.mouseup(envelopeMouseup);
        
        
	//initKeepButtons();
	//initReplyButtons();
	//initThrowawayButtons();

	//add attributes to the email nodes based on the email values.
	var newEmails = 0;
	var emailNode;
        var emailNodes=$('.emailWrapper');
        
	for(var i=0; i<emails.length; i++) {
		emailNode = $(emailNodes[len+i]);
                //reset to default state, in case the template is in the trash or in the tray, etc
                //setEmailToDefaultState(emailNode, true);

                //set the user's name on the template
                emailNode.find('#emailToAddress').html(userData.name);

                //jKarma.display(emailTemplate, emails); //this generates the email html nodes
                
                emailNode.draggable({
                    disabled:true
                });
                
               

		if(emails[i].status=='unread') {
			newEmails++;
		}
                emailNode.attr('id',"anEmail");
		emailNode.attr('r', emails[i].status);
		emailNode.attr('t', emails[i].folder);
		emailNode.attr('emailIndex', len+i);

		//set the user image
		var contact = getContactWithEmail(emails[i].from);
		if(contact) {
			emailNode.find('.senderProfilePicture').attr('src', contact.profilePicture());
			emailNode.find('.\\$from').html(contact.name());
			emailNode.find('.\\$name').html(contact.name());
			emails[i].name = contact.name();
		}
                else {
			emailNode.find('.\\$from').html(emails[i].from);
			//emailNode.find('.\\$name').html(contact.name());
                    
                }
                emailNode.find('.\\$subject').html(emails[i].subject);
                emailNode.find('.\\$dateSent').html(emails[i].dateSent);
                emailNode.find('.\\$body').html(emails[i].body);
                
                //init keep buttons
                //emailNode.find('.close').click(putEmailInTray($(this).parents('.emailWrapper')));
	}
        
	
        //updateMailCallout(emailModule.numNewEmails,newEmails);
        //emailModule.numNewEmails = newEmails;
	log('done inting prefetched mail');

}


/**
 * Pings the server for new emails. If there are new ones it pre-fetches them and stores
 * them in emailModule.prefetchedEmails until the mailbox is opened again.
 */
//FIXME if server gets error on this, the ping stops
function checkForNewEmails() {
      window.animationLock=true;
      setTimeout(function(){window.animationLock=false;console.log("released");},1220);
        emailModule.emailCheckTimer = null;
	console.log(emailModule.shouldCheckForNewEmails);
	if(emailModule.shouldCheckForNewEmails) {
		log('checking for new emails');
		emailModule.newEmailsRequest = sendRequest('email', {action:'checkForNewEmails'}, function(response) {
                    emailModule.shouldCheckForNewEmails=true;   
                        console.log(emailModule.numNewEmails);
                        console.log(response.newEmails);
			if(response.newEmails>emailModule.numNewEmails) {
				//we have new emails so prefetch them
                                var prevCount=emailModule.numNewEmails;
				//emailModule.numNewEmails=response.newEmails;
				emailModule.newEmailsRequest = null;
                                var diff=response.newEmails-prevCount;
				sendRequest('email', {action:'getNewEmails',limit:diff}, function(response) {
					log('prefetching emails');
                                        var emails=filterEmails(response.emails);
                                        emails=filterPhantomEmails(emails);
                                        if(emails.length>0) {
                                            emailModule.prefetchedEmails = emails;
                                            emailModule.numNewEmails=prevCount+emails.length;
                                            updateMailCallout(prevCount,emailModule.numNewEmails);
                                            if(modules.currentModuleId=="emailModule" && emailModule.numNewEmails > prevCount)
                                                stickyMailbox();
                                            log('done prefetching');
                                        }
				});
			}
			if(emailModule.shouldCheckForNewEmails) {
				emailModule.emailCheckTimer = setTimeout(checkForNewEmails, window.checkTimeNewMails);
			}
		});
	}
}


/** tell the email module to cancel the current ajax request. */
function stopEmailCheck() {
	emailModule.shouldCheckForNewEmails = false;
	
	//cancel the ajax request
	if(emailModule.newEmailsRequest) {
		emailModule.newEmailsRequest.abort();
	}
	
	//clear the timer
	if(emailModule.emailCheckTimer) {
		clearTimeout(emailModule.emailCheckTimer);
		emailModule.emailCheckTimer = null;
	}
}


/** debug method */
function dumpEmails() {
	var email;
	for(var i=0; i<emailModule.emails.length; i++) {
		email = emailModule.emails[i]; 
		log(email.uid + "\t" + email.folder + "\t" + email.subject);
	}
}

function getTestData() {
	return [
	        {body:"this is an email", from:"jmouka@gmail.com", status:"unread", subject:"a test", folder:'INBOX', uid:1, dateSent:'today'},
	        {body:"in the tray", from:"jmouka@gmail.com", status:"read", subject:"trayed", folder:'tray', uid:2, dateSent:'next week'}
    ];
}

/**
 * Loads the email body on-demand. 
 * This is necessary since viewing the body marks the email as 'read' by the server. 
 * If the email was unread this will update its status and the new emails UI.
 */
function getEmailBody(index, bodyNode) {
	var email = emailModule.emails[index];
	/*if(email.status==="unread") {
		email.status = "read";
		emailModule.numNewEmails = Math.max(0, emailModule.numNewEmails-1);
                updateMailCallout(emailModule.numNewEmails);

	}*/
	
	log('fetching email body'+email.folder);
        
	var request = {action:'getBody', uid:email.uid, folder:email.folder};
	sendRequest('email', request, function(response) {
		bodyNode.html(response.body);
	});
}
function markAsRead(index) {
	var email = emailModule.emails[index];
	if(email.status==="unread") {
		email.status = "read";
                updateMailCallout(emailModule.numNewEmails,Math.max(0, emailModule.numNewEmails-1));
		emailModule.numNewEmails = Math.max(0, emailModule.numNewEmails-1);
                var request = {action:'markAsRead', uid:email.uid, folder:email.folder};
                sendRequest('email', request);
	}

//	log('fetching email body', uid);

}

/**
 * Sends an email as a reply to a previously-clicked email.
 * The module made a note of the email when the reply button was clicked.
 * @param body	email body
 */
function sendReply(body) {
	var email = emailModule.emails[emailModule.replyIndex];
	emailModule.replyIndex = undefined;
	var request = {
			action:'reply', 
			uid: email.uid, 
			folder: email.folder, 
			body: body
	};
	sendRequest('email', request);
}

function sendEmail(body) {
	var subject = body.substr(0, Math.min(body.length, 40)) + "...";
	if(emailModule.contact) {
		log('sending email to ', emailModule.contact.email);
		var request = {
				action:'newEmail',
				to: emailModule.contact.email,
				subject: subject,
				body: body
		};
		sendRequest('email', request);
	}
}

/** Archive an email, ie send it to the tray. On the server it is moved to the "tray" folder. */
function archiveEmail(index) {
	var email = emailModule.emails[index];
	//log('archiving ' + index, email.status);
/*	if(email.status==emailModule.STATUS_WAITING) {
		showMessagePopup("The email is still waiting for the server to complete the last action. Please try again in few seconds.");
		return false;
	}*/
	if(window.DEBUG) {
		email.status = 'read';
		email.folder = 'tray';
	}
	else {
		email.status = emailModule.STATUS_WAITING;
		sendRequest('email', {action:'archiveEmail', uid:email.uid, folder:email.folder}, function(response){
			email.folder = response.folder;
			email.uid = response.uid;
			email.status = 'read';
		});
	}
	return true;
}
function deleteEmailFromUnknownContact(email) {
	
        //var email = emailModule.emails[index];
        if(email!=undefined) {
/*	if(email.status==emailModule.STATUS_WAITING) {
		showMessagePopup("The email is still waiting for the server to complete the last action. Please try again in few seconds.");
		return false;
	}*/
	if(window.DEBUG) {
		email.status = 'deleted';
		email.folder = '[Gmail]/Trash';
	}
	else {
		email.status = emailModule.STATUS_WAITING;
		sendRequest('email', {action:'deleteEmail', uid:email.uid, folder:email.folder}, function(response){
			email.status = 'deleted';
			email.uid = response.uid;
			email.folder = response.folder;
		});
	}}
	return true;
}

function deleteEmail(index) {
	
        var email = emailModule.emails[index];
        if(email!=undefined) {
/*	if(email.status==emailModule.STATUS_WAITING) {
		showMessagePopup("The email is still waiting for the server to complete the last action. Please try again in few seconds.");
		return false;
	}*/
	if(window.DEBUG) {
		email.status = 'deleted';
		email.folder = '[Gmail]/Trash';
	}
	else {
		email.status = emailModule.STATUS_WAITING;
		sendRequest('email', {action:'deleteEmail', uid:email.uid, folder:email.folder}, function(response){
			email.status = 'deleted';
			email.uid = response.uid;
			email.folder = response.folder;
		});
	}}
	return true;
}

function undeleteEmail(index) {
	var email = emailModule.emails[index];
/*	if(email.status==emailModule.STATUS_WAITING) {
		showMessagePopup("The email is still waiting for the server to complete the last action. Please try again in few seconds.");
		return false;
	}*/
	if(window.DEBUG) {
		email.status = 'read';
		email.folder = 'INBOX';
	}
	else {
		email.status = emailModule.STATUS_WAITING;
		sendRequest('email', {action:'undeleteEmail', uid:email.uid, folder:email.folder}, function(response){
			email.status = 'read';
			email.uid = response.uid;
			email.folder = response.folder;
		});
	}
	return true;
}

/** call this to display the view to compose an email to the contact. */
function composeEmailTo(contact) {
        emailModule.contact = contact;
	$('#composeEmailTo').html(contact.name());
        console.log("called............");
	//log($('#composeEmailTo > span').html(contact.name()));
	showComposeEmail(contact.draftEmailIndex);
}

/** returns the sender's name for the email. */
function getSenderNameForEmail(emailIndex) {
	return emailModule.emails[emailIndex].name;
}


function hideMailCallout(){
    $('#new_emails').hide();
    $('#calloutImage').hide();
}
function showMailCallout(animate){
    $('#new_emails').show();
    $('#calloutImage').show();
    if(animate) {
        $('#calloutImage').effect("shake",{times:2},100);
        $('#new_emails').effect("shake",{times:2},100);    
    }
        
}
function updateMailCallout(prevCount,num) {
    //console.log(window.languageData);
        $('#new_emails').html(""+num + " "+window.languageData['new_emails'].split('|')[1]);
        $('#new_emails').addClass('noLine');
        if(num==0) //Hide the callout if the # of new emails is 0
             hideMailCallout();
        else if(num<prevCount) // We don't animate if the number of new emails has decreased
            showMailCallout(false);
        else
            showMailCallout(true); // animate if increase in # of new emails
}
