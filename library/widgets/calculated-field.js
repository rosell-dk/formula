// http://jqueryui.com/widget/
// http://api.jqueryui.com/jQuery.widget/
// https://learn.jquery.com/jquery-ui/widget-factory/how-to-use-the-widget-factory/

$(function() {
  $.widget( "formula.calculatedfield", {
    // default options
    options: {
      formula: null,

      // callbacks
      change: null,
      formatter: null,
    },

    // the constructor
    _create: function() {

      this.element.addClass( "calculated-field" );
      this.element.attr( "readonly", "readonly" );

      if (this.options.formula == null) {
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

      if (this.options.formatter) {
        this.element.val(this.options.formatter(this.value));
      }
      else {
        this.element.val(this.value);
      }

      // trigger a callback/event ("calculatedfieldchange")
      this._trigger( "change" );

    },


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
      if (key == 'formula') {
        this.options.formula = value;
        this._createFormulaObject();
        this.value = this.formula.calc();
      }
      this._super( key, value );
    }
  });
});

