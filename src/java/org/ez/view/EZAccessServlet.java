package org.ez.view;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.ez.model.User;
import org.ez.model.Lang;
import org.ez.utils.HibernateUtil;
import org.ez.utils.UserUtils;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main app servlet, responsible for logging in/out and general setup.
 * 
 * @author jmouka
 * 
 * Login modes:
 * -going straight to index.html displays the login screen, only prompting for the user name. after submitting it:
 * 		-if the account requires a password they will be prompted for it
 * 		-if password is not required they are logged in
 * -user can login wiht /user/<the username>
 * 		-if password is required they are prompted, otherwise they are logged in
 * -user can login with /user/<their user key> and are always logged right in
 * -assistants can login in ONLY with the url /assistant/<their user key>
 * 		-assistants are always prompted for the assistant's password
 * 
 *
 */
@SuppressWarnings("serial")
public class EZAccessServlet extends JsonServlet {
	private static final Logger log = LoggerFactory.getLogger(EZAccessServlet.class);
	
	
	/**
	 * This method checks for the direct login (using /user or /assistant). 
	 * If not logged in, the userKey is saved in session, and a login attempt is made. The result is not 
	 * important right now, because index.html will call the json init action, where all
	 * credentials are actually processLoginResponse
         * ed. Essentially, all this does is note the userKey and if that's
	 * enough to log the user in then they are logged in.
	 * In all cases they are redirected to index.html.  
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
            boolean result=false;
            
            try {
			String action = request.getServletPath();
                        
			//in either case unset the user (essentially log out) and try to log them in
			if("/assistant".equals(action) || "/user".equals(action)) {
				String uri = request.getRequestURI();
				String userKey = uri.substring(uri.indexOf(action)+action.length()+1);
				HttpSession session = request.getSession();
				session.removeAttribute("user");
				session.setAttribute("userKey", userKey);
				session.setAttribute("isAssistant", "/assistant".equals(action));
				EmailServlet.CloseEmail(session);
                                ChatServlet.CloseChat(session);
				if("/user".equals(action)) {
					HashMap output = new HashMap();
					result=login(request, userKey, false, output); //simply attempt to login, the index.html will check and redirect to the proper screen
				}
			}
		}
		catch(Exception e) {
			e.printStackTrace();
		}
  //              if(result) 
  //                  response.sendRedirect(request.getContextPath() + "/indexDirectLogin.html");
  //              else
                response.sendRedirect(request.getContextPath() + "/index.html");
	}

	
	
	/** returns the user key, taking precedence from the request, and then the one saved in the session. */
	private String getUserKey(HttpServletRequest request) {
		Object value = request.getParameter("userKey");
		if(value==null) {
			value = request.getSession().getAttribute("userKey");
		}
		return (value==null ? null : value.toString());
	}
	
	@Override
	public void doActionNamed(HttpServletRequest request, String action, String data, HashMap<String, Object> output) {
		try {
			if("init".equals(action)) {
				User user = getUser(request);
				if(user!=null) {
					//already logged in
					loginSuccessful(request, user, output);
					if(isAssistant(request)) {
						output.put("assistant", "assistant");
                                                
					}
				}
				else if(getUserKey(request)!=null) {
					//the userKey was set (probably in a /user/userKey or /assistant/userKey url) so redirect to password
					output.put("password", "password required");
					output.put("userKey", getUserKey(request));
				}
				else {
					output.put("login", "login is required");
				}
			}
			else if("login".equals(action)) {
				login(request, getUserKey(request), isAssistant(request), output);
			}
			else if("signup".equals(action)) {
				signup(request, data, output);
			}
			else if("logout".equals(action)) {
				logout(request);
			}
                        
                        
		}
		catch(Exception e) {
			error(output, "request could not be processed", e);
			log.error("error running action {}", action, e);
		}
	}

	
	private void logout(HttpServletRequest request) {
		EmailServlet.CloseEmail(request.getSession());
                ChatServlet.CloseChat(request.getSession());
		request.getSession().invalidate();
	}

	/**
	 * Login has several possibilities:
	 * -userKey not found > json result is 'login' (go to userkey prompt)
	 * -userKey ok but login type requires password > json result is 'password' (go to password prompt)
	 * -userKey ok and password not required (users only) > logged in, json result is 'ok'
	 * -userKey and password ok > logged in, json result is 'ok'
	 * -userKey ok and password wrong > json result is 'password' (go to password prompt)
	 * @param userKey maybe the account username or userkey (!)
	 * @param isAssistant
	 * @param output
	 * @return
	 */
		private boolean login(HttpServletRequest request, String userKey, boolean isAssistant, HashMap<String, Object> output) {
            
                if(userKey==null) {
			//client will display the login screen
			output.put("login", "login");
			return false;
		}
		boolean result = false;
		String password = request.getParameter("password");
		Session session = HibernateUtil.getSession();
		try {
			session.beginTransaction();
			User user = (User)session.createCriteria(User.class)
							.add(Restrictions.or(
									Restrictions.eq("username",userKey),
									Restrictions.eq("userKey", userKey))
                    					).uniqueResult();
                        session.getTransaction().commit();
			if(user!=null) {
				if(isAssistant) {
					//assistant requires password
                                        //need to hash!!!!!!!!!!!!!!!---------------------------------
                                        if(password.equals("")) {							
							output.put("password", "require password");
                                                }
                                        else if(request.getParameter("password").equals("matched")){
                                            loginSuccessful(request, user, output);
                                            output.put("assistant", "assistant");
                                            result=true;
                                        }
                                        else if(request.getParameter("password").equals("unmatched")){
                                            output.put("error", "incorrect assistant's password");
                                        }
                                        
                                            //need hash password------------------------------- 
                                          //if(password.equals(null)){
                                             //   output.put("password", "require password");
                                            //}
                                           // else{
                                            //output.put("hashedPassword",user.getPassword());
                                           // result=true;
                                            //}
                                            //matchPassword(request, user, output);
                                            
                                            
                                        else{
                                               
						//loginSuccessful(request, user, output);
                                                output.put("hashedPassword",user.getAssistantPassword());
                                                result = true;
                                           }
				}
				else {   
                                        
					if(userKey.equals(user.getUserKey())) {
						loginSuccessful(request, user, output);
                                                result=true;
					}
					else if(user.isPasswordRequired()==false) {
						loginSuccessful(request, user, output);
						result = true;
					}
					else if(request.getParameter("password").equals("matched")){
                                            loginSuccessful(request, user, output);
                                            result=true;
                                        }
                                        else if(request.getParameter("password").equals("unmatched")){
                                           output.put("error", "incorrect password");
                                        }
                                        
                                            //need hash password------------------------------- 
                                          //if(password.equals(null)){
                                             //   output.put("password", "require password");
                                            //}
                                           // else{
                                            //output.put("hashedPassword",user.getPassword());
                                           // result=true;
                                            //}
                                            //matchPassword(request, user, output);
                                            
                                            
                                        else{
                                               if(password.equals("")) {							
							output.put("password", "require password");
                                                }
						else {
							//loginSuccessful(request, user, output);
                                                        output.put("hashedPassword",user.getPassword());
                                                        result = true;
						}
                                        }
                                            
					}
				}
			
			else {
				error(output, "the userKey or userName was not found");
			}
			
			
                        
                       /* if(user!=null) {
                            session = HibernateUtil.getSession();
                            try {
                                session.beginTransaction();
                                List<Lang> lang=null;
                                System.out.println("***"+user.getLang());
                                lang =session.createSQLQuery("select htmlId, "+user.getLang()+" from Lang").list();
                                output.put("lang",lang);
                                session.getTransaction().commit();
                            }
                            catch(Exception e) {
                                e.printStackTrace();
                            }                        
                        }*/
                            
		}
		catch(HibernateException e) {
			session.getTransaction().rollback();
			log.warn("Found more than one person with userKey {}", userKey);
			error(output, "error: found more than one user with that userKey. Contact administrator.");
		}
		return result;
	}
	
	private void loginSuccessful(HttpServletRequest request, User user, HashMap<String, Object> output) {
		setUser(request, user);
		output.put("ok", "ok");
		output.put("name", user.getFirstName() + ' ' + user.getLastName());
                output.put("contactBookType",user.getContactBookType());
                output.put("language",user.getLang());
                output.put("emailFilter",user.getFilter());
                output.put("emailFunction", user.getEmailFunction());
                output.put("albumFunction", user.getAlbumFunction());
                output.put("contactsFuction", user.getContactsFunction());
                output.put("screensaverwaitTime", user.getScreensaverwaitTime());
                output.put("screenSaverType", user.getScreenSaverType());
                if(isAssistant(request)) {
						output.put("assistant", "assistant");
                                                
					}
                //Retrieve language Translations
                    Session session = HibernateUtil.getSession();
                    try {
                        session.beginTransaction();
                        List<Lang> lang=null;
                       lang =session.createSQLQuery("select htmlId, "+user.getLang()+" from Lang").list();
                        output.put("lang",lang);
                        session.getTransaction().commit();
                    }
                    catch(Exception e) {
                        e.printStackTrace();
                    }
                
                
        }


	private void signup(HttpServletRequest request, String data, HashMap<String, Object> output) throws Exception {
		Session session = HibernateUtil.getSession();
		try {
			session.beginTransaction();
			User user = new User();
			user.setUsername(request.getParameter("username"));
			user.setPassword(request.getParameter("password"));
			user.setUserKey(UserUtils.GenerateUniqueUserKey(session));
			user.setPasswordRequired(true);
			session.save(user);
			setUser(request, user);
			setIsAssistant(request);
			output.put("ok", "ok");
			session.getTransaction().commit();
		}
		catch (Exception e) {
			session.getTransaction().rollback();
			log.error("error signing up", e);
			error(output, "error signing up", e);
		}

	}



	/* Old login... can be deleted.
	private void login(String userKey, String password, HashMap<String, Object> output) {
		Session session = HibernateUtil.getSession();
		try {
			session.beginTransaction();
			Person p = (Person) session.createQuery("from Person where email = ? and password = ?")
				.setString(0, userKey)
				.setString(1, password)
				.uniqueResult();
			
			if(p!=null) {
				setUser(p);
				output.put("email", userKey);
			}
			else {
				error(output, "Login incorrect.");
			}
			session.getTransaction().commit();
		}
		catch (HibernateException e) {
			session.getTransaction().rollback();
			log.warn("Found more than one person with email {}", userKey);
			error(output, "error: found more than one user with that email and password. Contact administrator.");
		}
		catch (Exception e) {
			session.getTransaction().rollback();
			log.error("error logging in", e);
			error(output, "error logging in", e);
		}
	}
	*/

	@Override
	public boolean mustBeLoggedIn() {
		return false;
	}
}
