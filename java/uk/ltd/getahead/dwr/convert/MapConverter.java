package uk.ltd.getahead.dwr.convert;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.StringTokenizer;

import uk.ltd.getahead.dwr.ConversionData;
import uk.ltd.getahead.dwr.ConversionException;
import uk.ltd.getahead.dwr.Converter;
import uk.ltd.getahead.dwr.ConverterManager;
import uk.ltd.getahead.dwr.ScriptSetup;

/**
 * An implementation of Converter for Maps.
 * @author Joe Walker [joe at eireneh dot com]
 * @version $Id: StringConverter.java,v 1.2 2004/11/04 15:54:07 joe_walker Exp $
 */
public class MapConverter implements Converter
{
    /* (non-Javadoc)
     * @see uk.ltd.getahead.dwr.Converter#init(uk.ltd.getahead.dwr.Configuration)
     */
    public void init(ConverterManager newConfig)
    {
        this.config = newConfig;
    }

    /* (non-Javadoc)
     * @see uk.ltd.getahead.dwr.Converter#convertTo(java.lang.Class, uk.ltd.getahead.dwr.ConversionData, java.util.Map)
     */
    public Object convertTo(Class paramType, ConversionData data, Map working) throws ConversionException
    {
        String value = data.getValue();
        if (value.trim().equals("null"))
        {
            return null;
        }

        if (value.startsWith("{"))
        {
            value = value.substring(1);
        }
        if (value.endsWith("}"))
        {
            value = value.substring(0, value.length() - 1);
        }

        try
        {
            // Maybe we ought to check that the paramType isn't expecting a more
            // distinct type of Map and attempt to create that?
            Map map = new HashMap();

            // We should put the new object into the working map in case it
            // is referenced later nested down in the conversion process.
            working.put(data, map);

            // Loop through the property declarations
            StringTokenizer st = new StringTokenizer(value, ",");
            int size = st.countTokens();
            for (int i = 0; i < size; i++)
            {
                String token = st.nextToken();
                if (token.trim().length() == 0)
                {
                    continue;
                }

                int colonpos = token.indexOf(":");
                if (colonpos == -1)
                {
                    throw new ConversionException("Missing ':' in object description: " + token);
                }

                String key = token.substring(0, colonpos).trim();
                String val = token.substring(colonpos + 1).trim();

                map.put(key, val);
            }

            return map;
        }
        catch (ConversionException ex)
        {
            throw ex;
        }
        catch (Exception ex)
        {
            throw new ConversionException(ex);
        }
    }

    /* (non-Javadoc)
     * @see uk.ltd.getahead.dwr.Converter#convertFrom(java.lang.Object, java.lang.String, java.util.Map)
     */
    public String convertFrom(Object data, String varname, Map converted) throws ConversionException
    {
        Map map = (Map) data;

        StringBuffer buffer = new StringBuffer();
        buffer.append("var ");
        buffer.append(varname);
        buffer.append(" = new Object();");

        for (Iterator it = map.keySet().iterator(); it.hasNext();)
        {
            String key = (String) it.next();
            String value = (String) map.get(key);

            ScriptSetup nested = config.convertFrom(value, converted);

            // Make sure the nested thing is declared
            buffer.append(nested.initCode);

            // And now declare our stuff
            buffer.append(varname);
            buffer.append(".");
            buffer.append(key);
            buffer.append(" = ");
            buffer.append(nested.assignCode);
            buffer.append(";");
        }

        return buffer.toString();
    }

    /**
     * To forward marshalling requests
     */
    private ConverterManager config;
}
