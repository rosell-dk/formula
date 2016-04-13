/*
Requires: jQuery

With this initializer, you can conveniently create dynamically calculated fields like this:

<input data-formula="ADD_TWO_NUMBERS(10,11)" readonly></input>

*/

jQuery(function() {
//  $(document).append($('<div id="formula_attr_tooltip">test</div>'));

  $('body').append('<span id="formula_attr_tooltip"></span');
  var $tooltip = $('#formula_attr_tooltip');
  $tooltip.css('background-color', 'yellow');
  $tooltip.css('position', 'absolute');
  $tooltip.css('z-index', '9999');
  $tooltip.css('padding', '5px');
  $tooltip.css('display', 'none');
  $tooltip.css('font-size', '0.9em');
  $tooltip.css('border', '1px solid #ccc');

//alert(tooltip);
  $('[data-formula]').each(function() {
    var $field = $(this);
    $field.hover(function(event) {
      $tooltip.text($field.attr('data-formula'));

      var offset = $(this).offset();
      var x = offset.left + $(this).width();  // event.clientX better?
      var y = offset.top + 5;  // event.clientX better?

      var right = $('body').width() - $tooltip.width() - x;
      if (right < 0) {
        x += right;
        $tooltip.css('left', 'initial');
        $tooltip.css('right', '10px');
      }
      else {
        $tooltip.css('right', 'initial');
        $tooltip.css('left', x + 'px');
      }
      if (x < event.clientX) {
        y+=20;
      }
      $tooltip.css('top', y);

      $tooltip.show();
    }, function() {
      $tooltip.hide();
    });
  });


});

