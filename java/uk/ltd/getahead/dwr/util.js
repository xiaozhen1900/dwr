
// See: http://www.crockford.com/javascript/jslint.html
/*global DWREngine, Option, alert, document, setTimeout, window */

/**
 * Declare a constructor function to which we can add real functions.
 * @constructor
 */
function DWRUtil() { }

////////////////////////////////////////////////////////////////////////////////
// The following functions are described in util-compat.html

/**
 * Enables you to react to return being pressed in an input
 * For example:
 * <code>&lt;input type="text" onkeypressed="DWRUtil.onReturn(event, methodName)"/&gt;</code>
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param event The event object for Netscape browsers
 * @param action Method name to execute when return is pressed
 */
DWRUtil.onReturn = function(event, action)
{
    if (!event)
    {
        event = window.event;
    }

    if (event && event.keyCode && event.keyCode == 13)
    {
        action();
    }
};

/**
 * Select a specific range in a text box.
 * This is useful for 'google suggest' type functionallity.
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param ele The id of the text input element or the HTML element itself
 * @param start The beginning index
 * @param end The end index 
 */
DWRUtil.selectRange = function(ele, start, end)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("selectRange() can't find an element with id: " + orig + ".");
        return;
    }

    if (ele.setSelectionRange)
    {
        ele.setSelectionRange(start, end);
    }
    else if (ele.createTextRange)
    {
        var range = ele.createTextRange();
        range.moveStart("character", start);
        range.moveEnd("character", end - ele.value.length);
        range.select();
    }

    ele.focus();
};

////////////////////////////////////////////////////////////////////////////////
// The following functions are described in util-general.html

/**
 * Find the element in the current HTML document with the given id, or if more
 * than one parameter is passed, return an array containing the found elements.
 * Any non-string arguments are left as is in the reply.
 * This function is inspired by the prototype library however it probably works
 * on more browsers than the original.
 * @see http://www.getahead.ltd.uk/dwr/util-general.html
 */
function $()
{
    var elements = new Array();

    for (var i = 0; i < arguments.length; i++)
    {
        var element = arguments[i];
        if (typeof element == 'string')
        {
            if (document.getElementById)
            {
                element = document.getElementById(element);
            }
            else if (document.all)
            {
                element = document.all[element];
            }
        }

        if (arguments.length == 1) 
        {
            return element;
        }

        elements.push(element);
    }

    return elements;
}

/**
 * A better toString than the default for an Object
 * @param data The object to describe
 * @param level 0 = Single line of debug, 1 = Multi-line debug that does not
 *              dig into child objects, 2 = Multi-line debug that digs into the
 *              2nd layer of child objects
 * @see http://www.getahead.ltd.uk/dwr/util-general.html
 */
DWRUtil.toDescriptiveString = function(data, level)
{
    var reply = "";
    var i = 0;
    var value;

    if (DWRUtil.isArray(data))
    {
        reply = "[";
        for (i = 0; i < data.length; i++)
        {
            try
            {
                obj = data[i];

                if (obj == null || typeof obj == "function")
                {
                    continue;
                }
                else if (typeof obj == "object" && level > 0)
                {
                    value = DWRUtil.toDescriptiveString(obj, level - 1);
                }
                else
                {
                    value = "" + obj;
                    value = value.replace(/\/n/g, "\\n");
                    value = value.replace(/\/t/g, "\\t");
                }
            }
            catch (ex)
            {
                value = "" + ex;
            }

            if (value.length > 13)
            {
                value = value.substring(0, 10) + "...";
            }

            reply += value;
            reply += ", ";

            if (level != 0)
            {
                reply += "\n";
            }

            if (level == 0 && i > 5)
            {
                reply += "...";
                break;
            }
        }
        reply += "]";

        return reply;
    }

    if (typeof data == "string" || typeof data == "number" || DWRUtil.isDate(data))
    {
        return data.toString();
    }

    if (typeof data == "object")
    {
        var typename = DWRUtil.detailedTypeOf(data);
        if (typename != "Object")
        {
            reply = typename + " ";
        }
        reply += "{";

        var isHtml = DWRUtil.isHTMLElement(data);

        for (var prop in data)
        {
            if (isHtml)
            {
                if (prop.toUpperCase() == prop || prop == "title" ||
                    prop == "lang" || prop == "dir" || prop == "className" ||
                    prop == "form" || prop == "name" || prop == "prefix" ||
                    prop == "namespaceURI" || prop == "nodeType" ||
                    prop == "firstChild" || prop == "lastChild" ||
                    prop.match(/^offset/))
                {
                    // HTML nodes have far too much stuff. Chop out the constants
                    continue;
                }
            }

            value = "";

            try
            {
                obj = data[prop];

                if (obj == null || typeof obj == "function")
                {
                    continue;
                }
                else if (typeof obj == "object" && level > 0)
                {
                    value = DWRUtil.toDescriptiveString(obj, level - 1);
                }
                else
                {
                    value = "" + obj;
                    value = value.replace(/\/n/g, "\\n");
                    value = value.replace(/\/t/g, "\\t");
                }
            }
            catch (ex)
            {
                value = "" + ex;
            }

            if (level == 0 && value.length > 13)
            {
                value = value.substring(0, 10) + "...";
            }

            reply += prop;
            reply += ":";
            reply += value;
            reply += ", ";

            if (level != 0)
            {
                reply += "\n";
            }

            i++;
            if (level == 0 && i > 5)
            {
                reply += "...";
                break;
            }
        }

        reply += "}";

        return reply;
    }

    return data.toString();
};

/**
 * Setup a GMail style loading message.
 * @see http://www.getahead.ltd.uk/dwr/util-general.html
 */
DWRUtil.useLoadingMessage = function()
{
    var disabledZone = document.createElement('div');
    disabledZone.setAttribute('id', 'disabledZone');
    disabledZone.style.position = "absolute";
    disabledZone.style.zIndex = "1000";
    disabledZone.style.left = "0px";
    disabledZone.style.top = "0px";
    disabledZone.style.width = "100%";
    disabledZone.style.height = "100%";
    document.body.appendChild(disabledZone);

    var messageZone = document.createElement('div');
    messageZone.setAttribute('id', 'messageZone');
    messageZone.style.position = "absolute";
    messageZone.style.top = "0px";
    messageZone.style.right = "0px";
    messageZone.style.background = "red";
    messageZone.style.color = "white";
    messageZone.style.fontFamily = "Arial,Helvetica,sans-serif";
    messageZone.style.padding = "4px";
    disabledZone.appendChild(messageZone);

    var text = document.createTextNode('Loading');
    messageZone.appendChild(text);

    $('disabledZone').style.visibility = 'hidden';

    DWREngine.setPreHook(function() { $('disabledZone').style.visibility = 'visible'; });
    DWREngine.setPostHook(function() { $('disabledZone').style.visibility = 'hidden'; });
};

////////////////////////////////////////////////////////////////////////////////
// The following functions are described in util-simple.html

/**
 * Set the value for the given id to the specified val.
 * This method works for selects (where the option with a matching value and
 * not text is selected), input elements (including textareas) divs and spans.
 * @see http://www.getahead.ltd.uk/dwr/util-simple.html
 * @param ele The id of the element or the HTML element itself
 */
DWRUtil.setValue = function(ele, val)
{
    if (val == null)
    {
        val = "";
    }

    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("setValue() can't find an element with id: " + orig + ".");
        return;
    }

    if (DWRUtil.isHTMLElement(ele, "select"))
    {
        // search through the values
        var found  = false;
        var i;

        for (i = 0; i < ele.options.length; i++)
        {
            if (ele.options[i].value == val)
            {
                ele.options[i].selected = true;
                found = true;
            }
            else
            {
                ele.options[i].selected = false;
            }
        }

        // If that fails then try searching through the visible text
        if (found)
        {
            return;
        }

        for (i = 0; i < ele.options.length; i++)
        {
            if (ele.options[i].text == val)
            {
                ele.options[i].selected = true;
                break;
            }
        }

        return;
    }

    if (DWRUtil.isHTMLElement(ele, "input"))
    {
        switch (ele.type)
        {
        case "checkbox":
        case "check-box":
        case "radio":
            ele.checked = (val == true);
            return;

        default:
            ele.value = val;
            return;
        }
    }

    if (DWRUtil.isHTMLElement(ele, "textarea"))
    {
        ele.value = val;
        return;
    }

    ele.innerHTML = val;
};

/**
 * The counterpart to setValue() - read the current value for a given element.
 * This method works for selects (where the option with a matching value and
 * not text is selected), input elements (including textareas) divs and spans.
 * @see http://www.getahead.ltd.uk/dwr/util-simple.html
 * @param ele The id of the element or the HTML element itself
 */
DWRUtil.getValue = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("getValue() can't find an element with id: " + orig + ".");
        return;
    }

    if (DWRUtil.isHTMLElement(ele, "select"))
    {
        // This is a bit of a scam because it assumes single select
        // but I'm not sure how we should treat multi-select.
        var sel = ele.selectedIndex;
        if (sel != -1)
        {
            var reply = ele.options[sel].value;
            if (reply == null || reply == "")
            {
                reply = ele.options[sel].text;
            }

            return reply;
        }
        else
        {
            return "";
        }
    }

    if (DWRUtil.isHTMLElement(ele, "input"))
    {
        switch (ele.type)
        {
        case "checkbox":
        case "check-box":
        case "radio":
            return ele.checked;

        default:
            return ele.value;
        }
    }

    if (DWRUtil.isHTMLElement(ele, "textarea"))
    {
        return ele.value;
    }

    return ele.innerHTML;
};

/**
 * getText() is like getValue() with the except that it only works for selects
 * where it reads the text of an option and not it's value.
 * @see http://www.getahead.ltd.uk/dwr/util-simple.html
 * @param ele The id of the element or the HTML element itself
 */
DWRUtil.getText = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("getText() can't find an element with id: " + orig + ".");
        return;
    }

    if (!DWRUtil.isHTMLElement(ele, "select"))
    {
        alert("getText() can only be used with select elements. Attempt to use: " + DWRUtil.detailedTypeOf(ele) + " from  id: " + orig + ".");
        return;
    }

    // This is a bit of a scam because it assumes single select
    // but I'm not sure how we should treat multi-select.
    var sel = ele.selectedIndex;
    if (sel != -1)
    {
        return ele.options[sel].text;
    }
    else
    {
        return "";
    }
};

/**
 * Given a map, call setValue() for all the entries in the map using the key
 * of each entry as an id.
 * @see http://www.getahead.ltd.uk/dwr/util-simple.html
 * @param map The map of values to set to various elements
 */
DWRUtil.setValues = function(map)
{
    for (var property in map)
    {
        var ele = $(property);
        if (ele != null)
        {
            var value = map[property];
            DWRUtil.setValue(property, value);
        }
    }
};

/**
 * Given a map, call getValue() for all the entries in the map using the key
 * of each entry as an id.
 * @see http://www.getahead.ltd.uk/dwr/util-simple.html
 * @param map The map of values to set to various elements
 */
DWRUtil.getValues = function(map)
{
    for (var property in map)
    {
        var ele = $(property);
        if (ele != null)
        {
            map[property] = DWRUtil.getValue(property);
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
// The following functions are described in util-list.html

/**
 * Remove all the options from a select list (specified by id)
 * @see http://www.getahead.ltd.uk/dwr/util-list.html
 * @param ele The id of the list element or the HTML element itself
 */
DWRUtil.removeAllOptions = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("removeAllOptions() can't find an element with id: " + orig + ".");
        return;
    }

    if (!DWRUtil.isHTMLElement(ele, "select"))
    {
        alert("removeAllOptions() can only be used with select elements. Attempt to use: " + DWRUtil.detailedTypeOf(ele));
        return;
    }

    // Empty the list
    ele.options.length = 0;
};

/**
 * Add options to a list from an array or map.
 * DWRUtil.addOptions has 4 modes:
 * <p><b>Array</b><br/>
 * DWRUtil.addOptions(selectid, data) and a set of options are created with the
 * text and value set to the string version of each array element.
 * </p>
 * <p><b>Array of objects, using option text = option value</b><br/>
 * DWRUtil.addOptions(selectid, data, prop) creates an option for each array
 * element, with the value and text of the option set to the given property of
 * each object in the array.
 * </p>
 * <p><b>Array of objects, with differing option text and value</b><br/>
 * DWRUtil.addOptions(selectid, data, valueprop, textprop) creates an option for
 * each object in the array, with the value of the option set to the given
 * valueprop property of the object, and the option text set to the textprop
 * property.
 * </p>
 * <p><b>Map (object)</b><br/>
 * DWRUtil.addOptions(selectid, map, reverse) creates an option for each
 * property. The property names are used as option values, and the property
 * values are used as option text, which sounds wrong, but is actually normally
 * the right way around. If reverse evaluates to true then the property values
 * are used as option values.
 * @see http://www.getahead.ltd.uk/dwr/util-list.html
 * @param ele The id of the list element or the HTML element itself
 * @param data An array or map of data items to populate the list
 * @param valuerev (optional) If data is an array of objects, an optional
 *        property name to use for option values. If the data is a map then this
 *        boolean property allows you to swap keys and values.
 * @param textprop (optional) Only for use with arrays of objects - an optional
 *        property name for use as the text of an option.
 */
DWRUtil.addOptions = function(ele, data, valuerev, textprop)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("fillList() can't find an element with id: " + orig + ".");
        return;
    }

    if (!DWRUtil.isHTMLElement(ele, "select"))
    {
        alert("fillList() can only be used with select elements. Attempt to use: " + DWRUtil.detailedTypeOf(ele));
        return;
    }

    // Bail if we have no data
    if (data == null)
    {
        return;
    }

    var text;
    var value;

    if (DWRUtil.isArray(data))
    {
        // Loop through the data that we do have
        for (var i = 0; i < data.length; i++)
        {
            if (valuerev != null)
            {
                if (textprop != null)
                {
                    text = data[i][textprop];
                    value = data[i][valuerev];
                }
                else
                {
                    value = data[i][valuerev];
                    text = value;
                }
            }
            else
            {
                if (textprop != null)
                {
                    text = data[i][textprop];
                    value = text;
                }
                else
                {
                    text = DWRUtil.toDescriptiveString(data[i]);
                    value = text;
                }
            }

            var opt = new Option(text, value);
            ele.options[ele.options.length] = opt;
        }
    }
    else
    {
        for (var prop in data)
        {
            if (valuerev)
            {
                text = prop;
                value = data[prop];
            }
            else
            {
                text = data[prop];
                value = prop;
            }

            var opt = new Option(text, value);
            ele.options[ele.options.length] = opt;
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
// The following functions are described in util-table.html

/**
 * Under the tbody (given by id) create a row for each element in the data
 * and for that row create one cell for each function in the cellFuncs array
 * by passing the rows object (from the data) to the given function.
 * The return from the function is used to populate the cell.
 * <p>The pseudo code looks something like this:
 * <pre>
 *   for each member of the data array
 *     for function in the cellFuncs array
 *       create cell from cellFunc(data[i])
 * </pre>
 * One slight modification to this is that any members of the cellFuncs array
 * that are strings instead of functions, the strings are used as cell contents
 * directly.
 * <p>Note that this function uses instanceof to detect strings which may break
 * on IE5 Mac. So we might need to rely on typeof == "string" alone. I'm not
 * yet sure if this might be an issue.
 * @see http://www.getahead.ltd.uk/dwr/util-table.html
 * @param ele The id of the tbody element
 * @param data Array containing one entry for each row in the updated table
 * @param cellFuncs An array of functions (one per column) for extracting cell
 *    data from the passed row data
 */
DWRUtil.addRows = function(ele, data, cellFuncs)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("addRows() can't find an element with id: " + orig + ".");
        return;
    }

    if (!DWRUtil.isHTMLElement(ele, "table") && !DWRUtil.isHTMLElement(ele, "tbody") &&
        !DWRUtil.isHTMLElement(ele, "thead") && !DWRUtil.isHTMLElement(ele, "tfoot"))
    {
        alert("addRows() can only be used with table, tbody, thead and tfoot elements. Attempt to use: " + DWRUtil.detailedTypeOf(ele));
        return;
    }

    // assure bug-free redraw in Gecko engine by
    // letting window show cleared table
    if (navigator.product && navigator.product == "Gecko")
    {
        setTimeout(function() { DWRUtil._addRowsInner(ele, data, cellFuncs); }, 0);
    }
    else
    {
        DWRUtil._addRowsInner(ele, data, cellFuncs);
    }
};

/**
 * Internal function to help rendering tables.
 * @see DWRUtil.addRows(ele, data, cellFuncs)
 * @private
 */
DWRUtil._addRowsInner = function(ele, data, cellFuncs)
{
    var frag = document.createDocumentFragment();

    if (DWRUtil.isArray(data))
    {
        // loop through data source
        for (var i = 0; i < data.length; i++)
        {
            DWRUtil._addRowInner(frag, data[i], cellFuncs);
        }
    }
    else if (typeof data == "object")
    {
        for (var row in data)
        {
            DWRUtil._addRowInner(frag, row, cellFuncs);
        }
    }

    ele.appendChild(frag);
};

/**
 * Iternal function to draw a single row of a table.
 * @private
 */
DWRUtil._addRowInner = function(frag, row, cellFuncs)
{
    var tr = document.createElement("tr");

    for (var j = 0; j < cellFuncs.length; j++)
    {
        var func = cellFuncs[j];
        var td;

        if (typeof func == "string")
        {
            td = document.createElement("td");
            var text = document.createTextNode(func);
            td.appendChild(text);
            tr.appendChild(td);
        }
        else
        {
            var reply = func(row);

            if (DWRUtil.isHTMLElement(reply, "td"))
            {
                td = reply;
            }
            else if (DWRUtil.isHTMLElement(reply))
            {
                td = document.createElement("td");
                td.appendChild(reply);
            }
            else
            {
                td = document.createElement("td");
                td.innerHTML = reply;
                //var text = document.createTextNode(reply);
                //td.appendChild(text);
            }

            tr.appendChild(td);
        }
    }

    frag.appendChild(tr);
};

/**
 * Remove all the children of a given node.
 * Most useful for dynamic tables where you clearChildNodes() on the tbody
 * element.
 * @see http://www.getahead.ltd.uk/dwr/util-table.html
 * @param ele The id of the element or the HTML element itself
 */
DWRUtil.removeAllRows = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("clearChildNodes() can't find an element with id: " + orig + ".");
        return;
    }

    while (ele.childNodes.length > 0)
    {
        ele.removeChild(ele.firstChild);
    }
};

////////////////////////////////////////////////////////////////////////////////
// Private functions only below here

/**
 * Browser detection code.
 * This is eeevil, but the official way [if (window.someFunc) ...] does not
 * work when browsers differ in rendering ability rather than the use of someFunc()
 * For internal use only.
 * @private
 */
DWRUtil._agent = navigator.userAgent.toLowerCase();

/**
 * @private
 */
DWRUtil._isIE = ((DWRUtil._agent.indexOf("msie") != -1) && (DWRUtil._agent.indexOf("opera") == -1));

/**
 * Is the given node an HTML element (optionally of a given type)?
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param ele The element to test
 * @param nodeName eg input, textarea - optional extra check for node name
 * @private
 */
DWRUtil.isHTMLElement = function(ele, nodeName)
{
    if (nodeName == null)
    {
        // If I.E. worked properly we could use:
        //  return typeof ele == "object" && ele instanceof HTMLElement;
        return ele != null &&
               typeof ele == "object" &&
               ele.nodeName != null;
    }
    else
    {
        return ele != null &&
               typeof ele == "object" &&
               ele.nodeName != null &&
               ele.nodeName.toLowerCase() == nodeName.toLowerCase();
    }
};

/**
 * Like typeOf except that more information for an object is returned other
 * than "object"
 * @private
 */
DWRUtil.detailedTypeOf = function(x)
{
    var reply = typeof x;

    if (reply == "object")
    {
        reply = Object.prototype.toString.apply(x);  // Returns "[object class]"
        reply = reply.substring(8, reply.length-1);  // Just get the class bit
    }

    return reply;
};

////////////////////////////////////////////////////////////////////////////////
// Deprecated functions only below here

/**
 * Is the given node an HTML input element?
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param ele The element to test
 * @deprecated Use isHTMLElement with a type field
 */
DWRUtil.isHTMLInputElement = function(ele)
{
    return DWRUtil.isHTMLElement(ele, "input");
};

/**
 * Is the given node an HTML textarea element?
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param ele The element to test
 * @deprecated Use isHTMLElement with a type field
 */
DWRUtil.isHTMLTextAreaElement = function(ele)
{
    return DWRUtil.isHTMLElement(ele, "textarea");
};

/**
 * Is the given node an HTML select element?
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param ele The element to test
 * @deprecated Use isHTMLElement with a type field
 */
DWRUtil.isHTMLSelectElement = function(ele)
{
    return DWRUtil.isHTMLElement(ele, "select");
};

/**
 * Array detector.
 * This is an attempt to work around the lack of support for instanceof in
 * some browsers.
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param data The object to test
 * @returns true iff <code>data</code> is an Array
 * @deprecated Not sure if DWR is the right place for this or if we support old browsers
 */
DWRUtil.isArray = function(data)
{
    return (data && data.join) ? true : false;
};

/**
 * Date detector.
 * This is an attempt to work around the lack of support for instanceof in
 * some browsers.
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param data The object to test
 * @returns true iff <code>data</code> is a Date
 * @deprecated Not sure if DWR is the right place for this or if we support old browsers
 */
DWRUtil.isDate = function(data)
{
    return (data && data.toUTCString) ? true : false;
};

/**
 * Like document.getElementById() that works in more browsers.
 * @param id The id of the element
 * @deprecated Use $()
 */
DWRUtil.getElementById = function(id)
{
    if (document.getElementById)
    {
        return document.getElementById(id);
    }
    else if (document.all)
    {
        return document.all[id];
    }

    return null;
};

/**
 * Visually enable or diable an element.
 * @see http://www.getahead.ltd.uk/dwr/util-compat.html
 * @param ele The id of the element or the HTML element itself
 * @param state Boolean true/false to set if the element should be enabled
 */
DWRUtil.setEnabled = function(ele, state)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("setEnabled() can't find an element with id: " + orig + ".");
        return;
    }

    // If we want to get funky and disable divs and spans by changing the font
    // colour or something then we might want to check the element type before
    // we make assumptions, but in the mean time ...
    // if (DWRUtil.isHTMLElement(ele, "input")) { ... }

    ele.disabled = !state;
    ele.readonly = !state;
    if (DWRUtil._isIE)
    {
        if (state)
        {
            ele.style.backgroundColor = "White";
        }
        else
        {
            // This is WRONG but the hack will do for now.
            ele.style.backgroundColor = "Scrollbar";
        }
    }
};

/**
 * Set the CSS display style to 'block'
 * @param ele The id of the element or the HTML element itself
 * @deprecated DWR isn't a generic Javascript library
 */
DWRUtil.showById = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("showById() can't find an element with id: " + orig + ".");
        return;
    }

    // Apparently this works better that display = 'block'; ???
    ele.style.display = '';
};

/**
 * Set the CSS display style to 'none'
 * @param ele The id of the element or the HTML element itself
 * @deprecated DWR isn't a generic Javascript library
 */
DWRUtil.hideById = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("hideById() can't find an element with id: " + orig + ".");
        return;
    }

    ele.style.display = 'none';
};

/**
 * Toggle an elements visibility
 * @param ele The id of the element or the HTML element itself
 * @deprecated DWR isn't a generic Javascript library
 */
DWRUtil.toggleDisplay = function(ele)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("toggleDisplay() can't find an element with id: " + orig + ".");
        return;
    }

    if (ele.style.display == 'none')
    {
        // Apparently this works better that display = 'block'; ???
        ele.style.display = '';
    }
    else
    {
        ele.style.display = 'none';
    }
};

/**
 * Alter an rows in a table that have a class of zebra to have classes of either
 * oddrow or evenrow alternately.
 * This is probably not the best place for this method, but I dont want to have
 * to fight with multiple onload functions.
 * @deprecated DWR isn't a generic Javascript library
 */
DWRUtil.alternateRowColors = function()
{
    var tables = document.getElementsByTagName("table");
    var rowCount = 0;

    for (var i = 0; i < tables.length; i++)
    {
        var table = tables.item(i);
        var rows = table.getElementsByTagName("tr");

        for (var j = 0; j < rows.length; j++)
        {
            var row = rows.item(j);
            if (row.className == "zebra")
            {
                if (rowCount % 2)
                {
                    row.className = 'oddrow';
                }
                else
                {
                    row.className = 'evenrow';
                }

                rowCount++;
            }
        }

        rowCount = 0;
    }
};

/**
 * Set the CSS class for an element
 * @param ele The id of the element or the HTML element itself
 * @deprecated DWR isn't a generic Javascript library
 */
DWRUtil.setCSSClass = function(ele, cssclass)
{
    var orig = ele;
    ele = $(ele);
    if (ele == null)
    {
        alert("setCSSClass() can't find an element with id: " + orig + ".");
        return;
    }

    ele.className = cssclass;
};

/**
 * Ensure a function is called when the page is loaded
 * @param load The function to call when the page has been loaded
 * @deprecated DWR isn't a generic Javascript library
 */
DWRUtil.callOnLoad = function(load)
{
    if (window.addEventListener)
    {
        window.addEventListener("load", load, false);
    }
    else if (window.attachEvent)
    {
        window.attachEvent("onload", load);
    }
    else
    {
        window.onload = load;
    }
};

/**
 * Remove all the options from a select list (specified by id) and replace with
 * elements in an array of objects.
 * @deprecated Use DWRUtil.removeAllOptions(ele); DWRUtil.addOptions(ele, data, valueprop, textprop);
 */
DWRUtil.fillList = function(ele, data, valueprop, textprop)
{
    DWRUtil.removeAllOptions(ele);
    DWRUtil.addOptions(ele, data, valueprop, textprop);
};

/**
 * Add rows to a table
 * @deprecated Use addRows()
 */
DWRUtil.drawTable = function(ele, data, cellFuncs)
{
    DWRUtil.addRows(ele, data, cellFuncs);
};

/**
 * We can use this function to deprecate things.
 * @deprecated
 * @private
 */
DWRUtil._deprecated = function(fname)
{
    alert("Utility functions like " + fname + "() are deprecated. Please convert to the DWRUtil.xxx() versions");
};
