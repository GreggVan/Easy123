package org.ez.controllers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.ez.data.Album;
import org.ez.data.Photo;
import org.ez.model.Account;

import com.google.gdata.client.photos.PicasawebService;
import com.google.gdata.data.Link;
import com.google.gdata.data.photos.AlbumFeed;
import com.google.gdata.data.photos.GphotoEntry;
import com.google.gdata.data.photos.PhotoEntry;
import com.google.gdata.data.photos.UserFeed;
import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ResourceNotFoundException;
import com.google.gdata.util.ServiceException;

public class AlbumController {
	private PicasawebService service;
	private UserFeed albumFeed;
	private Account account;
	
	
	public AlbumController(Account account) throws AuthenticationException {
		this.account = account;
		service = new PicasawebService(account.getEmail() + "@easyone");
		service.setUserCredentials(account.getEmail(), account.getPassword());
	}

	public List<Album> getAlbums() throws IOException, ServiceException {
		// TODO the username in the URL will eventually have to be saved in the
		// db as album subscriptions
		URL albumFeedUrl = new URL("http://picasaweb.google.com/data/feed/api/user/"
					+ account.getEmail()
					+ "?kind=album");

		List<Album> albums = new ArrayList<Album>();
		try {
			albumFeed = service.getFeed(albumFeedUrl, UserFeed.class);
		}
		catch(ResourceNotFoundException e) {
			//this will be thrown if user has no albums. it's not an error, so return the empty set
			return albums;
		}
		for(GphotoEntry albumEntry : albumFeed.getEntries()) {
			albums.add(getAllPhotos(albumEntry));
		}
		return albums;
	}

	protected Album getAllPhotos(GphotoEntry album_link) throws MalformedURLException, IOException, ServiceException {
		Album album = new Album(album_link.getTitle().getPlainText());

		Link feedHref = album_link.getLink(Link.Rel.FEED, null);
		AlbumFeed feed = service.getFeed(new URL(feedHref.getHref()), AlbumFeed.class);
		List<GphotoEntry> entries_photo = feed.getEntries();
		for (GphotoEntry entry_photo : entries_photo) {
			GphotoEntry adapted = entry_photo.getAdaptedEntry();
			if (adapted instanceof PhotoEntry) {
				PhotoEntry photo = (PhotoEntry)adapted;
//				MediaContent photoData = photo.getMediaContents().get(0);
//				photoData.setFileSize(800); //doesn't resize... must be for uploading or something else
				//album.getPhotos().add(new Photo(photoData.getUrl()));
				
				//this gets the full image size
				//Photo jsonPhoto = new Photo(photo.getMediaContents().get(0).getUrl());
				
				//FIXME an ugly hack to get the file sizes down. try to find a google-approved api
				//eg http://code.google.com/apis/picasaweb/docs/2.0/reference.html#Parameters
				Photo jsonPhoto = new Photo(photo.getMediaThumbnails().get(0).getUrl().replace("s72", "s1024"));
				
				album.getPhotos().add(jsonPhoto);
				
				if(album.getThumbnailURL()==null) {
					//album.setThumbnailURL(photo.getMediaThumbnails().get(0).getUrl());
					album.setThumbnailURL(jsonPhoto.getUrl());
				}

			}
			else {
				System.out.println(adapted.getClass());
			}
		}
		return album;

	}
}
