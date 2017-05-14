package org.ez.view;

import java.util.HashMap;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.ez.controllers.EmailController;
import org.ez.data.AccountType;
import org.ez.model.Account;
import org.ez.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EmailServlet extends JsonServlet {
	private static final Logger log = LoggerFactory.getLogger(EmailServlet.class);
	
	public static final String EMAIL_MODULE = "email";

	/** name of the folder for filing emails */
	protected static final String ARCHIVE_FOLDER = "tray";
	
	/** name of Gmail's trash folder. If generalizing, this would have to change. */
	private static final String TRASH_FOLDER = "[Gmail]/Trash";
        private static final String DRAFTS_FOLDER = "[Gmail]/Drafts";
	
	private EmailController email;

	@Override
	public void doActionNamed(HttpServletRequest request, String action, String data, HashMap<String, Object> output) {
		Object emailObj = request.getSession().getAttribute(EMAIL_MODULE);
		if(emailObj==null) {
			User user = getUser(request);
			Account account = user.getAccount(AccountType.Gmail);
			if(account==null) {
				error(output, "this user doesn't have a Gmail account setup");
				return;
			}
			email = new EmailController(account, ARCHIVE_FOLDER, TRASH_FOLDER,DRAFTS_FOLDER);
			try {
				email.connect();
			} catch (MessagingException e) {
				output.put("error", "could not connect to email. " + e.getMessage());
				return;
			}
			request.getSession().setAttribute(EMAIL_MODULE, email);
		}
		else {
			email = (EmailController)emailObj;
		}
		
		try {
			long messageUID = -1;
			String uid = request.getParameter("uid");
			if(uid!=null) {
				messageUID = Long.parseLong(uid);
			}
			String folder = request.getParameter("folder");
                        if(folder!=null)
                            if(folder.equalsIgnoreCase("Drafts"))
                                folder=DRAFTS_FOLDER;
			
			if("getEmail".equals(action)) {
				output.put("emails", email.getEmail());
			}
			else if("checkForNewEmails".equals(action)) {
				output.put("newEmails", email.getNewMessageCount());
			}
			else if("reply".equals(action)) {
				String body = request.getParameter("body");
				email.replyToEmail(messageUID, folder, body);
				output.put("ok", "ok");
			}
			else if("newEmail".equals(action)) {
				String to = request.getParameter("to");
				String subject = request.getParameter("subject");
				String body = request.getParameter("body");
				email.sendEmail(to, subject, body);
			}
			else if("getBody".equals(action)) {
				String body = email.getBody(messageUID, folder);
				if(body!=null) {
					output.put("body", body);
				}
				else {
					output.put("error", "could not download body");
				}
			}
			else if("markAsRead".equals(action)) {
				email.markAsRead(messageUID, folder);
	
			}

			else if("archiveEmail".equals(action)) {
				long newUID = email.moveEmail(messageUID, folder, ARCHIVE_FOLDER);
				if(newUID!=-1) {
					output.put("ok", "ok");
					output.put("folder", ARCHIVE_FOLDER);
					output.put("uid", newUID);
				}
				else {
					output.put("error", "email was not archived because it could not be found");
				}
			}
			else if("deleteEmail".equals(action)) {
				long newUID = email.deleteEmail(messageUID, folder);
				output.put("uid", newUID);
				output.put("folder", TRASH_FOLDER);
			}
			else if("undeleteEmail".equals(action)) {
				long newUID = email.undeleteEmail(messageUID);
				if(newUID!=-1) {
					output.put("uid", newUID);
					output.put("folder", "INBOX");
				}
				else {
					output.put("error", "could not undelete the email");
				}
			}
                        else if("getNewEmails".equals(action)) {
                            output.put("emails", email.getNewEmails(Integer.parseInt(request.getParameter("limit"))));
                        }
                        else if("createDraft".equals(action)) {
                            output.put("returnValue",email.createDraft(request.getParameter("to"),request.getParameter("body") ));
                        }
                        else if("deleteRecentDraft".equals(action)) {
                            output.put("returnValue",email.deleteRecentDraft());
                        }                        
                        else if("refreshRecentDraft".equals(action)) {
                            output.put("returnValue",email.refreshRecentDraft(request.getParameter("to"),request.getParameter("body")));
                        }
                        else if("getDemoEmail".equals(action)) {
				output.put("emails", email.getDemoEmail());
			}
                        
			else {
                            output.put("error", "unsupported action"+action);
			}
                        
                        //While loggin in with 'user/*' way, the client doesn't know the name, so add this
                        String name=((User)request.getSession().getAttribute("user")).getFirstName()+" "+((User)request.getSession().getAttribute("user")).getLastName();
                        output.put("name",name);
		}
                
		catch(Exception e) {
			log.error("error doing action {}", action, e);
			output.put("error", "email error: " + e.getMessage());
			e.printStackTrace();
		}
	}

	@Override
	public boolean mustBeLoggedIn() {
		return true;
	}

	/** shut down the email connection */
	public static void CloseEmail(HttpSession session) {
		Object module = session.getAttribute(EmailServlet.EMAIL_MODULE);
		if(module!=null) {
			((EmailController)module).close();
			session.removeAttribute(EmailServlet.EMAIL_MODULE);
		}

		
	}

}
