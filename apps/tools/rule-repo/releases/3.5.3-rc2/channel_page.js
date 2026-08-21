/* 我的规则仓库 3.5.3-rc2 - premium version center */
(function(R){
R.channelPage=function(parent){
 setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),cs,i,stable=null,test=null,local=null;if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页后执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}try{setPagePicUrl(this.iconOf(parent));}catch(e){}
 cs=meta.channels||[];for(i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];else if(cs[i].channel==='test')test=cs[i];else if(cs[i].channel==='local')local=cs[i];}
 var selfRepo=String(parent.id||'')==='rule-repo',coexist=selfRepo||!!(parent.raw&&parent.raw.allowCoexist),currentText=selfRepo?(this.isTestChannel()?'当前运行：测试版 '+this.version:'当前运行：正式版 '+this.version):'选择需要的版本后直接导入';
 d.push(this.hero(parent.name,'一个程序 · 一个版本中心\n'+(coexist?'正式版稳定使用 · 测试版独立验证':'正式/测试同名覆盖 · 本地版可独立保留'),this.iconOf(parent),'hiker://empty'));
 d.push(this.compactInfo('当前状态',currentText,'hiker://empty'));
 this.pushSpacer(d);this.pushSection(d,'选择版本','点击整张版本卡即可导入');
 if(stable)d.push(this.channelProductCard(parent,stable,selfRepo&&!this.isTestChannel()));
 if(test)d.push(this.channelProductCard(parent,test,selfRepo&&this.isTestChannel()));
 if(local)d.push(this.channelProductCard(parent,local,false));
 this.pushSpacer(d);
 if(coexist)d.push(this.compactInfo('恢复保障','“我的规则仓库”正式版与测试版分名并存。测试版异常时，打开正式版 → 版本中心 → 重新导入测试版即可恢复。','hiker://empty'));
 else if(local)d.push(this.compactInfo('版本关系','正式版与测试版使用相同程序名、互相覆盖；本地版使用独立名称，可以和远程版同时保留。','hiker://empty'));
 else d.push(this.compactInfo('版本关系','正式版与测试版保持同名覆盖。测试异常时重新导入正式版即可恢复。','hiker://empty'));
 setResult(d);
};
})(HikerRuleRepo);
