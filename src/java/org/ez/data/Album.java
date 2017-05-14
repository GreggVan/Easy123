package org.ez.data;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a JSON version of a Picassa album.
 * @author jmouka
 *
 */
public class Album {
	private String name;
	private String thumbnailURL;
	
	private List<Photo> photos;
	public Album(String name) {
		super();
		this.name = name;
		photos = new ArrayList<Photo>();
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Photo> getPhotos() {
		return photos;
	}
	public void setPhotos(List<Photo> photos) {
		this.photos = photos;
	}
	
	public String getThumbnailURL() {
		return thumbnailURL;
	}
	public void setThumbnailURL(String thumbnailURL) {
		this.thumbnailURL = thumbnailURL;
	}
	public String toString() {
		StringBuilder b = new StringBuilder();
		b.append("\nAlbum:").append(name).append("(").append(thumbnailURL).append(")");
		for(Photo p: photos) {
			b.append("\n\t").append(p.toString());
		}
		return b.toString();
	}
        public void setThumbnail() {
            if( ! photos.isEmpty() )
                this.thumbnailURL = photos.get(0).getUrl();
        }
        
}
