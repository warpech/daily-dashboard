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

    value = '<a href="' + url + '">' + value + '</a>';
    htmlRenderer.apply(this, arguments);
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

  function recommendationRenderer(instance, TD, row, col, prop, value, cellProperties) {
    var browserRecommendation = browserGecommendation(instance.getData(), instance.getDataAtRow(row).browser);
    switch (browserRecommendation) {
      case 'red':
        TD.style.backgroundColor = 'PeachPuff';
        break;

      case 'yellow':
        TD.style.backgroundColor = '#FFFF99';
        break;

      case 'green':
        TD.style.backgroundColor = 'lightgreen';
        break;
    }
    Handsontable.cellLookup.renderer.text.apply(this, arguments);
  }

  function browserGecommendation(data, browser) {
    var scores = {
      red: 0,
      yellow: 0,
      green: 0
    }
    for (var i = 0, ilen = data.length; i < ilen; i++) {
      if (data[i].browser === browser) {
        scores[data[i].status]++;
      }
    }
    if (scores.red) {
      return "red";
    }
    else if (scores.yellow) {
      return "yellow";
    }
    else if (scores.green) {
      return "green";
    }
  }

  function greenBrowsers(data) {
    var out = [];
    var checked = {};
    for (var i = 0, ilen = data.length; i < ilen; i++) {
      if (!checked[data[i].browser]) {
        checked[data[i].browser] = true;
        if (browserGecommendation(data, data[i].browser) === 'green') {
          out.push(data[i].browser);
        }
      }
    }
    return out;
  }

  function htmlRenderer(instance, TD, row, col, prop, value, cellProperties) {
    recommendationRenderer.apply(this, arguments);
    Handsontable.Dom.fastInnerHTML(TD, value);
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
    renderer: recommendationRenderer,
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
    $("#greenBrowsers").text(greenBrowsers(data[index].statuses).join(', ') || "none");
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