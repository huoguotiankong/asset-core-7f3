/* 我的规则仓库 v3.5.0-rc12 - compact dual version center */
(function(R){
R.ruleRepoChannelFallback=function(){var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:3,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-20',channels:[{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.1',build:360,displayVersion:'Stable 3.5.1 · Shell 1.5.1',path:'apps/tools/rule-repo/rule_repo_remote_v351.txt',mode:'remote',updatedAt:'2026-08-20',recommended:true,desc:'已验证稳定 · 适合日常使用',highlights:['实机验证通过','安全同步与多镜像','测试版异常可从正式版恢复'],icon:icon},{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.0-rc12',build:363,displayVersion:'Candidate 3.5.0-rc12 · Shell 1.0.11',path:'apps/tools/rule-repo/rule_repo_test_v111.txt',mode:'remote',updatedAt:'2026-08-20',recommended:false,desc:'界面与交互继续强化 · 用于抢先验证',highlights:['紧凑程序卡片','版本中心降噪','设置页卡片化','更新中心简化'],icon:icon}]};};
R.channelMeta=function(parent){var path=String(parent&&parent.channelsPath||parent&&parent.raw&&parent.raw.channelsPath||''),key=this.statePrefix+'channel_meta_'+String(parent&&parent.id||'default');if(path){try{var x=JSON.parse(this.apiText(path));if(x&&Array.isArray(x.channels)&&x.channels.length){setItem(key,JSON.stringify(x));return x;}}catch(e){}}try{var cached=JSON.parse(String(getItem(key,'')||''));if(cached&&Array.isArray(cached.channels)&&cached.channels.length)return cached;}catch(e){}if(String(parent&&parent.id||'')==='rule-repo')return this.ruleRepoChannelFallback();return null;};
R.channelPage=function(parent){
 setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent);if(!meta){setResult([{title:'版本信息暂时不可用',desc:'云端版本信息暂时无法读取，请稍后重试。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}try{setPagePicUrl(this.iconOf(parent));}catch(e){}
 var cs=meta.channels||[],stable=null,test=null;for(var i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];if(cs[i].channel==='test')test=cs[i];}
 d.push(this.hero('我的规则仓库','选择适合你的版本\n正式版日常使用 · 测试版体验新功能',this.iconOf(parent),'hiker://empty'));
 d.push(this.compactInfo('当前运行',this.isTestChannel()?'测试版 '+this.version:'正式版 '+this.version,'hiker://empty'));
 if(stable){this.pushSpacer(d);this.pushSection(d,'正式版 · 推荐','稳定、安全，适合日常使用');d.push(this.channelCard(parent,stable,'正式版 · 稳定推荐',!this.isTestChannel()));}
 if(test){this.pushSpacer(d);this.pushSection(d,'测试版 · 抢先体验','新界面和新功能优先验证');d.push(this.channelCard(parent,test,'测试版 · 抢先体验',this.isTestChannel()));}
 this.pushSpacer(d);d.push(this.compactInfo('恢复保障','测试版异常时，打开正式版 → 我的规则仓库 → 点击测试版卡片重新覆盖导入。','hiker://empty'));
 setResult(d);
};
})(HikerRuleRepo);
