package org.ez.view;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.ez.controllers.AlbumController;
import org.ez.data.AccountType;
import org.ez.data.Album;
import org.ez.model.Account;
import org.ez.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class AlbumServlet extends JsonServlet {
	private static final String ALBUM_CONTROLLER = "albumController";
	private static final Logger log = LoggerFactory.getLogger(AlbumServlet.class);
	
	@Override
	public void doActionNamed(HttpServletRequest request, String action, String data, HashMap<String, Object> output) {
		try {
			AlbumController albumController = null;
			Object albumObj = request.getSession().getAttribute(ALBUM_CONTROLLER);
			if(albumObj==null) {
				User user = getUser(request);
				Account acc = user.getAccount(AccountType.Gmail);
				if(acc==null) {
					log.info("User {} doesn't have a gmail account setup", user.getId());
					output.put("albums", new ArrayList());
					return;
				}
				else {
					albumController = new AlbumController();
					request.getSession().setAttribute(ALBUM_CONTROLLER, albumController);
				}
			}
			else {
				albumController = (AlbumController)albumObj;
			}
			
			if("getAlbums".equals(action)) {
				List<Album> albums = albumController.getAlbums();
				output.put("albums", albums);
			}
			else {
				error(output, "Unsupported action.");
			}
		}
		catch(Exception e) {
			log.error("error processing action {}", action, e);
			error(output, "An error occurred processing the action " + action, e);
		}

	}

	@Override
	public boolean mustBeLoggedIn() {
		return true;
	}

}
