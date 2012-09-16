var extend = function (Child, Parent) { // from book oop JS
    var F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
};

var BaseDirector = function (showlinksCount) {
    this.repeatedKeyStack = [];
    this.keyStack = [];
    this.repeatDelayChecker = false;
    this.repeatInvalidTime = 0;
    this.lineHeight = 0;
    this.leaveLines = 0;
    this.leaveHeight = 0;
    this.showlinksCount = 0;
    this.actor = false;
    this.keysMap = {};
};
BaseDirector.prototype.sayAction = function (key) {
    this._globalKeyHandler(key);
    this.actor.perform(this.keysMap[key]);
};
BaseDirector.prototype.getAllKeys = function () {
    return _.keys(this.keysMap);
};
BaseDirector.prototype._globalKeyHandler = function (key) {
    if (this.keyStack[0] == key) { // repeated
        this.repeatedKeyStack.unshift(key);
        // delay for repeat
        clearTimeout(this.repeatDelayChecker);
        this.repeatDelayChecker = setTimeout(
            function () {
                clearTimeout(this.repeatDelayChecker);
                this.repeatedKeyStack = [];
            }, this.repeatInvalidTime);
    } else {
        this.repeatedKeyStack = [key];
    }
    this.keyStack.unshift(key);
};
BaseDirector.prototype.checkIsRepeating = function () {
    return this.repeatedKeyStack.length > 7;
};

var DefaultDirector = function (showlinksCount) {
    this.repeatedKeyStack = [];
    this.keyStack = [];
    this.repeatDelayChecker = false;
    this.repeatInvalidTime = 1000;
    this.lineHeight = 16;
    this.leaveLines = 3;
    this.leaveHeight = this.leaveLines * this.lineHeight;
    this.showlinksCount = showlinksCount;
    this.actor = new Actor(this);
    this.keysMap = {
        'ctrl+n':'move-next',
        'ctrl+p':'move-prior',
        'ctrl+b':'back-history',
        'ctrl+f':'forward-history',
        'ctrl+e':'move-end',
        'ctrl+a':'move-ahead',
        'ctrl+v':'move-down',
        'alt+v':'move-up',
        'alt+shift+.':'move-bottom',
        'alt+shift+,':'move-top',
        'alt+n':'next-tab',
        'alt+p':'previous-tab',
        'ctrl+x ctrl+f':'show-links',
        'ctrl+x b':'show-all-tabs',
        'ctrl+g':'cancel',
        'esc':'cancel'
    };
};
extend(DefaultDirector, BaseDirector);
DefaultDirector.prototype.sayAction = function (key) {
    if (_.isNumber(key)) {
        this.actor.perform('open-link', {index:key});
        return;
    }
    this.constructor.uber.sayAction.call(this, key);
};

var Actor = function (director) {
    this.director = director;
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
        'cancel': this.cancel
    };

    // this.actions = {
    //     'move-next': function(){
    //         var offset = (director.checkIsRepeating() ? 3 : 1) * director.lineHeight;
    //         window.scrollBy(0, offset);
    //     },
    //     'move-prior': function(){
    //         var offset = (director.checkIsRepeating() ? 3 : 1) * director.lineHeight;
    //         window.scrollBy(0, -offset);
    //     },
    //     'move-forward': function(){
    //         window.scrollBy(director.lineHeight, 0);
    //     },
    //     'move-back': function(){
    //         window.scrollBy(-director.lineHeight, 0);
    //     },
    //     'move-end': function(){
    //         window.scrollTo(document.body.scrollWidth, window.scrollY);
    //     },
    //     'move-ahead': function(){
    //         window.scrollTo(0, window.scrollY);
    //     },
    //     'move-down': function(){
	//         window.scrollBy(0, window.innerHeight - director.leaveHeight);
    //     },
    //     'move-up': function(){
    //         window.scrollBy(0, -window.innerHeight + director.leaveHeight);
    //     },
    //     'move-bottom': function(){
    //         window.scrollTo(window.scrollX, document.body.scrollHeight);
    //     },
    //     'move-top': function(){
    //         window.scrollTo(window.scrollX, 0 );
    //     },
    //     'forward-history': function(){
	//         window.history.go(1);
	//     },
	//     'back-history': function(){
	//         window.history.go(-1);
	//     },
    //     'next-tab':function () {
    //         chrome.extension.sendMessage({method:'next-tab'});
    //     },
    //     'previous-tab':function () {
    //         chrome.extension.sendMessage({method:'previous-tab'});
    //     },
    //     'show-links':function () {
    //         var links = findShownLinks();
    //         addLinksMark(links);
    //     },
    //     'show-all-tabs':function () {
    //         chrome.extension.sendMessage({method:'get-all-tabs'},
    //                                      function (tabs) {
    //                                          if (!this.toolBar) {
    //                                              this.oolBar = $('<div id="toolbar"></div>').appendTo('body');
    //                                          }
    //                                          var tabsEl = [];
    //                                          for (var i=0; i<tabs.length; i++) {
    //                                              tabsEl.push($('<div class="tab">'.concat(tabs[i].title, '</div>')));
    //                                          }
    //                                          this.toolBar.empty().append(tabsEl).show();
    //                                      });
    //     },
    //     'cancel':function () {
    //         clearLinksMark();
    //         hideToolBar();
    //     }
    // };
};

Actor.prototype.perform = function (actionName, data) {
    var action = this.actions[actionName];
    action && action.call(this, data);
};
Actor.prototype._addLinksMark = function (links) {
    this._clearLinksMark();
    for (var i=0, len=this.links.length; i<len && i<this.director.showlinksCount; i++) {
        var linkPos = $(this.links[i]).offset(),
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
            return pos.top > t && pos.top < t + h;
        });
    return this.shownLinks;
},

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
    var links = this._findShownLinks();
    this._addLinksMark(links);
};
Actor.prototype.showAllTabs =function () {
    chrome.extension.sendMessage({method:'get-all-tabs'},
                                 function (tabs) {
                                     if (!this.toolBar) {
                                         this.oolBar = $('<div id="toolbar"></div>').appendTo('body');
                                     }
                                     var tabsEl = [];
                                     for (var i=0; i<tabs.length; i++) {
                                         tabsEl.push($('<div class="tab">'.concat(tabs[i].title, '</div>')));
                                     }
                                     this.toolBar.empty().append(tabsEl).show();
                                 });
};
Actor.prototype.cancel = function () {
    this._clearLinksMark();
    this._hideToolBar();
};
Actor.prototype.openLink = function (data) {
    var index = data.index;
    if (this.shownLinks[index]) {
        var link = $(this.shownLinks[index]).attr('href');
        window.location.href = link;
    }
};
