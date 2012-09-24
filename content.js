/* 
 *  Producer: 
 *  cast directors and actor;
 *  change director;
 *  director have to regitster his keys to producer;
 */
var Producer = function (type) {
    this.keys = [];
    var producer = this;
    chrome.extension.sendMessage({method:'get-localstorage', key:METAKEY_STORE}, function (response) {
                                     producer.metaKey = response.data ? response.data : DEFAULT_METAKEY;
                                     producer.actor = new Actor(producer);
                                     producer.director = producer.getDirector(DEFAULT_DIRECTOR);
                                     producer.actor.setDirector(producer.director);
                                 });
};
Producer.prototype.getDirector = function (type) {
    switch (type) {
    case DEFAULT_DIRECTOR:
        if (!this.defaultDirector) {
            this.defaultDirector = new DefaultDirector(this, this.actor);
        }
        this.director = this.defaultDirector;
        this.actor.setDirector(this.director);
        break;
    case TABSELECT_DIRECTOR:
        if (!this.tabSelectDirector) {
            this.tabSelectDirector = new TabSelectDirector(this, this.actor);
        }
        this.director = this.tabSelectDirector;
        this.actor.setDirector(this.director);
        break;
    case LINKOPEN_DIRECTOR:
        if (!this.linkOpenDirector) {
            this.linkOpenDirector = new LinkOpenDirector(this, this.actor);
        }
        this.director = this.linkOpenDirector;
        this.actor.setDirector(this.director);
        break;
    case LINKOPEN_ALTERNATE_DIRECTOR:
        if (!this.linkOpenAlternateDirector) {
            this.linkOpenAlternateDirector = new LinkOpenAlternateDirector(this, this.actor);
        }
        this.director = this.linkOpenAlternateDirector;
        this.actor.setDirector(this.director);
        break;
    default:
        break;
    }
    return this.director;
};
Producer.prototype.registerKeys = function (keys) {
    for(var i=0; i<keys.length; i++) {
        var k = keys[i];
        if (_.indexOf(this.keys, k) == -1) {
            // must be keydown or some sequence keys not work
            Mousetrap.bind(k, this._getKeyHandler(k), ['keydown']);
            this.keys.push(k);
        }
    }
};
Producer.prototype.bindNumKeys = function () {
    // must reverse the number sort for some mousetrap bug
    for (var num=0; num<SHOWLINKS_COUNT; num++) {
        var k = num.toString().split('').join(' ').concat(' enter');
        if (_.indexOf(this.keys, k) == -1) {
            Mousetrap.bind(k, this._getKeyHandler(num), ['keydown']);
            this.keys.push(k);
        }
    }
};
Producer.prototype._getKeyHandler = function (key) {
    var producer = this;
    return function () {
        producer.getDirector().sayAction(key);
    };
};

new Producer();
