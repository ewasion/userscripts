// ==UserScript==
// @name         MangaDex Read Chapter Tracker
// @namespace    Teasday
// @version      1.1.2
// @license      CC-BY-NC-SA-4.0
// @description  Adds tracking of read chapters to MangaDex
// @author       Teasday
// @match        https://mangadex.com/*
// @icon         https://mangadex.com/favicon.ico
// @homepage     https://ewasion.github.io/userscripts/mangadex-readchapter/
// @updateURL    https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-readchapter/mangadex-readchapter.meta.js
// @downloadURL  https://raw.githubusercontent.com/ewasion/userscripts/master/mangadex-readchapter/mangadex-readchapter.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @run-at       document-end
// ==/UserScript==

/* jshint asi: true */
/* jshint esnext: false */
/* jshint esversion: 6 */
/* jshint ignore:start */
(async function() {
  'use strict'
  /* jshint ignore:end */

  const UNREAD = 0
  const UNFINISHED = 1
  const READ = 2

  const GM_get = typeof GM_getValue !== 'undefined' ? GM_getValue : GM.getValue
  const GM_set = typeof GM_setValue !== 'undefined' ? GM_setValue : GM.setValue
  const GM_delete = typeof GM_deleteValue !== 'undefined' ? GM_deleteValue : GM.deleteValue

  /* jshint ignore:start */
  async function getChapterStatus (chapterID) {
    return await GM_get(chapterID, UNREAD)
  }
  async function setChapterStatus (chapterID, status) {
    await GM_set(chapterID, status)
    return status
  }
  async function updateChapterStatus (chapterID, status) {
    if (status === UNREAD) {
      await GM_delete(chapterID)
      return status
    } else {
      const oldStatus = await getChapterStatus(chapterID)
      if (status > oldStatus) {
        await GM_set(chapterID, status)
        return status
      }
      return oldStatus
    }
  }
  /* jshint ignore:end */

  function addStyle (css) {
    const head = document.getElementsByTagName('head')[0]
    if (head) {
      const style = document.createElement('style')
      style.type = 'text/css'
      style.innerHTML = css
      head.appendChild(style)
    }
  }

  addStyle(`
.read-chapter {
  opacity: 0.6;
}
.read-chapter:hover {
  opacity: 1;
}
.read-chapter-bulk {
  font-size: 0.8em;
}
.read-chapter-bulk .form-control {
  margin: 0 5px;
}`)

  function renderReadMark (el, status) {
    if (status === UNREAD) {
      el.title = "Unread"
      el.style.color = '#666'
    } else if (status === UNFINISHED) {
      el.title = "Unfinished"
      el.style.color = '#e6a670'
    } else if (status === READ) {
      el.title = "Read"
      el.style.color = '#acde77'
    }
    el.style.cursor = 'pointer'
    el.style.margin = '0 5px'
    el.dataset.status = status
    el.classList.add('read-chapter')
    el.classList.add('fas')
    el.classList.toggle('fa-eye', status === READ)
    el.classList.toggle('fa-eye-slash', status !== READ)
  }

  function createReadMark(id, status) {
    const el = document.createElement('span')
    renderReadMark(el, status || UNREAD)
    el.dataset.id = id
    el.addEventListener('click', function(evt) {
      let newStatus = UNREAD
      switch (parseInt(evt.target.dataset.status)) {
        case UNREAD:     newStatus = UNFINISHED; break
        case UNFINISHED: newStatus = READ;       break
      }
      setChapterStatus(evt.target.dataset.id, newStatus)
      renderReadMark(evt.target, newStatus)
    }, false)
    return el
  }

  function appendBulkSelect(el, chapters) {
    const chSelect = document.createElement('select')
    chSelect.classList.add('form-control', 'input-sm')
    for (let [i, chapter] of chapters.entries()) {
      let str = ''
      if (!!chapter.dataset.volumeNum) { str += `Vol. ${chapter.dataset.volumeNum} ` }
      if (!!chapter.dataset.chapterNum) { str += `Ch. ${chapter.dataset.chapterNum} ` }
      if (!!chapter.dataset.chapterName) { str += `${!str ? '' : ' - '}${chapter.dataset.chapterName}` }
      if (!str) { str = 'Read Online' }
      chSelect.options[i] = new Option(str, chapter.dataset.chapterId)
    }

    const readSelect = document.createElement('select')
    readSelect.classList.add('form-control', 'input-sm')
    readSelect.options[0] = new Option('Read', 2)
    readSelect.options[1] = new Option('Unfinished', 1)
    readSelect.options[2] = new Option('Unread', 0)

    const confirmButton = document.createElement('button')
    confirmButton.innerHTML = 'Submit'
    confirmButton.classList.add('btn', 'btn-default', 'btn-sm')
    confirmButton.addEventListener('click', (evt) => {
      evt.target.setAttribute('disabled', 'true')
      confirmButton.innerHTML = 'Updating...'
      const newStatus = parseInt(readSelect[readSelect.selectedIndex].value)
      const upToChapter = parseInt(chSelect[chSelect.selectedIndex].value)
      for (let chapter of chapters.slice(0).reverse()) {
        try {
          const id = parseInt(chapter.attributes.href.value.split('/')[2])
          if (!isNaN(id)) {
            setChapterStatus(id, newStatus)
            renderReadMark(chapter.parentNode.firstElementChild, newStatus)
            if (id === upToChapter) {
              break
            }
          }
        } catch (err) {}
      }
      evt.target.removeAttribute('disabled')
      confirmButton.innerHTML = 'Submit'
    }, false)

    el.appendChild(document.createTextNode('Mark all chapters up to '))
    el.appendChild(chSelect)
    el.appendChild(document.createTextNode(' as '))
    el.appendChild(readSelect)
    el.appendChild(document.createTextNode(' '))
    el.appendChild(confirmButton)
  }

  const jumpPage = document.querySelector('#jump_page')

  if (jumpPage) {
    // we're in the reader
    const jumpChapter = document.querySelector('#jump_chapter')
    const tdTitle = document.querySelector('#content span[title="Title"]').parentNode
    let readerMark = tdTitle.insertBefore(createReadMark(), tdTitle.firstElementChild)
    /* jshint ignore:start */
    const onPageTurn = async () => {
      try {
        const id = parseInt(jumpChapter.value)
        if (!isNaN(id)) {
          const isLastPage = jumpPage.value === jumpPage.lastElementChild.value
          let newStatus = (isLastPage ? READ : UNFINISHED)
          newStatus = await updateChapterStatus(id, newStatus)
          let oldReaderMark = readerMark
          readerMark = createReadMark(id, newStatus)
          oldReaderMark.parentNode.replaceChild(readerMark, oldReaderMark)
        }
      } catch (err) {
        console.error("[MangaDex Read Chapter Tracker] Error trying to update manga status:", err)
      }
    }
    /* jshint ignore:end */
    const mu = new MutationObserver(onPageTurn)
    mu.observe(document.querySelector('#current_page'), { attributes: true })
    onPageTurn()
  }
  else {
    // we're in some index page, check every table for chapter links
    const links = document.querySelectorAll('table tbody a')
    const chapters = Array.from(links).filter(a => a.attributes.href && a.attributes.href.value.indexOf('/chapter/') === 0)
    for (let chapter of chapters) {
      const id = chapter.dataset.chapterId
      /* jshint ignore:start */
      const status = await getChapterStatus(id)
      /* jshint ignore:end */
      chapter.parentNode.insertBefore(createReadMark(id, status), chapter.parentNode.firstElementChild)
    }

    const thead = document.querySelector('#chapters thead')
    if (thead) {
      // we're in the manga page
      const tr = document.createElement('tr')
      const th = document.createElement('th')
      th.classList.add('form-inline', 'read-chapter-bulk')
      th.colSpan = 7
      th.style.fontSize = '0.8em'
      appendBulkSelect(th, chapters)
      tr.appendChild(th)
      thead.appendChild(tr)
    }
  }
/* jshint ignore:start */
})();
/* jshint ignore:end */