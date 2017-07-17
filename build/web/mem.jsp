<%-- 
    Document   : mem
    Created on : Mar 20, 2012, 3:10:51 PM
    Author     : purushothamanramraj
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ page import="java.lang.management.*" %>
<%@ page import="java.util.*" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
        

<table border="0" width="100%">
<tr><td colspan="2" align="center"><h3>Memory MXBean</h3></td></tr>
<tr><td width="200">Heap Memory Usage</td><td>
<%=ManagementFactory.getMemoryMXBean().getHeapMemoryUsage()%>
</td></tr>

<tr>
  <td>Non-Heap Memory Usage</td>
  <td><%=ManagementFactory.getMemoryMXBean().getNonHeapMemoryUsage()%></td>
</tr>
<tr><td colspan="2">&nbsp;</td></tr>
<tr><td colspan="2" align="center"><h3>Memory Pool MXBeans</h3></td></tr>
<%
        Iterator iter = ManagementFactory.getMemoryPoolMXBeans().iterator();
        while (iter.hasNext()) {
            MemoryPoolMXBean item = (MemoryPoolMXBean) iter.next();
%>
<tr><td colspan="2">
<table border="0" width="100%" style="border: 1px #98AAB1 solid;">
<tr><td colspan="2" align="center"><b><%= item.getName() %></b></td></tr>
<tr><td width="200">Type</td><td><%= item.getType() %></td></tr>
<tr><td>Usage</td><td><%= item.getUsage() %></td></tr>
<tr><td>Peak Usage</td><td><%= item.getPeakUsage() %></td></tr>
<tr><td>Collection Usage</td><td><%= item.getCollectionUsage() %></td></tr>
</table>
</td></tr>
<tr><td colspan="2">&nbsp;</td></tr>
<%
}
%>

</table>
        
        
    </body>
</html>
