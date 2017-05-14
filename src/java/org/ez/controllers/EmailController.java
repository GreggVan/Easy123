package org.ez.controllers;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Part;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.UIDFolder;
import javax.mail.event.ConnectionEvent;
import javax.mail.event.ConnectionListener;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.ez.model.Account;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.smtp.SMTPTransport;

/**
This is an imap wrapper to control emails. It fetches from the inbox, archives to an archive
folder, and deletes/undeletes to a trash folder. The folder archive folder and trash names are passed
to the constructor (inbox is assumed "INBOX" (change in future as needed)). The archive folder
is created on-demand.

<p>

This class is thread-safe. It always checks if it's connected and calls connect as needed. Calling 
connect multiple times is fine as it checks its state.
 */

public class EmailController implements ConnectionListener {
	private static final Logger log = LoggerFactory.getLogger(EmailController.class);
	
	private static final String SMTP_HOST_NAME = "smtp.gmail.com";
	private static final int SMTP_PORT = 465;
	private static final boolean DEBUG = false;

	private String email;
	private String password;
	
	private static Session EMAIL_SESSION;
	private Store emailStore;
	private IMAPFolder inbox;
	
	/** emails are moved to this folder for archiving (aka tray) */
	private IMAPFolder archiveFolder;
	private String archiveFolderName;
	
	private IMAPFolder trash;
        private IMAPFolder draftsFolder;
	private String trashFolderName;
        private String draftsFolderName;
	
	/** javadoc claims you can check exists in a closed folder, but this implementation is throwing a javax.mail.FolderClosedException */
	private boolean archiveFolderExists;
	
	private SMTPTransport transport;
	
	private static SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("MMM d,yyyy");
	
	public EmailController(Account account, String archiveFolderName, String trashFolderName, String draftsFolderName) {
		this.email = account.getEmail();
		this.password = account.getPassword();
		this.archiveFolderName = archiveFolderName;
		this.trashFolderName = trashFolderName;
                this.draftsFolderName = draftsFolderName;
	}
	
	/**
	 * Returns the shared email session. This is a singleton method.
	 */
	protected static Session GetEmailSesion() {
		if(EMAIL_SESSION==null) {
			//if the app is to be generalized, pull these values out and put them into external properties file
			Properties props = System.getProperties();
			props.setProperty("mail.store.protocol", "imaps");
//		    props.setProperty("mail.smtp.auth", "true");
//		    props.setProperty("mail.smtp.starttls.enable", "true");
//		    props.setProperty("mail.smtp.starttls.required", "true");
//		    props.setProperty("mail.smtp.sasl.enable", "false");
			props.put("mail.smtp.host", SMTP_HOST_NAME);
			props.put("mail.smtp.auth", "true");
//			props.put("mail.debug", "true");
			props.put("mail.smtp.port", SMTP_PORT);
//			props.put("mail.smtp.socketFactory.port", SMTP_PORT);
//			props.put("mail.smtp.socketFactory.class", SSL_FACTORY);
//			props.put("mail.smtp.socketFactory.fallback", "false");
			props.put("mail.smtp.ssl.enable", true);

			EMAIL_SESSION = Session.getDefaultInstance(props, null);
		}
		EMAIL_SESSION.setDebug(DEBUG);
		return EMAIL_SESSION;
	}

	/**
	 * Connects the servers and sets up the folders.
	 * This will open only as-needed, so you can call this many times.
	 * @throws MessagingException
	 */
	public void connect() throws MessagingException {
		if(emailStore==null || emailStore.isConnected()==false) {
			log.info("Connecting to email store");
			EMAIL_SESSION = GetEmailSesion();
			
			//connect to IMAP
			emailStore = EMAIL_SESSION.getStore("imaps");
			emailStore.addConnectionListener(this);
			emailStore.connect("imap.gmail.com", email, password);
			inbox = (IMAPFolder) emailStore.getFolder("INBOX");
                        
			archiveFolder = (IMAPFolder) emailStore.getFolder(archiveFolderName);
			archiveFolderExists = archiveFolder.exists();
                        
                        draftsFolder = (IMAPFolder) emailStore.getFolder(draftsFolderName);
			trash = (IMAPFolder) emailStore.getFolder(trashFolderName);
			
			//this is the transport object for sending emails.. We will worry about it when the user wants to send a email
			transport = new SMTPTransport(EMAIL_SESSION, null);
		}
	}
	
	
	/** Fetches the emails and returns then as a list of hashmaps. Note, this does not get the email body.*/
	private List<HashMap<String, String>> getEmail(Folder folder) throws Exception {
		List<HashMap<String, String>> emails = new ArrayList<HashMap<String, String>>();
		if(folder.isOpen()==false) {
			folder.open(Folder.READ_WRITE);
		}
		Message[] messages = folder.getMessages();
		for(int i=0, count=messages.length; i<count; i++) {
			Message message = messages[i];
                        if(message.isExpunged()==false) {
				emails.add(fetchEmail(message));
			}
		}

		folder.close(true); //FIXME uncomment for production!
		return emails;
	}
	private List<HashMap<String, String>> getNewEmails(Folder folder, int limit) throws Exception {
		List<HashMap<String, String>> emails = new ArrayList<HashMap<String, String>>();
		if(folder.isOpen()==false) {
			folder.open(Folder.READ_WRITE);
		}
		Message[] messages = folder.getMessages();
		for(int i=messages.length-1; i>messages.length-1-limit; i--) {
			Message message = messages[i];
			if(message.isExpunged()==false) {
				emails.add(fetchEmailWithBody(message));
			}
		}

		folder.close(true); //FIXME uncomment for production!
		return emails;
	}	
	/** returns a list of emails for the inbox and archive folder (if exists). */
	public synchronized List<HashMap<String, String>> getEmail() throws Exception {
		connect();
		List<HashMap<String, String>> emails = getEmail(inbox);
                List<HashMap<String, String>> drafts = getEmail(draftsFolder);
                if(!drafts.isEmpty()) //we just handle one draft for now
                    emails.add(drafts.get(drafts.size()-1));
		if(archiveFolderExists) {
			emails.addAll(getEmail(archiveFolder));
		}
		return emails;
	}
	public synchronized List<HashMap<String, String>> getNewEmails(int limit) throws Exception {
		connect();
		List<HashMap<String, String>> emails = getNewEmails(inbox,limit);
                return emails;
	}	
	/**
	 * Gets the email and puts the important attributes into a Hashmap.
	 * It does NOT include the body because that marks the email as SEEN (aka read).
	 * 
	 * @param message
	 * @return
	 * @throws MessagingException
	 * @throws IOException
	 */
	private HashMap<String, String> fetchEmail(Message message) throws MessagingException, IOException {
		//long time=System.currentTimeMillis();
                HashMap<String, String> email = new HashMap<String, String>();
                String subject;
		//System.out.println(((InternetAddress)message.getFrom()[0]).getAddress().getClass());
		email.put("status", (message.isSet(Flags.Flag.SEEN)==true ? "read" : "unread"));
		email.put("from", ((InternetAddress)message.getFrom()[0]).getAddress());
		//TODO maybe check address for name and include it
                subject=message.getSubject();
                if(subject==null) {
                    subject="";
                }
                else if(subject.length() > 30)
                    subject=subject.substring(0,26)+"...";

		email.put("subject", subject);
		email.put("folder", message.getFolder().getName());
                //System.out.println("*******"+((InternetAddress)message.getAllRecipients()[0]).getAddress());
                if(message.getFolder().getName().equalsIgnoreCase("Drafts")) {
                    email.put("to",((InternetAddress)message.getAllRecipients()[0]).getAddress());
                    //Lets fetch the body too, 'cause we need to display the content asap
                    email.put("body", extractEmailBody(message));
                }
		email.put("uid", Long.toString(getUID(message)));
		email.put("dateSent", DATE_FORMAT.format(message.getSentDate()));
                
                
                    //             System.out.println("**header****"+(System.currentTimeMillis()-time));
                  //                time=System.currentTimeMillis();
                
                //Uncomment the following line to turn off on demand loading of email body
                //if(!message.isSet(Flags.Flag.SEEN))
                 //   email.put("body", extractEmailBody(message));
                //System.out.println("**body****"+(System.currentTimeMillis()-time));
//		Enumeration e = message.getAllHeaders();
//		while(e.hasMoreElements()) {
//			Header o = (Header)e.nextElement();
//			System.out.println(o.getName() + "\t" + o.getValue());
//		}
		
                
            
		//NOTE: download content on-demand (ie not here), because once viewd the SEEN flag is set to true 
		return email;
	}
	private HashMap<String, String> fetchEmailWithBody(Message message) throws MessagingException, IOException {
		//long time=System.currentTimeMillis();
                HashMap<String, String> email = new HashMap<String, String>();
                String subject;
		//System.out.println(((InternetAddress)message.getFrom()[0]).getAddress().getClass());
		email.put("status", (message.isSet(Flags.Flag.SEEN)==true ? "read" : "unread"));
		email.put("from", ((InternetAddress)message.getFrom()[0]).getAddress());
		//TODO maybe check address for name and include it
                subject=message.getSubject();
                if(subject==null) {
                    subject="";
                }
                else if(subject.length() > 30)
                    subject=subject.substring(0,26)+"...";

		email.put("subject", subject);
		email.put("folder", message.getFolder().getName());
                //System.out.println("*******"+((InternetAddress)message.getAllRecipients()[0]).getAddress());
                if(message.getFolder().getName().equalsIgnoreCase("Drafts")) {
                    email.put("to",((InternetAddress)message.getAllRecipients()[0]).getAddress());
                    //Lets fetch the body too, 'cause we need to display the content asap
                    email.put("body", extractEmailBody(message));
                }
		email.put("uid", Long.toString(getUID(message)));
		email.put("dateSent", DATE_FORMAT.format(message.getSentDate()));
                
                
                    //             System.out.println("**header****"+(System.currentTimeMillis()-time));
                  //                time=System.currentTimeMillis();
                
                //Uncomment the following line to turn off on demand loading of email body
                //if(!message.isSet(Flags.Flag.SEEN))
                    email.put("body", extractEmailBody(message));
                //System.out.println("**body****"+(System.currentTimeMillis()-time));
//		Enumeration e = message.getAllHeaders();
//		while(e.hasMoreElements()) {
//			Header o = (Header)e.nextElement();
//			System.out.println(o.getName() + "\t" + o.getValue());
//		}
		
                
            
		//NOTE: download content on-demand (ie not here), because once viewd the SEEN flag is set to true 
		return email;
	}
        
	protected String extractEmailBody(Message message) {
		// initializing check used for HTML content
		int flag = 0;
                boolean unread=false;
                try {
                    if(!message.isSet(Flags.Flag.SEEN))
                    unread=true;
                }
                catch(Exception e){
                    e.printStackTrace();
                }
		String body = null;
		try {
			Object messageContent = message.getContent();

			// Determine email type
			// this and next, wonder what they do!
			if (messageContent instanceof InputStream) {
				InputStream is = (InputStream) messageContent;
				// Assumes character content (not binary images)
				int c;
				StringBuilder buf = new StringBuilder();
				while ((c = is.read()) != -1) {
					buf.append((char)c);
				}
				body = buf.toString();
			} else if (messageContent instanceof String) {
				body = messageContent.toString();
			} else if (messageContent instanceof Multipart) {

				// Retrieve the Multipart object from the message
				Multipart multipart = (Multipart) messageContent;

				// System.out.println("Retrieve"+
				// multipart.getCount()+"Multipart object from the message");

				// Loop over the parts of the email
				for (int i = 0; i < multipart.getCount(); i++) {
					int Count = i + 1;
					Part part = multipart.getBodyPart(i);
					String contentType = part.getContentType();
					// display Part number and content type
					// System.out.println("Part "+Count+": "+contentType);

					if (contentType.startsWith("TEXT/HTML")) {
						flag = 1;
						body = part.getContent().toString();
						// System.out.println("reading type and content of text/HTML  mail:"
						// + part.getContent());

					} else if (contentType.startsWith("TEXT/PLAIN")) {
						if (flag != 1) {
							if (!multipart.getBodyPart(i + 1).getContentType()
									.startsWith("TEXT/HTML")) {
								body = part.getContent().toString();
								// System.out.println("reading type and content  text/plain  mail:"
								// + part.getContent());
							}
						}
					} else if (contentType.startsWith("multipart")) {
						Multipart mp = (Multipart) part.getContent();
						// //reading the best part set by browser
						// body =
						// mp.getBodyPart(mp.getCount()-1).getContent().toString();
						// System.out.println("Content in plain or html version: "+(String)mp.getBodyPart(mp.getCount()-1).getContent());

						for (int j = 0; j < mp.getCount(); j++) {
							if (mp.getBodyPart(j).getContentType()
									.startsWith("TEXT/HTML")) {
								flag = 1;
								body = mp.getBodyPart(j).getContent().toString();
								System.out
								.println("reading type and content of text/HTML  mail from mail with ATTACHMENT:"
										+ mp.getBodyPart(j).getContent());
							} else if (mp.getBodyPart(j).getContentType()
									.startsWith("TEXT/PLAIN")) {
								if (flag != 1) {
									if (!mp.getBodyPart(j + 1).getContentType()
											.startsWith("TEXT/HTML")) {
										body = mp.getBodyPart(j).getContent()
										.toString();
										// System.out.println("reading type and content  text/plain  mail from mail with ATTACHMENT:"
										// + mp.getBodyPart(j).getContent());
									}
								}

							}
						}
					} else if (contentType.startsWith("IMAGE")) {
						//String fileName = part.getFileName();
						// System.out.println("type: "+contentType+
						// "image fileName: "+ fileName);
					} else if (contentType.startsWith("AUDIO")) {
						//String fileName = part.getFileName();
						// System.out.println("type: "+contentType+
						// "audio fileName: "+ fileName);
					} else if (contentType.startsWith("VIDEO")) {
						//String fileName = part.getFileName();
						// System.out.println("type: "+contentType+
						// "video fileName: "+ fileName);
					} else if (contentType.startsWith("APPLICATION")) {
						//String fileName = part.getFileName();
						// System.out.println("type: "+contentType+
						// "application fileName: "+ fileName );
					} else {
						// Retrieve the file name of unknown type
						// System.out.println("Content: " + contentType
						// +part.getContent());
					}
				}
			}
		}
		catch(Exception e) {
			body = "Error: " + e.getMessage();
		}
                try {
                    if(unread)
                        message.setFlag(Flags.Flag.SEEN, false);
                }
                catch(Exception e)
                {
                    e.printStackTrace();
                }
		return body;
	}

	
	public synchronized void replyToEmail(long messageUID, String folderName, String body) throws Exception {
//		emailSession.setDebug(true);

		if(transport.isConnected()==false) {
			transport.connect(SMTP_HOST_NAME, SMTP_PORT, email, password);
		}
		Message message = getMessage(messageUID, folderName);
		Message reply = message.reply(false);
		reply.setText(body);
		reply.saveChanges();
		transport.sendMessage(reply, reply.getAllRecipients());
	}
	
	public synchronized void sendEmail(String to, String subject, String body) throws AddressException, MessagingException {
		if(transport.isConnected()==false) {
			transport.connect(SMTP_HOST_NAME, SMTP_PORT, email, password);
		}
		MimeMessage message = new MimeMessage(GetEmailSesion());
		message.setFrom(new InternetAddress(email));
		message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
		message.setSubject(subject);
		message.setText(body);
                
		message.saveChanges();
		transport.sendMessage(message, message.getAllRecipients());
	}

        //Marks the email as read

	public synchronized void markAsRead(long messageUID, String folderName) throws Exception {
		Message message = getMessage(messageUID, folderName);
                try {
                     message.setFlag(Flags.Flag.SEEN, true);
                }
                catch(Exception e)
                {
                    e.printStackTrace();
                }
	}

	/**
	 * Returns the email body for a particular message.
	 * This is done because fetching the body sets the 'read' flag, so it should be done
	 * only on-demand.
	 * @param messageUID	unique id for the email 
	 * @return the body string
	 * @throws Exception 
	 */
	public synchronized String getBody(long messageUID, String folderName) throws Exception {
                Message message = getMessage(messageUID, folderName);
		return extractEmailBody(message);
	}
	
	/**
	 * Moves the message from fromFolderName to toFolderName. It will create the toFolderName if not exists.  
	 * @param messageNumber
	 * @param fromFolderName
	 * @param toFolderName
	 * @return the message UID of the copied message, or -1 if nothing was copied, eg the message was not found.
	 * @throws Exception 
	 */
	public synchronized long moveEmail(long messageUID, String fromFolderName, String toFolderName) throws Exception {
		if(fromFolderName.equals(toFolderName)) {
			return messageUID; //email already in archive folder, so just return the current number
		}
		Message message = getMessage(messageUID, fromFolderName);
		if(message!=null) {
			IMAPFolder toFolder = getOpenFolder(toFolderName);
			return moveEmail(message, toFolder);
		}
                else {
			log.error("couldn't move message {} (from folder {}) because it wasn't found", messageUID, fromFolderName);
			return -1;
		}
	}
	
	/**
	 * Moves the message to the toFolder.
	 * It will create the toFolder (if needed), expunge the message from the current folder and close
	 * both folders. It returns the UID of the message in the toFolder.
	 * @param message
	 * @param toFolder
	 * @return
	 * @throws MessagingException
	 */
	protected long moveEmail(Message message, IMAPFolder toFolder) throws MessagingException {
		Folder fromFolder = message.getFolder();
		if(fromFolder.getName().equals(toFolder.getName())) {
			return getUID(message); //email already in toFolder, so just return the current uid
		}
		if(toFolder.exists()==false) {
			toFolder.create(Folder.HOLDS_MESSAGES);
		}
		if(toFolder.isOpen()==false) {
			toFolder.open(Folder.READ_WRITE);
		}

		//delete the email BEFORE copying! in gmail a copy into the trash results in 
		//message.isExpunged()==true, even though it's still present the original folder. 
		if(message.isExpunged()==false) {
			message.setFlag(Flags.Flag.DELETED, true);
		}

		fromFolder.copyMessages(new Message[]{message}, toFolder);
		//FIXME this line threw
		/*
		 java.lang.IllegalStateException: This operation is not allowed on a closed folder
	at com.sun.mail.imap.IMAPFolder.checkOpened(IMAPFolder.java:404)
	at com.sun.mail.imap.IMAPFolder.copyMessages(IMAPFolder.java:1531)
	at org.ez.controllers.EmailController.moveEmail(EmailController.java:378)
	at org.ez.controllers.EmailController.moveEmail(EmailController.java:343)

		 */

		/*seems important to close after. otherwise the UIDs returned are off, and don't
		update. not even calling expunge seems to do it.*/
		toFolder.close(true);
		fromFolder.close(true);
		

		
		//TODO perhaps confirm the returned UID is correct by searching for the email. if not found do a data-based search by subject and date sent 
		//when the message is copied to the folder the UID is incremented, so return the next one -1
		//NOTE: it may seem better to get the UIDNext earlier and return that, but on gmail sometimes the uid will skip
		//e.g. when moving from tray > trash > inbox, the last step skips a uid.
		return toFolder.getUIDNext()-1;
	}
	
	/** debug method to print out contents of a folder */
	protected void dumpFolder(Folder folder) throws MessagingException {
		System.out.println("\n" + folder.getName());
		if(folder.isOpen()==false) {
			System.out.println(folder.getName() + " needs opening");
			folder.open(Folder.READ_WRITE);
		}
		Message[] messages = folder.getMessages();
		for(int i=0, count=messages.length; i<count; i++) {
			Message msg = messages[i];
			dumpMessage(msg);
		}
	}
	
	/** debug method to print out a message */
	protected void dumpMessage(Message msg) throws MessagingException {
		System.out.println(msg.getMessageNumber() + "\t" +
				((UIDFolder)msg.getFolder()).getUID(msg) + "\t" + 
				(msg.isExpunged()? "expunged" : msg.getFolder().getName() + "\t" + msg.getSubject()));
	}
	
	public synchronized int getNewMessageCount() throws MessagingException {
		connect();
		
		//FIXME this line causes the folderclosedexception (but not anymore)
		//FIXME this line is NOW throwing storeclosedexception
		//TODO maybe just open inbox first
		int count = inbox.getUnreadMessageCount();		
		if(count==-1 && inbox.isOpen()==false) {
			//some implementations will return -1 when getUnreadMessageCount is invoked on a closed folder
			inbox.open(Folder.READ_WRITE);
			count = inbox.getUnreadMessageCount();
			inbox.close(true);
		}
		return (count==-1 ? 0 : count);
	}
	
	/** gets the folder by name */
	protected IMAPFolder getFolder(String name) throws MessagingException {
		if("INBOX".equals(name)) {
			return inbox;
		}
		else if(name.equals(archiveFolder.getName())) {
			return archiveFolder;
		}
		else if(name.equals(trash.getName())) {
			return trash;
		}
		else {
			return (IMAPFolder) emailStore.getFolder(name);
		}
	}
	
	/**
	 * This returns an open IMAPFolder. 
	 * It will check if it is connected and connect on demand.
	 * @param name
	 * @return
	 * @throws MessagingException
	 */
	protected IMAPFolder getOpenFolder(String name) throws MessagingException {
		if(emailStore.isConnected()==false) {
			connect();
		}
		IMAPFolder f = getFolder(name);
		if(f.isOpen()==false) {
			f.open(Folder.READ_WRITE);
		}
		return f;
		
	}

	protected long getUID(Message msg) throws MessagingException {
		return ((UIDFolder)msg.getFolder()).getUID(msg);
	}
	
	/**
	 * Retrieve the email by UID (instead of message number). 
	 * This will check if we are connected and will open the folder as needed.
	 * @param messageUID
	 * @param folderName
	 * @return the message
	 * @throws Exception is thrown on messaging errors or if the email/folder cannot be found.
	 */
	protected Message getMessage(long messageUID, String folderName) throws Exception {
		IMAPFolder folder = getOpenFolder(folderName);
		Message message = folder.getMessageByUID(messageUID);
		if(message==null) {
			log.error("couldn't find message {} in {}", messageUID, folderName);
			dumpFolder(folder);
		}
		return message;
	}
	
	/**
	 * moves the email into the trash folder.
	 * @param messageUID
	 * @param folderName
	 * @return the new uid of the message in the trash folder 
	 * @throws Exception is thrown on messaging errors or if the email/folder cannot be found.
	 */
	public synchronized long deleteEmail(long messageUID, String folderName) throws Exception {
		Message message = getMessage(messageUID, folderName);
		return moveEmail(message, trash);
	}

	/**
	 * This moves the email from the trash to the inbox, and returns the new message number.
	 * @param messageUID
	 * @param folder
	 * @return the message number, or -1 if the message can't be found (or expunged, which is the same thing)
	 * @throws Exception
	 */
	public synchronized long undeleteEmail(long messageUID) throws Exception {
		//get message this way (instead of directly) to ensure we are open and connected
		Message message = getMessage(messageUID, trashFolderName);
		if(message!=null && message.isExpunged()==false) {
			return moveEmail(message, inbox);
		}
		else {
			return -1;
		}
	}
	public synchronized long createDraft(String to, String body) throws Exception {
		MimeMessage message = new MimeMessage(GetEmailSesion());
		message.setFrom(new InternetAddress(email));
		message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
		message.setSubject("");
		message.setText(body);
                message.setFlag(Flags.Flag.SEEN, true);
		message.saveChanges();
                IMAPFolder drafts =getOpenFolder(draftsFolderName);
                //We currently support only one draft... so lets discard all other previous drafts
                if(drafts.getMessageCount()>0) 
                    for(Message m:drafts.getMessages()) 
			m.setFlag(Flags.Flag.DELETED, true);
		
                drafts.addMessages(new Message[]{message});
                drafts.close(true);
                return 1;
                
	} 
	public synchronized List<HashMap<String, String>> getDemoEmail() throws Exception {
		MimeMessage message = new MimeMessage(GetEmailSesion());
		message.setFrom(new InternetAddress("gv@trace.wisc.edu"));
		message.addRecipient(Message.RecipientType.TO, new InternetAddress(email));
		message.setSubject("Picnic");
		message.setText("Hi, <br><br> Would you like to join us for the picinic this weekend?<br><br> Regards<br> Gregg");
                message.setFlag(Flags.Flag.SEEN, false);
		message.saveChanges();
		MimeMessage message2 = new MimeMessage(GetEmailSesion());
		message2.setFrom(new InternetAddress("rpn2142@gmail.com"));
		message2.addRecipient(Message.RecipientType.TO, new InternetAddress(email));
		message2.setSubject("Happy Birthday !!");
		message2.setText("Hi Grandma, <br><br> Wish you a happy birthday!! <br><br> Love<br> Ramraj");
                message2.setFlag(Flags.Flag.SEEN, false);
		message2.saveChanges();
                connect();
		if(inbox.isOpen()==false) {
			inbox.open(Folder.READ_WRITE);
		}
                
                if(inbox.getMessageCount()>0) 
                    for(Message m:inbox.getMessages()) 
			m.setFlag(Flags.Flag.DELETED, true);
		
                inbox.addMessages(new Message[]{message2,message});
                //inbox.close(true);
		//connect();
		List<HashMap<String, String>> emails = getNewEmails(inbox,2);
                List<HashMap<String, String>> drafts = getEmail(draftsFolder);
                if(!drafts.isEmpty()) //we just handle one draft for now
                    emails.add(drafts.get(drafts.size()-1));

		return emails;                
                
	}        
	public synchronized long deleteRecentDraft() throws Exception {
                IMAPFolder drafts =getOpenFolder(draftsFolderName);
                if(drafts.getMessageCount()>0) {
                    Message m=drafts.getMessages()[drafts.getMessageCount()-1]; //get most recent message
                    return moveEmail(m, trash); //lets get rid of it
                    //drafts.close(true);
                }
                return -1;
	}
        //TODO:optimizie this
	public synchronized long refreshRecentDraft(String to,String body) throws Exception {
            deleteRecentDraft();
            return createDraft(to,body);
            
	}        
	@Override
	public void closed(ConnectionEvent arg0) {
		System.out.println("store connection closed " + arg0);
		
	}

	@Override
	public void disconnected(ConnectionEvent arg0) {
		System.out.println("store disconnected " + arg0);
		
	}

	@Override
	public void opened(ConnectionEvent arg0) {
		System.out.println("store opened " + arg0);
		
	}

	/**
	 * closes the email controller.
	 */
	public synchronized void close() {
		try {
			if(inbox.isOpen()) {
				inbox.close(true);
				inbox = null;
			}
			if(archiveFolder.isOpen()) {
				archiveFolder.close(true);
				archiveFolder = null;
			}
			if(trash.isOpen()) {
				trash.close(true);
				trash = null;
			}
			if(emailStore.isConnected()) {
				emailStore.close();
				emailStore = null;
			}
		}
		catch(MessagingException e) {
			log.warn("exception while shutting down email connection", e);
		}
	}


}
