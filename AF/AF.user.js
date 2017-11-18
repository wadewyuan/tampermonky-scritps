// ==UserScript==
// @name         AF
// @namespace    http://tampermonkey.net/
// @version      0.2
// @require        https://code.jquery.com/jquery-1.12.4.min.js
// @description  try to take over the world!
// @author       You
// @include      http://yxpjw.me/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var LOG_LABEL = "Tampermonkey message: ";
    var SCROLL_OFFSET = 1500;

    var isLoading = false;
    var hasNextPage = true;
    var _log = function(obj) {
        console.log(LOG_LABEL);
        console.log(obj);
    };

    // if jQuery isn't available, attach it to the page
    /*
    if (typeof(jQuery) != "undefined") {
        _log("jQuery is available, version " + jQuery.fn.jquery +" detected");
    } else {
        var scriptTag = document.createElement("script");
        scriptTag.setAttribute("src", "https://code.jquery.com/jquery-1.12.4.min.js");
        document.getElementsByTagName("body")[0].append(scriptTag);
    }*/

    $(document).ready(function() {
        // get url of next page
        var nextPageUrl = $("a:contains('下一页')").attr("href");
        if (!nextPageUrl) hasNextPage = false;

        var loadNextForPostDetails = function (result) {
            // get html of next page for post details, which is the "article.article-content" element
            var nextPageContent = result;
            nextPageContent = nextPageContent.substring(nextPageContent.indexOf("<article class=\"article-content\">"), nextPageContent.length - 1);
            nextPageContent = nextPageContent.substring(0, nextPageContent.indexOf("</article>") + 10);
            var picList = $(nextPageContent);

            // update next page url
            var arr = nextPageUrl.replace(".html", "").split("_");
            if (arr.length == 2) {
                nextPageUrl = arr[0] + "_" + (parseInt(arr[1]) +1) + ".html";
            }
            $("article.article-content blockquote:contains('相关帮助')").hide();
            $("div.pagination").hide();
            $("article.article-content").append(picList.children("p"));
        };

        var loadNextForPostList = function (result) {
            // get html of next page for post details, which is the "div.content" element
            var nextPageContent = result;
            nextPageContent = nextPageContent.substring(nextPageContent.indexOf("<div class=\"content\">"), nextPageContent.length - 1);
            nextPageContent = nextPageContent.substring(0, nextPageContent.indexOf("</div>") + 6);
            var articleList = $(nextPageContent + "</div>");

            // update next page url
            _log(articleList.find("a:contains('下一页')").get(0));
            if (articleList.find("a:contains('下一页')").length > 0) {
                nextPageUrl = articleList.find("a:contains('下一页')").attr("href");
                if (window.location.href.indexOf("page") < 0) {
                    nextPageUrl = "page/" + nextPageUrl;
                }
            } else {
                hasNextPage = false;
            }
            $("div.pagination").hide();
            $("div.content").append(articleList.children("article"));
        };

        var loadNextPage = function () {
            if(!isLoading && hasNextPage) {
                isLoading = true;
                $.ajax({
                    url: nextPageUrl,
                    success: function (result) {
                        if (nextPageUrl.match("_\\d+\.html$")) {
                            loadNextForPostDetails(result);
                        } else {
                            loadNextForPostList(result);
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

        $("a").unbind();
        $("a").click(function(event){
            event.stopPropagation();
            event.preventDefault();
            window.location.href = $(event.target).attr("href");
        });
    });

})();