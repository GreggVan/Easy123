/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.ez.view;


import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.ez.controllers.ChatController;
import org.ez.data.AccountType;
import org.ez.model.Account;
import org.ez.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author nandu
 */
public class ChatServlet extends JsonServlet {

    private ChatController cc ;
    private static final String CHAT_CONTROLLER = "chatController";
    private static final Logger log = LoggerFactory.getLogger(ChatServlet.class);
    @Override
    protected void doActionNamed(HttpServletRequest request, String action, String data, HashMap<String, Object> output) {
        try {
           System.out.println(action);
            Object chatObj = request.getSession().getAttribute(CHAT_CONTROLLER);
            User user = getUser(request);
            Account account = user.getAccount(AccountType.Gmail);
            if(chatObj == null){
                cc = new ChatController();
                System.out.print("new Connection");
                if(account==null){
                    log.info("User {} doesn't have a gmail account setup", user.getId());
                    output.put("NotGmail", null);
                    return;
                }else{
                    output.put("allContacts",cc.connect(account));
                }
                request.getSession().setAttribute(CHAT_CONTROLLER, cc);
            }else{
                cc = (ChatController) chatObj;
            }
            action =(request.getParameter("action"))!=null?request.getParameter("action"):"" ;
                if("sendMessages".equals(action)){
                    String message = (request.getParameter("message")!=null)?(request.getParameter("message")):"";
                    String sendTo = (request.getParameter("to")!=null)?(request.getParameter("to")):"";
                       try{
                            output.put("response",cc.sendMessage(message, sendTo));
                        }catch(Exception e){
                            System.err.print(e);
                        }
                }else if("checkMessages".equals(action)){
                    output.put("response",cc.checkMessage());
                }else if("close".equals(action)){
                    CloseChat(request.getSession());
                }
        }catch(Exception e) {
            //log.error("error processing action {}", action, e);
            error(output, "An error occurred processing the action " + action, e);
        } 
    }

    @Override
    protected boolean mustBeLoggedIn() {
        return true;
    }

    public static void CloseChat(HttpSession session) {
		Object module = session.getAttribute(ChatServlet.CHAT_CONTROLLER);
		if(module!=null) {
			((ChatController)module).close();
			session.removeAttribute(ChatServlet.CHAT_CONTROLLER);
		}


	}

}
