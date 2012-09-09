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
    'alt+p':'previous-tab'
},

actions = {
    'move-next': function(){
        var offset = ((repeatedKeyStack.length > 7) ? 3 : 1) * lineHeight;
        window.scrollBy(0, offset);
    },
    'move-prior': function(){
        var offset = ((repeatedKeyStack.length > 7) ? 3 : 1) * lineHeight;
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
    }
},

repeatedKeyStack = [], keyStack = [], repeatDelayChecker,
repeatInvalidTime = 1000,

keyHandler = function (key) {
    if (keyStack[0] == key) { // repeated
        repeatedKeyStack.unshift(key);
        // delay for repeat
        clearTimeout(repeatDelayChecker);
        repeatDelayChecker = setTimeout(
            function () {
                clearTimeout(repeatDelayChecker);
                repeatedKeyStack = [];
            }, repeatInvalidTime);
    } else {
        repeatedKeyStack = [key];
    }
    keyStack.unshift(key);
};

for(var k in keysMap) {
    if (keysMap.hasOwnProperty(k)) {
        var actionName = keysMap[k];
        if (actions.hasOwnProperty(actionName)) {
            key(k, function (event, handler) {
                    var k = handler.shortcut;
                    keyHandler(k);
                    var actionName = keysMap[k];
                    actions[actionName]();
                });
        }
    }
}
