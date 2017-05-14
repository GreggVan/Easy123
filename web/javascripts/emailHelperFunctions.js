/**
This file is the animation and UI control for the email module. It talks to the emailModule.js
to communicate with the server.
*/


/*
z-index values:
 -open letter should be very top so nothing is covering the email body
 -for trayed emails, the Z_TRAYED is the base z-index, and their index is added
 */
var Z_TRAY = 1;			//tray
var Z_TRAYED = 2;		//envelopes in the tray
var Z_TRASH1 = 1;		//the lower trash lip
var Z_TRASHING = 2;		//letters being trashed
var Z_TRASH2 = 3; 		//the trash image (overlay)
var Z_ENVELOPE = 1000;		//envelopes on desktop
var Z_CLICKED_ENVELOPE = 1001; //not used, but could be
var Z_LETTER = 1010;		//letter being viewed, including reply letter
var Z_TRUCK = 1100;		//make delivery truck be top
var COMPOSE_MAIL_LEFT=490;   //Coordinate where the compose mail shows up
var COMPOSE_MAIL_TOP=10;
var Z_COMPOSE=1005;
var numViewingLetters = 0;


//TODO try to remove unused ones
var ip = "";
var W = screen.width;
var H = screen.height;
var filter = 0;
var filter2 = 0;

/** the emailWrapper node currently in the trash. The trash keeps the last trashed envelope, so it
 * can be untrashed. Any new envelopes trashed cause the old one to be removed.
 */
var deletedEmail;

/** this is used to drop emails onto the trash and tray */
var lastDragged;

/** list of emails in the tray */
var trayEmails = new Array();
var trayEmailsFlag = new Array();
var trayptr = -1;
var loadingPhotos = 1;
var MARGIN = 25;
var buttonwidth = 200;

var ENVELOPE_HEIGHT = 358; //pixel height of an open envelope
var ENVELOPE_WIDTH = 355; //pixel width of an open envelope

var viewportwidth;
var viewportheight;
if (typeof window.innerWidth != 'undefined') {
    viewportwidth = window.innerWidth, viewportheight = window.innerHeight
}
// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
    viewportwidth = document.documentElement.clientWidth, viewportheight = document.documentElement.clientHeight
}
// older versions of IE
else {
    viewportwidth = document.getElementsByTagName('body')[0].clientWidth, viewportheight = document.getElementsByTagName('body')[0].clientHeight
}

var trash_x;
var trash_y;

/** the tray style/position, used to animate emails being filed */
var csstray = {};

/** the base top value for emails in the tray. calculated when the mailbox is opened. */
var trayedEmailBaseTop;


function initMail() {
	$('#emailTray').css('z-index', Z_TRAY);
	$('#trashLip').css('z-index', Z_TRASH1);
	$('#trash').css('z-index', Z_TRASH2);
	$('#trashHighlight').css('z-index', Z_TRASH2+1);
	$('#truck').css('z-index', Z_TRUCK);
	$('#truckEnvelope').css('z-index', Z_TRUCK);
        $('#composeEmailFacade').css('left',COMPOSE_MAIL_LEFT+225-100+'px');
        $('#composeEmailFacade').css('top',COMPOSE_MAIL_TOP-120+'px');
        $('#composeEmailFacade').css('z-index',Z_COMPOSE);
/* the facade is used so that it works on an ipad 
 * The problem on the ipad is, you can't focus to a text area after an animation.
 * you can focus, in a click handler only. You cannot change the focus in a function which is
 * called by the click handler on an ipad*/
$('#sendFacade').click(function(){
   $('#composeEmailFacade').hide();
   $('#composeEmail').show();
   $('#inputpaper').val($('#inputpaperFacade').val());
   $('#composeEmail').find('.send').click();

});
$('#throwawayFacade').click(function(){
   $('#composeEmailFacade').hide();
   $('#composeEmail').show();

   $('#composeEmail').find('.throwaway').click();

});

$('#emailContents').click(function() {
$('#touchEmailInstruction').hide();
});

    $('.trash').mousedown(function () {


        //log('trash was clicked');
        if (deletedEmail) {
        	//make a local copy of the deletedEmail, to prevent double-calls/overwrites on it while animating
        	var deletedEmail1 = deletedEmail;

        	//call server to undelete
        	if(undeleteEmail(deletedEmail1.attr('emailIndex'))==false) {
        		return;
        	}
        	deletedEmail = undefined;

            //console.log('trash mousedown');
            deletedEmail1.attr('t', 'INBOX');
            var csstrash1 = {
                position: 'absolute',
                top: trash_y - 128 + 'px'
            };
            deletedEmail1.css('z-index', Z_ENVELOPE);
            deletedEmail1.animate(csstrash1, 500, function () {
                deletedEmail1.find('.envcontents').find('#envelope').attr('src', 'images/mail/envelope.png');
                //deletedEmail.css('z-index', curr_index);
                deletedEmail1.find('#frontcontents').show();

                //if the envelope has been read, show the top flap and move the rest down 128px
                if (deletedEmail1.attr('r') == "read") {
                    deletedEmail1.find('#rot2').show();
                    deletedEmail1.find('#envelope').css('top', '128px');
                    deletedEmail1.find('#frontcontents').css({
                    	'position': 'absolute',
                    	'top': '128px'
                    });
                }
                else {
                	deletedEmail1.find('#frontcontents').css('top', '0px');
                }

                //deletedEmail.css('z-index', curr_index);
                csstrash1.top = trash_y - 128 - 239 + 'px';
                csstrash1.left = trash_x + 34 - 355 + 'px';
                deletedEmail1.css(csstrash1);
                csstrash1.top = trash_y - 128 - 239 - 50 + 'px';
                csstrash1.left = trash_x + 34 - 355 - 75 + 'px';
                deletedEmail1.animate(csstrash1, 500);

                deletedEmail1.draggable({
                	disabled:false,
                    drag: function () {
                        lastDragged = $(this);
                    },
                    containment: "#emailContents",
                    scroll: false
                });
            });
        }
    });



    //initialize the replyEmail node
	initReplyEmail($("#composeEmail"));

}

/** this reverts the envelope's html to the default state.
 * if clearHanlders is true it will clear all click,mousedown, mouseup, etc handlers on the
 * envelope. */
function setEmailToDefaultState(email, clearHandlers) {
	email = $(email);
	email.find("#rot2").hide();
	email.find("#frontcontents").css('position', 'absolute');
	email.find('#envelope').attr('src', 'images/mail/envelope.png');
	email.find('#envelope').css('top', '0px');
	email.find("#frontcontents").css('top', '0px');

	/*you would do this so that when re-rendering the emails (ie when a new email arrives)
	you don't end up with multiple events being fired. */
	if(clearHandlers) {
		email.unbind('mousedown');
		email.unbind('mouseup');
		email.find('.close').unbind('click');
		email.find('.throwaway').unbind('click');
		email.find('.reply').unbind('click');

		email.draggable("destroy");
	}
	else {
		email.draggable({
			drag: function () {
				lastDragged = $(this);
			},
			containment: "parent",
			scroll: false,
			disabled:false
		});
	}
}

/**
 * This inits all the email nodes and data, and animates the emails.
 */
function showEmails() {
	if(emailModule.fetchingEmails ) {
		//do nothing if in the middle of a fetch
		return;
	}
        var isAnyDraftExists=false;
	//updateEmails(); //if there are new emails waiting, this will update the data
        //append the prefetched emails
        appendPrefetched(emailModule.prefetchedEmails);

	//init positions of the trash and tray
	$('#emailContents').show();
	var pos = $('#trash').position();
	trash_x = pos.left;
	trash_y = pos.top;
	pos = $('#emailTray').position();
	csstray.left = (pos.left + 23) + 'px';
	csstray.top = (pos.top) + 'px';
	trayedEmailBaseTop = pos.top+5;	//base 'top' value for trayed emails


	var mail = $('#mail');
	var pos = mail.position();

    var top = pos.top;
    var left = pos.left;
    var margin = mail.css('margin');
    var margin = parseInt((margin.substring(0, margin.length - 2)));
    var width = mail.css('width');
    var width = parseInt((width.substring(0, width.length - 2)));

    var emailArea = $('#emailContents');
    var emailAreaWidth = emailArea.width();
    var emailAreaHeight = emailArea.height();

    var cssop = {
        top: '0px',
        left: '0px'
    };


    $('#mailbox').attr("src", "images/mail/mailbox_o.png");

	if(emailModule.noEmail) {
		//do nothing if there is no email
		return;
	}


window.animationLock=true;
setTimeout(function(){window.animationLock=false;console.log("released");},1220)
    top = 0;
    margin = MARGIN;
    left = 0;
    cssop.top = top + margin + 130 + 'px';
    cssop.left = left + margin + 175 + 'px';
    $('.emailWrapper').css(cssop);
    var cnta = 0;
    var counter=0;
    //fixing the issue when emails are put in tray, back in mailbox, and shown again (jacob)
    //They are pushed back to the trayEmails arrays, so reset them here.
    trayptr = -1;
    trayEmailsFlag = new Array();
    trayEmails = new Array();

    $(".emailWrapper").each(function () {
        $(this).find('.mailinbox').show();
        cssop.top = top + margin + 130 + 'px';
        cssop.left = left + margin + 175 - (cnta % 5) * 3 - buttonwidth - MARGIN + 'px';
        cnta++;
        $(this).css(cssop);
    });
    
    $(".emailWrapper").each(function () {
        counter++;

        var type = $(this).attr('t');
        var oc = $(this).attr('r');
        if (type == 'trash') {
            $(this).show();
            var cnt = 0;
            $(this).find('.mailinbox').hide();
            var flag123 = undefined;
            var z123 = $(this).css('z-index');
            if (oc == "read") {
                flag123 = 1;
            } else flag123 = undefined;
            $(this).draggable({
                disabled: true
            });
            $(this).find('.envcontents').find('#envelope').css('left', '0px');
            $(this).find('.envcontents').find('#envelope').css('top', '0px');
            $(this).find('.envcontents').find('#envelope').attr('src', 'images/mail/trash_ball.png');
            $(this).find('.envcontents').show();
            $(this).find('.envcontents').find('#envelope').show();
            $(this).find('#frontcontents').css('display', 'none');


            $(this).animate({'left':'+=500px'},200, function() {
            	animateEmailToTrash($(this));
            });
        } else if (type == 'tray') {

            $(this).show();
            $(this).find('.mailinbox').hide();
            trayptr++;
            trayEmails[trayptr] = $(this);
            if (oc == "read") {
                $(this).find('#rot2').hide();
                $(this).find('#envelope').attr('src', 'images/mail/tray_envelope1.png');
                trayEmailsFlag[trayptr] = 1;
            } else {
                $(this).find('.envcontents').find('#envelope').attr('src', 'images/mail/tray_envelope2.png');
                trayEmailsFlag[trayptr] = 0;
            }
            $(this).find('.envcontents').find('#envelope').parent().show();

            $(this).draggable({
                disabled: true
            });
            $(this).find('.envcontents').find('#envelope').css('left', '0px');
            $(this).find('.envcontents').find('#envelope').css('top', '40px');
            $(this).find('#frontcontents').css('display', 'none');
            csstray.top = (trayedEmailBaseTop - 3*trayEmails.length) + 'px';
            $(this).css('z-index', Z_TRAYED+trayEmails.length);
                $(this).animate(csstray, 1200);
        } else if (type == 'INBOX') {
        	//animate emails in the INBOX
            $(this).show();
            
            $(this).css('z-index', Z_ENVELOPE);
            var sub = 0;
            if (trayptr > -1) sub = trayptr + 1;
            if (deletedEmail != undefined) sub = sub + 1;
            $(this).animate({
                left: '+=' + '150',
                top: '+=' + '60'
            }, 500, function () {
                $(this).find(".mailinbox").hide();
                $(this).find(".envcontents").show();
                if ($(this).attr('in') == 'c') $(this).find("#frontcontents").show();
                else {
                    //    alert('hello');
                    $(this).find("#frontcontents").hide();
                }
                if (oc == 'read') {
                    $(this).find("#rot2").show();
                    $(this).find("#frontcontents").css('position', 'absolute');
                    $(this).find('#envelope').attr('src', 'images/mail/envelope.png');
                    $(this).find('#envelope').css('top', '128px');
                    $(this).find("#frontcontents").css('top', '128px');
                }

                $(this).css('top', getInt($(this).css('top')) - 100 + 'px');

                //calculate a random final position for the envelopes
                //the extra numbers are margins
                var x = randomXToY(50, emailAreaWidth-2*ENVELOPE_WIDTH);
                var y = randomXToY(20, emailAreaHeight-ENVELOPE_HEIGHT-200);
                $(this).animate({
                    left: x + 'px',
                    top: y + 'px'
                }, 1000);
            });
        } else if(type=="Drafts"){
            isAnyDraftExists=true;
            $(this).show();
            
            $(this).css('z-index', Z_ENVELOPE);
            var sub = 0;
            if (trayptr > -1) sub = trayptr + 1;
            if (deletedEmail != undefined) sub = sub + 1;
            $(this).animate({
                left: '+=' + '150',
                top: '+=' + '60'
            }, 500, function () {
                $(this).find(".mailinbox").hide();
                /*$(this).find(".envcontents").show();
                if ($(this).attr('in') == 'c') $(this).find("#frontcontents").show();
                else {
                    //    alert('hello');
                    $(this).find("#frontcontents").hide();
                }
                if (oc == 'read') {
                    $(this).find("#rot2").show();
                    $(this).find("#frontcontents").css('position', 'absolute');
                    $(this).find('#envelope').attr('src', 'images/mail/envelope.png');
                    $(this).find('#envelope').css('top', '128px');
                    $(this).find("#frontcontents").css('top', '128px');
                }

                $(this).css('top', getInt($(this).css('top')) - 100 + 'px');

                //calculate a random final position for the envelopes
                //the extra numbers are margins
                var x = randomXToY(50, emailAreaWidth-2*ENVELOPE_WIDTH);
                var y = randomXToY(20, emailAreaHeight-ENVELOPE_HEIGHT-200);
                $(this).animate({
                    left: x + 'px',
                    top: y + 'px'
                }, 1000);
            */
                var contact=getContactWithEmail($(this).find('#emailToAddress').html());
                 if(!contact)
                 contact={email:  $(this).find('#emailToAddress').html(),
                    name:function() {
                        return this.email.split('@')[0];
                    },
                    draftEmailIndex:$(this).attr('emailIndex')
                    
                 };
                 //Here we treat this as a reply email.

                 contact.draftEmailIndex=$(this).attr('emailIndex');


                 writeEmailToUnknown(contact,$(this).find('.\\$body').text());
            });
         
         
        }
        
    });
    //If no drafts from earlier sessions but draft from current session
    if(!isAnyDraftExists && emailModule.writingEmail)
            $('#composeEmailFacade').show();

}


/**
 * Calls the email controller to delete the email, sets the ui to be a balled-up paper, and
 * animates the email to the trash can.
 * @param emailWrapper
 */
function trashEmail(emailWrapper) {
    var p = emailWrapper.find('#letter');	//the #letter node

    //if the email is a real email it will have an emailIndex, so delete it on the server.
    //the method won't delete emails with undefined emailIndex.
    if(deleteEmail(emailWrapper.attr('emailIndex'))==false) {
    	return;
    }

    var css23 = {
        top: '0px',
        left: '2px'
    };
    css23.left = viewportwidth - 488 + 'px';
    css23.top = viewportheight - 600 + 'px';
    emailWrapper.animate(css23, 500, function () {
        emailWrapper.attr('in', 'c');
        //console.log($(p).parent().parent().attr('class')+":"+z+","+$(p).parent().parent().find('.envcontents').find('#rot3').css('z-index')+","+p.css('z-index'));
        $(p).find('#message').hide();
        $(p).find('#paper').attr('src', 'images/mail/paper2.png');
        $(p).find('#paper').animate({
            'width': '305px',
            'height': '230px'
        }, 0, function () {
            $(p).find('#paper').css('width', '305px');
            $(p).find('#paper').css('height', '230px');
        });
        $(p).animate({
            'left': '25px',
            'top': '-90px'
        }, 0, function () {
            //$(p).css('z-index', z + 1);
            $(p).animate({
                'top': '132px'
            }, 0, function () {
                $(p).parent().parent().find('.envcontents').rotate3Di('-180', 0, {
                    sideChange: mySideChange1,
                    complete: myComplete2_1
                });
            });
            emailWrapper.css('z-index', Z_TRASHING);
            emailWrapper.draggable('disable');
            emailWrapper.find('.envcontents').find('#envelope').css('left', '0px');
            emailWrapper.find('.envcontents').find('#envelope').css('top', '0px');
            //$(emailWrapper).css('z-index', z + 2);
            emailWrapper.find('.envcontents').find('#envelope').attr('src', 'images/mail/trash_ball.png');
            emailWrapper.css("left",getInt(emailWrapper.css('left'))+120+'px');
            emailWrapper.attr('t', 'trash');
            emailWrapper.find('#rot2').css('display', 'none');
            emailWrapper.find('#frontcontents').css('display', 'none');
            emailWrapper.draggable(false);


            /*
             * The code is setup so that if there is an email in the trash, this next one will take
             * its place. The last one can still be undeleted.
             */

            if(deletedEmail) {
            	deletedEmail.css('display', 'none');
            	deletedEmail.attr('t', 'deleted');
            }
            deletedEmail = emailWrapper;

            animateEmailToTrash(emailWrapper);
        });
    });
}

/** animates an email moving into the trash */
function animateEmailToTrash(emailWrapper) {
    var cssTrash = {
    		top: (trash_y) + 'px',
    		left: (trash_x+30) + 'px'
    }

    emailWrapper.animate(cssTrash, 1000);
}

/** sets the click handler for the 'keep' button */
function initKeepButtons() {
    $('.close').click(function () {
        var emailWrapper = $(this).parents('.emailWrapper');
        putEmailInTray(emailWrapper);
        log('keep was clicked');
    });
}

function putEmailInTray(emailWrapper) {
    if(archiveEmail($(emailWrapper).attr('emailIndex'))==false) {
    	return;
    }

    var paper = emailWrapper.find('#letter');
    emailWrapper.attr('in', 'c')


    if(!paper.is(':visible')) { //just move envelope into tray
    	paper.css('z-index', 12);
    	var envelope = emailWrapper.find('.envcontents');
		mySideChange1.call(envelope, false);
		finishPutInTray.call(envelope);
	}
    else { //put paper back in envelope, spin it around, move into tray
    	paper.find('#message').hide();
    	paper.find('#paper').attr('src', 'images/mail/paper2.png');
    	paper.find('#paper').animate({
    		'width': '305px',
    		'height': '230px'
    	}, 650, function () {
    		paper.find('#paper').css('width', '305px');
    		paper.find('#paper').css('height', '230px');
    	});
    	paper.animate({
    		'left': '25px',
    		'top': '-90px'
    	}, 650, function () {
    		//this function puts the letter back in envelope

    		//TODO really should fix this instead of hard-coding (when time permits) -jacob
    		paper.css('z-index', 12);

    		paper.animate({
    			'top': '132px'
    		}, 300, function () {
    			//this function rotates the envelope and puts it in tray
    			emailWrapper.find('.envcontents').rotate3Di('-180', 300, {
    				sideChange: mySideChange1,
    				complete: finishPutInTray
    			});
    		});
    	});
    }
}






/* This is called for every mouse click on a letter: to turn envelop over and read email, click reply/keep/trash. */
function envelopeMousedown() {
	//log('emailWrapper mousedown', this);
	var wrapper = $(this);

	/* uncomment if envelopes should come to the surface
	$('.selectedEmail').css('z-index', Z_ENVELOPE).removeClass('selectedEmail');
	wrapper.css('z-index', Z_CLICKED_ENVELOPE);
	wrapper.addClass('selectedEmail')
	*/

    if ($(this).find('.envcontents').find('#envelope').attr('src') == 'images/mail/tray_envelope1.png' ||
    		$(this).find('.envcontents').find('#envelope').attr('src') == 'images/mail/tray_envelope2.png') {
        if (trayptr != -1) {
			var trayEmail = trayEmails.pop()
			var isOpen = trayEmailsFlag.pop();
			trayptr--;
			trayEmail.attr('t', 'INBOX');
        	animateEnvelopeMovingOutOfTray(trayEmail, (isOpen==1));
        }
    }
}

function animateEnvelopeMovingOutOfTray(trayEmail, isOpen) {
     var css = {
         position: 'absolute',
         top: trash_y - 128 + 'px',
         left: '0px'
     };
     trayEmail.draggable({
         disabled: false
     });

     trayEmail.animate(css, 500, function () {
     	//first animate the small envelope moving out of tray
         trayEmail.find('.envcontents').find('#envelope').attr('src', 'images/mail/envelope.png');
         trayEmail.find('#frontcontents').show();
         if (isOpen) {
             trayEmail.find('.envcontents').find('#rot2').show();
             trayEmail.find('#envelope').css('top', '128px');
             trayEmail.find('#frontcontents').css('position', 'absolute');
             trayEmail.find('#frontcontents').css('top', '128px');
         } else {
             trayEmail.find('#envelope').css('top', '0px');
             trayEmail.find('#frontcontents').css('top', '0px');
         }

         //set initial position of the large envelope
         trayEmail.css('z-index', Z_ENVELOPE);
         trayEmail.css('top', (trash_y - 128 - 239) + 'px');

         //animate the envelope floating up
         css.top = '-=' + (10 + trayptr*5) + 'px';
         css.left = '+=' + (trayptr*5) + 'px';
         trayEmail.animate(css, 500, function() {
         });
     });
}

/**
 * This gets called for all clicks on the envelope, to turn it over, click reply/trash/keep, etc
 */
function envelopeMouseup() {
	//note: curr_index is most likely just the z-index, but since this isn't work i'm taking it out (jacob)
	var curr_index = Z_ENVELOPE;

	//log('emailWrapper mouseup');
	var wrapper = $(this);
	//wrapper.css('z-index', curr_index);


	//if the envelope is NOT in the trash or in the tray
    if (wrapper.find('.envcontents').find('#envelope').attr('src') != 'images/mail/trash_ball.png' &&
    		wrapper.find('.envcontents').find('#envelope').attr('src') != 'images/mail/tray_envelope1.png' &&
    		wrapper.find('.envcontents').find('#envelope').attr('src') != 'images/mail/tray_envelope2.png') {
        var flag123;
        var pos = wrapper.position();
        var left = pos.left;
        var top = pos.top;


        var _lastDragged = lastDragged; //lastDragged is set in the drag event for each envelope
        lastDragged = null;	//clear the lastDragged

        if (!_lastDragged) {
            //if the user clicked the envelope without moving it (left edges are same on mousedown as mouseup)
            //then turn the envelope over to read it

            var p = wrapper;
            var position = p.position();
            var L = position.left;
            var T = position.top;
            var isOverlapped = 0;
            var isCurrent = 0;
            //if (wrapper.css('z-index') == curr_index) isCurrent = 1;
            var t = '';
            var nowzi = wrapper.css('z-index');
            var overlapped = '';

            wrapper.css('z-index', Z_LETTER + numViewingLetters++);
            wrapper.attr('r', 'read');
            var maxLeft = 0;
            //move to side
            $('.emailWrapper').each(function () {
                var p1 = $(this);
                var position1 = p1.position();
                var zCheck = $(this).css('z-index') + ',';
                if (maxLeft < position1.left && overlapped.indexOf(zCheck) != -1) maxLeft = position1.left;
            });
            var nowleft = wrapper.css('left');
            markAsRead(wrapper.attr('emailIndex'));   //send update to server


        	//fetch email body if not yet loaded.. Useful when you turned on ondemand loading
        	var emailBody = wrapper.find('.\\$body');
        	if(emailBody.html().indexOf('Please') == 0) {
        		getEmailBody(wrapper.attr('emailIndex'), emailBody);
        	}
                
        	// i think this 'if' is the code to turn over an envelopes (jacob)
            if (isOverlapped == 1) {
                wrapper.animate({
                    left: '' + (maxLeft + 335)
                    //top: '-='+300
                }, "slow", function () {
                    var zIndex = 0;
                    /*
                    var nowz = $(this).css('z-index');
                    $('.emailWrapper').each(function () {
                        if ($(this).css('z-index') > nowz) $(this).css('z-index', $(this).css('z-index') - 1);
                    });
                    $(this).css('z-index', curr_index);
                    */
                    $(this).find('#envelope').rotate3Di('180', 300, {
                        sideChange: mySideChange,
                        complete: myComplete
                    });
                    $(this).find('#rot2').rotate3Di('180', 300, {
                        //complete: finishPutInTray
                    });
                    $(this).find('#frontcontents').css('display', 'none');
                });
                $(this).animate({
                    left: '' + (nowleft)
                    //	top: '+='+300
                }, "slow");
                $(this).attr('in', 'o');
            } else {
                // if not overlapped, no animation - just change the z-index
                var zIndex = 0;

                if (wrapper.css('z-index') == curr_index) {
                    wrapper.find('#envelope').rotate3Di('180', 300, {
                        sideChange: mySideChange,
                        complete: myComplete
                    });
                    wrapper.find('#rot2').rotate3Di('180', 300, {
                        //complete: finishPutInTray
                    });
                    wrapper.find('#frontcontents').css('display', 'none');
                } else {
                	/*
                    var nowz = wrapper.css('z-index');
                    $('.emailWrapper').each(function () {
                        if ($(this).css('z-index') > nowz) $(this).css('z-index', $(this).css('z-index') - 1);
                    });
                    wrapper.css('z-index', curr_index);
                	 */
                    wrapper.find('#envelope').rotate3Di('180', 300, {
                        sideChange: mySideChange,
                        complete: myComplete
                    });
                    wrapper.find('#rot2').rotate3Di('180', 300, {
                        //complete: finishPutInTray
                    });
                    wrapper.find('#frontcontents').css('display', 'none');
                }
                wrapper.attr('in', 'o');
            }
        }
        else {
            var height = 240 + (wrapper.attr('r')=='read' ? 119 : 0);
            wrapper.css('height', height);
            var width = wrapper.outerWidth();

            //this is called when a user drags an envelope over the trash
            if (left + 275 > trash_x && top > trash_y - 64 - 240 - 20 &&
            		wrapper.find('.envcontents').find('#envelope').attr('src') == 'images/mail/envelope.png') {
            	trashEmail(wrapper);
            	return;
            }
            else if (nodesOverlap(wrapper, $('#emailTray'), true)) {
            	//called to drop envelope into tray
            	//console.log('emailWrapper mouseup tray code(??)');
                putEmailInTray(wrapper);
                return;
            }
        }
    }
}

/**
 * Utility to determine if 2 jquery dom objects overlap.
 * If 'fullyCovered' is passed and set true this method only returns true if n1 completely covers n2.
 */
function nodesOverlap(n1, n2, fullyCovered) {
	var p1 = n1.position();
	var w1 = n1.outerWidth();
	var h1 = n1.outerHeight();
	var p2 = n2.position();
	var w2 = n2.outerWidth();
	var h2 = n2.outerHeight();

	if((p1.left<p2.left && p1.left+w1>p2.left+w2) && (p1.top<p2.top && p1.top+h1>p2.top+h2)) {
		//n1 fully covers n2
		return true;
	}
	else if(!fullyCovered &&
			//n1 and n2 overlap partially
			(
				(p1.left>=p2.left && p1.left<=p2.left+w2) ||
				(p1.left+w1>=p2.left && p1.left+w1<=p2.left+w2)

			) &&
			(
				(p1.top>=p2.top && p1.top<=p2.top+h2) ||
				(p1.top+h1>=p2.top && p1.top+h1<=p2.top+h2)

			)
		) {
		return true;
	}
	else {
		return false;
	}
}


/**
 * Displays the the node to compose an email. If emailIndex is sent this will reply to that email.
 * @param emailIndex	the emailIndex attribute of the email being replied to (optional)
 */
function showComposeEmail(emailIndex) {
	emailWrapper = $("#composeEmail");
        setReplyEmailToDefaultState();
        var time=10000;
	//clear the text areas
	//$('#emailSubjectText').val('');
	$('#inputpaper').val('');

        emailModule.writingEmail=true;
	if(emailIndex!==undefined) {
		if(emailModule.emails[emailIndex].folder == "Drafts") { //make note that this is a draft from a previous session
                    emailWrapper.attr('t', "draft");
                    emailModule.replyIndex = emailIndex;
                    emailModule.draftCreated=true;
                    window.draftTimer=setTimeout("refreshDraft()",window.refreshDraftRate);
                }
                else {
                    emailModule.replyIndex = emailIndex;			//make note of the email being replied to
                    emailWrapper.attr('t', "reply");
                    var name = getSenderNameForEmail(emailIndex);
                    if(!name)
                        name=emailModule.emails[emailIndex].from.split('@')[0];
                    $('#composeEmailTo').html(name);
                    window.draftTimer=setTimeout("createDraft()",window.createDraftTime);

                }
	}
	else {
		emailModule.replyIndex = undefined;				//make note we are NOT replying to an email
		emailWrapper.attr('t', "new");
                window.draftTimer=setTimeout("createDraft()",window.createDraftTime);
	}
	emailWrapper.css('z-index', Z_LETTER + numViewingLetters++);
	emailWrapper.draggable({
        drag: function () {
            lastDragged = emailWrapper;
        },
        containment: "#emailContents",
        scroll: false
    });

    var type = emailWrapper.attr('t');
    var oc = emailWrapper.attr('r');

    emailWrapper.show();
    emailWrapper.find(".mailinbox").hide();
    emailWrapper.find(".envcontents").show();
    if (emailWrapper.attr('in') == 'c') emailWrapper.find("#frontcontents").show();
    else {
        emailWrapper.find("#frontcontents").hide();
    }
    if (oc == 'read') {
        emailWrapper.find("#rot2").show();
        emailWrapper.find("#frontcontents").css('position', 'absolute');
        emailWrapper.find('#envelope').attr('src', 'images/mail/envelope.png');
        emailWrapper.find('#envelope').css('top', '128px');
        emailWrapper.find("#frontcontents").css('top', '128px');
    }

    /* the way i tried to fix it
    var cssop = {
    		//left : viewportwidth + 'px',
    		left: '550px',
    	    top: (emailWrapper.position().top-100) + 'px');
    };
    emailWrapper.animate(cssop, 0, function () {
    */
    var cssop = {
            top: '0px',
            left: '0px'
    };
    emailWrapper.css('top', getInt(emailWrapper.css('top')) - 100 + 'px');
    cssop.left = viewportwidth + 'px';
    cssop.top = 10 + 'px';

    emailWrapper.animate(cssop, 0, function () {
        emailWrapper.find('#frontcontents').css('display', 'none');
        emailWrapper.find('#envelope').rotate3Di('180', 0, {
            sideChange: mySideChange,
            complete: myComplete_reply
        });
    });
    
}

//TODO should rename: technically used for composeEmail, not just reply
function initReplyEmail(emailWrapper) {
    var type = $(this).attr('t');
    var oc = $(this).attr('r');
} // end of initReplyEmail

function testSendAnimation() {
	showComposeEmail();
	$('.send').click();
}


/** function to close the mailbox and hide all email widgets */
function mailin() {

    var MARGIN = 25;
    var TOP = 0;
    var LEFT = 0;
    var WIDTH = 200;
    var a1 = $('#mail').css('top');
    var top = parseInt((a1.substring(0, a1.length - 2)));
    var left = $('#mail').css('left');
    var left = parseInt((left.substring(0, left.length - 2)));
    var margin = $('#mail').css('margin');
    var margin = parseInt((margin.substring(0, margin.length - 2)));
    var width = $('#mail').css('width');
    var width = parseInt((width.substring(0, width.length - 2)));
    var cssop = {
        top: '0px',
        left: '0px',
        position: 'absolute'
    };
    var ani = 1;
    var cnta = 0;
    if(emailModule.noEmail) {
        //if no mail, just change the mail box pic and fade out the tray and trash
        $('#mailbox').attr('src', 'images/mail/mailbox_c.png');
        $('#emailContents').delay(800).fadeOut(100);
        return;
    }
    window.animationLock=true;
    setTimeout(function(){window.animationLock=false;console.log("released");},920)
    $(".emailWrapper").each(function () {
        //alert(top+'jasldf'+$('a').css('margin'));
        cssop.top = 0 + 25 + 130 + 60 + 'px';
        cssop.left = 0 + 25 + 175 + 90 - 225 - (ani % 5) * 3 + 'px';
        ani++;
        //alert(cssop.left);

        $(this).animate(cssop, 300, function () {
            $(this).find('.mailinbox').show();
            $(this).find('#frontcontents').hide();
            $(this).find('.envcontents').hide();
            $(this).find('#rot2').hide();
            cnta++;
            if (cnta == $(".emailWrapper").length) {
                var cnt = 0;
                $(".emailWrapper").each(function () {
                    //alert($(this).find('#envelope').attr('src'));
                    $(this).animate({
                        left: '+=' + '-90',
                        top: '+=' + '-60'
                    }, 400, function () {
                        cnt++;
                        if (cnt == $(".emailWrapper").length) {
                            $('.emailWrapper').hide();
                            $('#mailbox').attr('src', 'images/mail/mailbox_c.png');
                            /*
                            $('#mailbox_cont').append(mcimg);
                            $('#mailbox_cont').css('right', '0%');
                            */
                        }
                    });
                });
            }
        });
    });
 
    $('#composeEmailFacade').hide();
    //hide the tray, trash, etc
    $('#emailContents').delay(800).fadeOut(100);
}


//--- functions take from index.jsp --------------------------------------

/** called when a node is flipped and the side has changed.
 * among other places, it's called when an email is opened, and 'reply' gets clicked.*/
function mySideChange(front) {
	//log('mysidechange  xx');
    var p = $(this).parent().parent();
    var z = p.css('z-index');
    if (front) {} else {
    	//log('mySideChange doing something');
        //$(this).parent('.envcontents').parent('.emailWrapper').find('#frontcontents').css('display', 'none');
        var a1 = $(this).parent('.envcontents').parent().css('top');
        var b1 = parseInt((a1.substring(0, a1.length - 2)));
        $(this).attr('src', 'images/mail/fullback2_2.png');
        p.find('.envcontents').find('#rot2').css('left', '-1px');
        if (p.find('#rot2').css('display') == 'none') {
        	$(this).parent('.envcontents').parent('.emailWrapper').css('top', b1 - 128 + 'px');
        }
        $(this).css('top', '128px');
    }
}

/**
 *
 * This is a callback for when the user clicks 'keep' and the envelope rotates, when
 * user presses 'send' to send an email, and when 'throw away' is clicked.
 */
function mySideChange1(front) {
	//log('mysidechange1', this);
    if (front) {}
    else {
        //alert('hello');
        //$(this).css('display','none');
        $(this).find('#letter').css('display', 'none');
        $(this).find('#rot3').css('display', 'none');
        $(this).find('#rot2').css('left', '0px');
        $(this).find('#envelope').attr('src', 'images/mail/envelope.png');
    }
}

function myComplete1() {
    var p = $(this).parent().parent();
    //       p.find('#frontcontents').show();
    //        $(this).css('display','none');
    p.find('.envcontents').find('#rot3').css('z-index', 'auto');
    p.find('.envcontents').find('#letter').css('z-index', 'auto');
    p.find('.envcontents').find('#rot1').css('z-index', 'auto');
    p.find('.envcontents').css('z-index', 'auto');
}

/**
 * Called when 'throw away' is clicked
 */
function myComplete2_1() {
    //alert('hello');
    var p = $(this);
    var emailWrapper = $(this).parent();
    if (p.find('#letter').css('display') == 'none') {
        p.parent().find('#frontcontents').show();
        $(p).parent().find('#frontcontents').css('position', 'absolute');
        $(p).parent().find('#frontcontents').css('top', '128px');
    }
/*

 //       p.find('#frontcontents').show();
//        $(this).css('display','none');
p.find('.envcontents').find('#rot3').css('z-index','auto');
        p.find('.envcontents').find('#letter').css('z-index','auto');
             p.find('.envcontents').find('#rot1').css('z-index','auto');
             p.find('.envcontents').css('z-index','auto');*/
    $(this).rotate3Di('unflip', 1);
    $(this).find('#envelope').rotate3Di('unflip', 1);
    $(this).find('#rot2').rotate3Di('unflip', 1);
}

/**
 * Callback method to finish putting an envelope to the tray.
 */
function finishPutInTray() {
	//note: 'this' will be the envcontents div
    var p = $(this);
    var emailWrapper = $(this).parent();
    if (p.find('#letter').css('display') == 'none') {
        p.parent().find('#frontcontents').show();
        $(p).parent().find('#frontcontents').css('position', 'absolute');
        $(p).parent().find('#frontcontents').css('top', '128px');
    }
    setTimeout(function () {
        trayptr++;
        trayEmails.push(emailWrapper);

        if (emailWrapper.find('#rot2').css('display') != 'none') {
            emailWrapper.find('#rot2').css('display', 'none');
            emailWrapper.find('#envelope').attr('src', 'images/mail/tray_envelope1.png');
            trayEmailsFlag[trayptr] = 1;
        } else {
            emailWrapper.find('#envelope').attr('src', 'images/mail/tray_envelope2.png');
            trayEmailsFlag[trayptr] = 0;
        }
        emailWrapper.draggable({
            disabled: true
        });
        emailWrapper.find('#envelope').css( {
        	'left': '0px',
        	'top' : '40px'
        });
        emailWrapper.attr('t', 'tray');
        emailWrapper.find('#frontcontents').css('display', 'none');


        csstray.top = (trayedEmailBaseTop - 3*trayptr) + 'px';
        emailWrapper.animate(csstray, 1000);
        emailWrapper.css('z-index', Z_TRAYED+trayEmails.length);
    }, 300);
/*

 //       p.find('#frontcontents').show();
//        $(this).css('display','none');
p.find('.envcontents').find('#rot3').css('z-index','auto');
        p.find('.envcontents').find('#letter').css('z-index','auto');
             p.find('.envcontents').find('#rot1').css('z-index','auto');
             p.find('.envcontents').css('z-index','auto');*/
    $(this).rotate3Di('unflip', 1);
    $(this).find('#envelope').rotate3Di('unflip', 1);
    $(this).find('#rot2').rotate3Di('unflip', 1);
}


/**
 * This is called at the end of the 'send' email animation to put the envelope
 * into the truck and truck drives off.
 */
/**
 * This is called at the end of the 'send' email animation to put the envelope
 * into the truck and truck drives off.
 */
function myComplete2_reply() {
    var p = $(this);	//this is class="envcontents
    var emailWrapper = $(this).parent();
    emailWrapper.draggable({
        disabled: true
    });

    //close flap, flip over envelope, display some info on front
                               $(emailWrapper).animate({'top':'-50px','left':'550px'},1000,function(){

                               $(emailWrapper).find('#frontcontents').hide();
                               $(emailWrapper).find('.envcontents').find('#envelope').attr('src','images/mail/truck_env.png');
                               $(emailWrapper).animate({'top':'-70px','left':'475px'},1000,function(){
                                   $('#truck').animate({'left': $(window).width() + 'px'},3000,function(){
                                    $(this).hide();
                                   });
                                    $(this).hide();
                               });

                               });
                    if(p.find('#letter').css('display')=='none')
                        {
                    p.parent().find('#frontcontents').show();

        $(p).parent().find('#frontcontents').css('position','absolute');
        $(p).parent().find('#frontcontents').css('top','128px');
                        }

              $(this).find('#rot2').hide();
              $(this).rotate3Di('unflip',1);
              $(this).find('#envelope').rotate3Di('unflip',1);
              $(this).find('#rot2').rotate3Di('unflip',1);

}

function myComplete2_reply_original() {
    //alert('hello');
                    var p=$(this);
                    var polaroid=$(this).parent();

                               $( polaroid ).draggable({disabled: true});
                               $(polaroid).animate({'top':'-50px','left':'350px'},1000,function(){

                               $(polaroid).find('#frontcontents').hide();
                               $(polaroid).find('.envcontents').find('#envelope').attr('src','mail/truck_env.png');
                               $(polaroid).animate({'top':'-70px','left':'275px'},1000,function(){
                                   $('#truck').animate({'left': $(window).width() + 'px'},3000,function(){
                                       $(this).remove();
                                   });
                                   $(this).remove();


                               });

                               });
                    if(p.find('#letter').css('display')=='none')
                        {
                    p.parent().find('#frontcontents').show();

        $(p).parent().find('#frontcontents').css('position','absolute');
        $(p).parent().find('#frontcontents').css('top','128px');
                        }

/*

 //       p.find('#frontcontents').show();
//        $(this).css('display','none');
p.find('.envcontents').find('#rot3').css('z-index','auto');
        p.find('.envcontents').find('#letter').css('z-index','auto');
             p.find('.envcontents').find('#rot1').css('z-index','auto');
             p.find('.envcontents').css('z-index','auto');*/
        $(this).find('#rot2').hide();
            $(this).rotate3Di('unflip',1);
              $(this).find('#envelope').rotate3Di('unflip',1);
              $(this).find('#rot2').rotate3Di('unflip',1);
}


function myComplete() {
    
    var p = $(this).parent().parent();
    var z123 = p.css('z-index');
    var z = parseInt(z123);
    if (p.find('#rot3').css('display') == 'none') {
        p.find('#rot3').css('z-index', z + 2);
        p.find('#rot3').show();
        p.find('#letter').css('z-index', z + 1);
        p.find('#letter').show();
        p.find('#letter').find('#message').css('display', 'none');
        p.find('#rot1').css('z-index', z + 3);
        if (p.find('#rot2').css('display') == 'none') {
            p.find('#rot1').show();
            p.find('#rot1').animate({
                width: '355px',
                height: '30px'
            }, 300, function () {
                p.find('#rot1').hide();
                //p.find('#rot2').css('left','-1px');
                p.find('#rot2').show();
                p.find('#letter').css('width', '500px');
                p.find('#letter').find('#paper').show();
                p.find('#letter').animate({
                    'top': '-90px'
                }, 300, function () {
                    $(this).css('z-index', z + 5);
                    $(this).find('#paper').attr('src', 'images/mail/paper.png');
                    $(this).find('#paper').css('width', '305px');
                    $(this).find('#paper').css('height', '230px');
                    $(this).css('height', '230px');
                    $(this).css('width', '305px');
                    $(this).find('#paper').animate({
                        'width': '488px',
                        'height': '648px'
                    }, 650, function () {
                        //p.find('#envcontents').find('#message').css('z-index',z+9) ;
                        $(this).parent().find('#message').show();
                        $(this).parent().find('#message').css('top', '0px');
                        $(this).parent().find('#message').css('width', '430px');
                    });
                    $(this).animate({
                        'top': '10px',
                        'left': '-69px'
                    }, 600, function () {
                        var csso = {
                            'top': '0px',
                            'left': '10px'
                        };
                        csso.top = '10px';
                        csso.left = 175 + (randomXToY(1, 10)) * 10 + 'px';
                        $(p).animate(csso, 1000);
                    });
                });
            });
        } else {
            p.find('#rot1').hide();
            p.find('#rot2').show();
            p.find('#letter').css('width', '500px');
            p.find('#letter').find('#paper').show();
            p.find('#letter').animate({
                'top': '-90px'
            }, 300, function () {
                $(this).css('z-index', z + 5);
                $(this).find('#paper').attr('src', 'images/mail/paper.png');
                $(this).find('#paper').css('width', '305px');
                $(this).find('#paper').css('height', '230px');
                $(this).css('height', '230px');
                $(this).css('width', '305px');
                $(this).find('#paper').animate({
                    'width': '488px',
                    'height': '648px'
                }, 650, function () {
                    //p.find('#envcontents').find('#message').css('z-index',z+9) ;
                    $(this).parent().find('#message').show();
                    $(this).parent().find('#message').css('top', '0px');
                    $(this).parent().find('#message').css('width', '430px');
                });
                $(this).animate({
                    'top': '10px',
                    'left': '-69px'
                }, 600, function () {
                    var csso = {
                        'top': '0px',
                        'left': '10px'
                    };
                    csso.top = '10px';
                    csso.left = 175 + (randomXToY(1, 10)) * 10 + 'px';;
                    $(p).animate(csso, 1000);
                });
            });
        }
    }
}

/**
 * this gets called when a reply email is initialized to show up on the screen. why it's being rotated etc is beyond me (jacob)
 */
function myComplete_reply() {
    var p = $(this).parent().parent();
    var z = p.css('z-index');
    if (p.find('#rot3').css('display') == 'none')
    {
        //alert($('#composeEmail').attr('t'));
    	//log('mycomplete_reply doing something');
        p.find('#rot3').css('z-index', z + 2);
        // p.find('#rot3').show();
        p.find('#letter').css('z-index', z + 1);
        p.find('#letter').show();
        p.find('#letter').find('#message').css('display', 'none');
        p.find('#rot1').css('z-index', z + 3);

        if (p.find('#rot2').css('display') == 'none') {
        	//animate displaying the letter

            p.find('#rot1').animate({
                width: '355px',
                height: '30px'
            }, 0, function () {
                p.find('#rot1').hide();
                p.find('#letter').css('width', '500px');
                p.find('#letter').find('#paper').show();
                p.find('#rot3').show();
                p.find('#rot2').show();
                p.find('#letter').animate({
                    'top': '-90px'
                }, 0, function () {
                    $(this).css('z-index', z + 5);
                    $(this).find('#paper').attr('src', 'images/mail/paper.png');
                    $(this).find('#paper').css('width', '305px');
                    $(this).find('#paper').css('height', '230px');
                    $(this).css('height', '230px');
                    $(this).css('width', '305px');
                    $(this).find('#paper').animate({
                        'width': '488px',
                        'height': '648px'
                    }, 0, function () {
                        $(this).hide();
                        $(this).parent().find('#inputpaper').show();
                        $(this).parent().find('#message').show();
                        //$(this).parent().find('#message').css('top', '0px');
                        //$(this).parent().find('#message').css('width', '430px');
                    });
                    $(this).animate({
                        'top': '10px',
                        'left': '-69px'
                    }, 0, function () {
                        var csso = {
                            'top': '0px',
                            'left': '10px'
                        };
                        var time=0;
                        if(!window.isIos) {
                            $('#composeEmail').css('left',window.width+"px");
                            $('#composeEmail').show();
                            time=1000;
                        }
                        csso.top = COMPOSE_MAIL_TOP+'px';
                        csso.left = COMPOSE_MAIL_LEFT+200+'px';
                        
                        
                        
                        
                        if($('#composeEmail').attr('t')=="draft") {
                            console.log("draft reco*****");
                            time=0;
                            csso.left = COMPOSE_MAIL_LEFT+'px';
                        }
                            
                        
                        
                        //the letter's final position

                        $(p).animate(csso,time, function () {
                          //  $(this).parent().find('#inputpaper').focus();
                          
                          $(this).hide();
                          if(!window.isIos) {
                               $('#composeEmailFacade').show();
                               $('#inputpaperFacade').focusEnd();
                               $('#composeEmailFacade').draggable();
                          }
                        });
                    });
                });
            });
        } else {
            
        	//no idea what this is (jacob)
            p.find('#rot1').hide();
            p.find('#rot2').show();
            p.find('#letter').css('width', '500px');
            p.find('#letter').find('#paper').show();
            p.find('#letter').animate({
                'top': '-90px'
            }, 300, function () {
                $(this).css('z-index', z + 5);
                $(this).find('#paper').attr('src', 'images/mail/paper.png');
                $(this).find('#paper').css('width', '305px');
                $(this).find('#paper').css('height', '230px');
                $(this).css('height', '230px');
                $(this).css('width', '305px');
                $(this).find('#paper').animate({
                    'width': '488px',
                    'height': '648px'
                }, 650, function () {
                    //p.find('#envcontents').find('#message').css('z-index',z+9) ;
                    $(this).parent().find('#message').show();
                    //$(this).parent().find('#message').css('top', '0px');
                    //$(this).parent().find('#message').css('width', '430px');
                });
                $(this).animate({
                    'top': '10px',
                    'left': '-69px'
                }, 600, function () {
                    var csso = {
                        'top': '0px',
                        'left': '10px'
                    };
                    csso.top = '10px';
                    csso.left = 350 + (randomXToY(1, 10)) * 10 + 'px';;
                });
            });
        }
    }
}
function stickyMailbox() {
	log("******STICKY");
        if(emailModule.fetchingEmails ) {
		//do nothing if in the middle of a fetch
		return;
	}
        emailModule.state="STICKY";
        var prevLen=emailModule.emails.length;
	//updateEmails(); //if there are new emails waiting, this will update the data
        //append the prefetched emails
        //appendPrefetched(emailModule.prefetchedEmails);
        initPrefetchedEmails();
	//init positions of the trash and tray
	/*$('#emailContents').show();
	var pos = $('#trash').position();
	trash_x = pos.left;
	trash_y = pos.top;
	pos = $('#emailTray').position();
	csstray.left = (pos.left + 23) + 'px';
	csstray.top = (pos.top) + 'px';
	trayedEmailBaseTop = pos.top+5;	//base 'top' value for trayed emails


	var mail = $('#mail');
	var pos = mail.position();

    var top = pos.top;
    var left = pos.left;
    var margin = mail.css('margin');
    var margin = parseInt((margin.substring(0, margin.length - 2)));
    var width = mail.css('width');
    var width = parseInt((width.substring(0, width.length - 2)));

    var emailArea = $('#emailContents');
    var emailAreaWidth = emailArea.width();
    var emailAreaHeight = emailArea.height();




    $('#mailbox').attr("src", "images/mail/mailbox_o.png");

	if(emailModule.noEmail) {
		//do nothing if there is no email
		return;
	}*/

    var cssop = {
        top: '0px',
        left: '0px'
    };
//window.animationLock=true;
//setTimeout(function(){window.animationLock=false;console.log("released");},1220)
var emailNodes = $('.emailWrapper');var cnta = 0;
    var counter=0;
emailModule.stuckListStart=prevLen;
for(var i=prevLen;i<emailModule.emails.length;i++) {
    var top = 0;
    var margin = MARGIN;
    var left = 0;
    cssop.top = top + margin + 130 + 'px';
    cssop.left = left + margin + 175 + 'px';
    $(emailNodes[i]).css(cssop);

    //fixing the issue when emails are put in tray, back in mailbox, and shown again (jacob)
    //They are pushed back to the trayEmails arrays, so reset them here.
    trayptr = -1;
    trayEmailsFlag = new Array();
    trayEmails = new Array();

    
        $(emailNodes[i]).find('.mailinbox').show();
        cssop.top = top + margin + 110 + 'px';
        cssop.left = left + margin + 145 - (cnta % 5) * 3 - buttonwidth - MARGIN + 'px';
        cnta++;
        $(emailNodes[i]).css(cssop);
        $(emailNodes[i]).css(cssop).show();
        $(emailNodes[i]).mousedown(stickyEmailClick);
        $(emailNodes[i]).draggable("disable");
        $(emailNodes[i]).find('.mailinbox').show();
    
}
}
function stickyEmailClick(event) {
    event.preventDefault();
    log("stickyEmailClick");
    clickModuleButton("emailModule");    
}
function showStuckEmails() {
window.animationLock=true;
setTimeout(function(){window.animationLock=false;console.log("released");},1220);
emailModule.state="NORMAL";
var emailNodes = $('.emailWrapper');var counter=0;
    var emailArea = $('#emailContents');
    var emailAreaWidth = emailArea.width();
    var emailAreaHeight = emailArea.height();
for(var i=emailModule.stuckListStart;i<emailModule.emails.length;i++) {

        //Stuck Emails always belong to INBOX
        console.log("******"+i);
        counter++;

        var type = $(emailNodes[i]).attr('t');
        var oc = $(emailNodes[i]).attr('r');

        	//animate emails in the INBOX
            $(emailNodes[i]).show();
            
            $(emailNodes[i]).css('z-index', Z_ENVELOPE);
            var sub = 0;
            if (trayptr > -1) sub = trayptr + 1;
            if (deletedEmail != undefined) sub = sub + 1;
            $(emailNodes[i]).animate({
                left: '+=' + '150',
                top: '+=' + '60'
            }, 500, function () {
                $(this).find(".mailinbox").hide();
                $(this).find(".envcontents").show();
               
                if ($(this).attr('in') == 'c') $(emailNodes[i]).find("#frontcontents").show();
                else {
                    //    alert('hello');
                    $(this).find("#frontcontents").hide();
                }
                if (oc == 'read') {
                    $(this).find("#rot2").show();
                    $(this).find("#frontcontents").css('position', 'absolute');
                    $(this).find('#envelope').attr('src', 'images/mail/envelope.png');
                    $(this).find('#envelope').css('top', '128px');
                    $(this).find("#frontcontents").css('top', '128px');
                }

                //$(this).css('top', getInt($(emailNodes[i]).css('top')) - 100 + 'px');
                $(this).find("#frontcontents").show();
                //calculate a random final position for the envelopes
                //the extra numbers are margins
                var x = randomXToY(200, emailAreaWidth-2*ENVELOPE_WIDTH);
                var y = randomXToY(200, emailAreaHeight-ENVELOPE_HEIGHT-200);
                $(this).animate({
                    left: x + 'px',
                    top: y + 'px'
                }, 1000, function () {
                    
                    //lets unbind and bind again the handlers
                    
                    $(this).unbind("mousedown");
                    $(this).draggable({
                        drag: function () {
                            lastDragged = $(this);
                        },
                        containment: "parent",
                        scroll: false,
                        disabled:false
                    });
                
                    //$('.throwaway').unbind("click");
                    $(this).mousedown(envelopeMousedown);
                    $(this).mouseup(envelopeMouseup);
                    $('.close').unbind("click");
                    initKeepButtons();
                    //initReplyButtons();
                    
                    
                });
            });
 
    }
}
function createDraft() {
    	log("creatingDraft...");
        //We remember only one draft... so lets get rid of all previous other drafts
                $('.emailWrapper').each(function() { //lets mark the corresponding email node as deleted
                   if($(this).attr('t')== "Drafts")
                       $(this).attr('t','deleted');
                });   
        
        emailModule.draftCreated=true;
        var to=null;
        var body=$('#inputpaperFacade').val();
        //Lets try to get the destination info from emailModule.replyIndex or 
        //emailModule.contact
        if(emailModule.replyIndex!=undefined) {
                if(emailModule.emails[emailModule.replyIndex].folder!="Drafts")
                    to=emailModule.emails[emailModule.replyIndex].from;

        }
        else if(emailModule.contact)
                to=   emailModule.contact.email;
        //createDraft will empty the draft folder and then crate a new draft
        if(to) {
            var request = {
                            action:'createDraft', 
                            to:to,
                            body:body

            };
            emailModule.prevDraftVersion=body; // so we don't have to refresh if nothing has changed
            sendRequest('email', request,function(response){
                
                if(emailModule.draftCreated) //incase the draft is discarded,so we don't have to refresh
                    window.draftTimer=setTimeout("refreshDraft()",window.refreshDraftRate);
            });
        
        }
}
function refreshDraft() {
    	
        log("entering refreshPhase");
        
        var to=null;
        var body=$('#inputpaperFacade').val();
        if(body==emailModule.prevDraftVersion) { //Nothing has changed
            window.draftTimer=setTimeout("refreshDraft()",window.refreshDraftRate);
            return;
        }
        emailModule.prevDraftVersion=body;
        log("refreshingDraft...");
        //Lets try to get the destination info from emailModule.replyIndex or 
        //emailModule.contact
        if(emailModule.replyIndex!=undefined) {
                if(emailModule.emails[emailModule.replyIndex].folder!="Drafts") //a draft created this session
                    to=emailModule.emails[emailModule.replyIndex].from;
                else {
                    to=emailModule.emails[emailModule.replyIndex].to; //a draft created earlier, we have the destination in "TO itself"
                    emailModule.emails[emailModule.replyIndex].body=body; //lets updated our local copy too..
                }
        }
        else if(emailModule.contact)
                to=   emailModule.contact.email;

        if(to && emailModule.draftCreated) {
            var request = {
                            action:'refreshRecentDraft', 
                            to:to,
                            body:body

            };
            sendRequest('email', request,function(response){
                if(emailModule.draftCreated) //incase the draft is discarded,so we don't have to refresh
                    window.draftTimer=setTimeout("refreshDraft()",window.refreshDraftRate);
            });
        
        }    
}

//This is used to get rid of a draft created for a reply email after it is sent or thrown away
function discardDraft(index) {
            
            clearTimeout(window.draftTimer);
            
            if(emailModule.draftCreated) {
                var request = {
                                action:'deleteRecentDraft'
                };
                sendRequest('email', request); 
                emailModule.draftCreated=false;
            }
            if(index!=undefined) {//if there is a node for this in emailModule.emails, lets mark it as deleted
                $('.emailWrapper').each(function() { //lets mark the corresponding email node as deleted
                   if($(this).attr('emailIndex')== index)
                       $(this).attr('t','deleted');
                });   
                emailModule.replyIndex = undefined;
            }
                
}
//TODO: get rid of  this at end of reply and throwaway reply handlers, because we do this anyway in showComposeEmail
function setReplyEmailToDefaultState() {
            
   var p = $('#composeEmail').find('.envcontents');	//this is class="envcontents
    var emailWrapper = $(p).parent();
    emailWrapper.draggable({
        disabled: true
    });
                    if(p.find('#letter').css('display')=='none')
                        {
                    p.parent().find('#frontcontents').show();

        $(p).parent().find('#frontcontents').css('position','absolute');
        $(p).parent().find('#frontcontents').css('top','128px');
                        }

        $(p).find('#rot2').hide();
            $(p).rotate3Di('unflip',1);
              $(p).find('#envelope').rotate3Di('unflip',1);
              $(p).find('#rot2').rotate3Di('unflip',1);
              $(p).find('#rot3').css('display','none');
    

}
