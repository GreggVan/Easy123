package org.ez.controllers;

import org.jivesoftware.smack.MessageListener;
import org.jivesoftware.smack.Chat;
import java.util.ArrayList;
import java.util.HashMap;
import org.ez.model.Account;
import org.jivesoftware.smack.ConnectionConfiguration;
import org.jivesoftware.smack.PacketListener;
import org.jivesoftware.smack.Roster;
import org.jivesoftware.smack.RosterEntry;
import org.jivesoftware.smack.XMPPConnection;
import org.jivesoftware.smack.XMPPException;
import org.jivesoftware.smack.filter.MessageTypeFilter;
import org.jivesoftware.smack.filter.PacketFilter;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Packet;
import org.jivesoftware.smack.packet.Presence;
import org.jivesoftware.smack.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author nandu
 */
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    XMPPConnection connection;
    boolean newMessageStatus = false;
    HashMap<String, String> messageBean = null;
    ArrayList allMessages = new ArrayList();

    public ChatController() {
    }

    public class MessageParrot implements PacketListener {

        private XMPPConnection xmppConnection;

        public MessageParrot(XMPPConnection conn) {
            xmppConnection = conn;
        }

        public void processPacket(Packet packet) {
            Message message = (Message) packet;
            if (message.getBody() != null) {
                String fromName = StringUtils.parseBareAddress(message.getFrom());
                messageBean = new HashMap<String, String>();
                messageBean.put("userName", fromName);
                messageBean.put("message", message.getBody());
                allMessages.add(messageBean);
//                System.out.print("processMessage" + message.getBody());
//                System.out.println(message.getFrom());
                newMessageStatus = true;
            }
        }
        public String sendPacket(String body, String to) {
        try {
            System.out.print("host name ::: " + connection.getHost());
            Message message = new Message();
            message.setTo(to);
            message.setBody(body);
            connection.sendPacket(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }
    };

//    public void processPacket(Packet packet) {
//        Message message = (Message) packet;
//        if (message.getBody() != null) {
//            try {
//                String fromName = StringUtils.parseBareAddress(message.getFrom());
//                System.out.println("Message from " + fromName + "\n" + message.getBody() + "\n");
//                messageBean = new HashMap<String, String>();
//                messageBean.put("userName", fromName);
//                messageBean.put("message", message.getBody());
//                allMessages.add(messageBean);
//                System.out.print("processMessage" + message.getBody());
//                System.out.println(message.getFrom());
//                newMessageStatus = true;
//            } catch (Exception e) {
//            }
//            //  Message reply = new Message();
//            //   reply.setTo(fromName);
//            //   reply.setBody("I am a Java bot. You said: " + message.getBody());
//            //   xmppConnection.sendPacket(reply);
//        }
//    }
    public String sendPacket(String body, String to) {
        try {
            System.out.print("host name ::: " + connection.getHost());
            Message message = new Message();
            message.setTo(to);
            message.setBody(body);
            connection.sendPacket(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    public ArrayList connect(Account account) {
        ConnectionConfiguration connConfig = new ConnectionConfiguration("talk.google.com", 5222, "gmail.com");
        connection = new XMPPConnection(connConfig);
        ArrayList roster = null;
        try {
            // Connect
            connection.connect();

            // Login with appropriate credentials
        //    System.out.print("User Name :: " + account.getEmail());
        //    System.out.print("User Password :: " + account.getPassword());
            connection.login(account.getEmail(), account.getPassword());
            Presence presence = new Presence(Presence.Type.available);
            connection.sendPacket(presence);
            PacketFilter filter = new MessageTypeFilter(Message.Type.chat);
            connection.addPacketListener(new MessageParrot(connection), filter);
            // Get the user's roster
            roster = getRosters(connection);
            //sendMessage("hi guess what?/ .. I made an application to work with gtalk and this is a test chat of that", "nandu8201@gmail.com");
        } catch (XMPPException e) {
            // Do something better than this!
            e.printStackTrace();
        }
        return roster;
    }

    public ArrayList getRosters(XMPPConnection con) {

        HashMap<String, String> contact = null;
        ArrayList contactList = new ArrayList();
        Roster roster = con.getRoster();

        // Print the number of contacts
     //   System.out.println("Number of contacts: " + roster.getEntryCount());


        // Enumerate all contacts in the user's roster

        for (RosterEntry entry : roster.getEntries()) {
            contact = new HashMap<String, String>();
            try {
                if (entry.getName() == null) {
                    contact.put("userName", "");
                } else {
                    contact.put("userName", entry.getName());
                }
                contact.put("emailId", entry.getUser());
                contactList.add(contact);
            } catch (Exception e) {
                e.printStackTrace();
            }

        }

        return contactList;
    }

    public String sendMessage(String message, String to) throws XMPPException {
        new MessageParrot(connection).sendPacket(message, to);
        return null;
    }
//    public void processMessage(Chat chat, Message message) {
//        System.out.println("inside process message");
//        if (message.getType() == Message.Type.chat) {
//            try {
//                messageBean = new HashMap<String, String>();
//                messageBean.put("userName", chat.getParticipant());
//                messageBean.put("message", message.getBody());
//                allMessages.add(messageBean);
//                System.out.print("processMessage" + message.getBody());
//                System.out.println(message.getFrom());
//                newMessageStatus = true;
//            } catch (Exception e) {
//                System.out.print("error");
//                log.error("error process chat message", e);
//            }
//        }
//    }
    public ArrayList checkMessage() {
        if (!connection.isConnected()) {
            try {
                connection.connect();
            } catch (Exception e) {
                log.error("Check Message Method :: Could not connect to gtalk", e);
            }
        }
        if (newMessageStatus) {
            ArrayList responseChat = allMessages;
            allMessages = new ArrayList();
            System.out.println(responseChat);
            newMessageStatus = false;
            return responseChat;
        } else {
            return null;
        }
    }

    public synchronized void close() {
        try {
            if (connection.isConnected()) {
                Presence presence = new Presence(Presence.Type.unavailable);
                connection.sendPacket(presence);
                connection.disconnect();
                connection = null;
            }
        } catch (Exception e) {
            log.warn("exception while shutting down chat connection", e);
        }
    }
}
