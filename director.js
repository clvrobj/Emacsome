/*
 * Director: 
 * bind keys event functions;
 * pass all key events to actor;
 * check if it is repeated key stroke
 */
var BaseDirector = function (producer, actor) {
    this.repeatedKeyStack = [];
    this.keyStack = [];
    this.repeatDelayChecker = false;
    this.repeatInvalidTime = 0;
    this.lineHeight = 0;
    this.leaveLines = 0;
    this.leaveHeight = 0;
    this.actor = false;
    this.bindKeys();
};
BaseDirector.prototype.getKeysMap = function () {
    return {};
};
BaseDirector.prototype.sayAction = function (key) {
    this._globalKeyHandler(key);
    this.actor.perform(this.getKeysMap()[key]);
};
BaseDirector.prototype._globalKeyHandler = function (key) {
    if (this.keyStack) {
        if (this.keyStack[0] == key) { // repeated
            this.repeatedKeyStack.unshift(key);
            // delay for repeat
            clearTimeout(this.repeatDelayChecker);
            var director = this;
            this.repeatDelayChecker = setTimeout(
                function () {
                    clearTimeout(director.repeatDelayChecker);
                    director.repeatedKeyStack = [];
                }, this.repeatInvalidTime);
        } else {
            this.repeatedKeyStack = [key];
        }
        this.keyStack.unshift(key);
    }
};
BaseDirector.prototype.checkIsRepeating = function () {
    return this.repeatedKeyStack.length > 7;
};
BaseDirector.prototype.bindKeys = function () {
    var keys = _.keys(this.getKeysMap());
    this.producer.registerKeys(keys);
};

// basic key actions director
var DefaultDirector = function (producer, actor) {
    this.producer = producer;
    this.actor = actor;
    this.repeatedKeyStack = [];
    this.keyStack = [];
    this.repeatDelayChecker = false;
    this.repeatInvalidTime = 800;
    this.lineHeight = 16;
    this.leaveLines = 3;
    this.leaveHeight = this.leaveLines * this.lineHeight;
    this.bindKeys();
};
extend(DefaultDirector, BaseDirector);
DefaultDirector.prototype.getKeysMap = function () {
    return {
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
        'ctrl+x k':'close-current-tab',
        'ctrl+g':'cancel',
        'esc':'cancel'
    };
};
DefaultDirector.prototype.sayAction = function (key) {
    this.constructor.uber.sayAction.call(this, key);
};

var TabSelectDirector = function (producer, actor) {
    this.producer = producer;
    this.actor = actor;
    this.bindKeys();
};
extend(TabSelectDirector, BaseDirector);
TabSelectDirector.prototype.getKeysMap = function () {
    return {
        'ctrl+s':'highlight-next-tab',
        'ctrl+r':'highlight-previous-tab',
        'ctrl+g':'cancel',
        'enter':'active-tab',
        'esc':'cancel'
    };
};

var LinkOpenDirector = function (producer, actor) {
    this.producer = producer;
    this.actor = actor;
    this.repeatedKeyStack = [];
    this.keyStack = [];
    this.repeatDelayChecker = false;
    this.repeatInvalidTime = 1000;
    this.lineHeight = 16;
    this.leaveLines = 3;
    this.leaveHeight = this.leaveLines * this.lineHeight;
    this.bindKeys();
};
extend(LinkOpenDirector, BaseDirector);
LinkOpenDirector.prototype.getKeysMap = function () {
    return {
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
        'ctrl+x k':'close-current-tab',
        'ctrl+g':'cancel',
        'esc':'cancel'
    };
};
LinkOpenDirector.prototype.bindKeys = function () {
    this.producer.bindNumKeys();
    this.constructor.uber.bindKeys.call(this);
};
LinkOpenDirector.prototype.sayAction = function (key) {
    if (_.isNumber(key)) {
        this.actor.perform('open-link', {index:key});
        return;
    }
    this.constructor.uber.sayAction.call(this, key);
};
