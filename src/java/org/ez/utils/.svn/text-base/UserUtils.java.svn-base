package org.ez.utils;

import java.util.Date;

import org.ez.model.User;
import org.hibernate.Session;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

public class UserUtils {
	public static String GenerateUniqueUserKey(Session session) throws Exception  {
		String userKey = null;
		while(userKey==null) {
			userKey = Long.toString((new Date()).getTime());
			if(IsUserKeyUnique(session, userKey)==false) {
				userKey = null;
			}
		}
		return userKey;
	}

	/** checks that the string is a unique userKey AND username. */
	public static boolean IsUserKeyUnique(Session session, String val) throws Exception {
		Number count = (Number) session.createCriteria(User.class)
			.add(Restrictions.or(Restrictions.eq("userKey", val), Restrictions.eq("username", val)))
			.setProjection(Projections.rowCount())
			.uniqueResult();
		
		return count.intValue()==0;
	}

}
