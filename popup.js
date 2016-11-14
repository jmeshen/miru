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
    console.log('Set links');
    rerenderLinks(links)
  });
}

function addLink(links, obj) {
  if (obj.url.indexOf('http://') == -1) {
    obj.url = 'http://' + obj.url;
  }
  var key = obj.title ? obj.title : obj.url;
  links[key] = obj.url;

  chrome.storage.sync.set({links: links}, function() {
    console.log('Added URL');
    rerenderLinks(links)
  });
}

function removeLink(links, title) {
  console.log(title);
  delete links[title]
  setLinks(links);
}
// refactor to use $(document).ready if you're going to use jquery anyway
document.addEventListener('DOMContentLoaded', function() {
  var links = {
    'google': 'https://google.com',
    'facebook': 'https://facebook.com',
    'giphy': 'https://giphy.com'
  };
  chrome.storage.sync.get(function(storedLinks) {
    console.info(storedLinks)
    if (storedLinks && storedLinks.links) {
      links = storedLinks.links;
    }
    console.log('Links??', links)
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
    console.log('clicking the x', $(this))
    var title = $(this).prev().text();
    removeLink(links, title);
  })

  var saveCurrentPage = document.getElementById('saveCurrentPage');
  saveCurrentPage.addEventListener('click', function() {

    chrome.tabs.getSelected(null, function(tab) {
      d = document;
      console.log(tab)
      if (!links.hasOwnProperty(tab.title)) {
        addLink(links, tab);
      }
    });
  }, false);
}, false);

