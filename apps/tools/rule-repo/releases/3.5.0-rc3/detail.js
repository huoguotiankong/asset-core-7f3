/* 我的规则仓库 v3.5.0-rc3 - channel selector detail */
(function(R){
R.ruleRepoChannels=function(){
  var fallback={schema:1,id:'rule-repo',name:'我的规则仓库',channels:[
    {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.4.3',displayVersion:'Stable 3.4.3',path:'apps/tools/rule-repo/rule_repo_remote_v343.txt',mode:'remote',desc:'稳定版 · 适合日常使用 · 已实机验证',icon:this.iconRoot+'icon.svg'},
    {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.0-rc3',displayVersion:'Candidate 3.5.0-rc3',path:'apps/tools/rule-repo/rule_repo_test.txt',mode:'remote',desc:'测试版 · 新功能优先体验 · 与正式版状态隔离',icon:this.iconRoot+'icon.svg'}
  ]};
  try{var x=JSON.parse(this.apiText('apps/tools/rule-repo/channels.json'));if(x&&Array.isArray(x.channels)&&x.channels.length)return x;}catch(e){}
  return fallback;
};
R.ruleRepoChannelPage=function(parent){
  setPageTitle('我的规则仓库');var d=[],meta=this.ruleRepoChannels(),self=this;
  try{setPagePicUrl(this.iconOf(parent));}catch(e){}
  d.push({title:'我的规则仓库',desc:'海阔视界专属 · 规则管理中心\n正式版 / 测试版统一云端入口',img:this.iconOf(parent),pic_url:this.iconOf(parent),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
  this.pushSpacer(d);this.pushSection(d,'选择版本','首页只保留一个“我的规则仓库”；在这里选择需要导入的版本。');
  (meta.channels||[]).forEach(function(c){
    var raw={id:String(c.id||''),name:String(c.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),category:'tools',categoryName:'工具',subCategory:'仓库管理',tags:['远程',c.channel==='test'?'测试':'正式','管理','版本'],mode:'remote',updatedAt:'2026-08-20',icon:String(c.icon||self.iconOf(parent))};
    var status=self.statusOf(self.normalizeItem(raw,0));
    d.push({
      title:(c.label||c.channel)+'  '+String(c.displayVersion||c.version||''),
      desc:String(c.desc||'')+'\n当前记录：'+status+' · 点击直接导入'+String(c.label||''),
      img:String(c.icon||self.iconOf(parent)),pic_url:String(c.icon||self.iconOf(parent)),
      url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),
      col_type:'movie_1_left_pic',extra:{lineVisible:false}
    });
  });
  this.pushSpacer(d);this.pushSection(d,'版本规则','正式版用于日常稳定使用；测试版用于验证新功能。测试通过后再晋级正式版，不需要在首页放两个重复程序。');
  d.push({title:'正式版',desc:'Stable 通道 · 长期稳定 · 通过实机验证后才更新',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:'测试版',desc:'Candidate/Test 通道 · 独立更新与回退 · 不影响正式版',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  setResult(d);
};
R.detailPage=function(){
  var id=String((MY_PARAMS&&MY_PARAMS.hc_repo_item_id)||getParam('id')||''),item=this.findById(id,false),d=[];
  if(!item){setResult([{title:'程序不存在或云端索引已更新',url:'hiker://empty',col_type:'text_center_1'}]);return;}
  if(item.id==='rule-repo')return this.ruleRepoChannelPage(item);
  setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}var st=this.statusOf(item),iv=this.installedVersion(item),modeDesc=item.mode==='remote'?'自用远程代码版':(item.mode==='share'?'纯本地分享版':'本地程序'),last=this.lastImportedTime(item),openTitle=String(item.raw&&item.raw.openTitle||item.name||'').replace(/\|/g,'');
  d.push({title:item.name,desc:'v'+(item.version||'未标记')+' · '+modeDesc+'\n'+this.statusMark(item),img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
  d.push({title:'打开',col_type:'text_2',url:'hiker://home@'+openTitle+'||hiker://home',extra:{lineVisible:false}});d.push({title:st==='可更新'?'立即更新':'导入 / 覆盖',col_type:'text_2',url:$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw)),extra:{lineVisible:false}});
  d.push(this.statCard('云端',item.version||'--','hiker://empty'));d.push(this.statCard('已记录',iv||'--','hiker://empty'));d.push(this.statCard('状态',st,'hiker://empty'));d.push(this.statCard('模式',this.modeText(item.mode),'hiker://empty'));
  this.pushSpacer(d);this.pushSection(d,'快捷操作','使用海阔原生 hiker://home@规则名 打开已安装程序。');d.push(this.quickCard(this.isFav(item)?'★ 已收藏':'☆ 收藏',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));d.push(this.quickCard('检查更新',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';return'toast://'+x.name+'：'+r.statusOf(x)+' / 云端 '+x.version;},item.id)));d.push(this.quickCard('备份状态','hiker://page/ruleRepoSettings?rule=&simple=true'));
  this.pushSpacer(d);this.pushSection(d,'程序信息',item.desc||'暂无说明');d.push({title:'分类',desc:item.categoryName+' / '+item.subCategory,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'运行模式',desc:modeDesc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'更新时间',desc:item.updatedAt||'未标记',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'最近导入',desc:last?this.formatTime(last):'未记录',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});if(item.bytes)d.push({title:'包体大小',desc:Math.round(Number(item.bytes)/1024)+' KB',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  if((item.tags||[]).length){this.pushSpacer(d);this.pushSection(d,'标签','');(item.tags||[]).forEach(function(t){d.push({title:'#'+t,col_type:'flex_button',url:'hiker://page/ruleRepoSearch?rule=&simple=true&kw='+encodeURIComponent(t)});});}
  this.pushSpacer(d);this.pushSection(d,'更多操作','系统级删除未使用未文档化 API；这里只管理仓库记录。');d.push({title:'复制仓库路径',desc:item.path||'',url:'copy://'+(item.path||''),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'查看导入记录',url:'hiker://page/ruleRepoHistory?rule=&simple=true',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'清除该程序版本记录',desc:'只清除“已记录 / 可更新”判断依据，不删除海阔里已安装的小程序。',url:$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore');r.removeInstalled(id);refreshPage(false);return'toast://版本记录已清除';},item.id),col_type:'text_1',extra:{lineVisible:false}});setResult(d);
};
})(HikerRuleRepo);
