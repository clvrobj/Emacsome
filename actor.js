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
        'show-links': this.showLinks,
        'show-all-tabs': this.showAllTabs,
        'open-link': this.openLink,
        'highlight-next-tab': this.highlightNextTabInToolbar,
        'highlight-previous-tab': this.highlightPreviousTabInToolbar,
        'active-tab':this.activeTab,
        'cancel': this.cancel
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
Actor.prototype.showAllTabs =function () {
    var actor = this;
    chrome.extension.sendMessage({method:'get-all-tabs'},
                                 function (r) {
                                     var tabs = r.tabs, currentTab = r.currentTab;
                                     if (!actor.toolBar) {
                                         actor.toolBar = $('<div id="toolbar"></div>').appendTo('body');
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
    this.producer.getDirector(DEFAULT_DIRECTOR);
};
Actor.prototype.openLink = function (data) {
    var index = data.index;
    if (this.shownLinks[index]) {
        var link = $(this.shownLinks[index]).attr('href');
        window.location.href = link;
    }
};
