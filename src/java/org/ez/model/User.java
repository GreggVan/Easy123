package org.ez.model;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.ez.data.AccountType;
import org.ez.data.LoginType;

/**
 * This is a user account.
 * @author jmouka
 *
 */

@Entity
@JsonIgnoreProperties(ignoreUnknown=true)
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String firstName;
	private String lastName;

	
	/** This is a direct-login key, appened to a url */
	private String userKey;
	
	private String username;
	/**user's password */
	private String password;
	
	private String assistantPassword;
	
	
	@OneToMany (mappedBy="user", fetch=FetchType.EAGER)
	private Set<Account> accounts;
	
	@OneToMany (mappedBy="user", fetch=FetchType.EAGER)
	private Set<Person> contacts;

	private String chatId;
	private String chatPassword;
	
	/** an optional authentication method*/
	private boolean passwordRequired;
        private int contactBookType; 
        private int screensaverType;
        private String lang;
        private String filter;  //Email Filter
        
        private boolean emailFunction;
        private boolean albumFunction;
        private boolean contactsFunction;
        private String screensaverwaitTime;
	
	public boolean removeFromContacts(Person aContact) {
		Person p = getContact(aContact.getId());
		if(p!=null) {
			return contacts.remove(p);
		}
		return false;
	}
	
	/** Returns the Person object held by this person, found by id. */ 
	public Person getContact(Long anId) {
		Iterator<Person> it = getContacts().iterator();
		while(it.hasNext()) {
			Person p = it.next();
			if(p.getId().equals(anId)) {
				return p;
			}
		}
		return null;
	}
	public void addContact(Person contact) {
		if(contacts==null) {
			contacts = new HashSet<Person>();
		}
		contacts.add(contact);
	}

	public Account getAccount(AccountType type) {
		if(type==null) {
			return null;
		}
		Iterator<Account> it = getAccounts().iterator();
		while(it.hasNext()) {
			Account a = it.next();
			if(type.equals(a.getType())) {
				return a;
			}
		}
		return null;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}
	public String getLang() {
		return lang;
	}

	public void setLang(String lang) {
		this.lang = lang;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getUserKey() {
		return userKey;
	}

	public void setUserKey(String userKey) {
		this.userKey = userKey;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

       	public int getContactBookType() {
		return contactBookType;
	}

	public void setContactBookType(int type) {
		this.contactBookType = type;
	}
	public Set<Account> getAccounts() {
		if(accounts==null) {
			accounts = new HashSet<Account>();
		}
		return accounts;
	}

	public void setAccounts(Set<Account> accounts) {
		this.accounts = accounts;
	}

	public Set<Person> getContacts() {
		if(contacts==null) {
			contacts = new HashSet<Person>();
		}
		return contacts;
	}

	public void setContacts(Set<Person> contacts) {
		this.contacts = contacts;
	}

	public String getChatId() {
		return chatId;
	}

	public void setChatId(String chatId) {
		this.chatId = chatId;
	}

	public String getChatPassword() {
		return chatPassword;
	}

	public void setChatPassword(String chatPassword) {
		this.chatPassword = chatPassword;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getAssistantPassword() {
		return assistantPassword;
	}
        
	public void setFilter(String filter) {
		this.filter = filter;
	}

	public String getFilter() {
		return filter;
	}        

	public void setAssistantPassword(String assistantPassword) {
		this.assistantPassword = assistantPassword;
	}

	public boolean isPasswordRequired() {
		return passwordRequired;
	}

	public void setPasswordRequired(boolean passwordRequired) {
		this.passwordRequired = passwordRequired;
	}
        public boolean getEmailFunction() {
		return emailFunction;
	}

	public void setEmailFunction(boolean emailFunction) {
		this.emailFunction = emailFunction;
	}

        public boolean getAlbumFunction() {
		return albumFunction;
	}

	public void setAlbumFunction(boolean albumFunction) {
		this.albumFunction = albumFunction;
	}
        
         public boolean getContactsFunction() {
		return contactsFunction;
	}

	public void setContactsFunction(boolean contactsFunction) {
		this.contactsFunction = contactsFunction;
	}
        
        public String getScreensaverwaitTime() {
		return screensaverwaitTime;
	}

	public void setScreensaverwaitTime(String screensaverwaitTime) {
		this.screensaverwaitTime = screensaverwaitTime;
	}
    public int getScreenSaverType() {
		return screensaverType;
	}

	public void setScreenSaverType(int screensaverType) {
		this.screensaverType = screensaverType;
	}

}
