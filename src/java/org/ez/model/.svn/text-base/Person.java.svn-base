package org.ez.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;


@Entity
@JsonIgnoreProperties(ignoreUnknown=true)
public class Person {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String firstName;
	private String lastName;
	private String email;
	
	/** eg a jabber url */
	private String chatId;
	
	@ManyToOne
	private User user;

	@ManyToOne
	private BinaryData profilePicture;
	
	@JsonProperty
	public boolean hasProfilePicture() {
		return profilePicture != null;
	}
	
	public boolean equals(Object obj) {
		if(obj==null || obj.getClass()!=Person.class) {
			return false;
		}
		else if(obj==this) {
			return true;
		}
		else {
			return this.id==((Person)obj).id;
		}
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

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getChatId() {
		return chatId;
	}

	public void setChatId(String chatId) {
		this.chatId = chatId;
	}

	@JsonIgnore
	public BinaryData getProfilePicture() {
		return profilePicture;
	}

	public void setProfilePicture(BinaryData profilePicture) {
		this.profilePicture = profilePicture;
	}

	@JsonIgnore
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	
	
}
