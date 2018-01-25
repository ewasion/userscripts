// ==UserScript==
// @name         MangaDex Reader fullscreen
// @namespace    Teasday
// @version      0.1.0
// @license      CC-BY-NC-SA-4.0
// @description  Adds a fullscreen viewer to MangaDex
// @author       Teasday
// @match        https://mangadex.com/chapter/*
// @icon         https://mangadex.com/favicon.ico
// @homepage     https://ewasion.github.io/userscripts/mangadex-fullscreen/
// @updateURL    https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-fullscreen/mangadex-fullscreen.meta.js
// @downloadURL  https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-fullscreen/mangadex-fullscreen.user.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  function addStyle (css) {
    var head = document.getElementsByTagName('head')[0];
    if (!head) return;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }

  addStyle(`
#content.fullscreen {
  z-index: 2000;
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  padding: 0;
  margin: 0;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
}
#content.fullscreen .row {
  display: none;
}
#content.fullscreen #current_page {
  position: relative;
  z-index: 2010;
  padding: 0;
  max-height: 100%;
}
#current_page {
  max-height: calc(100vh - 50px);
}
#content.noresize,
#content.noresize #current_page {
  height: auto;
  max-height: none;
  min-height: 100%;
}
#reader-size-controls {
  display: none;
  cursor: pointer;
  float: right;
  text-align: right;
  margin: 5px;
  font-size: 2em;
  color: #eee;
  text-shadow: #000 1px 1px 3px;
}
#content.fullscreen #reader-size-controls {
  position: fixed;
  display: block;
  z-index: 2020;
  top: 5px;
  right: 5px;
  opacity: 0.3;
  transition: opacity 0.5s;
}
#content.fullscreen #reader-size-controls:hover {
  opacity: 1;
}
`);

  var buttons = document.createElement('div');
  buttons.id = 'reader-size-controls';
  var fs_btn = document.createElement('div');
  fs_btn.classList.add('control-fullscreen');
  fs_btn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
  var rs_btn = document.createElement('div');
  rs_btn.classList.add('control-resize');
  rs_btn.innerHTML = '<i class="fas fa-expand"></i>';
  buttons.appendChild(fs_btn);
  buttons.appendChild(rs_btn);

  var content = document.getElementById('content');
  content.insertBefore(buttons, document.getElementById('current_page'));
  content.classList.add('noresize');
  content.children[0].children[2].classList.replace('col-sm-3', 'col-sm-2');
  content.children[0].children[3].classList.replace('col-sm-3', 'col-sm-2');

  var new_col = document.createElement('div');
  new_col.classList.add('col-sm-2');
  new_col.innerHTML = `<button type="button" role="button" title="Fullscreen" class="btn btn-default pull-right control-fullscreen"><i class="fas fa-expand-arrows-alt"></i> </button>
                       <button type="button" role="button" title="Resize" class="btn btn-default pull-right control-resize"><i class="fas fa-expand"></i> </button>`;
  content.children[0].appendChild(new_col);

  for (var fs of document.querySelectorAll('.control-fullscreen')) {
    fs.onclick = function() {
      content.classList.toggle('fullscreen');
    };
  }
  for (var rs of document.querySelectorAll('.control-resize')) {
    rs.onclick = function() {
      content.classList.toggle('noresize');
    };
  }

})();