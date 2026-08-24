/* 我的规则仓库 3.5.6-rc9 - Local-First Runtime & Asset Cache 15.0 */
(function(R){
  var baseIconOf=R.iconOf,baseImportRule=R.importRule,baseSyncManifest=R.syncManifest;
  R.version='3.5.6-rc9';
  R.build=399;
  R.channel='test';
  R.baseStableVersion='3.5.5';
  R.baseStableBuild=389;
  R.targetVersion='3.5.6';
  R.releaseLabel='Single Workspace 15.0 · Local-First Runtime';
  R.localFirstRuntimeVersion='15.0';
  R.localRuntimeManagerVersion='2.1.0';
  function safeId(s){return String(s||'item').replace(/[^0-9A-Za-z_.-]/g,'_');}
  function extOf(u){u=String(u||'').split('?')[0].split('#')[0];var m=u.match(/\.([A-Za-z0-9]{2,5})$/),e=m?String(m[1]).toLowerCase():'img';if(['png','jpg','jpeg','webp','gif','svg','ico'].indexOf(e)<0)e='img';return e;}
  function cdnize(u){u=String(u||'');var m=u.match(/^https:\/\/raw\.githubusercontent\.com\/huoguotiankong\/asset-core-7f3\/main\/(.+)$/);if(m)return'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/'+m[1];return u;}
  R.localIconFile=function(item){var u=String(item&&item.icon||'');return'hiker://files/cache/asset-core-local/icons/'+safeId(item&&item.id||item&&item.name||'item')+'.'+extOf(u);};
  R.localizeIcon=function(item,force){item=item||{};var p=this.localIconFile(item);try{if(!force&&fileExist(p))return getPath(p);}catch(e0){}var u=String(item.icon||'');if(!u&&typeof this.fallbackIcon==='function')u=String(this.fallbackIcon(item)||'');if(!u)return'';u=typeof this.iconCdn==='function'?String(this.iconCdn(u)||u):cdnize(u);u=cdnize(u);try{downloadFile(u,p);if(fileExist(p))return getPath(p);}catch(e){}return'';};
  R.syncLocalIcons=function(items){items=Array.isArray(items)?items:[];var ok=0,fail=0;for(var i=0;i<items.length;i++){var p='';try{p=this.localizeIcon(items[i],false);}catch(e){}if(p)ok++;else fail++;}return{ok:ok,fail:fail,total:items.length};};
  R.iconOf=function(item){try{var p=this.localIconFile(item);if(fileExist(p))return getPath(p);}catch(e){}return baseIconOf.call(this,item);};
  R.importRule=function(raw){var ret=baseImportRule.call(this,raw);try{
    if(!ret||String(ret).indexOf('海阔视界')!==0)return ret;
    var x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;var item=this.normalizeItem?this.normalizeItem(x||{},0):(x||{}),local=this.localizeIcon(item,false);if(!local)return ret;
    var mark='￥home_rule￥',at=String(ret).indexOf(mark);if(at<0)return ret;var head=String(ret).slice(0,at+mark.length),body=String(ret).slice(at+mark.length),rule=JSON.parse(body);rule.icon=local;return head+JSON.stringify(rule);
  }catch(e){return ret;}};
  R.syncManifest=function(){var x=baseSyncManifest.apply(this,arguments);if(x&&x.ok){try{x.localIcons=this.syncLocalIcons(this.items(false));}catch(e){x.localIconError=String(e.message||e);}}return x;};
  R.localRuntimeStatus=function(){var name='__hclocal_rule-repo-test_state.json';try{if(!fileExist(name))return{installed:false,version:'',build:0};var s=JSON.parse(String(readFile(name,0)||'{}')),c=s.current||{};return{installed:!!c.packageFile,version:String(c.version||''),build:Number(c.build||0),previous:s.previous||null,lastInstallError:String(s.lastInstallError||'')};}catch(e){return{installed:false,error:String(e.message||e)};}};
  if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
