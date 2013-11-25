$(function () {
  function projectRenderer(instance, TD, row, col, prop, value, cellProperties) {
    var url = '';
    switch (value) {
      case 'x-html':
        url = 'https://github.com/PuppetJs/x-html';
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
        Handsontable.Dom.fastInnerHTML(TD, 'Known problems');
        break;

      case 'red':
        TD.style.backgroundColor = 'red';
        Handsontable.Dom.fastInnerHTML(TD, 'Fail');
        break;
    }
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
        data: "comment"
      }
    ]
  });

  $.get("data/data.json", function (response) {
    $("#hot").handsontable('loadData', response[0].statuses);
    $("h2").text(dateToHumanDate(response[0].date))
    $("#lastUpdate").text(dateToHumanDate(response[0].date))
  })
});