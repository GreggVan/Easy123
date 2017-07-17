

function sendHandler(element) {
        
        
            
        var p = $(element).parent().parent(); //the #letter node
    	var emailWrapper = p.parent().parent();
    	var type = emailWrapper.attr('t');
    	//var z = emailWrapper.css('z-index');
        emailModule.writingEmail=false;
        //emailWrapper.find('#recepientAddress').html(emailModule.contact.firstName);
    	if(type=='new') {
    		sendEmail($('#inputpaper').val());
                discardDraft(); //clear drafts created in this session for this email
    	}
    	else if(type=='draft'){
    		sendEmail($('#inputpaper').val());
                discardDraft(emailModule.replyIndex);  // since we have sent the email, lets delete it..
    	}
        else {
                sendReply($('#inputpaper').val());
                discardDraft(); //clear drafts created in this session for this email
        }

        $("#truck").css('left', '-200px').show().animate({
            'left': '375px'
        }, 1000);

        emailWrapper.attr('in', 'c');
        p.find('#message').hide();

        //TODO this may need to be the wrapper
        p.find('#inputpaper').hide();

        p.find('#paper').show();
        p.find('#paper').attr('src', 'images/mail/paper2.png');
        p.find('#paper').animate({
            'width': '305px',
            'height': '230px'
        }, 650, function () {
            p.find('#paper').css('width', '305px');
            p.find('#paper').css('height', '230px');
        });
        p.animate({
            'left': '25px',
            'top': '-90px'
        }, 650, function () {
        	//this drops the paper into the envelope
        	p.css('z-index', p.css('z-index')-3);
            p.animate({
                'top': '132px'
            }, 300, function () {
            	//this flips the envelope over
                p.parent().parent().find('.envcontents').rotate3Di('-180', 300, {
                	sideChange: mySideChange1,
                	complete: myComplete2_reply
                });
            });
        });
}
/** adds a click handler for all the emails' reply button.
 */
function replyHandler(element) {
	//TODO possibly refactor to a simple method, and turn the buttons into hrefs with onclick="..."
        //alert("CLICK");

        
        var emailWrapper = $(element).parent().parent().parent().parent();
        //This is not a draft
        //init data for the 'reply' letter (jacob)
        if(window.isIos) {
            
            $('#composeEmailFacade').show();
            $('#composeEmailFacade').find('#composeEmailTo').html('');
            $('#inputpaper').val('');
            $('#inputpaperFacade').val('');
            $('#inputpaperFacade').focus();

            destination = emailWrapper.find('.\\$from').html();
            $('#recepientAddress').html(destination);
            $('#senderAddress').html(userData.name);

            emailWrapper.animate({'left':'0px'}, 0, function () {
                showComposeEmail(emailWrapper.attr('emailIndex'));
            });
        }
        else {
            $('#composeEmailFacade').hide();
            $('#composeEmailFacade').find('#composeEmailTo').html('');
            $('#inputpaper').val('');
        

            $('#inputpaperFacade').val('');
            //$('#inputpaperFacade').focus();

            destination = emailWrapper.find('.\\$from').html();
            $('#recepientAddress').html(destination);
            $('#senderAddress').html(userData.name);
            if(emailWrapper != null)
                emailWrapper.animate({'left':'0px','top':COMPOSE_MAIL_TOP+'px'}, 1000, function () {
                    showComposeEmail(emailWrapper.attr('emailIndex'));
                });
            
        }
}
function throwAwayHandler(element) {
        var emailWrapper = $(element).parents('.emailWrapper');
    	trashEmail(emailWrapper);
}
function throwAwayReplyHandler(element) {

        
        var p = $('#composeEmail'); //the #letter node
    	var emailWrapper = $('#composeEmail');
    	var type = emailWrapper.attr('t');
        emailModule.writingEmail=false;
        //reply and new types can be only created in this session 
        //draft types are only from previous sessions
        
        if(type=="reply" || type =="new")
            discardDraft(); //clear assoicated drafts created this session
        else if(type=="draft") {
            discardDraft(emailModule.replyIndex);
        }   



        var p = $(element).parent().parent();
        var q = p = $(p).parent().parent();
        var css23 = {
            top: '0px',
            left: '2px'
        };

        
        css23.left = viewportwidth - 288 + 'px';
        css23.top = viewportheight - 600 + 'px';
        $(q).animate(css23, 500, function () {
            var p = $(this).find("#letter");
            //var z=parseInt($(p).parent().parent().css('z-index'));
            // alert($(p).parent().parent().attr('class'));
            $(p).parent().parent().attr('in', 'c');
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
                var emailWrapper = $(p).parent().parent();
                var z123 = $(emailWrapper).css('z-index');
                var flag123 = 1;
                $(emailWrapper).draggable();
                $(emailWrapper).find('.envcontents').find('#envelope').css('left', '0px');
                $(emailWrapper).find('.envcontents').find('#envelope').css('top', '0px');
                //$(emailWrapper).css('z-index', z + 2);
                $(emailWrapper).find('.envcontents').find('#envelope').attr('src', 'images/mail/trash_ball.png');
                
                $(emailWrapper).attr('t', 'trash');
                $(emailWrapper).find('#rot2').css('display', 'none');
                $(emailWrapper).find('#frontcontents').css('display', 'none');
                $(emailWrapper).draggable(false);
                var csstrash1 = {
                    position: 'absolute',
                    top: (trash_y - 30) + 'px',
                	left: (trash_x + 260) + 'px'
                };
                $(emailWrapper).css('left', trash_x + 260 + 'px');
                if($('#addressBook').css('display')!="none") {
                    
                    csstrash1.left=screen.width-58+'px';
                    csstrash1.top=viewportheight+'px';
                    $(emailWrapper).css('left', screen.width-58+'px');
                }
               

                

                emailWrapper.animate(csstrash1, 1000, function() {
                	$(this).hide();
                });

            });
        });
}