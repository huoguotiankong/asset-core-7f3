/* 我的规则仓库·测试版 3.5.5-rc2 - Channel Icon Delivery completion */
(function(R){
var baseChannelMeta=R.channelMeta;
var baseFallback=R.ruleRepoChannelFallback;
R.version='3.5.5-rc2';
R.build=388;
R.channel='test';
R.baseStableVersion='3.5.4';
R.baseStableBuild=384;
R.targetVersion='3.5.5';
R.releaseLabel='Single Workspace 13.2.2 · Icon Delivery 1.1';
R.iconDeliveryVersion='1.1.0';
R.isTestChannel=function(){return true;};

/* 多版本 channels.json 里的 icon 也必须经过同一 CDN 适配，避免详情/版本中心继续破图。 */
R.channelMeta=function(item){
 var meta=baseChannelMeta.call(this,item),list=meta&&meta.channels;
 if(Array.isArray(list))for(var i=0;i<list.length;i++)if(list[i]&&list[i].icon)list[i].icon=this.iconCdn(list[i].icon);
 return meta;
};
R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[];
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.5-rc2';
  list[i].baseVersion='3.5.4';
  list[i].targetVersion='3.5.5';
  list[i].build=388;
  list[i].displayVersion='Test 3.5.5-rc2 · Build 388 · Icon Delivery 1.1';
  list[i].path='apps/tools/rule-repo/rule_repo_test_v132.txt';
  list[i].updatedAt='2026-08-23';
  list[i].desc='完整统一首页程序卡、版本中心和底部导航的本仓图标 CDN 交付';
  list[i].highlights=['程序卡 Raw 自动转 jsDelivr','Stable/Test/Local 版本卡同样转换','底部五栏统一 CDN','保留同步即时刷新'];
 }
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
