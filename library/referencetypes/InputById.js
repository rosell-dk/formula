// Note: jQuery required!

/**
 *  Reference INPUT fields by ID with "#"
 */

function InputById(ref) {
  this.elm = document.getElementById(ref);
}
InputById.prototype.getValue = function() {
  return $(this.elm).val();
}
InputById.prototype.setChangeCallback = function(changeCallback) {
  $(this.elm).bind("change", changeCallback);
}
Formula.addReferenceType('#', function (ref){
  return new InputById(ref)
});
