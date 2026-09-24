/* PikPak Test22 Build10124 - single-account exports and native cloud search */
(function(C,P,UI,Pages,R){
    var base=R.module;
    function extractMagnet(s){var m=String(s||'').match(/magnet:\?xt=urn:btih:[^\s]+/i);return m?m[0]:'';}
    R.module=function(){var m=base();m.home=Pages.home;m.drive=Pages.drive;m.cloudSearch=Pages.cloudSearch;m.account=Pages.account;m.settings=Pages.settings;m.webLogin=Pages.webLogin;m.webDone=Pages.webDone;m.searchRoute=function(q){q=String(q||'').trim();return q?UI.route('pikpakSearch',{q:q,type:'all'}):'toast://请输入搜索关键词';};m.search=function(){var q=String(getParam('kw','')||'').trim(),sh=P.parseShareInput(q),mag=extractMagnet(q);if(sh||mag||/^https?:\/\//i.test(q)){setResult([{title:'打开输入内容',desc:q,url:m.openInput(q),col_type:'text_1'}]);return;}return Pages.cloudSearch({q:q,type:'all',external:true});};return m;};
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages,PikPakRemoteRuntime);
