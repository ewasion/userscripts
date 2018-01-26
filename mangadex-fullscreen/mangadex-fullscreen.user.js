// ==UserScript==
// @name         MangaDex Reader fullscreen
// @namespace    Teasday
// @version      0.1.2
// @license      CC-BY-NC-SA-4.0
// @description  Adds a fullscreen viewer to MangaDex
// @author       Teasday, Eva
// @match        https://mangadex.com/chapter/*
// @icon         https://mangadex.com/favicon.ico
// @homepage     https://ewasion.github.io/userscripts/mangadex-fullscreen/
// @updateURL    https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-fullscreen/mangadex-fullscreen.meta.js
// @downloadURL  https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-fullscreen/mangadex-fullscreen.user.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const addStyle = function (css) {
    const head = document.getElementsByTagName('head')[0];
    if (!head) return;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  };

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
#content.fullscreen .row,
#content.fullscreen #edit_button,
#content.fullscreen #delete_button {
  display: none;
}
#content.fullscreen #current_page {
  position: relative;
  z-index: 2010;
  padding: 0;
  max-height: 100%;
  max-width: none;
}
#current_page {
  min-height: 100%;
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

.footer { height: auto; }
.footer p { margin-bottom: 0; }
`);

  const getRsTitle = function (noresize) {
      return noresize ? "Fit to height" : "Fit to width (or auto)";
  };

  const getFsTitle = function (fullscreen) {
      return fullscreen ? "Exit fullscreen" : "Enter fullscreen";
  };

  const content = document.getElementById('content');
  const buttons = document.createElement('div');
  buttons.id = 'reader-size-controls';
  const fs_btn = document.createElement('div');
  fs_btn.classList.add('control-fullscreen');
  fs_btn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
  const rs_btn = document.createElement('div');
  rs_btn.classList.add('control-resize');
  rs_btn.innerHTML = '<i class="fas fa-expand"></i>';
  buttons.appendChild(fs_btn);
  buttons.appendChild(rs_btn);

  content.insertBefore(buttons, document.getElementById('current_page'));
  content.classList.add('noresize');
  content.children[0].children[2].classList.replace('col-sm-3', 'col-sm-2');
  content.children[0].children[3].classList.replace('col-sm-3', 'col-sm-2');

  const new_col = document.createElement('div');
  new_col.classList.add('col-sm-2');
  new_col.innerHTML = `<button type="button" role="button" class="btn btn-default pull-right control-fullscreen"><i class="fas fa-expand-arrows-alt"></i> </button>
                       <button type="button" role="button" class="btn btn-default pull-right control-resize"><i class="fas fa-expand"></i> </button>`;
  content.children[0].appendChild(new_col);

  for (const fs of document.querySelectorAll('.control-fullscreen')) {
    fs.title = getFsTitle(content.classList.contains('fullscreen'));
    fs.onclick = function() {
      const fullscreen = content.classList.toggle('fullscreen');
      for (const fs of document.querySelectorAll('.control-fullscreen')) {
        fs.title = getFsTitle(fullscreen);
      }
    };
  }
  for (const rs of document.querySelectorAll('.control-resize')) {
    rs.title = getRsTitle(content.classList.contains('noresize'));
    rs.onclick = function() {
      const noresize = content.classList.toggle('noresize');
      for (const rs of document.querySelectorAll('.control-resize')) {
        rs.title = getRsTitle(noresize);
      }
    };
  }

})();