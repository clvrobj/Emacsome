var SHOWLINKS_COUNT = 99,

DEFAULT_DIRECTOR = 0,
TABSELECT_DIRECTOR = 1,
LINKOPEN_DIRECTOR = 2,
LINKOPEN_ALTERNATE_DIRECTOR = 3,

DEFAULT_METAKEY = 'alt',
METAKEY_STORE = 'meta-key', // the key store in the localstorage

DEFAULT_KEYSMAP = {
    'ctrl+n':'move-next',
    'ctrl+p':'move-prior',
    'ctrl+b':'back-history',
    'ctrl+f':'forward-history',
    'ctrl+e':'move-end',
    'ctrl+a':'move-ahead',
    'ctrl+v':'move-down',
    'meta+v':'move-up',
    'meta+shift+.':'move-bottom',
    'meta+shift+,':'move-top',
    'meta+n':'next-tab',
    'meta+p':'previous-tab',
    'ctrl+x ctrl+f':'show-links',
    'ctrl+x ctrl+v':'show-links-alternate',
    'ctrl+x b':'show-all-tabs',
    'ctrl+x k':'close-current-tab',
    'ctrl+x ctrl+r':'reload-tab',
    'ctrl+h':'show-help',
    'ctrl+g':'cancel',
    'esc':'cancel'
};
