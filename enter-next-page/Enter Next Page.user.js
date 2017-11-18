// ==UserScript==
// @name         Enter Next Page
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       wyuan
// @match        https://bbs.hupu.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var LOG_LABEL = "Tampermonkey message: ";
    var SCROLL_OFFSET = 800;

    var isLoading = false;
    var hasNextPage = true;
    var _log = function(obj) {
        console.log(LOG_LABEL);
        console.log(obj);
    };

    // if jQuery isn't available, attach it to the page
    if (typeof(jQuery) != "undefined") {
        _log("jQuery is available, version " + jQuery.fn.jquery +" detected");
    } else {
        var scriptTag = document.createElement("script");
        scriptTag.setAttribute("src", "https://code.jquery.com/jquery-1.12.4.min.js");
        document.getElementsByTagName("body")[0].append(scriptTag);
    }

    $(document).ready(function() {
        // get url of next page
        var nextPageUrl = $("a:contains('下一页')").attr("href");
        if (!nextPageUrl) hasNextPage = false;
        _log(hasNextPage);

        var loadNextForPostList = function (result) {
            // get html of post list, which is the "ul.for-list" element
            var nextPageContent = result;
            nextPageContent = nextPageContent.substring(nextPageContent.indexOf("<ul class=\"for-list\">"), nextPageContent.length - 1);
            nextPageContent = nextPageContent.substring(0, nextPageContent.indexOf("</ul>") + 5);
            var postList = $(nextPageContent);

            // update next page url
            var arr = nextPageUrl.split("-");
            if (arr.length == 2) {
                nextPageUrl = arr[0] + "-" + (parseInt(arr[1]) +1);
            }
            $("div.showpage").hide();
            $("ul.for-list").append(postList.children("li"));
        };

        var loadNextForPostDetails = function (result) {
            // get html of next page for post details, which is the "form[name='delatc']" element
            var nextPageContent = result;
            nextPageContent = nextPageContent.substring(nextPageContent.indexOf("<form name=\"delatc\""), nextPageContent.length - 1);
            nextPageContent = nextPageContent.substring(0, nextPageContent.indexOf("</form>") + 7);
            var commentList = $(nextPageContent);

            // update next page url
            var arr = nextPageUrl.replace(".html", "").split("-");
            if (arr.length == 2) {
                nextPageUrl = arr[0] + "-" + (parseInt(arr[1]) +1) + ".html";
            }
            $("div.downpage").hide();
            if(commentList.children("div").first().attr("id") < $("form[name='delatc'] div.floor").last().attr("id")) {
                // workaround to solve the problem that last page content would be loaded over and over
                hasNextPage = false;
            } else {
                $("form[name='delatc']").append(commentList.children("div"));
            }
        };

        var loadNextPage = function () {
            if(!isLoading && hasNextPage) {
                isLoading = true;
                $.ajax({
                    url: nextPageUrl,
                    success: function (result) {
                        if (nextPageUrl.match("-\\d+$")) {
                            loadNextForPostList(result);
                        } else if (nextPageUrl.match("-\\d+\.html$")) {
                            loadNextForPostDetails(result);
                        }
                    },
                    error: function(error){
                        _log(error);
                        hasNextPage = false;
                    },
                    complete: function() {
                        isLoading = false;
                    }
                });
            }
        };

        $(this).scroll(function(event){
            if ($(this).scrollTop()  >= $(this).height() - $(window).height() - SCROLL_OFFSET) {
                    loadNextPage();
            }
        });
    });

})();