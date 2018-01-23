// ==UserScript==
// @name         MyAnimeList conversations
// @namespace    https://github.com/ewasion
// @version      0.1.1
// @description  Lets you see conversations between two people.
// @author       Eva
// @homepage     https://ewasion.github.io/userscripts/mal-com/
// @icon         https://ewasion.github.io/userscripts/mal-com/icon.png
// @updateURL    https://raw.githubusercontent.com/ewasion/userscripts/master/mal-com/mal-com.meta.js
// @downloadURL  https://raw.githubusercontent.com/ewasion/userscripts/master/mal-com/mal-com.user.js
// @grant        none
// @match        *://myanimelist.net/profile/*
// @match        *://myanimelist.net/profile.php?username=*
// @match        *://myanimelist.net/comments.php?id=*
// @exclude      *://myanimelist.net/profile/*/reviews
// @exclude      *://myanimelist.net/profile/*/recommendations
// @exclude      *://myanimelist.net/profile/*/clubs
// @exclude      *://myanimelist.net/profile/*/friends
// @license      GPL-3.0
// ==/UserScript==

if (typeof jQuery == 'undefined') $ = unsafeWindow.jQuery;

var current = {};
var profile = new URL(window.location.href).searchParams.get("id");

if(profile === null) {
  profile = $("[href^='https://myanimelist.net/rss.php?type=blog']")[0].href.replace('https://myanimelist.net/rss.php?type=blog&id=', '');
  $(".comment.clearfix").each(function(index) {
    console.log(index + ": " + 'object evt: %O', this);
    if(typeof this['children'][1]['children'][2] == 'undefined') {
      current = document.createElement("div");
      current.innerHTML = "\n\n                      \n                                            \n                                            \n                                                                    <a class=\"ml8\" href=\"https://myanimelist.net/comtocom.php?id1="+profile+"&amp;id2="+this.firstChild.firstElementChild.src.replace('https://myanimelist.cdn-dena.com/images/userimages/thumbs/', '').replace('_thumb.jpg', '')+"\">Conversation</a>\n                      \n                                            \n                    ";
      $(current).addClass('postActions ar mt4');
      this['children'][1].appendChild(current);
    } else {
      console.log(1);
    }
  });
} else {
  $(".spaceit").each(function(index) {
    console.log(index + ": " + 'object evt: %O', this);
    if(this.nextElementSibling === null) {
      current = document.createElement("div");
      current.innerHTML = "<small><a href=\"/comtocom.php?id1="+profile+"&amp;id2="+this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace('https://myanimelist.cdn-dena.com/images/userimages/thumbs/', '').replace('_thumb.jpg', '')+"\" title=\"Comment-to-Comment\">Com-to-Com</a> \n\t\t - <a href=\"/modules.php?go=report&amp;type=com&amp;id="+this.id.replace('comtext', '')+"\" title=\"Report this comment\">Report</a></small>"
innerText: "Com-to-Com - Delete - Report";
      current.style = "margin-top: 10px;";
      this.parentElement.appendChild(current);
    } else {
      console.log(1);
    }
  });
}
