var getKeyHandler = function (key) {
    return function () {
        director.sayAction(key);
    };
};

var SHOWLINKS_COUNT = 35,
director = new DefaultDirector(SHOWLINKS_COUNT),

// add key action mapping
keys = director.getAllKeys();
for(var i=0; i<keys.length; i++) {
    var k = keys[i];
    // must be keydown or some sequence keys not work
    Mousetrap.bind(k, getKeyHandler(k), ['keydown']);
}
for (var num=0; num<=SHOWLINKS_COUNT; num++) {
    var k = num.toString().split('').join(' ').concat(' enter');
    Mousetrap.bind(k, getKeyHandler(num), ['keydown']);
}
