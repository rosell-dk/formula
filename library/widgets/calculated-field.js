// http://jqueryui.com/widget/
// http://api.jqueryui.com/jQuery.widget/
// https://learn.jquery.com/jquery-ui/widget-factory/how-to-use-the-widget-factory/

$(function() {
  $.widget( "formula.calculatedfield", {
    // default options
    options: {
//      format: null,
      formula: null,

      // callbacks
      change: null,
      formatter: null,
//      random: null
    },

    // the constructor
    _create: function() {

      this.element.addClass( "calculated-field" );
      this.element.attr( "readonly", "readonly" );

      if (this.options.formula == null) {
//        this._setOption('formula', this.element.attr('data-formula'));
        if (this.element.attr('data-formula') !== undefined) {
          this.options.formula = this.element.attr('data-formula');
        }
        else {
          this.options.formula = '"empty"';
        }
      }

      this._createFormulaObject();

      this.value = this.formula.calc();

      this._refresh();
    },

    getCalculatedValue: function() {
      return this.value;
    },

    _createFormulaObject: function() {
      var widget = this;

      // If there is an existing formula, remove its event handlers
      if (this.formula instanceof Formula) {
        this.formula.formulaFragment.removeChangeHandlers();
      }

      this.formula = new Formula(this.options.formula, function() {
        var oldValue = widget.value;

        widget.value = widget.formula.calc();

        if (oldValue != widget.value) {

          // Refresh. This formats the value and triggers a "calculatedfieldchange" event
          widget._refresh();

          // Trigger a change event on the input element, in case another formula is listening
          widget.element.trigger('change');
        }
      });
      
    },

    // called when created, and later when changing options
    _refresh: function() {

//      alert('formula:' + this.options.formula);
      if (this.options.formatter) {
        this.element.val(this.options.formatter(this.value));
      }
      else {
        this.element.val(this.value);
      }

      // trigger a callback/event ("calculatedfieldchange")
      this._trigger( "change" );

    },

    // a public method to change the color to a random value
    // can be called directly via .colorize( "random" )
/*
    random: function( event ) {
      var colors = {
        red: Math.floor( Math.random() * 256 ),
        green: Math.floor( Math.random() * 256 ),
        blue: Math.floor( Math.random() * 256 )
      };

      // trigger an event, check if it's canceled
      if ( this._trigger( "random", event, colors ) !== false ) {
        this.option( colors );
      }
    },*/

    // events bound via _on are removed automatically
    // revert other modifications here
    _destroy: function() {
      this.element.removeClass( "calculated-field" )
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function() {
      // _super and _superApply handle keeping the right this-context
      this._superApply( arguments );
      this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {
      // prevent invalid color values
/*      if ( /red|green|blue/.test(key) && (value < 0 || value > 255) ) {
        return;
      }*/
//      alert('set option:' + key + ':' + value);
      if (key == 'formula') {
        this.options.formula = value;
        this._createFormulaObject();
        this.value = this.formula.calc();
      }
      this._super( key, value );
    }
  });
});

