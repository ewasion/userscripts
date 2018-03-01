// ==UserScript==
// @name         MangaDex gas cloud
// @namespace    https://github.com/ewasion
// @version      0.1.0
// @license      GPL-3.0
// @description  Makes MangaDex actually usable
// @author       Eva
// @match        https://mangadex.com/*
// @match        https://mangadex.org/*
// @icon         https://mangadex.org/favicon.ico
// @homepage     https://ewasion.github.io/userscripts/mangadex-cloud/
// @updateURL    https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-cloud/mangadex-cloud.meta.js
// @downloadURL  https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-cloud/mangadex-cloud.user.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  if($('link[rel="stylesheet"][id="cf_styles-css"][href="/cdn-cgi/styles/cf.errors.css"]').length > 0) {
    location.reload();
  }
})();