$(function () {
      var metaKey = localStorage[METAKEY_STORE], metaKeySel = $('select#meta-key');
      metaKeySel.children('option[value='.concat(metaKey, ']')).attr('selected', true);
      $('#save').click(function () {
                           localStorage[METAKEY_STORE] = metaKeySel.children('option:selected').val();
                           var alert = $('#alert');
                           alert.show(800);
                           setTimeout(function () {alert.hide(800);}, 1000 * 5);
                       });
});
