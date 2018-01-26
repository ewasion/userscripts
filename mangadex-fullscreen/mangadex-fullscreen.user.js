// ==UserScript==
// @name         MangaDex Reader fullscreen
// @namespace    Teasday
// @version      0.2
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

  // add css

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
#content.fullscreen img.reader {
  position: relative;
  z-index: 2010;
  padding: 0;
  max-height: 100%;
  max-width: none;
  height: 100%;
}
img.reader {
  min-height: 100%;
  max-height: calc(100vh - 50px);
}
#content.noresize,
#content.noresize img.reader {
  height: auto;
  max-height: none;
  min-height: 100%;
  max-width: 100%;
}
#reader-size-controls {
  display: none;
  cursor: pointer;
  float: right;
  text-align: right;
  margin: 5px;
  font-size: 2em;
  color: #ddd;
  text-shadow: #000 1px 1px 4px;
}
#content.fullscreen #reader-size-controls {
  position: fixed;
  display: block;
  z-index: 2020;
  top: 5px;
  right: 5px;
  opacity: 0.3;
  transition: all 0.4s;
}
#content.fullscreen #reader-size-controls:hover {
  opacity: 1;
  background: rgba(0,0,0,0.35);
  box-shadow: 0 0 35px 15px rgba(0,0,0,0.35);
}
#content.fullscreen #reader-size-controls i:hover {
  color: #fff;
  text-shadow: #fff 0 0 10px;
}

.footer { height: auto; }
.footer p { margin-bottom: 0; }
`);

  // control button data

  const controls = {
    fullscreen: {
      icon: 'expand-arrows-alt',
      titles: ['Enter fullscreen', 'Exit fullscreen']
    },
    noresize: {
      icon: 'expand',
      titles: ['Fit to width (or auto)', 'Fit to height']
    }
  };

  // add html

  const content = document.getElementById('content');

  const buttons = document.createElement('div');
  buttons.id = 'reader-size-controls';
  buttons.innerHTML = Object.entries(controls).reduce(function(acc, ctrl) {
    return `${acc}<div class="control-${ctrl[0]}"><i class="fas fa-${ctrl[1].icon}"></i></div>`;
  }, '');

  const newCol = document.createElement('div');
  newCol.classList.add('col-sm-2');
  newCol.innerHTML = Object.entries(controls).reduce(function(acc, ctrl, i) {
    return `${acc}<button type="button" role="button" class="btn btn-default pull-right control-${ctrl[0]}"><i class="fas fa-${ctrl[1].icon}"></i></button>`;
  }, '');

  content.insertBefore(buttons, document.getElementById('current_page'));
  content.children[0].children[2].classList.replace('col-sm-3', 'col-sm-2');
  content.children[0].children[3].classList.replace('col-sm-3', 'col-sm-2');
  content.children[0].appendChild(newCol);

  // actual js

  const updateCtrl = function(ctrl, val) {
    localStorage.setItem(`reader.${ctrl}`, val);
    for (const btn of document.querySelectorAll(`.control-${ctrl}`)) {
      btn.title = controls[ctrl].titles[val ? 1 : 0];
      content.classList.toggle(`${ctrl}`, val);
    }
  };
  const updateAll = function() {
    for (let ctrl of Object.keys(controls)) {
      updateCtrl(ctrl, localStorage.getItem(`reader.${ctrl}`) === 'true');
    }
  };
  const listenBtnClick = function(ctrl) {
    for (const btn of document.querySelectorAll(`.control-${ctrl}`)) {
      btn.addEventListener('click', function() {
        updateCtrl(ctrl, localStorage.getItem(`reader.${ctrl}`) !== 'true');
      }, false);
    }
  };

  Object.keys(controls).map(listenBtnClick);
  window.addEventListener('focus', updateAll, false);
  updateAll();
})();