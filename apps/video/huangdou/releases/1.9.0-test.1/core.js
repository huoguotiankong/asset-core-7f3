/* 黄豆短剧 1.9 CoreBridge: reuse verified Stable 1.8.2 protocol/parser baseline. */
var HuangDouCoreV182=(function(){
  var MARK='海阔视界，首页频道￥home_rule￥';
  var SNAPSHOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/huangdou/releases/1.8.2-test.1/source_local_1.8.2.txt';
  var CACHE='huangdou_core_snapshot_182_v190';
  var instance=null;
  function valid(s){return String(s||'').indexOf(MARK)===0;}
  function source(){
    var s=getItem(CACHE,'');
    if(valid(s))return String(s);
    s=fetch(SNAPSHOT+'?bridge=19001',{timeout:10000,headers:{'Cache-Control':'no-cache'}});
    if(!valid(s))throw new Error('黄豆短剧 1.8.2 核心快照格式错误');
    setItem(CACHE,String(s));
    return String(s);
  }
  function module(){
    if(instance)return instance;
    var s=source(),obj=JSON.parse(s.substring(MARK.length));
    var pages=JSON.parse(String(obj.pages||'[]')),page=null;
    for(var i=0;i<pages.length;i++)if(String(pages[i].path||'')==='hddj'){page=pages[i];break;}
    if(!page||!page.rule)throw new Error('黄豆短剧 1.8.2 核心模块缺失');
    var old=$.exports;
    eval(String(page.rule));
    var core=$.exports;
    $.exports=old;
    if(!core||typeof core!=='object')throw new Error('黄豆短剧 1.8.2 核心导出失败');
    instance=core;
    return instance;
  }
  return{build:'1.8.2',module:module,snapshot:SNAPSHOT};
})();
