/* 我的规则仓库 v3.5.0-rc7 - premium channel selector */
(function(R){
R.channelPage=function(parent){
  setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),self=this;
  if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页后执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1'}]);return;}
  try{setPagePicUrl(this.iconOf(parent));}catch(e){}
  var cs=meta.channels||[],stable=null,test=null;for(var i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];if(cs[i].channel==='test')test=cs[i];}
  var coexist=String(parent.id||'')==='rule-repo';
  d.push(this.hero(parent.name,'选择适合你的版本\n'+(coexist?'正式版稳定使用 · 测试版独立体验':'正式版稳定使用 · 测试版覆盖体验'),this.iconOf(parent),'hiker://empty'));
  if(stable)d.push({title:'Stable  '+String(stable.version||''),url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  if(test)d.push({title:'Test  '+String(test.version||''),url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  this.pushSpacer(d);
  this.pushSection(d,'正式版','已验证 · 推荐日常使用');
  if(stable)this.pushChannelCard(d,parent,stable,true);
  this.pushSpacer(d);
  this.pushSection(d,'测试版','新功能先行 · 适合抢先体验');
  if(test)this.pushChannelCard(d,parent,test,false);
  this.pushSpacer(d);
  d.push({title:coexist?'正式版与测试版可同时保留':'切换版本就是覆盖安装',desc:coexist?'“我的规则仓库”承担自举恢复职责。为避免测试版异常时连正式安装入口也失效，它是唯一默认使用不同程序名、允许双版本并存的程序。':'海阔按程序名判断是否为同一个程序。除“我的规则仓库”外，同一小程序的正式版与测试版保持完全相同的程序名；导入测试版会覆盖当前版本，需要恢复时直接从仓库导入正式版覆盖即可。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  setResult(d);
};
R.pushChannelCard=function(d,parent,c,recommended){
  var self=this,badge=recommended?'稳定 · 推荐':'抢先体验',raw={id:String(c.id||''),name:String(c.name||parent.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),category:parent.category,categoryName:parent.categoryName,subCategory:parent.subCategory,tags:['远程',recommended?'正式':'测试','版本'],mode:String(c.mode||'remote'),updatedAt:String(c.updatedAt||''),icon:String(c.icon||self.iconOf(parent)),openTitle:String(c.openTitle||c.name||parent.name||'')},item=self.normalizeItem(raw,0),status=self.displayStatus(item),hl=Array.isArray(c.highlights)?c.highlights.slice(0,3):[];
  d.push({title:(recommended?'正式版':'测试版')+'  ·  '+badge,desc:String(c.displayVersion||c.version||'')+'\n'+String(c.desc||'')+(hl.length?'\n'+hl.join(' · '):''),img:String(c.icon||self.iconOf(parent)),pic_url:String(c.icon||self.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false}});
  d.push({title:recommended?'导入正式版':'导入测试版',url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'仓库记录  '+status,url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'更新于 '+String(c.updatedAt||'未标记'),url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});
};
})(HikerRuleRepo);
