/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function showScreensaver(){
    // screen saver goes here
    $('#screensaver').show();
    $('#screenSaverGallery').hide();
    $('#newMailText').hide();
    log("SCREEN SAVER");
    if(emailModule.numNewEmails!=undefined) 
        if(emailModule.numNewEmails>0) {
            
            moveRandom();
            return;
        }
    else  {  
        //$('#screenSaverGallery').show();
        $('#screensaver').fadeIn(5000, function() {
            var factor=1;
            $('#screenSaverGallery').css('position:absolute');
            $('#screenSaverGallery').css('z-index','2001');
            //$('#screenSaverGallery').css('width',(factor*viewportwidth+10) +'px');
            //$('#screenSaverGallery').css('height',factor*viewportheight +'px');

            $('#screenSaverGallery').css('align','center');

            window.screenTimer=setTimeout("showScreenSaverGallery()",window.refreshPhotoTime);
        //window.photoRefresher=setTimeout("showScreenSaverGallery()",2000);
        });
    }

}
 function clearScreensaver(e) {
    // undo screen saver here
    $('#screensaver').hide();
    // reset timer
    clearTimeout(window.screenTimer);
    clearTimeout(window.checkIfNewMailTimer);
    //schedule screenSaver after the wait time
    window.screenTimer = setTimeout("showScreensaver()",window.screenSaverWaitTime);
}
/********************************************/
/**
 * This is called when screen saver runs.
 * @param album			the album object
 * @param albumWrapper	the jquery node for the thumbnail
 */
function showScreenSaverGallery() {
	//log('show', album.name);
        
	/*var urls = new Array();
	for(var i=0; i<album.photos.length; i++) {
		urls.push(album.photos[i].url);
	}*/
	$('#screenSaverGallery').fadeOut(200,function() {
            window.checkIfNewMailTimer=setTimeout("checkIfNewMail()",window.checkTimeNewMails);
            $('#newMailText').hide();
            if(albumModule.albums!==null && albumModule.albums!=undefined) {
            console.log("*****"+i); 
            var album=0;
            if(albumModule.albums.length>1)
                album=album+1;
            var i=parseInt($('#screenSaverGallery').attr('photoIndex'));
            $('#screenSaverGallery').attr('photoIndex',(i+1)%albumModule.albums[album].photos.length);
            $('#screenSaverGallery').load(function(){
            //console.log($('#screenSaverGallery').width()+" "+$('#screenSaverGallery').height());
            var imgWidth=$('#screenSaverGallery').width();
            var imgHeight=$('#screenSaverGallery').height();
            console.log(imgWidth+"   "+imgHeight);
            imgWidth=viewportheight/imgHeight*imgWidth;            
            imgHeight=viewportheight;
                        
                
            
            $('#screenSaverGallery').css('left',(viewportwidth-imgWidth)/2 +'px');
            $('#screenSaverGallery').css('top',(viewportheight-imgHeight)/2 +'px');
            //$('#screenSaverGallery').css('width',imgWidth +'px');
            $('#screenSaverGallery').css('height','100%');
                
            }).attr('src',albumModule.albums[album].photos[i].url);
/*            var imgWidth=getInt($('#screenSaverGallery').width());
            var imgHeight=getInt($('#screenSaverGallery').height());*/
            //alert(viewportwidth+"   "+$('#screenSaverGallery').width());
            //$('#screenSaverGallery').css('align','center');
            
            $('#screenSaverGallery').fadeIn(window.refreshPhotoTime); 
            }
            window.screenTimer=setTimeout("showScreenSaverGallery()",window.refreshPhotoTime);
        });
	//var gallery1 = new Gallery(gallery, urls,3000,0.7);
	//var node = $(albumWrapper).parent();
	
	//remember the position of the album thumbnail
	//albumModule.selectedAlbum = node;
	//albumModule.positionOfAlbum = getSizeAndPosition(node);
	//$('#galleryTitle').html(album.name);
	
	//move thumbnail and show gallery
	/*node.animate({
		top: '170px',
		left: '130px',
		width:'580px',
		height: '460px'
	}, 500, 'linear', function() {
		$(this).hide();
	});*/
        
	//gallery.fadeIn(2000);
}

function checkIfNewMail(){
    if(emailModule.numNewEmails>0){
        clearTimeout(checkIfNewMailTimer);
        moveRandom();
    }
    else{
        window.checkIfNewMailTimer=setTimeout("checkIfNewMail()",window.checkTimeNewMails);
    }
}

function moveRandom(){
    
    $('#screenSaverGallery').hide();

    var x = Math.floor(Math.random()*$(document).width());
    var y = Math.floor(Math.random()*$(document).height());
    var documentHeight = $(document).height();
    var documentWidth = $(document).width();
    var mailStr = "You have "+ emailModule.numNewEmails + " new mail" ;
    if(emailModule.numNewEmails>1)
        mailStr +="s";
    $("#newMailText").html(mailStr);
    divHeight=$('#newMailText').height;
    divWidth = $('#newMailText').width();
    if(documentWidth-(x+divWidth)<0)
        x=0;
    if(documentHeight-(y+divHeight+100)<0)
        y=0;
    $('#newMailText').show();
    $("#newMailText").animate({top:y, left:x}, window.moveRandomTime );
    
    clearTimeout(window.screenTimer);
    
    window.screenTimer = setTimeout("moveRandom()",( window.moveRandomTime+500));
}