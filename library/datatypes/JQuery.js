Formula.addFunction('$', function(a, b) {
  return $(a,b);
});

Formula.addFunction('$VAL', function($jq) {
  return $jq.val();
});

Formula.addFunction('$ATTR', function($jq, attrName) {
  return $jq.attr(attrName);
});

