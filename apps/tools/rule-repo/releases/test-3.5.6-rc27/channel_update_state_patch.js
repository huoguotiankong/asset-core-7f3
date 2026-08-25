/* 我的规则仓库 3.5.6-rc27 - Channel Update State */
var RuleRepoRC27=(function(){
var VERSION='3.5.6-rc27',BUILD=417;
function isGroup(x){return !!(x&&(String(x.entryType||'')==='channel-group'||x.channelsPath||(x.raw&&x.raw.channelsPath)));}
function isRemote(ch){ch=String(ch||'').toLowerCase();return ch==='stable'||ch==='test'||ch==='candidate';}
function copy(x){try{return JSON.parse(JSON.stringify(x));}catch(e){return x||{};}}
function meta(R,item){try{var c=R.fastChannelCache(item);if(c&&c.meta&&Array.isArray(c.meta.channels))return c.meta;}catch(e){}return null;}
function byChannel(cs,ch){for(var i=0;i<cs.length;i++)if(String(cs[i]&&cs[i].channel||'')===String(ch||''))return cs[i];return null;}
function byVersion(cs,v){for(var i=0;i<cs.length;i++)if(String(cs[i]&&cs[i].version||'')===String(v||''))return cs[i];return null;}
function better(R,a,b){if(!a)return b;if(!b)return a;var ab=Number(a.build||0),bb=Number(b.build||0);if(ab>0&&bb>0&&ab!==bb)return ab>bb?a:b;return R.versionCmp(String(a.version||''),String(b.version||''))>=0?a:b;}
function target(R,cs){var t=null;for(var i=0;i<cs.length;i++)if(isRemote(cs[i]&&cs[i].channel))t=better(R,t,cs[i]);return t;}
function verifiedAt(R,item){try{var x=R.readVerifiedInstallIndex&&R.readVerifiedInstallIndex(),v=x&&x.apps&&x.apps[String(item.id||'')];return Number(v&&v.verifiedAt||x&&x.time||0);}catch(e){return 0;}}
function current(R,item,s,cs){
 var cur=null,ch=String(s&&s.channel||''),v=String(s&&s.installedVersion||''),c=isRemote(ch)?byChannel(cs,ch):null;
 if(c)cur={channel:ch,version:v||String(c.version||''),build:v&&v!==String(c.version||'')?0:Number(c.build||0),time:verifiedAt(R,item)};
 else if(v){c=byVersion(cs,v);if(c&&isRemote(c.channel))cur={channel:String(c.channel||''),version:v,build:Number(c.build||0),time:verifiedAt(R,item)};}
 var map={};try{map=R.installedMap?R.installedMap():{};}catch(e){}
 var latest=null;for(var i=0;i<cs.length;i++){c=cs[i]||{};if(!isRemote(c.channel))continue;var r=map&&map[String(c.id||'')];if(r&&r.version&&(!latest||Number(r.time||0)>latest.time))latest={channel:String(c.channel||''),version:String(r.version||''),build:String(r.version||'')===String(c.version||'')?Number(c.build||0):0,time:Number(r.time||0)};}
 if(latest&&(!cur||latest.time>=cur.time))cur=latest;
 if(!cur){try{v=String(R.installedVersion(item)||'');c=byVersion(cs,v);if(v&&c&&isRemote(c.channel))cur={channel:String(c.channel||''),version:v,build:Number(c.build||0),time:0};}catch(e2){}}
 return cur;
}
function newer(R,t,c){if(!t||!c||!c.version)return false;var tb=Number(t.build||0),cb=Number(c.build||0);if(tb>0&&cb>0)return tb>cb;return R.versionCmp(String(t.version||''),String(c.version||''))>0;}
function selfMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-25 08:30',channels:[{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'正式版 3.5.5 · Build 389',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',recommended:true},{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,build:BUILD,displayVersion:'测试版 '+VERSION+' · Build '+BUILD,path:'apps/tools/rule-repo/rule_repo_test_v164.txt',mode:'remote-local-first',recommended:false}]};}
function apply(R){
 if(!R||typeof R.fastItemState!=='function')throw new Error('fastItemState 不可用');
 if(R.__rc27ChannelUpdates){R.version=VERSION;R.build=BUILD;return R;}
 var baseFast=R.fastItemState,baseCache=R.fastChannelCache,baseActual=R.actualStatus,baseNative=R.nativeStatusMeta;
 R.__rc27ChannelUpdates=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 17.0 · Channel Update State';R.localFirstRuntimeVersion='17.0';R.fastHomeVersion='17.0.0';R.isTestChannel=function(){return true;};
 R.ruleRepoChannelFallback=function(){return selfMeta();};
 R.fastChannelCache=function(item){if(String(item&&item.id||'')==='rule-repo')return{schema:12,time:Date.now(),revision:'self-rc27',sig:'rule-repo',meta:selfMeta()};return baseCache.call(this,item);};
 R.fastItemState=function(item){var s=copy(baseFast.call(this,item));if(!isGroup(item))return s;if(String(item.id||'')==='rule-repo'){s.installed=true;s.recognized=true;s.updateKnown=true;s.update=false;s.channel='test';s.installedVersion=VERSION;s.targetVersion=VERSION;return s;}var m=meta(this,item),cs=m&&m.channels||[];if(!s.installed&&this.actualInstalled)try{s.installed=!!this.actualInstalled(item);}catch(e){}if(!s.installed||!cs.length)return s;var c=current(this,item,s,cs),t=target(this,cs);if(c&&t){s.channel=c.channel;s.installedVersion=c.version;s.installedBuild=Number(c.build||0);s.targetChannel=String(t.channel||'');s.targetVersion=String(t.version||'');s.targetBuild=Number(t.build||0);s.recognized=true;s.updateKnown=true;s.update=newer(this,t,c);}return s;};
 R.actualStatus=function(item){if(isGroup(item)){var s=this.fastItemState(item);return s.update?'可更新':(s.installed?'已安装':'版本中心');}return baseActual.call(this,item);};
 R.nativeStatusMeta=function(item){if(isGroup(item)){var s=this.fastItemState(item);if(s.update)return{label:'可更新',color:'#F59E0B'};if(s.installed)return{label:'已安装',color:'#22A06B'};return{label:'版本中心',color:'#1677FF'};}return baseNative.call(this,item);};
 R.stats=function(items){items=items||[];var o={all:items.length,remote:0,local:0,installed:0,updates:0,favorites:this.favIds().length,recent:this.recentIds().length,groups:0};for(var i=0;i<items.length;i++){var x=items[i],s=this.fastItemState(x);if(x.mode==='remote')o.remote++;else o.local++;if(isGroup(x))o.groups++;if(s.installed)o.installed++;if(s.update)o.updates++;}return o;};
 R.updatesPage=function(){setPageTitle('更新');var d=[],items;try{items=this.items(false);}catch(e){setResult([{title:'暂时无法读取更新状态',desc:String(e.message||e),col_type:'text_center_1'}]);return;}var self=this,u=items.filter(function(x){return self.actualStatus(x)==='可更新';}),st=this.stats(items);d.push(this.hero('更新中心','测试版 '+VERSION+' · '+(u.length?u.length+' 个待更新':'当前已同步'),this.uiIcon('updates'),'hiker://empty'));d.push(this.secondaryAction('刷新版本目录',this.workspaceStaticAction?this.workspaceStaticAction('sync'):'hiker://empty'));d.push(this.sectionLine());d.push(this.metricCard('全部',st.all,'all','all','hc_repo_updates_dummy'));d.push(this.metricCard('已安装',st.installed,'installed','none','hc_repo_updates_dummy'));d.push(this.metricCard('可更新',u.length,'updates','none','hc_repo_updates_dummy'));d.push(this.metricCard('收藏',st.favorites,'favorites','none','hc_repo_updates_dummy'));d.push(this.sectionLine());d.push(this.sectionToolbar('待更新程序 · '+u.length,'updates','hiker://empty'));if(u.length){for(var i=0;i<u.length;i++)this.pushProgram(d,u[i],true);}else this.pushEmpty(d,'已是最新状态','当前已安装远程版本没有更高 Build 的 Stable/Test。');d.push(this.sectionLine());this.pushNav(d,'updates');setResult(d);};
 return R;
}
return{version:'1.0.0',apply:apply,selfMeta:selfMeta};
})();
