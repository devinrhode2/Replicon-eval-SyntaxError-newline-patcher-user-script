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
// ==/UserScript==

// This is the full error copy-pasted from chrome:
/*
Uncaught SyntaxError: Invalid or unexpected token                        VM215822:1
    at eval (<anonymous>)
    at jsLoaderObject_loadFrom [as loadFrom] (rt.dll?nextpage=main:92)
    at rduration.html:14
// Clicking the little triangle to reveal other stack frames shows the same call sites:
jsLoaderObject_loadFrom @ rt.dll?nextpage=main:92
(anonymous) @ rduration.html:14
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

// if you see all this logged in the console when on this page:
// Then it should mostly work... I haven't really clicked around much, so if there's an issue present in chrome that's not present in safari/IE, feel free to file an issue
// (but I will tell you now, I'm not fixing it if it doesn't affect my time entry workflow)
/* expected logs on page:
userscript.html?name=Replicon%20eval%20SyntaxError%20newline%20patcher.user.js&id=cad71d13-16fe-4f1a-a37c-68d10f6f0e5d:41
newline replaced js failed! ReferenceError: d is not defined:
window.eval @ userscript.html?name=Replicon%20eval%20SyntaxError%20newline%20patcher.user.js&id=cad71d13-16fe-4f1a-a37c-68d10f6f0e5d:41
eval @ VM226351:5
eval @ VM226521:5
eval @ VM231450:59
eval @ VM232968:3
eval @ VM232964:3
Load @ rt.dll?nextpage=timesheet/timesheet&_User.Preference.Temp.Timesheet.CurrentDate,October 2, 2020&assign=_User.Preference.Temp.Timesheet.TimesheetUserId,89229852&assign=_User.Preference.Temp.Timesheet.TimesheetView,0&assign=_User.Preference.Temp.Timesheet.ReturnPage,&assign=goToDay,1&assign=SideMenuLoading,1&assign=updateCurrentDate,1:1194
retrieveJs @ rt.dll?nextpage=timesheet/timesheet&_User.Preference.Temp.Timesheet.CurrentDate,October 2, 2020&assign=_User.Preference.Temp.Timesheet.TimesheetUserId,89229852&assign=_User.Preference.Temp.Timesheet.TimesheetView,0&assign=_User.Preference.Temp.Timesheet.ReturnPage,&assign=goToDay,1&assign=SideMenuLoading,1&assign=updateCurrentDate,1:72
(anonymous) @ VM233706:1
setTimeout (async)
retrieveJs @ rt.dll?nextpage=timesheet/timesheet&_User.Preference.Temp.Timesheet.CurrentDate,October 2, 2020&assign=_User.Preference.Temp.Timesheet.TimesheetUserId,89229852&assign=_User.Preference.Temp.Timesheet.TimesheetView,0&assign=_User.Preference.Temp.Timesheet.ReturnPage,&assign=goToDay,1&assign=SideMenuLoading,1&assign=updateCurrentDate,1:70
(anonymous) @ VM232945:1
setTimeout (async)
retrieveJs @ rt.dll?nextpage=timesheet/timesheet&_User.Preference.Temp.Timesheet.CurrentDate,October 2, 2020&assign=_User.Preference.Temp.Timesheet.TimesheetUserId,89229852&assign=_User.Preference.Temp.Timesheet.TimesheetView,0&assign=_User.Preference.Temp.Timesheet.ReturnPage,&assign=goToDay,1&assign=SideMenuLoading,1&assign=updateCurrentDate,1:70
(anonymous) @ VM232434:1
setTimeout (async)
...
*/
