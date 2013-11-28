$(function () {
  function projectRenderer(instance, TD, row, col, prop, value, cellProperties) {
    var url = '';
    switch (value) {
      case 'x-html':
//        url = 'https://github.com/PuppetJs/x-html';
        url = 'http://puppetjs.github.io/x-html/examples/index.html';
        break;

      case 'polymer-ui-elements':
        url = 'http://www.polymer-project.org/polymer-all/polymer-ui-elements/polymer-ui-menu/index.html';
        break;
    }

    Handsontable.Dom.fastInnerHTML(TD, '<a href="' + url + '">' + value + '</a>');
  }

  function statusRenderer(instance, TD, row, col, prop, value, cellProperties) {
    switch (value) {
      case 'green':
        TD.style.backgroundColor = 'lime';
        Handsontable.Dom.fastInnerHTML(TD, 'OK');
        break;

      case 'yellow':
        TD.style.backgroundColor = 'yellow';
        Handsontable.Dom.fastInnerHTML(TD, 'Works with workaround');
        break;

      case 'red':
        TD.style.backgroundColor = 'red';
        Handsontable.Dom.fastInnerHTML(TD, 'Fail');
        break;
    }
  }

  function htmlRenderer(instance, TD, row, col, prop, value, cellProperties) {
    TD.innerHTML = value;
  }

  function dateToHumanDate(input) {
    input = input.split('-');
    var y = input[0];
    var m = (["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])[input[1] - 1];
    var d = input[2];
    return d + ' ' + m + ',  ' + y;
  }

  $("#hot").handsontable({
    readOnly: true,
    data: [],
    columns: [
      {
        title: "Project",
        data: "project",
        renderer: projectRenderer
      },
      {
        title: "Project version",
        data: "project_version"
      },
      {
        title: "Browser",
        data: "browser"
      },
      {
        title: "Browser version",
        data: "browser_version"
      },
      {
        title: "Status",
        data: "status",
        renderer: statusRenderer
      },
      {
        title: "Comment",
        data: "comment",
        width: 330,
        renderer: htmlRenderer
      }
    ]
  });

  var lastIndex = 0;
  var currentIndex = 0;
  var data;
  $.get("data/data.json", function (response) {
    data = response;
    lastIndex = data.length - 1;
    currentIndex = lastIndex;
    renderIndex(currentIndex);
    $("#lastUpdate").text(dateToHumanDate(data[lastIndex].date));
  });

  function renderIndex(index) {
    $("#hot").handsontable('loadData', data[index].statuses);
    $("#recommendation").html(data[index].recommendation || '');
    $("#currentDate").text(dateToHumanDate(data[index].date));
    if (currentIndex === 0) {
      $('#prevDate').attr("disabled", "disabled");
    }
    else {
      $('#prevDate').removeAttr("disabled");
    }
    if (currentIndex === lastIndex) {
      $('#nextDate').attr("disabled", "disabled");
    }
    else {
      $('#nextDate').removeAttr("disabled");
    }
  }

  $('#prevDate').click(function () {
    currentIndex--;
    renderIndex(currentIndex);
  });

  $('#nextDate').click(function () {
    currentIndex++;
    renderIndex(currentIndex);
  });
});