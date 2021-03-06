$(function () {
  function projectRenderer(instance, TD, row, col, prop, value, cellProperties) {
    var url = '';
    switch (value) {
      case 'x-html':
        url = 'http://puppetjs.github.io/x-html/examples/index.html';
        break;

      case 'polymer-ui-elements':
        url = 'http://www.polymer-project.org/polymer-all/polymer-ui-elements/polymer-ui-menu/index.html';
        break;

      case 'PMail':
        url = 'https://github.com/warpech/PMail';
        break;

      case 'Handsontable':
        url = 'http://handsontable.com/demo/web_component.html';
        break;
    }

    value = '<a href="' + url + '">' + value + '</a><br><small>' + instance.getDataAtRow(row).project_version + '</small>';
    htmlRenderer.apply(this, arguments);
  }

  function smallPrint(txt) {
    return '<small>' + txt + '</small>';
  }

  function statusRenderer(instance, TD, row, col, prop, value, cellProperties) {
    if (!value) {
      value = {
        status: 'white',
        comment: 'N/A'
      };
    }

    switch (value.status) {
      case 'green':
        TD.style.backgroundColor = 'lightgreen';
        Handsontable.Dom.fastInnerHTML(TD, smallPrint('OK ') + value.comment);
        break;

      case 'yellow':
        TD.style.backgroundColor = '#FFFF99';
        Handsontable.Dom.fastInnerHTML(TD, smallPrint('WORKS WITH WORKAROUND ') + value.comment);
        break;

      case 'red':
        TD.style.backgroundColor = 'tomato';
        Handsontable.Dom.fastInnerHTML(TD, smallPrint('FAIL ') + value.comment);
        break;

      case 'white':
        TD.style.backgroundColor = 'white';
        Handsontable.Dom.fastInnerHTML(TD, '? ' + value.comment);
        break;
    }
  }

  function browserRecommendation(data, browser) {
    var scores = {
      red: 0,
      yellow: 0,
      green: 0
    };
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

  function recommendedBrowsers(data, acceptedArr) {
    var out = [];
    var checked = {};
    for (var i = 0, ilen = data.length; i < ilen; i++) {
      if (!checked[data[i].browser]) {
        checked[data[i].browser] = true;
        if (acceptedArr.indexOf(browserRecommendation(data, data[i].browser)) > -1) {
          out.push(data[i].browser);
        }
      }
    }
    return out;
  }

  function htmlRenderer(instance, TD, row, col, prop, value, cellProperties) {
    Handsontable.Dom.fastInnerHTML(TD, value);
  }

  function dateToHumanDate(input) {
    input = input.split('-');
    var y = input[0];
    var m = (["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])[input[1] - 1];
    var d = input[2];
    return d + ' ' + m + ',  ' + y;
  }

  var data;
  var lastIndex;
  var currentIndex;

  $.get("data/data.json", function (response) {
    data = response;
    lastIndex = data.length - 1;
    currentIndex = lastIndex;

    $("#hot").handsontable({
      readOnly: true,
      data: [],
      renderer: statusRenderer,
      columns: [
        {
          title: "Project",
          data: "project",
          renderer: projectRenderer
        }
      ]
    });

    renderIndex(lastIndex);

    $("#lastUpdate").text(dateToHumanDate(data[lastIndex].date));
  });

  function createPivot(data, columns) {
    var columnNames = [];
    var pivot = [];
    data.forEach(function (dataRow) {
      var browserName = dataRow.browser + "<br><small>" + dataRow.browser_version + '</small>';
      browserName = browserName.replace(/\./g, ',');

      if (columnNames.indexOf(browserName) === -1) {
        columnNames.push(browserName);
        columns.push({
          title: browserName.replace(/\,/g, '.'),
          data: browserName
        });
      }

      var pivotRow = pivot.filter(function (pivotRow) {
        return pivotRow.project === dataRow.project;
      });
      if (pivotRow.length) {
        pivotRow = pivotRow[0];
      }
      else {
        pivotRow = {};
        pivotRow.project = dataRow.project;
        pivotRow.project_version = dataRow.project_version;
        pivot.push(pivotRow);
      }

      pivotRow[browserName] = {
        status: dataRow.status,
        comment: dataRow.comment
      };
    });

    return pivot;
  }

  function renderIndex(index) {
    var columns = [
      {
        title: "Project",
        data: "project",
        renderer: projectRenderer
      }
    ];
    var pivot = createPivot(data[index].statuses, columns);

    $("#hot").handsontable('loadData', pivot);
    $("#hot").handsontable('updateSettings', {
      columns: columns
    });

    $("#recommendation").html(data[index].recommendation || '');
    $("#currentDate").text(dateToHumanDate(data[index].date));

    var rec = recommendedBrowsers(data[index].statuses, ["green"]);
    if (rec.length) {
      $("#recommendedBrowsers").text(rec.join(', '));
      $("#recommendedBrowsersDesc").text("Recommended browsers (fully green column)");
    }
    else {
      rec = recommendedBrowsers(data[index].statuses, ["green", "yellow"]);
      if (rec.length) {
        $("#recommendedBrowsers").text(rec.join(', '));
        $("#recommendedBrowsersDesc").text("Not the worst experience in browsers (green & yellow column)");
      }
      else {
        $("#recommendedBrowsers").text('none');
        $("#recommendedBrowsersDesc").text("Recommended browsers (fully green column)");
      }
    }

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