/* 我的规则仓库 3.5.6-rc8 - Fast Version Center validation hotfix 14.6.1 */
(function(R){
var baseWorkspaceData=R.workspaceData;
var baseHybridDocument=R.hybridDocument;
var baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;

R.version='3.5.6-rc8';
R.build=398;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.6';
R.releaseLabel='Single Workspace 14.6.1 · Fast Version Center Validation';
R.fastHomeVersion='14.6.1';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v143.js';
R.workspaceBootstrapCache=143;
R.isTestChannel=function(){return true;};

R.channelMetaMatchesCatalog=function(item,data){
 if(!data||!Array.isArray(data.channels)||data.channels.length===0)return false;
 var targets={};try{targets=this.catalogTargets?this.catalogTargets(item):{};}catch(e){}
 var keys=['stable','test','local'],map={},i,c,k;
 for(i=0;i<data.channels.length;i++){c=data.channels[i]||{};k=String(c.channel||'').toLowerCase();if(k)map[k]=String(c.version||'');}
 function compatible(actual,target){
  actual=String(actual||'');target=String(target||'');
  if(!target)return true;if(!actual)return false;if(actual===target)return true;
  return actual.indexOf(target+'-')===0||actual.indexOf(target+'.')===0;
 }
 for(i=0;i<keys.length;i++){k=keys[i];if(targets&&targets[k]&&!compatible(map[k],targets[k]))return false;}
 return true;
};

R.workspaceData=function(items,initialView,initialId){var d=baseWorkspaceData.call(this,items,initialView,initialId);d.ui='Single Workspace 14.6.1';if(d.performance)d.performance.versionValidation='catalog-base-compatible-v2';return d;};
R.hybridDocument=function(title,data,body,script){var html=String(baseHybridDocument.call(this,title,data,body,script));html=html.replace(/Single Workspace 14\.6/g,'Single Workspace 14.6.1');html=html.replace(/Render Guard 14\.6 · RC7 patches/g,'Render Guard 14.6.1 · RC8 patches');return html;};

R.ruleRepoChannelFallback=function(){
 var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],test=null,i;
 for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){test=list[i];break;}
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg'};list.push(test);}
 test.version='3.5.6-rc8';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=398;test.displayVersion='Test 3.5.6-rc8 · Build 398 · Fast Version Center 14.6.1';test.path='apps/tools/rule-repo/rule_repo_test_v144.txt';test.mode='remote';test.updatedAt='2026-08-24';test.recommended=false;test.desc='RC7 性能优化热修：目录基线版本与 Local/派生版本兼容校验，避免正确 channels.json 被误判滞后';test.highlights=['保留 CDN 优先短超时快速版本中心','允许 Local 1.8.2 匹配 1.8.2-local.1','Test/Stable 具体版本差异仍严格检测','不修改 RC6 安装/更新状态逻辑'];
 if(data){data.channels=list;data.updatedAt='2026-08-24 16:xx';}
 return data;
};

if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
