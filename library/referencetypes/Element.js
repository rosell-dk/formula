// Note: jQuery required!

/**
 *  Multiple syntaxes for referencing property of a DOM node
 *
 *  The reference is parsed into two parts.
 *  First part dictates how to find the input element.
 *  Examples: 
 *    '#id:bananas' - find the element by id (in this case: id=bananas)
 *    '#name:bananas' - find the element by name
 *    '#bananas' - also find the element by id
 *
 *  The second part tells what to return
 *    '#bananas.value' - Return the value of the input
 *    '#bananas.element' - Return the input element itself
 *    '#bananas.attr:class  - Return the attribute (in this case the "class" attribute)
 *    '#bananas.propertyname  - Return any named property on the DOM node. Ie. #bananas.checked will return the checked property
 *
 */
Formula.addParser(function(text) {
  if (text[0] != '#') {
    return
  }
  var parts = text.substr(1).split('.');

  var sel = parts[0];
  var valuePart = parts[1];

  var elm;
  if (sel.substr(0, 3) == 'id:') {
    elm = document.getElementById(sel.substr(3));
  }
  else if (sel.substr(0, 5) == 'name:') {
    elm = $("[name='" + sel.substr(5) + "']").get(0);
  }
  else {
    elm = document.getElementById(sel);
  }
  if (elm) {
    // Return a "Bound variable". (an object with a getValue() function, and a setChangeCallback() function
    return {
      getValue: function () {
        if (valuePart === undefined) {
          return elm.value;
        }
        if (valuePart.substr(0, 5) == 'attr:') {
          return $(elm).attr(valuePart.substr(5));
        }
        switch (valuePart) {
          case 'undefined':
          case 'value':
            return elm.value;
          case 'element':
            return elm;
          default:
            return elm[valuePart];
        }
      },
      setChangeCallback: function(changeCallback) {
        // This is where jQuery is needed.
        // TODO: do not depend on jQuery
        $(elm).bind("change", changeCallback);
      }
    }
  }
});

