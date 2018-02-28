// ==UserScript==
// @name         MangaDex upload
// @namespace    https://github.com/ewasion
// @version      0.0.1
// @license      CC-BY-NC-SA-4.0
// @description  Highly customizable upload script for MangaDex
// @author       Eva
// @match        https://mangadex.com/upload/*
// @icon         https://mangadex.com/favicon.ico
// @homepage     https://ewasion.github.io/userscripts/mangadex-upload/
// @updateURL    https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-upload/mangadex-upload.meta.js
// @downloadURL  https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-upload/mangadex-upload.user.js
// @grant        none
// ==/UserScript==

function uploadLog(message, display) {
  $('<p>', {
    text: message,
    class: display
  }).appendTo($('#logs'));
}

function processFiles() {
  let filepicker = $("#files");
  if(filepicker.get(0).files.length === 0) {
    return alert('You must select at least one file');
  }
  let names = [];
  for (var i = 0; i < filepicker.get(0).files.length; ++i) {
    names.push(filepicker.get(0).files[i].name);
  }
  const regParts = $('#regex').val().match(/^\/(.*?)\/([gmiyu]*)$/);
  const regex = regParts ? new RegExp(regParts[1], regParts[2]) : new RegExp($('#regex').val());
  let uploads = [];

  const lang = $('#lang_id').val();
  const fallback_group = $('#group_id').val();
  const fallback_manga = $('#fallback_manga').val();
  names.forEach(function(name, index) {
    const matches = regex.exec(name + name);
    if(matches) {
      const group = !matches[4] ? matches[1] : matches[4];
      const chapter = matches[3];
      const volume = matches[2];
      uploadLog('Added to the upload queue [' + group + '] Vol.' + volume + ' Ch.' + chapter + ' (' + name + ') {' + index + '}', 'normal');

      let upload = new FormData();
      upload.append('manga_id', fallback_manga);
      upload.append('volume_number', volume);
      upload.append('chapter_number', chapter);
      upload.append('chapter_name', '');
      upload.append('group_id', 2);
      upload.append('lang_id', lang);
      upload.append('file', filepicker.get(0).files[index]);
      uploads.push(upload);
    } else {
      uploadLog('Skipped. Regex doesn\'t match (' + name + ') {' + index + '}', 'warning');
    }
  });
  uploadFiles(uploads);
}

function uploadFiles(files) {
  const file = files[0];
  files.shift();
  $.ajax({
    url: "/ajax/actions.ajax.php?function=chapter_upload",
    type: 'POST',
    data: file,
    cache: false,
    contentType: false,
    processData: false,

    xhr: function() {
      var myXhr = $.ajaxSettings.xhr();
      if (myXhr.upload) {
        myXhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            $('#progressbar_m').show();
            $('#progressbar_m').width((Math.round(e.loaded/e.total*100) + '%'));
          }
        } , false);
      }
      return myXhr;
    },

    success: function (data) {
      uploadLog('Uploaded  [' + file.get('group_id') + '] Vol.' + file.get('volume_number') + ' Ch.' + file.get('chapter_number') + ' (' + file.get('file').name + ')', 'success');
      $('#progressbar_m').hide();
      $('#progressbar_m').width('0%');
      if(files.length > 0) {
        uploadFiles(files);
      } else {
        uploadLog('Upload complete', 'info');
      }
    },

    error: function(err) {
      uploadLog('Upload failed [' + file.get('group_id') + '] Vol.' + file.get('volume_number') + ' Ch.' + file.get('chapter_number') + ' (' + file.get('file').name + ')', 'error');
    }
  });
}

/* Display mass upload form */
(function() {
  'use strict';
  let langpicker = $('#lang_id');
  let grouppicker = $('#group_id');
  let actions = $('#upload_form > div:last-child').prev();
  $('#upload_form').remove(); /* Get rid of the low effort upload form */

  let mangadex_uploader = $('<div>', {id: 'mangadex_uploader'});

  /* Fancy title */
  let title = $('.panel:last-child .panel-title');
  let titleicon = title.find('span');
  title.text(' Mass upload');
  title.prepend(titleicon);

  /* Make it look pretty */
  $('<style>', {text: `
#mangadex_uploader label:not(:first-child), #mangadex_uploader button[type="submit"], #mangadex_uploader a[role="button"] {
  margin-top: 20px;
}

#logs:empty::before {
  content: 'Logs will show up here.';
  color: #ccc;
}

#mangadex_uploader::before {
  display: block;
  content: 'MangaDex uploader 0.1.0';
  margin-bottom: 10px;
  color: rgba(255, 255, 255, .3);
}

#progressbar_m {
  height: 38px;
  border-radius: 5px;
}

label {
  display: block;
}

#files {
  color: #999;
}

#logs .success {
  color: green;
}

#logs .error {
  color: green;
}

#logs .warning {
  color: orange;
}

#logs .info {
  color: cyan;
}

#logs .normal {
  color: #ccc;
}
`}).appendTo('head');

  /* Files */
  $('<label>', {
    for: 'files',
    text: 'Files'
  }).appendTo(mangadex_uploader);
  $('<input>', {
    type: 'file',
    id: 'files',
    multiple: ''
  }).appendTo(mangadex_uploader);

  /* Regex */
  $('<label>', {
    for: 'regex',
    text: 'Regex'
  }).appendTo(mangadex_uploader);
  $('<input>', {
    type: 'text',
    class: 'form-control',
    id: 'regex',
    placeholder: 'Regex',
    value: /.*?(?:\[([^\]]+)\].*)?v[^\d]*?(\.?\d+(?:\.\d+)*[a-zA-Z]?).*?c[^\d]*?(\.?\d+(?:\.\d+)*[a-zA-Z]?).*?(?:\[([^\]]+)\].*)?\.(?:zip|cbz)$/i
  }).appendTo(mangadex_uploader);

  /* Fallbacks */
  $('<label>', {
    for: 'fallback_manga',
    text: 'Fallback manga ID'
  }).appendTo(mangadex_uploader);
  $('<input>', {
    type: 'number',
    class: 'form-control',
    id: 'fallback_manga',
    placeholder: 'Fallback manga ID'
  }).appendTo(mangadex_uploader);

  $('<label>', {
    for: 'group_id',
    text: 'Fallback group'
  }).appendTo(mangadex_uploader);
  grouppicker.appendTo(mangadex_uploader);

  /* Language */
  $('<label>', {
    for: 'lang_id',
    text: 'Language'
  }).appendTo(mangadex_uploader);
  langpicker.appendTo(mangadex_uploader);

  /* Chapter titles */
  $('<label>', {
    for: 'chapter_titles',
    text: 'Chapter titles'
  }).appendTo(mangadex_uploader);
  $('<textarea>', {
    class: 'form-control',
    id: 'chapter_titles',
    placeholder: `1:Naruto Uzumaki!!
2:Konohamaru!!
3:Sasuke Uchiha!!
4:Kakashi Hatake!!
5:Unpreparedness is One's Greatest Enemy!!`
  }).appendTo(mangadex_uploader);

  /* Manga DB */
  $('<label>', {
    for: 'manga_db',
    text: 'Manga DB'
  }).appendTo(mangadex_uploader);
  $('<textarea>', {
    class: 'form-control',
    id: 'manga_db',
    placeholder: `5:naruto
153:detective conan
188:nichijou
69:xblade`
  }).appendTo(mangadex_uploader);

  /* Group DB */
  $('<label>', {
    for: 'group_db',
    text: 'Group DB'
  }).appendTo(mangadex_uploader);
  $('<textarea>', {
    class: 'form-control',
    id: 'group_db',
    placeholder: `1334:iem
621:fh
128:inp mangaz
1196:kefi
1335:wtf
645:bushido
577:binktopia
937:inane
1370:project_88
1371:wek`
  }).appendTo(mangadex_uploader);

  /* Back/upload buttons */
  actions.find('#upload_button').attr('id', 'start_uploading');
  actions.find('[href^="/manga/"]').attr('href', '#');
  actions.appendTo(mangadex_uploader);

  /* Progress bar */
  $('<div>', {
    id: 'progressbar_m',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': '0',
    style: 'width: 0%;',
    class: 'progress-bar progress-bar-info'
  }).appendTo(mangadex_uploader);

  /* Logs */
  $('<label>', {
    text: 'Logs'
  }).appendTo(mangadex_uploader);
  $('<div>', {
    id: 'logs'
  }).appendTo(mangadex_uploader);

  mangadex_uploader.appendTo('.panel:last-child .panel-body');
  $('#start_uploading').click(function() {processFiles();});
})();
