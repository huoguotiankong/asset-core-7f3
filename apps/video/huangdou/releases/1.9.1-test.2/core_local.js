/* 黄豆短剧 1.9.1-test.2 - flattened local CoreBridge */
var HuangDouCoreV182=(function(){
  var MARK='海阔视界，首页频道￥home_rule￥',instance=null;
  function packageData(){var s=JSON.parse(String(readFile('__hclocal_huangdou-test_state.json',0)||'{}')),c=s.current||{};if(!c.packageFile)throw new Error('黄豆本地运行包状态缺失');var p=JSON.parse(String(readFile(String(c.packageFile),0)||'{}'));if(!p||!Array.isArray(p.files))throw new Error('黄豆本地运行包描述缺失');return p;}
  function asset(name){var p=packageData();for(var i=0;i<p.files.length;i++)if(String(p.files[i].name||'')===String(name)){var t=String(readFile(String(p.files[i].file),0)||'');if(!t)throw new Error('黄豆本地资产为空: '+name);return t;}throw new Error('黄豆本地资产不存在: '+name);}
  function module(){
    if(instance)return instance;
    var src=asset('core-snapshot');if(src.indexOf(MARK)!==0)throw new Error('黄豆本地 Core 快照格式错误');
    var obj=JSON.parse(src.substring(MARK.length)),pages=JSON.parse(String(obj.pages||'[]')),page=null;
    for(var i=0;i<pages.length;i++)if(String(pages[i].path||'')==='hddj'){page=pages[i];break;}
    if(!page||!page.rule)throw new Error('黄豆本地 Core 模块缺失');
    var old=$.exports;eval(String(page.rule));var core=$.exports;$.exports=old;
    if(!core||typeof core!=='object')throw new Error('黄豆本地 Core 导出失败');instance=core;return instance;
  }
  return{build:'1.8.2-local-bundle',delivery:'local-first',module:module};
})();
