/* 我的规则仓库 3.5.3-rc9 - about/runtime label patch */
(function(R){
R.aboutPage=function(){
 setPageTitle('关于');
 var d=[],repo=this.findById('rule-repo')||{},channel=this.isTestChannel()?'Test':'Stable';
 d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心',this.iconOf(repo),'hiker://empty'));
 this.pushSection(d,'核心能力','围绕发现、管理、更新和恢复组织');
 d.push(this.quickAction('分类管理','category','hiker://page/ruleRepoCategory?rule=&simple=true'));
 d.push(this.quickAction('搜索','search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdates?rule=&simple=true'));
 d.push(this.quickAction('备份恢复','backup','hiker://page/ruleRepoSettings?rule=&simple=true'));
 d.push(this.sectionLine());
 this.pushSection(d,'当前版本','运行信息集中显示，不占首页主视觉');
 d.push(this.infoRow('版本',String(this.version||'--')));
 d.push(this.infoRow('通道',channel));
 d.push(this.infoRow('界面',String(this.releaseLabel||'Product Hub 6.0')));
 d.push(this.infoRow('Build',String(this.build||'--')));
 d.push(this.compactInfo('产品原则','稳定优先 · 主任务优先 · 原生组件优先 · Stable/Test 分层 · 异常可恢复','hiker://empty'));
 d.push(this.sectionLine());
 this.pushNav(d,'settings');
 setResult(d);
};
})(HikerRuleRepo);
