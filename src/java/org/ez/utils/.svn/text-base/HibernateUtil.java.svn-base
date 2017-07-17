package org.ez.utils;

import java.util.Iterator;
import java.util.Properties;

import org.ez.model.Account;
import org.ez.model.BinaryData;
import org.ez.model.Person;
import org.ez.model.User;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.slf4j.LoggerFactory;

public class HibernateUtil {

	private static SessionFactory sessionFactory;

	private static SessionFactory buildSessionFactory() {
		try {
			// Create the SessionFactory from hibernate.cfg.xml
			return new Configuration()
				.addPackage("org.ez.model")
				.addAnnotatedClass(User.class)
				.addAnnotatedClass(Account.class)
				.addAnnotatedClass(Person.class)
				.addAnnotatedClass(BinaryData.class)
				.configure()
				.buildSessionFactory();
		} catch (Throwable ex) {
			LoggerFactory.getLogger(HibernateUtil.class).error("Initial SessionFactory creation failed", ex);
			throw new ExceptionInInitializerError(ex);
		}
	}
	
	
	/** 
	 * On tomcat6 some properties are set to null and c3p0 crashes with nullpointerexception.
	 * this goes throught all the properties and sets all nulls to blank strings. 
	 */
	private static void fixC3p0() {
		Properties props = System.getProperties();
		for (Iterator ii = props.keySet().iterator(); ii.hasNext(); ) {
			String propKey = (String) ii.next();
			String propVal = props.getProperty( propKey );
			if( propVal == null ) {
				System.err.println("FOUND NULL PROPERTY " + propKey + " ... setting to empty string");
				try {
					System.setProperty(propKey, "");
				}
				catch(Exception e) {}
				
			}
		}

	}

	private static SessionFactory getSessionFactory() {
		if(sessionFactory==null) {
			fixC3p0();
			sessionFactory = buildSessionFactory();
		}
		return sessionFactory;
	}
	
	public static Session getSession() {
		return getSessionFactory().getCurrentSession();
	}
}