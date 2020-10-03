// ==UserScript==
// @name         Replicon eval SyntaxError newline patcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fixes "Uncaught SyntaxError: Invalid or unexpected token" on projecttimecapture.com. May not fix all issues.
// @author       You
// @match        https://www.projecttimecapture.com/*
// @run_at       document_start
// @grant        none
// @license      MIT
// @updateURL https://openuserjs.org/meta/devinrhode2/Replicon_eval_SyntaxError_newline_patcher.meta.js
// @downloadURL https://openuserjs.org/install/devinrhode2/Replicon_eval_SyntaxError_newline_patcher.user.js
// @copyright 2020, devinrhode2 (https://openuserjs.org/users/devinrhode2)
// ==/UserScript==

/* This is the full error from chrome:
Uncaught SyntaxError: Invalid or unexpected token
    at eval (<anonymous>)
    at jsLoaderObject_loadFrom [as loadFrom] (rt.dll?nextpage=main:92)
    at rduration.html:14

When you load this page: https://www.projecttimecapture.com/cgi/rt.dll?nextpage=main
You should not see it get stuck too long at "Generating Timesheet..."
It is expected to see a bunch of warnings like this in the console:

    newline replaced js failed! ReferenceError: d is not defined:
    js: d.level1id=this.level1id

There may be some issue present due to these warnings being generated, but I haven't really checked everything works inside this app yet.
*/

// This site has a ton of iframes, which is why the url was being logged:
//console.log('setup eval newline patch in', window.location.href.replace('https://www.projecttimecapture.com', ''));
window.originalEval = window.eval;
window.eval = function (jsStr) {
  try {
    return window.originalEval(jsStr);
  } catch (firstError) {
    // assumption is that chrome \r\n has turned into \n\n (which fails) instead of \\n\\n (which works in safari, and, it turns out, chrome too)
    var newJsStr = jsStr
      .replaceAll('\\n', '__GOOD_NEWLINE__')
      .replaceAll('\n', '\\n')
      .replaceAll('__GOOD_NEWLINE__', '\\n');

    try {
      return window.originalEval(newJsStr);
    } catch (secondError) {
      console.warn('newline replaced js failed! ' + String(secondError).split('\n')[0] + ':');
      console.log('js:', newJsStr);
      //throw firstError; // need to swallow these errors, even if code is run in console on breakpoint (outside of tamper monkey/crx env)
    }
  }
};
