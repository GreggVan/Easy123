/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//common functions for all contact books -- UTILITY FUNCTIONS
function contactin() {
	$('#contactTrash').hide();
        var pos = $('#contactsButton').position();
	$('#addressBook').animate({
		top: pos.top+50 + 'px',
		left: pos.left+20 + 'px',
		width: '120px',
		height: '143px',
		opacity:0
	}, function() {
		$(this).hide();
	});
	   $('#composeEmailFacade').hide();
}
/** Added to the contact objects to return an url for its contact picture. */
function profilePicture() {
	if(this.hasProfilePicture) {
		return 'file?action=profile&id=' + this.id;
	}
	else {
		return "images/contacts/unknownUser.jpg";
	}
}

/** Added to the contact objects to return the full name*/
function name() {
	return this.firstName + ' ' + this.lastName;
}
function back() {
    var currentPage=window.contactBookPreviousState.currentPage;
    window.contactBookPreviousState.currentPage=currentPage-1;
    selectContacts();

}
function more() {
    var currentPage=window.contactBookPreviousState.currentPage;
    window.contactBookPreviousState.currentPage=currentPage+1;
    selectContacts();
}


function sortByFirstName(a, b) {
    var x = a.firstName.toLowerCase();
    var y = b.firstName.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}
function paginateContacts(contacts) {
   var pageNo=0;
   var pages=new Array();
   pages[pageNo]="<tr>";
   var total=contacts.length;
   for(var i=0;i<total;i++) {
        pages[pageNo]=pages[pageNo]+"<td style='padding-bottom:10px;'><div style='width:115px;'><a href='javascript:selectContact("+(i)+");' style='color:black;'><table><tr><td align='center'><div style='width:100px;overflow:hidden;background-color: #000000' class='contact_pic'><img style='height:100px' src='"+contacts[i].profilePicture()+"'></div></td></tr><tr><td align='center'><span class=''>"+contacts[i].name()+"</span></td></tr></table></a></div></td>";
        if((i+1)%3==0)
            pages[pageNo]=pages[pageNo]+"</tr><tr>";
        if((i+1)%9==0 && (i+1)<total) {
            
            pages[pageNo]=pages[pageNo]+"</tr>";
            pageNo++;
            pages[pageNo]="<tr>";    
        }
            
    }
    //alert(pageNo);
    window.pages=pages;
    window.contactBookPreviousState.lastPage=pageNo;
}

function selectContacts() {
     $('#EmailInstructions').hide();
    $('#backButton').hide();$('#moreButton').hide();  
    var curPage=window.contactBookPreviousState.currentPage;
    
    if(curPage<window.contactBookPreviousState.lastPage)
        $('#moreButton').show();
        
    if(curPage>0)
        $('#backButton').show();        
  
    $('#backToListing').hide();        
    //window.contactBookPreviousState.startFrom=i;    
    
    

    
    
    clearUp();
    
    $('#contacts').show();
    
    $('#noContacts').hide();
    $('#contactTable').html(window.pages[window.contactBookPreviousState.currentPage]);            
	
    if($('#person').is(':visible')) {
	$('#person').hide("slide", {direction: "right"}, 500);
    }
    if($('#personNotAvailable').is(':visible')) {
	$('#personNotAvailable').hide("slide", {direction: "right"}, 500);
    }    
   
}

function openAddressBook() {
    selectContacts();
}
function displayContact(contact) {
    console.log("contact :::  "+contact);
    console.log("contact email ::: " + contact.email);
   isavailable(contact);
}