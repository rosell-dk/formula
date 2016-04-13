/**
 * Under construction!
 */

function SimpleDate(year, month, day) {
  this.year = year;
  this.month = month;   // month is NOT zero-based
  this.day = day;
}
SimpleDate.defaultFormat = 'MM-DD-YYYY';

SimpleDate.prototype.toString = function() {
  return this.format();
}

SimpleDate.prototype.toDate = function() {
  return new Date(this.year, this.month-1, this.day);
}

/** 
 *  Format 
 *
 */
SimpleDate.prototype.format = function(format) {
  if (format === undefined) {
    format = SimpleDate.defaultFormat;
  }
  var s = format;
  s = s.replace('YYYY', ("0000" + this.year).slice(-4));
  s = s.replace('MM', ("00" + this.month).slice(-2));
  s = s.replace('DD', ("00" + this.day).slice(-2));
  s = s.replace('D', this.day);
  s = s.replace('M', this.month);
  return s;
}

Formula.addFunction('SIMPLEDATE', function(year, month, day) {
  return new SimpleDate(year, month, day);
});


/**
 * Format simpledate
 * @param sd [SimpleDate] - the SimpleDate object to format
 * @param format [String] (optional) - The format. If no format is supplied, SimpleDate.defaultFormat will be used
 *
 *  The following tokens are supported: YYYY, MM, DD, D, M
 *  (but note that D and M are not supported in the parser)
 *
 * Examples: 
 *   SIMPLEDATE_FORMAT(SIMPLEDATE_NOW(), 'DD-MM-YYYY')
 */
Formula.addFunction('SIMPLEDATE_FORMAT', function(sd, format) {
  return sd.format(format);
});

/**
 *  Examples:
 *     SIMPLEDATE_PARSE('2016-12-24', 'YYYY-DD-MM')
 *
 *  NOTE: ONLY the following tokens are supported: MM, DD, YYYY, D, M
 */
Formula.addFunction('SIMPLEDATE_PARSE', function(text, format) {
  var f = format;
  if (f === undefined) {
    f = SimpleDate.defaultFormat;
  }
  f = f.replace('MM', '((?:0[1-9])|(?:1[012]))');         // accept 01 - 12
  f = f.replace('DD', '((?:0[1-9])|(?:[12]\\d)|3[01])');  // accept 01 - 31
  f = f.replace('YYYY', '(\\d\\d\\d\\d)');  // accept 0000 - 9999

  f = f.replace('D', '((?:[1-9])|(?:[12]\\d)|(?:3[01]))'); // accept 1-31, not '01'
  f = f.replace('M', '((?:[1-9])|(?:[1][012]))'); // accept 1-12, not '01'

//  f = f.replace('D', '\\d{1,2}');
//alert(f);
  f = '^' + f + '$';

  var re = new RegExp(f);
  var result = text.match(re);
  if (result == null) {
    alert('could not parse "' + text + '" according to format: "' + format + '"');
    return result;
  }
  // We now have the parts in [1], [2], etc.
  // The order of these parts are the order in which they occured.
  // So, now, we need to sort that out

  var tokensToSearchFor = ['YYYY', 'M', 'D'];
  var positions = [];
  for (var i=0; i<tokensToSearchFor.length; i++) {
    var token = tokensToSearchFor[i];
    var pos = format.indexOf(tokensToSearchFor[i]);
    if (pos != -1) {
      positions.push({
        token: token,
        pos: pos
      });
    }
  }
  positions.sort(function (a, b) {
    if (a.pos > b.pos) {
      return 1;
    }
    if (a.pos < b.pos) {
      return -1;
    }
    return 0;
  });

// alert(JSON.stringify(positions));  
// alert(JSON.stringify(result));  

  // Now connect the parts
  var year = 0;
  var month = 1;
  var day = 0;

  for (var i=1; i<result.length; i++) {
    var token = positions[i-1].token;
    switch (token) {
      case 'YYYY':
        year = result[i];
        break;
      case 'M':
        month = result[i];
        break;
      case 'D':
        day = result[i];
        break;
    }
  }
  return new SimpleDate(year, month, day);

//  return new moment(text, format);

});


Formula.addFunction('SIMPLEDATE_NOW', function(sd) {
  var d = new Date();
//alert(d.getYear());
  return new SimpleDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

/** Return day of month (1-31) */
Formula.addFunction('SIMPLEDATE_DAY', function(sd) {
  return sd.day;
});

/** Return month. 1 = January, 2 = February, ... */
Formula.addFunction('SIMPLEDATE_MONTH', function(sd) {
  return sd.month;
});

Formula.addFunction('SIMPLEDATE_YEAR', function(sd) {
  return sd.year;
});

Formula.addFunction('SIMPLEDATE_ADD_DAYS', function(sd, daysToAdd) {
  var ms = sd.toDate().getTime();
  ms += 40000000;  // Turn the time forward to the middle of the day - so we will not get any trouble with daylight saving
  ms += 86400000 * daysToAdd;

  var d = new Date(ms);
  return new SimpleDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

