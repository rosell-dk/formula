var Formula = function(formula, resultChangedCallBack) {

  this.resultChangedCallBack = resultChangedCallBack;

  thisFormula = this;

  // Detect endless recursion
  this.numberOfCalculationsLately = 0;
  window.setInterval(function () {
    if (thisFormula.numberOfCalculationsLately > 10) {
      alert('oh-oh. Too much recursion. Stopping formula: ' + options.formula);
      thisFormula.stoppedBecauseTooMuchRecursion = true;
    }
    thisFormula.numberOfCalculationsLately = 0;

  }, 100);

  this.formulaObject = Formula.parseFormula(formula);
  this.formulaObject.addChangeHandlers(this);
}

Formula.prototype.calc = function() {
  return this.formulaObject.calc();
}

Formula.prototype.referenceChanged = function() {
  this.resultChangedCallBack();
}

/**
 *  Return a FormulaFragment object with the parsed formula.
 *  This can later be executed with the .calc() method
 */
Formula.parseFormula = function(formula) {
  var s = 'PASSTHROUGH(' + formula + ')';
  var formulas = []; 
  /* 
  Strategy is to parse last function found in string, until there are no more functions to be found.
  Finding the last function is easier than the first, because it cannot possibly have child functions.
  Finding the matching ")" for the function is as easy as finding the first ")" after the function name
  On the other hand, if we were going for the outemost function, we would have trouble in strings like
  these: "MULTIPLY(SUM(1,2),DIVIDE(2,3))". Finding the matching ")" of MULTIPLY amounts to finding the
  last ")" in the string. But finding the matching ")" of SUM is the first. Thus, we would have had to 
  count parentheses.

  The last function will It will always be (one of) the innermost functions.
  Each time we find a function, we:
    1) create a Formula 
    2) replace the function in the string with a placeholder: FORMULA-[N]
    
  In the end of this procedure, the resulting string will for example be:
    Begin   "MULTIPLY(SUM(1,2),DIVIDE(2,3))"
    Step 1  "MULTIPLY(SUM(1,2),FORMULA-1)"      formula1 = {fname:'DIVIDE', param: [2,3]}
    Step 2  "MULTIPLY(FORMULA-2,FORMULA-1)"     formula2 = {fname:'SUM', param: [1,2]}
    Step 3  "FORMULA-3"                         formula3 = {fname:'MULTIPLY', param: [formula1,formula2]}

  But first, find mark all function calls, so we dont have to iterate
  function names repeatedly
  We here transform "MULTIPLY(SUM(1,2),2)" to "[FUNCTION:MULTIPLY](FUNCTION:SUM](1,2),2,)"
  
 */
  
  for (var i=0; i<Formula.function_names.length; i++) {
    var fname = Formula.function_names[i];
    var re = new RegExp('(\\b)' + fname + '\\(', 'g');
    s = s.replace(re, '$1[FUNCTION:' + fname + '](');
  }

  while (true) {
    // Find last function
    var fnPos = -1;
    var fname = '';

    var fnPos = s.lastIndexOf('[FUNCTION:');
    if (fnPos == -1) {
      return formulas[formulas.length-1];
    }
    var fnPos2 = s.indexOf(']', fnPos);
    fname = s.substring(fnPos + 10, fnPos2);

    var fnPos3 = s.indexOf(')', fnPos2);
    var param = s.substring(fnPos2 + 2, fnPos3);

    var parameters = param.split(',');

    var resolvedParameters = [];

    parameterloop:
    for (var i=0; i<parameters.length; i++) {
      var p = parameters[i].trim();

      // Handle when the parameter is a function
      if (p.indexOf('[FORMULA-') == 0) {
        var formulaIndex = parseInt(p.substring(9, p.length-1), 0);
        resolvedParameters.push(formulas[formulaIndex]);
      }

      else {

        // Handle when the parameter is a reference
        // - we loop through known prefixes to check if parameter starts with that prefix
        for (var j=0; j<Formula.referencePrefixes.length; j++) {
          var prefix = Formula.referencePrefixes[j];
          if (p.indexOf(prefix) == 0) {
            var references = Formula.referenceCreators[prefix](p.substr(prefix.length));
            if (typeof references['getValue'] === 'function') {
              resolvedParameters.push(references);
            }
            else {
              for (var k=0; k<references.length; k++) {
                resolvedParameters.push(references[k]);
              };
            }
            continue parameterloop;
          }
        }

        // Number
        if (!isNaN(parseFloat(p))) {
          resolvedParameters.push(parseFloat(p));
          continue;
        }

        // String
        var re = /^([\'][^']*[\'])|([\"][^"]*[\"])/;
        if (re.exec(p) != null) {
          resolvedParameters.push(p.substring(1, p.length-1));
          continue;
        }

        // Boolean
        if (p.toLowerCase() == 'false') {
          resolvedParameters.push(false);
          continue;
        }
        if (p.toLowerCase() == 'true') {
          resolvedParameters.push(true);
          continue;
        }
      }

    }
    
    formulas.push(new Formula.Fragment(fname, resolvedParameters, parameters));

    s = s.substr(0, fnPos) + '[FORMULA-' + (formulas.length-1) + ']' + s.substr(fnPos3+1);

  }
}

/* Functionality for adding functions */
Formula.function_names = [];
Formula.functions = {};

Formula.addFunction = function(fname, fn) {
  Formula.function_names.push(fname);
  Formula.functions[fname] = fn;
}

Formula.addFunction('PASSTHROUGH', function(val) {
  return val;
});


/* Functionality for adding reference types */
Formula.referenceCreators = {}
Formula.referencePrefixes = [];
Formula.addReferenceType = function(prefix, referenceCreator) {
  Formula.referenceCreators[prefix] = referenceCreator;
  Formula.referencePrefixes.push(prefix);
}


/* --------------------- */
/* Class Formula.Frament */
/* --------------------- */

Formula.Fragment = function(fname, resolvedParameters, parameters) {
  this.fname = fname;
  this.resolvedParameters = resolvedParameters;
  this.parameters = parameters;
}

Formula.Fragment.prototype.calc = function() {

  // First, resolve parameters to actual values. Ie:
  // - $('#oranges') => '12'
  // - formula => result of formula

  var values = [];
  for (var i=0; i<this.resolvedParameters.length; i++) {
    var p = this.resolvedParameters[i];
    if (p instanceof Formula.Fragment) {
      p = p.calc();
    }
    else if (typeof p['getValue'] === 'function') {
      p = p.getValue();
    }
    values.push(p)
  }

  // Next, apply the function
  var thisForCustomFunctions = {
    formula: this
  }
  var result = Formula.functions[this.fname].apply(thisForCustomFunctions, values);
  return result;
}

/* Add change handlers to all references in this formula */
Formula.Fragment.prototype.addChangeHandlers = function(formula) {
  for (var i=0; i<this.resolvedParameters.length; i++) {
    var p = this.resolvedParameters[i];
    if (p instanceof Formula.Fragment) {
      p.addChangeHandlers(formula);
    }

    // Handle reference
    else if (typeof p['setChangeCallback'] === 'function') {
      p.setChangeCallback(function() {
        formula.referenceChanged($(this));
      });
    }
  }
}
