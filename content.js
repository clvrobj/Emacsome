var lineHeight = 16, leaveLines = 3, leaveHeight = leaveLines * lineHeight, 

keysMap = {
    'ctrl+n':'next',
    'ctrl+p':'prior',
    'ctrl+b':'back',
    'ctrl+f':'forward',
    'ctrl+e':'end',
    'ctrl+a':'ahead',
    'ctrl+v':'down',
    'alt+v':'up',
    'alt+shift+.':'bottom',
    'alt+shift+,':'top'
},

actions = {
    'next': function(){
        window.scrollBy(0, lineHeight);
    },
    'prior': function(){
        window.scrollBy(0, -lineHeight);
    },
    'forward': function(){
        window.scrollBy(lineHeight, 0);
    },
    'back': function(){
        window.scrollBy(-lineHeight, 0);
    },
    'end': function(){
        window.scrollTo(document.body.scrollWidth, window.scrollY);
    },
    'ahead': function(){
        window.scrollTo(0, window.scrollY);
    },
    'down': function(){
	    window.scrollBy(0, window.innerHeight - leaveHeight);
    },
    'up': function(){
        window.scrollBy(0, -window.innerHeight + leaveHeight);
    },
    'bottom': function(){
        window.scrollTo(window.scrollX, document.body.scrollHeight);
    },
    'top': function(){
        window.scrollTo(window.scrollX, 0 );
    }
}

for(var k in keysMap) {
    if (keysMap.hasOwnProperty(k)) {
        var actName = keysMap[k];
        if (actions.hasOwnProperty(actName)) {
            key(k, actions[actName]);
        }
    }
}
