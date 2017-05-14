package org.ez.view;

import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Iterator;
import javax.imageio.ImageIO;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.ez.model.BinaryData;
import org.ez.model.Person;
import org.ez.model.User;
import org.ez.utils.HibernateUtil;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FileManagerServlet extends HttpServlet {
	private final static Logger log = LoggerFactory.getLogger(FileManagerServlet.class);
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String action = request.getParameter("action");
		try {
			if("profile".equals(action)) {
				getProfilePicture(request, response);
			}
			else if(processUploadedPicture(request)){
				response.getWriter().println("ok");
			}
			else {
				response.getWriter().println("Error: Unsupported action");
			}
		}
		catch(Exception e) {
			response.getWriter().println("Error: " + e.getMessage());
			log.error("error processing action {}", action, e);
		}
	}
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		doGet(request, response);
	}

	private boolean processUploadedPicture(HttpServletRequest request) throws FileUploadException {
		if(ServletFileUpload.isMultipartContent(request)==false) {
			return false;
		}
		FileItemFactory factory = new DiskFileItemFactory();
		ServletFileUpload upload = new ServletFileUpload(factory);
		Iterator<FileItem> iter = upload.parseRequest(request).iterator();
		FileItem data = null;
		Long contactId = null;
		while (iter.hasNext()) {
		    FileItem item = (FileItem) iter.next();
		    if (item.isFormField()) {
		    	if("id".equals(item.getFieldName())) {
		    		contactId = new Long(item.getString());
		    	}
		    } else {
		        data = item;
		    }
		}
		
		if(data!=null && contactId!=null) {
			User user = JsonServlet.getUser(request);
			saveProfilePicture(user, contactId, data);
			return true;
		}
		else {
			return false;
		}
	}
	

	private boolean saveProfilePicture(User user, Long contactId, FileItem picture) {
		Person contact = user.getContact(contactId);
		//make sure we're saving to the user's contact, not some fake id
		if(contact!=null) {
			Session session = HibernateUtil.getSession();
			try {
				session.beginTransaction();
				session.update(contact);
				BinaryData profilePicture = contact.getProfilePicture();
				if(profilePicture==null) {
					profilePicture = new BinaryData();
					contact.setProfilePicture(profilePicture);
				}
				profilePicture.setContentType(picture.getContentType());
				profilePicture.setName(picture.getName());
				profilePicture.setData(picture.get());
				session.saveOrUpdate(profilePicture);
				session.getTransaction().commit();
				return true;
			}
			catch (Exception e) {
				session.getTransaction().rollback();
				log.error("error saving uploaded file", e);
				return false;
			}
		}
		else {
			return false;
		}
	}

	private void getProfilePicture(HttpServletRequest request, HttpServletResponse response) throws IOException {
		Long contactId = new Long(request.getParameter("id"));
		User user = JsonServlet.getUser(request);
		Person contact = user.getContact(contactId);
		if(contact!=null && contact.getProfilePicture()!=null) {
			BinaryData pic = contact.getProfilePicture();
                        /*
                        try {
                        InputStream in = new ByteArrayInputStream(pic.getData());
                        BufferedImage bImageFromConvert = ImageIO.read(in);
                        String picFormat=pic.getContentType().split("/")[1];
                        ImageIO.write(bImageFromConvert, picFormat, new File("/Users/purushothamanramraj/picdb/"+pic.getId()+"."+picFormat));
                        }
                        catch(Exception e) {
                            e.printStackTrace();
                        }*/
			response.setContentType(pic.getContentType());
			response.setContentLength(pic.getData().length);
                        
			response.getOutputStream().write(pic.getData());
			response.getOutputStream().close();
		}
		else {
			response.setContentType("image/jpeg");
			String path = request.getSession().getServletContext().getRealPath("images/contacts/unknownUser.jpg");
			BufferedInputStream in = new BufferedInputStream(new FileInputStream(path));
			OutputStream out = response.getOutputStream();
			int b;
			while((b=in.read())>=0) {
				out.write(b);
			}
			in.close();
			out.close();
		}
	}
}
