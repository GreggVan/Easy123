window.albumModule = {
	albums: null,			//array of album objects
	gallery: null,			//the Gallery object,
	selectedAlbum: null,	//jquery object for the selected album (its icon)
	positionOfAlbum: null,	//when an album is clicked this saves it's position
	isLoaded: false
}


function initAlbumModule() {
	sendRequest("albums", {action:'getAlbums'}, function(response) {
		albumModule.albums = response.albums;
		albumModule.isLoaded = true;
		$('#albumLoading').html(window.languageData['albumLoading'].split('|')[1]);
                //lets initialize the screen saver
                window.screenTimer = setTimeout("showScreenSaver();",window.screenSaverWaitTime);
//		if(DEBUG) {
//			showAlbums();
//		}
	});

}

function showAlbums() {
	if(!albumModule.isLoaded) {
		return;
	}
        window.animationLock=true;
        setTimeout(function(){window.animationLock=false;console.log("released");},520)
	$('#albumContents').show();
	if(albumModule.albums && albumModule.albums.length>0) {
		jKarma.display('#anAlbum', albumModule.albums);
		
		//set initial position of each album to the button
		var pos = $('#albumButton').position();
		var contentsWidth = $('#albumContents').width(); 
		var css = {
				top: pos.top + 50 + 'px',
				left: pos.left + 100 - $('#albumContents').position().left + 'px',
				opacity: 0
		};
		var albumNodes = $('.anAlbum').css(css);
		
		//animate albums to a grid
		var top = 0;
		var left = 0;
		var width = albumNodes.outerWidth();
		var height = albumNodes.outerHeight();
                
                if(albumNodes.length==1) {
			var myTop=top+300;
                        $(albumNodes[0]).animate({top:myTop+'px', left:left+'px', opacity:1}, 100,function() {
                            showAlbum(albumModule.albums[0],$(albumNodes[0]).children()[0]);
                        });                    
                }
                else {
                    for(var i=0; i<albumNodes.length; i++) {
                            $(albumNodes[i]).animate({top:top+'px', left:left+'px', opacity:1}, 500);
                            left += width;
                            if(left + width > contentsWidth) {
                                    left = 0;
                                    top += height;
                            }
                    }
               }
	}
	else {
		$('#noAlbumsMessage').show();
		$('#anAlbum').hide();
	}
}

/**
 * This is called when user clicks on an album thumbnail
 * @param album			the album object
 * @param albumWrapper	the jquery node for the thumbnail
 */
function showAlbum(album, albumWrapper) {
	//log('show', album.name);
	var urls = new Array();
	for(var i=0; i<album.photos.length; i++) {
		urls.push(album.photos[i].url);
	}
	
	hideAlbum(); //hide the open album (if exists)
	
	var gallery = $('#albumGallery');
	albumModule.gallery = new Gallery(gallery, urls,350,1);
	var node = $(albumWrapper).parent();
	
	//remember the position of the album thumbnail
	albumModule.selectedAlbum = node;
	albumModule.positionOfAlbum = getSizeAndPosition(node);
	$('#galleryTitle').html(album.name);
	
	//move thumbnail and show gallery
	node.animate({
		top: '170px',
		left: '130px',
		width:'580px',
		height: '460px'
	}, 500, 'linear', function() {
		$(this).hide();
	});
	gallery.delay(300).fadeIn(200);
}

/** hides the currently-open (if exists) album. returns true if an album was open.*/
function hideAlbum() {
	if(albumModule.selectedAlbum) {
		$('#galleryTitle').html('');
		var gallery = $('#albumGallery');
		gallery.hide();
		gallery.html(''); //clear the current gallery
		
		albumModule.selectedAlbum
			.show()
			.animate(albumModule.positionOfAlbum, 500);
	
		albumModule.selectedAlbum = null;
		return true;
	}
	return false;
}

function hideAlbums() {

    window.animationLock=true;
    setTimeout(function(){window.animationLock=false;console.log("released");},920)

        if(hideAlbum()) {
		setTimeout(hideAlbums, 500);
	}
	else {
		var pos = $('#albumButton').position();
		var css = {
				top: pos.top + 50 + 'px',
				left: pos.left + 100 - $('#albumContents').position().left + 'px',
				opacity: 0
		};
		$('.anAlbum').animate(css, 500);
		setTimeout(function() {	$('#albumContents').hide(); }, 500);
	}
}

