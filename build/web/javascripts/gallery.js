/**
	javascript carousel-style picture gallery
	Copyright 2011, Jacob Mouka
	Dual licensed under the MIT or GPL Version 2 licenses.
	
	Usage: create a new gallery object with a parent node and an array of urls:
		var urls = { .... };
		var gallery = new Gallery('#pictureGallery', urls);
	
	@param parentNode	a jQuery selector, node, or html node, that is the parent for the gallery
	@param pictures		array of ulrs
*/
function Gallery(parentNode, pictures,animationTime,transparency) {
	var parent = $(parentNode);//jQuery object that is the parent for gallery
	var pixCss;				//array of css with the positions/sizes of the pictures
	var pixZ;				//array of z-indexes for the pictures (managed separately to make the animations look better)
	var numPictures = 5;	//number of pictures being displayed
        var zoomedInIndex =undefined;
	var middleIndex = (numPictures-1)/2; //index of the picture in the forefront
	var opacity=transparency;
	var isAnimating = false;
        var animateTime=animationTime;
	/** array of ImageObject objects, an inner 'class' */
	var imageData = null;
	
	generateCss();
        init(pictures);
        //position zoom at bottom right corner
        parent.append("<div id='zoom' style='left:"+parseInt(parent.width()-110)+"px;top:"+parseInt(parent.width()*3/4-310)+"px'> <img src='images/album/glass.png' id='zoomOut'></div>");
        $('#zoom').bind('click',zoomHandler);
	/**
	Generates the css (size and position) for the picture. 
	*/
	function generateCss() {
		var width = parseInt(parent.width()*2/3);
		var height = parseInt(width*3/4);
		var left = parseInt((parent.width()-width)/2);

                $('#galleryTitle').css("width",parseInt(width*1/4)+'px');
                $('#galleryTitle').css("height",parseInt(left-5)+'px');



		pixCss = new Array();
		pixZ = new Array();
		pixCss[(numPictures-1)/2] = {
			width: width + 'px',
			height: height + 'px',
			left: left + 'px',
			top: '0px'
		}
		var fullHeight = height;
                var t;
		for(var i=(numPictures-3)/2; i>=0;  i--) {
			width = parseInt(width*0.7);
			height = parseInt(height*0.7);
                        
			t = parseInt((fullHeight-height)/2);
                        
			left = parseInt(left*0.3);
			pixCss[i] = {
				width: width + 'px',
				height: height + 'px',
				left: left + 'px',
				top: t + 'px'
			}
			pixCss[numPictures-1-i] = {
				width: width + 'px',
				height: height + 'px',
				left: parent.width()-left-width + 'px',
				top: t + 'px'
			}
		}
                
		/*
		pixCss[0] = jQuery.extend({}, pixCss[1]);
		pixCss[numPictures-1] = jQuery.extend({}, pixCss[numPictures-2]);
		*/
		
		for(var i=0; i<numPictures; i++) {
			pixZ[i] = (i<=(numPictures-1)/2 ? i : numPictures-i-1) + 1;
		}

	}
	
	function init(pictures) {
		for(var i=0; i<pictures.length; i++) {
			parent.append(
				"<div class='galleryPicture'>"
				+ "<img>"
				+ "<div class='pictureNumber'>" + (i+1) + "</div>"
				+ "</div>");
			//parent.append("<img class='galleryPicture'>");
			//parent.append("<img id='cachedImage' style='display:none;'>");
		}

		//alert(parseInt(parent.height()));
                imageData = new Array();
		var htmlNodes = $('.galleryPicture');
		
		var cssIndex = middleIndex;
		for(var i=0; i<pictures.length; i++) {
			//log('cssIndex', cssIndex);
			var imageObj = new ImageObject(pictures[i], $(htmlNodes[i]), i, cssIndex);
			if(cssIndex+1<pixCss.length) {
				cssIndex++;
			}
			imageObj.node.css(pixCss[imageObj.cssIndex]);
			if(middleIndex+i > pixCss.length) {
				imageObj.hide();
				imageObj.node.css('z-index', 0);
			}
			else if(middleIndex+i==pixCss.length) {
				//pre-load the next image. it will be covered up by the last one
				imageObj.show();
				imageObj.node.css('z-index', 0);
			}
			else {
				imageObj.show();
				imageObj.node.css('z-index', pixZ[imageObj.cssIndex]);
			}
			imageObj.node.click(getClickHandler(i));
			imageData.push(imageObj);
                        

		}
	}
	function zoomHandler() {
            if(zoomedInIndex!=undefined)
                toggleFullscreen(imageData[zoomedInIndex]);
            return false;
        }
	/**
		The imageData objects manage the state and loading of the images. The object definition is
			url: 			//the url for the image
			node: 			//jQuery node for this image
			index: 			//index in the imageData array
			cssIndex:		//current index into pixCss, which is essentailly the node's position on the screen
			isRightOfCenter://true if the node is right of center, false if left
			imageIsLoaded:	//boolean
			isVisible:		
			show()			//shows the node and loads its image if needed
			hide()			//hides the node
	*/	

	function ImageObject(url, node, index, cssIndex) {
		this.url = url;
		this.node = node;
		this.index = index;
		this.cssIndex = cssIndex;
		this.isRightOfCenter = true;
		this.imageIsLoaded = false;
		this.isVisible = false;
				
		this.show = function(arg) {
//			log('showing', this.index);
			this.isVisible = true;
			this.node.show(arg);
			if(!this.imageIsLoaded) {
				this.node.find('img').attr('src', this.url);
                                this.node.find('img').css('opacity',opacity);
				this.imageIsLoaded = true;
				//log('loading image for indes' , imageObj.index);
				//TODO check if width/height is more that 3/4, and change image class to be wide
			}
		};
		this.hide = function(arg) {
//			log('hiding', this.index);
			this.isVisible = false;
			this.node.hide(arg);
		};

	}
	
	function getClickHandler(index) {
		return function() {
			pictureClick(index);
		}
	}
	
	function pictureClick(index) {

                //var animateTime=350;
                if(isAnimating===false) {
			isAnimating = true;
			var data = imageData[index];
			if(data.cssIndex==middleIndex) {
				toggleFullscreen(data);
			}
			else {
                                if(zoomedInIndex!=undefined)
                                       toggleFullscreen(imageData[zoomedInIndex]);
				var delta = (data.isRightOfCenter ? -1 : 1);
//				var steps = Math.abs(middleIndex - data.cssIndex);
//				for(var step=0; step<steps; step++) {
					var start = Math.max(0, data.index-data.cssIndex);
					var end = Math.min(imageData.length, data.index+pixCss.length-data.cssIndex);
					
					var imageObj;
					//this loop must animate all visible pictures, and hide the ones being covered
					for(var i=start; i<end; i++) {
						imageObj = imageData[i];
						if(imageObj.cssIndex+delta >=0 && imageObj.cssIndex+delta<pixCss.length) {
							imageObj.cssIndex += delta;
//							imageObj.node.css('z-index', pixZ[imageObj.cssIndex]);
//							imageObj.node.animate(pixCss[imageObj.cssIndex], 500, 'linear');
							imageObj.node.animate(pixCss[imageObj.cssIndex], animateTime, zIndexUpdate(imageObj.node, pixZ[imageObj.cssIndex]));
						}
						else {
							//hiding is at the right spot
							//log('hiding', i);
							imageObj.isVisible = false;
							imageObj.node.css('z-index', 0);
							imageObj.node.delay(animateTime).hide(1);
						}
						imageObj.isRightOfCenter = imageObj.cssIndex > middleIndex;
					}
					// show next picture at top of stack
					if(delta===-1 && end<imageData.length) {
						imageData[end].show();
//						imageData[end].node.css('z-index', 1);
                                                setTimeout(zIndexUpdate(imageData[end].node, 1), animateTime);
					}
					else if(delta===1 && start-1>=0) {
						imageData[start-1].show();
						imageData[start-1].node.css('z-index', 1);
					}
					//verifyOrder(start, end);
				}
//				index += delta;
//				data = imageData[index];
//			}
			isAnimating = false;
		}
	}
	
	function zIndexUpdate(node, z) {
		return function() {
			node.css('z-index', z);
		};
	}

	function verifyOrder(start, end) {
		var imageObj;
		for(var i=start, cssIndex=imageData[start].cssIndex; i<end; i++, cssIndex++) {
			imageObj = imageData[i];
			if(imageObj.cssIndex!==Math.min(cssIndex, pixCss.length-1)) {
				log('ERROR');
				log(start, end);
				log(i, imageObj);
				log(imageObj.cssIndex, 'should be ' + cssIndex);
			}
		}
	}
	
	this.debug = function () {
		log(pixCss);
		for(var i=0; i<imageData.length; i++) {
			log('index: ' + imageData[i].index + "\tcssIndex: " + imageData[i].cssIndex + "\tisVisible: " + imageData[i].isVisible);
		}
	}
	
	function toggleFullscreen(data) {
		if(!data.savedSize) {
			data.savedSize = data.node.position();
			data.savedSize.width = data.node.width();
			data.savedSize.height = data.node.height();
			
			var docHeight = $(document).height();
			var docWidth = $(document).width();
			var width = docWidth - 80; //80 is margin
			var height = docHeight - 60; // 60 is margin
			
			//pictures are in 3/4 aspect, so if screen is taller than this we maximize to width, else maximize to height
			if(docHeight/docWidth > 3/4) {
				height = parseInt(docWidth * data.savedSize.height/data.savedSize.width);
			}
			else {
				width = parseInt(docHeight*data.savedSize.width/data.savedSize.height);
			}
			left = Math.max(0, parseInt((docWidth - width)/2));
			var zoom = {
				height: height + 'px',
				width: width + 'px',
				top: 10-parent.offset().top + 'px',
				left: left -parent.offset().left + 'px'
			}
			data.node.animate(zoom, 500);
			zoomedInIndex=data.index;
                        $("#zoom").show();
		}
		else {
			data.node.animate({
				height: pixCss[(numPictures-1)/2].height,
				width: pixCss[(numPictures-1)/2].width,
				left: pixCss[(numPictures-1)/2].left,
				top: pixCss[(numPictures-1)/2].top
			}, 500);
                        zoomedInIndex=undefined;
			data.savedSize = undefined;
                        $("#zoom").hide();
		}
	}
}