var lineHeight = 16, leaveLines = 3, leaveHeight = leaveLines * lineHeight, 

keysMap = {
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
    'ctrl+g':'cancel'
},

actions = {
    'move-next': function(){
        var offset = (getIsRepeating() ? 3 : 1) * lineHeight;
        window.scrollBy(0, offset);
    },
    'move-prior': function(){
        var offset = (getIsRepeating() ? 3 : 1) * lineHeight;
        window.scrollBy(0, -offset);
    },
    'move-forward': function(){
        window.scrollBy(lineHeight, 0);
    },
    'move-back': function(){
        window.scrollBy(-lineHeight, 0);
    },
    'move-end': function(){
        window.scrollTo(document.body.scrollWidth, window.scrollY);
    },
    'move-ahead': function(){
        window.scrollTo(0, window.scrollY);
    },
    'move-down': function(){
	    window.scrollBy(0, window.innerHeight - leaveHeight);
    },
    'move-up': function(){
        window.scrollBy(0, -window.innerHeight + leaveHeight);
    },
    'move-bottom': function(){
        window.scrollTo(window.scrollX, document.body.scrollHeight);
    },
    'move-top': function(){
        window.scrollTo(window.scrollX, 0 );
    },
    'forward-history': function(){
	    window.history.go(1);
	},
	'back-history': function(){
	    window.history.go(-1);
	},
    'next-tab':function () {
        chrome.extension.sendMessage({method:'next-tab'});
    },
    'previous-tab':function () {
        chrome.extension.sendMessage({method:'previous-tab'});
    },
    'show-links':function () {
        var links = findShownLinks();
        addLinksMark(links);
    },
    'cancel':function () {
        clearLinksMark();
    }
},

_repeatedKeyStack = [], _keyStack = [],
_repeatDelayChecker, REPEAT_INVALID_TIME = 1000,

keyHandler = function (key) {
    if (_keyStack[0] == key) { // repeated
        _repeatedKeyStack.unshift(key);
        // delay for repeat
        clearTimeout(_repeatDelayChecker);
        _repeatDelayChecker = setTimeout(
            function () {
                clearTimeout(_repeatDelayChecker);
                _repeatedKeyStack = [];
            }, REPEAT_INVALID_TIME);
    } else {
        _repeatedKeyStack = [key];
    }
    _keyStack.unshift(key);
},

getIsRepeating = function () {return _repeatedKeyStack.length > 7;},

actionsWrap = function (key) {
    return function () {
        keyHandler(key);
        actions[keysMap[key]]();
    };
},

_links = [], _shownLinks = {}, SHOWLINKS_COUNT = 35,
_linksMark = [],

findShownLinks = function () {
    if (!_links.length) {
        _links = $('a:visible');
    }
    var t = window.scrollY, h = $(window).height();
    _shownLinks = _links.filter(
        function () {
            var pos = $(this).offset();
            return pos.top > t && pos.top < t + h;
        });
    return _shownLinks;
},

addLinksMark = function (links) {
    clearLinksMark();
    for (var i=0, len=links.length; i<len && i<SHOWLINKS_COUNT; i++) {
        var linkPos = $(links[i]).offset(),
        top = linkPos.top - 12, left = linkPos.left - 17,
        mark = $('<span class="link-index">'.concat(i, '</span>'))
            .css({top:(top >= 0) ? top:0, left:(left >= 0) ? left:0});
        _linksMark.push(mark);
    }
    $('body').append(_linksMark);
},
clearLinksMark = function () {
    $(_linksMark).each(function (idx, el) {$(el).remove();});
    _linksMark = [];
},

openLink = function (num) {
    return function () {
        if (_shownLinks[num]) {
            var link = $(_shownLinks[num]).attr('href');
            window.location.href = link;
        }
    };
},
addNumKeyMap = function () {
    for (var num=0; num<=SHOWLINKS_COUNT; num++) {
        var k = num.toString().split('').join(' ').concat(' enter');
        Mousetrap.bind(k, openLink(num), ['keydown']);
    }
};

for(var k in keysMap) {
    if (keysMap.hasOwnProperty(k))
        // must be keydown or some sequence keys not work
        Mousetrap.bind(k, actionsWrap(k), ['keydown']);
}

addNumKeyMap();