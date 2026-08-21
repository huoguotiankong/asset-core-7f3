/* 我的规则仓库 v3.5.3 Stable - promoted from verified 3.5.3-rc11 */
(function(R){
R.version='3.5.3';
R.build=377;
R.channel='stable';
R.releaseLabel='Native Product 8.0 · Stable';
R.updatedAt='2026-08-21';
R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.3',build:377,path:'apps/tools/rule-repo/rule_repo_remote_v353.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'RC11 实机验证晋级 · 日常使用与恢复入口',highlights:['首页状态工作台','程序状态与标签分层','双栏分类树','紧凑版本中心'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.4-rc1',baseVersion:'3.5.3',targetVersion:'3.5.4',build:378,path:'apps/tools/rule-repo/rule_repo_test_v124.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Native Product 9.0 · 实机细节修复',highlights:['矢量数字统计','分类透明占位','卡片信息对齐','搜索页收敛'],icon:icon}
 ]};
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
