/* 我的规则仓库 v3.5.0-rc2 - fixed primary taxonomy */
(function(R){
R.categories=function(items){
  var count=this.categoryCounts(items),base=[
    {id:'all',name:'全部'},
    {id:'video',name:'视频'},
    {id:'comic',name:'漫画'},
    {id:'cloud',name:'网盘'},
    {id:'tools',name:'工具'},
    {id:'aggregate',name:'聚合'}
  ];
  return base.map(function(x){return{id:x.id,name:x.name,count:count[x.id]||0};});
};
})(HikerRuleRepo);
