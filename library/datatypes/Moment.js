/*
Requires moment.js! (momentjs.com)
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script>

momentjs is the actual data type. 
This file is just adds functions which works on this datatype

*/

/**
 *  A whole bunch of signatures are supported by moment
 *  Here, we just pass the arguments to moment(), so the same signatures are supported here
 *
 *  MOMENT() - Returns moment object representing now
 *  MOMENT([String]) - Not recommended
 *  MOMENT(date [String], format [String]) - Parse date using format. Ie: MOMENT("12-25-1995", "MM-DD-YYYY")
 *  ...
 * 
 *  Check out the API here: http://momentjs.com/docs/#/parsing/
 *  
 */
Formula.addFunction('MOMENT', function(a, b, c, d) {
  if (arguments.length == 0) return new moment();
  if (arguments.length == 1) return new moment(a);
  if (arguments.length == 2) return new moment(a, b);
  if (arguments.length == 3) return new moment(a, b, c);
  if (arguments.length == 4) return new moment(a, b, c, d);
});


/**
 * Examples: 
 *   'MMMM Do YYYY, h:mm:ss a' -> 'April 12th 2016, 12:59:32 pm'
 *   'dddd' -> 'Tuesday'
 *   'MMM Do YY') -> 'Apr 12th 16
 *   'YYYY [escaped] YYYY'  -> '2016 escaped 2016'
 */
Formula.addFunction('MOMENT_FORMAT', function(momentObj, format) {
  if (!(momentObj instanceof moment)) {
    return typeof momentObj;
  }
  return momentObj.format(format);
});

/**
 * Use moments very lenient parser
 */
Formula.addFunction('MOMENT_PARSE', function(text, format) {
  return new moment(text, format);
});

/**
 *  Strict parse, which only accepts strict compliance to the format
 *  Iee MOMENT_STRICT_PARSE('12-24-2014', 'MM-DD-YYYY') is accepted
 *  but MOMENT_STRICT_PARSE('2-24-2014', 'MM-DD-YYYY') is not accepted
 *  and so is MOMENT_STRICT_PARSE('banana 2/24 2014', 'banana M/DD YYYY')
 *
 *  NOTE: ONLY the following tokens are supported: MM, DD, YYYY, D, M 
 */
Formula.addFunction('MOMENT_TEST_DATE_FORMAT', function(text, format) {
//  return new moment(text, format);
  var f = format;
  f = f.replace('MM', '((0[1-9])|(1[012]))');         // accept 01 - 12
  f = f.replace('DD', '((0[1-9])|([12]\\d)|3[01])');  // accept 01 - 31
  f = f.replace('YYYY', '\\d\\d\\d\\d');  // accept 0000 - 9999

  f = f.replace('D', '(([1-9])|([12]\\d)|(3[01]))'); // accept 1-31, not '01'
  f = f.replace('M', '(([1-9])|([1][012]))'); // accept 1-12, not '01'

//  f = f.replace('D', '\\d{1,2}');
//alert(f);
  f = '^' + f + '$';

  var re = new RegExp(f);
  var result = text.match(re);
  return (result != null);
//  return new moment(text, format);
});



/** Return unit of date
 *  Units available: 'year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'
 */
Formula.addFunction('MOMENT_GET', function(momentObj, unit) {
  return momentObj.get(unit);
});

/** Return day of month (1-31) */
Formula.addFunction('MOMENT_DATE', function(momentObj) {
  return momentObj.date();
});

/** Return zero-indexed month. 0 = January, 1 = February, ... */
Formula.addFunction('MOMENT_MONTH', function(momentObj) {
  return momentObj.month();
});

Formula.addFunction('MOMENT_YEAR', function(momentObj) {
  return momentObj.year();
});

/** Units available: see http://momentjs.com/docs/#/manipulating/add/ 
 */
Formula.addFunction('MOMENT_ADD', function(momentObj, unitsToAdd, units) {
//  return date;
  return momentObj.add(unitsToAdd, units);
});

