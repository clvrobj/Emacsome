/*
 * Actor: 
 * execute low level functions;
 * communicate with background.js
 */
var Actor = function (producer) {
    this.links = [];
    this.shownLinks = {};
    this.linksMark = [];
    this.actions = {
        'move-next': this.moveNext,
        'move-prior': this.movePrior,
        'move-forward': this.moveForward,
        'move-back': this.moveBack,
        'move-end': this.moveEnd,
        'move-ahead': this.moveAhead,
        'move-down': this.moveDown,
        'move-up': this.moveUp,
        'move-bottom': this.moveBottom,
        'move-top': this.moveTop,
        'forward-history': this.forwardHistory,
	    'back-history': this.backHistory,
        'next-tab': this.nextTab,
        'previous-tab': this.previousTab,
        'show-links': this.showLinks, // will open link in new tab
        'show-links-alternate': this.showLinksAlternate, // will open link in current tab
        'show-all-tabs': this.showAllTabs,
        'open-link': this.openLink,
        'open-link-newtab': this.openLinkNewTab,
        'highlight-next-tab': this.highlightNextTabInToolbar,
        'highlight-previous-tab': this.highlightPreviousTabInToolbar,
        'active-tab':this.activeTab,
        'close-current-tab':this.closeCurrentTab,
        'reload-tab':this.reloadTab,
        'show-help': this.showHelp,
        'cancel': this.cancel
    };
    this.actionsIntro = {
        'move-next': 'next line',
        'move-prior': 'prior line',
        'move-forward': 'move right',
        'move-back': 'move left',
        'move-end': 'far right of page',
        'move-ahead': 'far left of page',
        'move-down': 'page down',
        'move-up': 'page up',
        'move-bottom': 'move to page bottom',
        'move-top': 'move to page top',
        'forward-history': 'forward history',
	    'back-history': 'back history',
        'next-tab': 'next tab',
        'previous-tab': 'prior tab',
        'show-links': 'show links to open link in new tab',
        'show-links-alternate': 'show links to open link in current tab',
        'show-all-tabs': 'brows all tabs',
        'open-link': 'open link in current tab',
        'open-link-newtab': 'open link in new tab',
        'highlight-next-tab': 'highlight next tab',
        'highlight-previous-tab': 'highlight previous tab',
        'active-tab': 'active highlighted tab',
        'close-current-tab': 'close current tab',
        'reload-tab': 'reload current tab',
        'show-help': 'show help',
        'cancel': 'cancel'
    };
    this.producer = producer;
};

Actor.prototype.perform = function (actionName, data) {
    var action = this.actions[actionName];
    action && action.call(this, data);
};
Actor.prototype._addLinksMark = function (links) {
    this._clearLinksMark();
    for (var i=0, len=links.length; i<len && i<SHOWLINKS_COUNT; i++) {
        var linkPos = $(links[i]).offset(),
        top = linkPos.top - 12, left = linkPos.left - 17,
        mark = $('<span class="link-index">'.concat(i, '</span>'))
            .css({top:(top >= 0) ? top:0, left:(left >= 0) ? left:0});
        this.linksMark.push(mark);
    }
    $('body').append(this.linksMark);
},
Actor.prototype._clearLinksMark = function () {
    $(this.linksMark).each(function (idx, el) {$(el).remove();});
    this.linksMark = [];
};
Actor.prototype._hideToolBar = function () {
    this.toolBar && this.toolBar.hide();
};
Actor.prototype._findShownLinks = function () {
    if (!this.links.length) {
        this.links = $('a:visible');
    }
    var t = window.scrollY, h = $(window).height();
    this.shownLinks = this.links.filter(
        function () {
            var pos = $(this).offset();
            return pos.top >= t && pos.top < t + h;
        });
    return this.shownLinks;
};
Actor.prototype.setDirector = function (director) {
    this.director = director;
};

Actor.prototype.moveNext = function(){
    var offset = (this.director.checkIsRepeating() ? 3 : 1) * this.director.lineHeight;
    window.scrollBy(0, offset);
};
Actor.prototype.movePrior = function() {
    var offset = (this.director.checkIsRepeating() ? 3 : 1) * this.director.lineHeight;
    window.scrollBy(0, -offset);
};
Actor.prototype.moveForward = function() {
    window.scrollBy(this.director.lineHeight, 0);
};
Actor.prototype.moveBack = function() {
    window.scrollBy(-this.director.lineHeight, 0);
};
Actor.prototype.moveEnd = function() {
    window.scrollTo(document.body.scrollWidth, window.scrollY);
};
Actor.prototype.moveAhead = function() {
window.scrollTo(0, window.scrollY);
};
Actor.prototype.moveDown = function() {
	window.scrollBy(0, window.innerHeight - this.director.leaveHeight);
};
Actor.prototype.moveUp = function() {
    window.scrollBy(0, -window.innerHeight + this.director.leaveHeight);
};
Actor.prototype.moveBottom = function() {
    window.scrollTo(window.scrollX, document.body.scrollHeight);
};
Actor.prototype.moveTop = function() {
    window.scrollTo(window.scrollX, 0 );
};
Actor.prototype.forwardHistory = function() {
	window.history.go(1);
};
Actor.prototype.backHistory = function() {
	window.history.go(-1);
};
Actor.prototype.nextTab = function () {
    chrome.extension.sendMessage({method:'next-tab'});
};
Actor.prototype.previousTab =function () {
    chrome.extension.sendMessage({method:'previous-tab'});
};
Actor.prototype.showLinks = function () {
    this.producer.getDirector(LINKOPEN_DIRECTOR);
    var links = this._findShownLinks();
    this._addLinksMark(links);
};
Actor.prototype.showLinksAlternate = function () {
    this.producer.getDirector(LINKOPEN_ALTERNATE_DIRECTOR);
    var links = this._findShownLinks();
    this._addLinksMark(links);
};
Actor.prototype.showAllTabs =function () {
    var actor = this;
    chrome.extension.sendMessage({method:'get-all-tabs'},
                                 function (r) {
                                     var tabs = r.tabs, currentTab = r.currentTab;
                                     if (!actor.toolBar) {
                                         actor.toolBar = $('<div id="emacsome-toolbar"></div>').appendTo('body');
                                     }
                                     var tabsEl = [];
                                     for (var i=0; i<tabs.length; i++) {
                                         tabsEl.push($('<div class="tab">'.concat(tabs[i].title, '</div>')));
                                     }
                                     actor.toolBar.empty().append(tabsEl).show();
                                     actor._highlightTabInToolbar(currentTab.index);
                                 });
    this.producer.getDirector(TABSELECT_DIRECTOR);
};
Actor.prototype._highlightTabInToolbar = function (index) {
    var tabs = this.toolBar.find('.tab');
    if (index >=0 && index < tabs.length) {
        tabs.removeClass('active').eq(index).addClass('active');
        this._tabIndex = index;
    }
};
Actor.prototype.highlightNextTabInToolbar = function () {
    var tabs = this.toolBar.find('.tab'), index = this._tabIndex + 1;
    index = index < tabs.length ? index : 0;
    this._highlightTabInToolbar(index);
};
Actor.prototype.highlightPreviousTabInToolbar = function () {
    var tabs = this.toolBar.find('.tab'), index = this._tabIndex - 1;
    index = index >= 0 ? index : (tabs.length - 1);
    this._highlightTabInToolbar(index);
};
Actor.prototype.activeTab = function () {
    chrome.extension.sendMessage({method:'active-tab', 'index':this._tabIndex});
    this.cancel();
};
Actor.prototype.cancel = function () {
    this._clearLinksMark();
    this._hideToolBar();
    this._hideHelpWnd();
    this.producer.getDirector(DEFAULT_DIRECTOR);
};
Actor.prototype.openLink = function (data) {
    var index = data.index;
    if (this.shownLinks[index]) {
        var link = $(this.shownLinks[index]).attr('href');
        window.location.href = link;
    }
    this.cancel();
};
Actor.prototype.openLinkNewTab = function (data) {
    var index = data.index;
    if (this.shownLinks[index]) {
        var link = $(this.shownLinks[index]).attr('href');
        window.open(link);
    }
    //Notice: `18` and `8` both will response when key `1 8 enter`
    // cancel after open one link and ignore the `8`
    this.cancel();
};
Actor.prototype.closeCurrentTab = function () {
    chrome.extension.sendMessage({method:'close-current-tab'});
};
Actor.prototype.reloadTab = function () {
    chrome.extension.sendMessage({method:'reload-tab'});
};
Actor.prototype.showHelp = function () {
    if (!this.helpWnd) {
        this.helpWnd = $('<div id="emacsome-help-wrap"></div>').appendTo('body');
    }
    this.helpWnd.empty();
    var keysMap = this.director.getKeysMap(), keys = _.keys(keysMap),
    ul = $('<div id="emacsome-help"><ul></ul></div>').appendTo(this.helpWnd).children('ul');
    for (var i=0; i<keys.length; i++) {
        var k = keys[i];
        ul.append('<li><div class="key">'.concat(k, '</div><div class="intro">', this.actionsIntro[keysMap[k]], '</div></li>'));
    }
    this.helpWnd.css('height', window.innerHeight).show();
};
Actor.prototype._hideHelpWnd = function () {
    this.helpWnd && this.helpWnd.hide();
};