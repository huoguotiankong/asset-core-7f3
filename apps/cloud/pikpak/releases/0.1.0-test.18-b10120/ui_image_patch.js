/* PikPak Test18 Build10120 - distinguish image cards from downloads */
(function(P,UI){
    var baseFileCard=UI.fileCard,baseShareCard=UI.shareCard;
    function image(f){var m=String(f&&f.mime_type||'').toLowerCase(),n=String(f&&f.name||'').toLowerCase();return m.indexOf('image')>=0||/\.(jpg|jpeg|png|gif|webp|bmp|heic|avif)(\?|$)/i.test(n);}
    UI.fileCard=function(f,url){var c=baseFileCard(f,url);if(image(f)&&c.extra)c.extra.cls='image';return c;};
    UI.shareCard=function(f,url){var c=baseShareCard(f,url);if(image(f)){c.desc=String(c.desc||'')+'  ·  点击预览';c.extra=c.extra||{};c.extra.cls='image';}return c;};
})(PikPakProvider,PikPakUI);

