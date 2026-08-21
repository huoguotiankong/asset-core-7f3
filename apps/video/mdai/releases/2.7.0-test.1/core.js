/* MDAI 2.7 core bridge: reuse the verified 2.6.3 protocol/data baseline. */
var MDAICoreV263=(function(){
    var MARK='海阔视界，首页频道￥home_rule￥';
    var SNAPSHOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/mdai/releases/2.6.3-test.1/source_local_2.6.3.txt';
    var CACHE='mdai_core_snapshot_263_v270';
    var instance=null;
    function valid(s){return String(s||'').indexOf(MARK)===0;}
    function source(){
        var s=getItem(CACHE,'');
        if(valid(s))return String(s);
        s=fetch(SNAPSHOT+'?bridge=27001',{timeout:10000,headers:{'Cache-Control':'no-cache'}});
        if(!valid(s))throw new Error('麻豆AI 2.6.3 核心快照格式错误');
        setItem(CACHE,String(s));
        return String(s);
    }
    function module(){
        if(instance)return instance;
        var s=source();
        var obj=JSON.parse(s.substring(MARK.length));
        var pages=JSON.parse(String(obj.pages||'[]'));
        var page=null;
        for(var i=0;i<pages.length;i++){
            if(String(pages[i].path||'')==='mdai'){page=pages[i];break;}
        }
        if(!page||!page.rule)throw new Error('麻豆AI 2.6.3 核心模块缺失');
        var old=$.exports;
        eval(String(page.rule));
        var core=$.exports;
        $.exports=old;
        if(!core||typeof core!=='object')throw new Error('麻豆AI 2.6.3 核心导出失败');
        instance=core;
        return instance;
    }
    return {build:'2.6.3',module:module,snapshot:SNAPSHOT};
})();
