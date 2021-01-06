define([
  'require',
  'jquery',
  'base/js/namespace',
  'base/js/events',
  'base/js/utils',
  'notebook/js/codecell',
], function (
  requirejs,
  $,
  Jupyter,
  events,
  utils,
  codecell
) {
  "use strict";
  var CodeCell = codecell.CodeCell;

  function load_extension() {
    // add css
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = requirejs.toUrl("./main.css");
    document.getElementsByTagName("head")[0].appendChild(link);

    var element = $("<ul id='options'>").attr("list-style", "none");
    var container = $("<div id='box'>");

    var cellWrapper = $("<div/>").addClass('cell-wrapper');
    var mycell;

    var open = function () {
      var cell = Jupyter.notebook.get_selected_cell();
      element.empty();
      cellWrapper.empty();

      mycell = new CodeCell(Jupyter.notebook.kernel, {
        events: Jupyter.notebook.events,
        config: Jupyter.notebook.config,
        keyboard_manager: Jupyter.notebook.keyboard_manager,
        notebook: Jupyter.notebook,
        tooltip: Jupyter.notebook.tooltip,
      });
      mycell.set_input_prompt("display", "none");
      mycell.render();
      mycell.refresh();

      var index = [];
      var importance = [];
      var words = cell.get_text().split(" ");

      $.getJSON(Jupyter.notebook.base_url + "nbextensions/snippetProject/snippets.json", function (data) {
        // Add options for each code snippet in the snippets.json file
        $.each(data['snippets'], function (key, snippet) {
          var tags = snippet['tags'];
          var count = 0;
          $.each(words, function (indexOfWord, word) {
            if (tags.indexOf(word) >= 0) {
              count++;
            };
          });
          if (count > 0) {
            index.push(key);
            importance.push(count);
          };
        });
        var i = 0;
        var j = 0;
        var currentImportance;
        var currentIndex;
        for (i = 1; i < importance.length; i++) {
          currentImportance = importance[i];
          currentIndex = index[i];
          for (j = i - 1; j >= 0 && currentImportance > importance[j]; j--) {
            importance[j + 1] = importance[j];
            index[j + 1] = index[j];
          };
          importance[j + 1] = currentImportance;
          index[j + 1] = currentIndex;
        };
        var snippets = data['snippets'];
        $.each(index, function (key, value) {
          var option = $("<li class='option'>")
            .attr("value", snippets[value]['name'])
            .text(snippets[value]['name'])
            .attr("code", snippets[value]['code'].join('\n'))
            .attr("list-style", "none")
            .on({
              mouseover: function () {
                $(".cell-wrapper .input_area").css("display", "block");
                $(".option").not(this).css("background-color", "white");
                $(this).css("background-color", "#eeeeee");
                mycell.set_text($(this).attr("code"));
                $(".cell-wrapper .input_area").css("display", "block");
              },
              click: function () {
                cell.set_text($(this).attr("code"));
              }
            });
          element.append(option);
        })
        if (index.length==0) {
          var option = $("<li class='option'>")
            .text("Sorry, no snippet found!")
            .attr("list-style", "none")
            .css("color", "#f40505")
          element.append(option);
        }
      })

      container.appendTo(cell.element.find('.input_area'));
      element.appendTo(container);
      cellWrapper.appendTo(container);
      cellWrapper.append(mycell.element);
      container.css("display", "flex");
      $(".cell-wrapper .input_area").css("display", "none");
    };

    var close = function () {
      container.css("display", "none");
    };

    var action0 = {
      help: 'open options',
      help_index: 'zz',
      handler: open
    };
    var prefix0 = 'my_extension';
    var action_name0 = 'open-options';

    var full_action_name0 = Jupyter.actions.register(action0, action_name0, prefix0);

    Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('Alt-f', full_action_name0);

    var action1 = {
      help: 'off options',
      help_index: 'zz',
      handler: close
    };
    var prefix1 = 'my_extension';
    var action_name1 = 'off-options';

    var full_action_name1 = Jupyter.actions.register(action1, action_name1, prefix1);

    Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('Alt-c', full_action_name1);
    Jupyter.keyboard_manager.command_shortcuts.add_shortcut('Alt-c', full_action_name1);
  }

  return {
    load_ipython_extension: load_extension,
  };
});
