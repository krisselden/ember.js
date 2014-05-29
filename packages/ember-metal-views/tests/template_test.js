import { testsFor, $, equalHTML, appendTo } from "ember-metal-views/tests/test_helpers";

testsFor("ember-metal-views - template support");

test("a view can have a template", function() {
  var view = {
    isView: true,

    template: function(context) {
      return document.createTextNode(context.prop);
    },

    templateOptions: {data: {}},

    prop: "WAT"
  };

  appendTo(view);
  equalHTML('qunit-fixture', "<div>WAT</div>");
});
