function renderLinks(links) {
  for (link in links) {
      $('.container')
        .append($('<div>', {class: 'urlLink'})
          .append($('<a>', {href: links[link], target: "_blank"})
            .text(link)
          )
          .append($('<span>', {class: 'removeBtn'})
            .text('x')
          )
        )
    }
  return;
}

function rerenderLinks(links) {
  $('.container').empty();
  renderLinks(links);
}

function setLinks(links) {
  chrome.storage.sync.set({links: links}, function() {
    rerenderLinks(links)
  });
}

function addLink(links, obj) {
  var re = new RegExp("^(http|https)://", "i");
  if (!re.test(obj.url)) {
    obj.url = 'http://' + obj.url;
  }
  var key = obj.title ? obj.title : obj.url;
  links[key] = obj.url;

  chrome.storage.sync.set({links: links}, function() {
    rerenderLinks(links)
  });
}

function removeLink(links, title) {
  delete links[title]
  setLinks(links);
}

$(document).ready(function() {
  var links = {};
  chrome.storage.sync.get(function(storedLinks) {
    if (storedLinks && storedLinks.links) {
      links = storedLinks.links;
    }
    renderLinks(links);
  })

  $('#addUrlForm').submit(function(e) {
    var $urlField = $('#urlField');
    var $titleField = $('#titleField');
    event.preventDefault();
    if (!$urlField.val()) {
      $urlField.addClass('error');
      return;
    } else {
      $urlField.removeClass('error');
      var title = $titleField.val() ? $titleField.val() : $urlField.val();
      var linkObj = {
        title: title,
        url: $urlField.val()
      };
      addLink(links, linkObj);
    }
  })

  $('.container').on('click', '.removeBtn', function() {
    var title = $(this).prev().text();
    removeLink(links, title);
  })

  $('#saveCurrentPage').click(function() {
    chrome.tabs.getSelected(null, function(tab) {
      d = document;
      console.log(tab)
      if (!links.hasOwnProperty(tab.title)) {
        addLink(links, tab);
      }
    });
  })
});

