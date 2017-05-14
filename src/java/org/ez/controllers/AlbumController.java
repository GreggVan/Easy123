package org.ez.controllers;

import com.google.api.services.drive.model.File;
import java.io.IOException;
import java.util.List;

import org.ez.data.Album;
import java.util.ArrayList;
import org.ez.data.Photo;
import org.ez.utils.GoogleDriveConnector;

public class AlbumController {
    GoogleDriveConnector gdc;
    
    public AlbumController() {
        this.gdc = new GoogleDriveConnector();
    }
    
    public List<Album> getAlbums() throws IOException {
        List<Album> albumList = new ArrayList<Album>();        
        
        List<File> albumDirs = getAlbumDirs();
        for( File albumDir : albumDirs )
            albumList.add( createAlbumFromDir(albumDir) );
        
        return albumList;       
    }
    
    private List<File> getAlbumDirs() throws IOException {
        String rootDirId = gdc.getFileId("Easyone_Albums");
        return gdc.getFilesInDir(rootDirId);
    }
    
    private Album createAlbumFromDir(File albumDir) throws IOException {
        Album album = new Album(albumDir.getName());
        addPhotos(album, albumDir);
        album.setThumbnail();
        return album;
    }
    
    private void addPhotos(Album album, File albumDir) throws IOException {
        for( File file : gdc.getFilesInDir(albumDir.getId()) ) {
            System.out.println("*********" + file.getId());
            album.getPhotos().add(new Photo(gdc.getFileUrl(file.getId())));
        }    
    }

    
    public static void main(String args[]) throws IOException {
        AlbumController ac = new AlbumController();
        List<Album> albums = ac.getAlbums();

        
    }

}
