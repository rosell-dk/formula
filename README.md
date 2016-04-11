# formula
Generic engine for parsing and running excel-like formulas

## No functions predefined
formula is born without any functions. It is however very easy to add a function:

```javascript
Formula.addFunction('ADD_TWO_NUMBERS', function(a, b) {
  return a+b;
});
```

## Creating a formula
A formula is created with the Formula constructor, which takes the formula as an argument, and optionally a callback, which we will be called whenever the result changes, due to a reference that has changed (we will get to references in a minute)

```javascript
  var simpleFormula = new Formula('ADD_TWO_NUMBERS(0.1,9)', changeCallback);
```

To run the calculation, you simply call the "calc()" method:

```javascript
  var result = simpleFormula.calc();
```

## No reference types are predefined either
Formulas are much more fun, when they can reference stuff. For example, you might want to reference a number, which the user enters in an html input field. Or the result of another formula. Or something entered in a jQuery widget. Or a data model representing data in a database. Or...

To enable references, you need to create and add a reference type first.
Here is an example of adding a reference type, which enables the formulas to reference input-elements with a #id-syntax, and react when these changes.

```javascript
function InputReference(ref) {
  this.elm = document.getElementById(ref);
}
InputReference.prototype.getValue = function() {
  return $(this.elm).val();
}
InputReference.prototype.setChangeCallback = function(changeCallback) {
  $(this.elm).bind("change", changeCallback);
}
Formula.addReferenceType('#', function (ref){return new InputReference(ref)});
```

With that in place, you can for example do this: ADD_TWO_NUMBERS(PARSE_NUMBER(#input1), PARSE_NUMBER(#input2))
(you need to create the "PARSE_NUMBER" function to make this run)


A Reference object must implement the following methods:
getValue()
This method must return the value of the reference. It can be any type you want

setChangeCallback(changeCallback)
This method must ensure that changeCallback is called whenever the value of the reference changes

The constructor is called with the reference label as it was written in the formula, without the prefix. If for example, the prefix is set to "CELL", then this formula: "CELL(B12)" will result in the constructor being called with the text "(B12)"

## A note on types
As mentioned, references can return any type. The same applies to functions - they can accept any type. The engine just moves these types around ignorantly.

Thus you can for example enable the engine to work with complex numbers this way:

```javascript
function ComplexNumber(a, b) {
  this.a = a;
  this.b = b;
}

Formula.addFunction('COMPLEXNUMBER', function(a, b) {
  return new ComplexNumber(a, b);
});

Formula.addFunction('ADD_TWO_COMPLEX_NUMBERS', function(cn1, cn2) {
  return new ComplexNumber(cn1.a + cn2.a, cn1.b + cn2.b);
});
```

This will enable you to do this:
```javascript
var formula1 = new Formula('ADD_TWO_COMPLEX_NUMBERS(COMPLEXNUMBER(10,10),COMPLEXNUMBER(1,16))');
var result = formula.calc();    // result is a ComplexNumber object
```

You might also consider adding functions for fomatting and parsing your data type. Like this:

```javascript
Formula.addFunction('FORMAT_COMPLEX_NUMBER', function(cn) {
  if (cn.b > 0) {
    return '(' + cn.a + ' + ' + cn.b + 'i)';
  }
  return '(' + cn.a + ' - ' + (-cn.b) + 'i)';
});

Formula.addFunction('PARSE_COMPLEXNUMBER', function(s) {
  var re = /\(([+-]?[0-9.]*)\s*([+-])\s*([0-9.]*)\s*i\s*\)/
  var result = re.exec(s);
  if ((result != null) && (result.length == 4)) {
    return new ComplexNumber(parseFloat(result[1]), parseFloat(result[2]+result[3]));
  }
  return 'not a complex number';
});
```

Actually, the functions for handling complex numbers have been added in this repository, so to use them, all you have to do is include "datatypes/ComplexNumber.js". More data types will come.





