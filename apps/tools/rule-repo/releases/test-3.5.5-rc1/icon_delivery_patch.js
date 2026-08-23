/* 我的规则仓库·测试版 3.5.5-rc1 - Icon Delivery Adapter 1.0 */
(function(R){
var baseIconOf=R.iconOf;
var baseFallback=R.ruleRepoChannelFallback;
var CDN='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/';
var RAW='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
var WEBRAW='https://github.com/huoguotiankong/asset-core-7f3/raw/main/';

R.version='3.5.5-rc1';
R.build=387;
R.channel='test';
R.baseStableVersion='3.5.4';
R.baseStableBuild=384;
R.targetVersion='3.5.5';
R.releaseLabel='Single Workspace 13.2.2 · Icon Delivery 1.0';
R.iconDeliveryVersion='1.0.0';
R.isTestChannel=function(){return true;};

/* 海阔/X5 对 raw.githubusercontent 图标存在实机加载失败；本仓图片统一交付到 jsDelivr。 */
R.iconCdn=function(url){
 var s=String(url||'');
 if(s.indexOf(RAW)===0)return CDN+s.substring(RAW.length);
 if(s.indexOf(WEBRAW)===0)return CDN+s.substring(WEBRAW.length);
 return s;
};
R.iconRoot=CDN+'apps/tools/rule-repo/assets/';
R.uiAssetRoot=CDN+'apps/tools/rule-repo/assets/ui/';
R.uiActiveRoot=CDN+'apps/tools/rule-repo/assets/ui/active/';
R.uiIcon=function(name){return this.uiAssetRoot+String(name||'home')+'.svg';};
R.uiIconState=function(name,active){return active?this.uiActiveRoot+String(name||'home')+'.svg':this.uiIcon(name);};
R.iconOf=function(item){
 var u='';
 try{u=baseIconOf.call(this,item);}catch(e){u=item&&item.icon?String(item.icon):'';}
 return this.iconCdn(u);
};

R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[];
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.5-rc1';
  list[i].baseVersion='3.5.4';
  list[i].targetVersion='3.5.5';
  list[i].build=387;
  list[i].displayVersion='Test 3.5.5-rc1 · Build 387 · Icon Delivery 1.0';
  list[i].path='apps/tools/rule-repo/rule_repo_test_v132.txt';
  list[i].updatedAt='2026-08-23';
  list[i].desc='统一修复规则仓库程序图标与底部导航 Raw GitHub 破图问题';
  list[i].highlights=['本仓 Raw 图标自动转 jsDelivr','底部五栏统一 CDN 图标','保留 Test2 同步后自动刷新','不修改 Stable 3.5.4'];
 }
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
