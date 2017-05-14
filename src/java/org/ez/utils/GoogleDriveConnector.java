/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.ez.utils;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.io.IOException;
import java.util.List;

/**
 *
 * @author purushothamanramraj
 */
public class GoogleDriveConnector {
    
    final String CLIENT_ID = "653076092119-of8b0ia81c73r6pg7d8b7gf3ml1jtu7a.apps.googleusercontent.com";
    final String CLIENT_SECRET = "c_fTJxWBIfzlEZEVj4uCRLx2";
    final String TOKEN = "1/HKRSu-SiVvorkV21OtSmWtHoVc2U-DtfHl5gNpC-qSV6HOWb1Sw8MelKkxobh1qt";
    final String APP = "Easyone";   
    
    JsonFactory jsonFactory;
    HttpTransport httpTransport;
    Drive drive;
    GoogleCredential googleCredential;
    
    public GoogleDriveConnector() {
        jsonFactory = new JacksonFactory();
        httpTransport = new NetHttpTransport(); 
        initDrive();
    }
        
    private void initDrive() {
        
        authorize();
        this.drive = new Drive.Builder(httpTransport, jsonFactory, this.googleCredential)
                .setApplicationName(APP)
                .build();    
    }
    
    private void authorize() {
        GoogleTokenResponse response = new GoogleTokenResponse();
        response.setRefreshToken(TOKEN);
        this.googleCredential = new GoogleCredential.Builder().setTransport(httpTransport)
            .setJsonFactory(jsonFactory)
            .setClientSecrets(CLIENT_ID, CLIENT_SECRET)
            .build()
            .setFromTokenResponse(response);     
    }

    public List<File> getFilesInDir(String dirId) throws IOException {
        FileList result = this.drive.files().list()
                .setQ(String.format("'%s' in parents", dirId))
                .setFields("files(id, name)")
                .execute(); 
        
        return result.getFiles();
    }
    
    public String getFileId(String name) throws IOException {
        FileList result = this.drive.files().list()
                .setQ(String.format("name = '%s'", name))
             .setFields("files(id)")
             .execute();

        return isEmpty(result) ? "" : result.getFiles().get(0).getId();
            
    }
    
    public String getFileUrl(String id) {
        return "https://drive.google.com/uc?export=view&id=" + id;
    }
    
    private boolean isEmpty(FileList fileList) {
        return fileList==null || fileList.getFiles().isEmpty();
    }
    
}
