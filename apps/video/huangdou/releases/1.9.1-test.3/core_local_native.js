/* 黄豆短剧 1.9.1-test.3 - Local-First native Core bridge */
var HuangDouCoreV182=(function(){
  var MARK='海阔视界，首页频道￥home_rule￥';
  var ASSET='hiker://files/rules/asset-core-local/huangdou-test/assets/core_182.txt';
  var instance=null;
  function text(){var s=String(fetch(ASSET)||'');if(s.indexOf(MARK)!==0)throw new Error('黄豆本地 Core 快照格式错误');return s;}
  function module(){
    if(instance)return instance;
    var src=text(),obj=JSON.parse(src.substring(MARK.length)),pages=JSON.parse(String(obj.pages||'[]')),page=null;
    for(var i=0;i<pages.length;i++)if(String(pages[i].path||'')==='hddj'){page=pages[i];break;}
    if(!page||!page.rule)throw new Error('黄豆本地 Core 模块缺失');
    var old=$.exports;
    eval(String(page.rule));
    var core=$.exports;
    $.exports=old;
    if(!core||typeof core!=='object')throw new Error('黄豆本地 Core 导出失败');
    instance=core;return instance;
  }
  return{build:'1.8.2-local-asset',delivery:'local-first-native',module:module};
})();
