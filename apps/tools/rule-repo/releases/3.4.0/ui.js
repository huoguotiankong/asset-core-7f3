/* 我的规则仓库 v3.4.0 - shared UI system */
(function(R){
R.modeText=function(mode){return mode==='remote'?'远程':(mode==='share'?'分享版':'本地');};
R.statusMark=function(item){var s=this.statusOf(item);return s==='可更新'?'↑ 可更新':(s==='已同步'?'✓ 已同步':'· 未记录');};
R.navPages={home:'hiker://page/ruleRepoHome?rule=&simple=true',category:'hiker://page/ruleRepoCategory?rule=&simple=true',search:'hiker://page/ruleRepoSearch?rule=&simple=true',updates:'hiker://page/ruleRepoUpdates?rule=&simple=true',settings:'hiker://page/ruleRepoSettings?rule=&simple=true'};
R.pushNav=function(d,active){var nav=[['⌂ 首页','home'],['▦ 分类','category'],['⌕ 搜索','search'],['↻ 更新','updates'],['⚙ 设置','settings']],self=this;nav.forEach(function(x){d.push({title:(active===x[1]?'● ':'')+x[0],url:self.navPages[x[1]],col_type:'text_5',extra:{lineVisible:false}});});};
R.pushSection=function(d,title,desc){d.push({title:title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});};
R.pushSpacer=function(d){d.push({col_type:'blank_block'});};
R.statCard=function(title,value,url){return{title:title+'  '+String(value),url:url||'hiker://empty',col_type:'text_4',extra:{lineVisible:false}};};
R.quickCard=function(title,url){return{title:title,url:url||'hiker://empty',col_type:'text_3',extra:{lineVisible:false}};};
R.itemCard=function(item){var st=this.statusOf(item),tags=(item.tags||[]).slice(0,2).map(function(t){return'#'+t;}).join('  '),title=item.name+(st==='可更新'?'  ↑':''),line1='v'+(item.version||'未标记')+' · '+this.modeText(item.mode)+' · '+this.statusMark(item),line2=item.categoryName+' / '+item.subCategory+(tags?' · '+tags:'');return{title:title,desc:line1+'\n'+line2,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'movie_1_left_pic',extra:{lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id,longClick:[{title:st==='可更新'?'更新程序':'导入程序',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},{title:this.isFav(item)?'取消收藏':'加入收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}]}};};
R.pushEmpty=function(d,title,desc){d.push({title:title||'暂无内容',desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});};
R.formatTime=function(ts){ts=Number(ts||0);if(!ts)return'未检查';try{var d=new Date(ts);var p=function(n){return n<10?'0'+n:n;};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());}catch(e){return'未检查';}};
})(HikerRuleRepo);
