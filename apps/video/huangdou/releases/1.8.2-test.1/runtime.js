/* 黄豆短剧 remote test runtime loader 1.8.2-test.1
 * Pinned snapshot bridge: preserves the verified local business module while
 * moving the executable business payload behind a versioned remote release.
 */
var HuangDouRemoteRuntime=(function(){
  var MARK='海阔视界，首页频道￥home_rule￥';
  var SNAPSHOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/huangdou/releases/1.8.2-test.1/source_local_1.8.2.txt';
  var CACHE='huangdou_remote_snapshot_182_test1';
  var BUILD='1.8.2-test.1';
  var instance=null;
  function valid(s){return String(s||'').indexOf(MARK)===0;}
  function source(){
    var s=getItem(CACHE,'');
    if(valid(s))return s;
    s=fetch(SNAPSHOT+'?snapshot='+encodeURIComponent(BUILD),{timeout:10000,headers:{'Cache-Control':'no-cache'}});
    if(!valid(s))throw new Error('黄豆短剧远程业务快照格式错误');
    setItem(CACHE,String(s));
    return String(s);
  }
  function module(){
    if(instance)return instance;
    var s=source(),o=JSON.parse(s.substring(MARK.length)),pages=JSON.parse(String(o.pages||'[]')),p=null;
    for(var i=0;i<pages.length;i++)if(String(pages[i].path||'')==='hddj'){p=pages[i];break;}
    if(!p||!p.rule)throw new Error('黄豆短剧远程业务模块缺失：hddj');
    var old=$.exports;
    eval(String(p.rule));
    var m=$.exports;
    $.exports=old;
    if(!m||typeof m!=='object')throw new Error('黄豆短剧远程业务模块导出失败');
    instance=m;
    return instance;
  }
  return{build:BUILD,module:module,snapshot:SNAPSHOT};
})();
