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
		window.contactBookPreviousState ={isPerson:'false',personIndex:-1 , currentPage:0,lastPage:0, ch1:'A',ch2:'B',selectedNode:$('#flaps .flap')[0]};
                //isPerson - whether a person page is displayed eariler
                //personIndex -- if so store his index in personIndex
                //curPage  --  store the current Page
                //lastPage -- store max # of pages available
                // ch1,ch2,selectedNode, parameters to shortlistContacts functions

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
    //$('.flap').hide();    
    
}

function selectContact(index) {
        window.contactBookPreviousState.isPerson='true';
        window.contactBookPreviousState.personIndex=index;
        
        $('#backToListing').show();
        //var contact=userData.contacts[index];
        var contact=window.contactSubset[index];
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
    if(window.contactBookPreviousState.isPerson=='true'){
        displayContact(window.contactSubset[window.contactBookPreviousState.personIndex]);
    }    
    else 
        shortListContacts([window.contactBookPreviousState.ch1,window.contactBookPreviousState.ch2], window.contactBookPreviousState.selectedNode);
}
function showContactsFromEmail() {
	$('#flaps').show();
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
    //$('#flaps .selectedContact').removeClass('selectedContact');
    $('#EmailInstructions').show();
    $('#EmailInstructions').find("#gotoAddressBook").show();
}
function shortListContacts(letters, node) {
	$('#flaps .selectedContact').removeClass('selectedContact');
	$(node).addClass('selectedContact');
	$('#EmailInstructions').hide();
        $('#Header').show();
	var contacts = new Array();
	var contact;
	var firstLetter;
        if(userData.contacts==null)
            return;
	for(var i=0; i<userData.contacts.length; i++) {
		contact = userData.contacts[i];
		firstLetter = contact.firstName.toUpperCase().charAt(0);
		for(var j=0; j<letters.length; j++) {
			if(letters[j]===firstLetter) {
				contacts.push(contact);
				break;
			}
		}
	}
        console.log(contacts.length);
	if(contacts.length==0) {
		$('#contacts').hide();
		$('#noContacts').html('You have no contacts with first names starting with ' + letters.join(',')).show();
	}
	else {
            contacts.sort(sortByFirstName);
            paginateContacts(contacts);
            window.contactSubset=contacts;
            selectContacts();
	}
        window.contactBookPreviousState.isPerson='false';
        window.contactBookPreviousState.ch1=letters[0];
        window.contactBookPreviousState.ch2=letters[1];
        window.contactBookPreviousState.selectedNode=node;

}
