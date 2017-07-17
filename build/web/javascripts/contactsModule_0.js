/**
 * This module is responsible for fetching and setting up the contacts.
 * 
 * Each contact object has:
 * -firstName
 * -lastName
 * -email
 * -profilePicture()	//a method returning an url to the image
 * -name()				//a method returning the full name
 */

function initContactsModule() {
	
        
        sendRequest("account", {action:"getContacts"}, function(response){
		log('fetching contacts');
		userData.contacts = response.contacts;
                
		jKarmaAddFunction(userData.contacts, 'profilePicture', profilePicture);
		jKarmaAddFunction(userData.contacts, 'name', name);
		log('done fetching contacts');
                log('all contacts :::  '+userData.contacts);
		window.contactBookPreviousState ={isPerson:'false' ,personIndex:-1,currentPage:0,lastPage:0};
                userData.contacts.sort(sortByFirstName);
                paginateContacts(userData.contacts);
		                
                
	});


}

/**
 * Displays the contacts that start with the chars in letters (note: must be uppercase). 
 * @param letters	array of uppercase chars
 * @param node
 */



function clearUp() {
    $('#contacts').css('border','none');
    $("#contactInstruction").html("");
    $('#addressBook').find("#Header").show();
    $("#contactArrow").hide();
    $('#aContact').hide();
    $('.flap').hide();    
    
}

function selectContact(index) {
       //Save state -- but Gregg said not for this contact book. so we don't save
        window.contactBookPreviousState.isPerson='false';
        window.contactBookPreviousState.personIndex=-1;
        
        $('#backToListing').show();
        var contact=userData.contacts[index];
        displayContact(contact);

}

function showContacts() {
	$('#contactTrash').show();
        var addressBook = $('#addressBook');
	var pos = $('#contactsButton').position();
	addressBook.css({
		top: (pos.top+50) + 'px',
		left: pos.left+20 + 'px',
		height: '143px',
		width: '120px',
		opacity: 0
	});
	addressBook.show();
	addressBook.animate({
        'left': '350px',
        'top': '20px',
        'width': '550px',
        'height': '650px',
        opacity: 1
    });
    $('#Header').show();
    $('#EmailInstructions').hide();
    if(window.contactBookPreviousState.isPerson=='true')
       displayContact(window.contactSubset[window.contactBookPreviousState.personIndex]);
    else 
        selectContacts();
  
}
function showContactsFromEmail() {
	$('#contactTrash').show();
        var addressBook = $('#addressBook');
	var pos = $('#contactsButton').position();
	addressBook.css({
		top: (pos.top+50) + 'px',
		left: pos.left+20 + 'px',
		height: '143px',
		width: '120px',
		opacity: 0
	});
	addressBook.show();
	addressBook.animate({
        'left': '350px',
        'top': '20px',
        'width': '550px',
        'height': '650px',
        opacity: 1
    });
    clearUp();
    $('#Header').hide();
    $('#noContacts').hide();
    $('#contacts').hide();
    $('#person').hide();
    $('#flaps .selectedContact').removeClass('selectedContact');
    $('#EmailInstructions').show();
    $('#EmailInstructions').find("#gotoAddressBook").show();
}
