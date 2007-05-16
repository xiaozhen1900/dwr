package org.getahead.dwrdemo.chat;

import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedList;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.directwebremoting.ScriptBuffer;
import org.directwebremoting.ScriptSession;
import org.directwebremoting.WebContext;
import org.directwebremoting.WebContextFactory;

/**
 * @author Joe Walker [joe at getahead dot ltd dot uk]
 */
public class JavascriptChat
{
    /**
     * @param text The new message text to add
     */
    public void addMessage(String text)
    {
        if (text != null && text.trim().length() > 0)
        {
            messages.addFirst(new Message(text));
            while (messages.size() > 10)
            {
                messages.removeLast();
            }
        }

        WebContext wctx = WebContextFactory.get();
        String currentPage = wctx.getCurrentPage();

        ScriptBuffer script = new ScriptBuffer();
        script.appendScript("receiveMessages(")
              .appendData(messages)
              .appendScript(");");

        // Loop over all the users on the current page
        Collection<ScriptSession> sessions = wctx.getScriptSessionsByPage(currentPage);
        for (Iterator<ScriptSession> it = sessions.iterator(); it.hasNext();)
        {
            ScriptSession otherSession = it.next();
            otherSession.addScript(script);
        }
    }

    /**
     * The current set of messages
     */
    private LinkedList<Message> messages = new LinkedList<Message>();

    /**
     * The log stream
     */
    protected static final Log log = LogFactory.getLog(JavascriptChat.class);
}
