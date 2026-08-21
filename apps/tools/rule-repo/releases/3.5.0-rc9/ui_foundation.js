/* 我的规则仓库 v3.5.0-rc9 - UI foundation compatibility contract */
(function(R){
R.pushSpacer=function(d){d.push({col_type:'blank_block'});};
R.pushEmpty=function(d,title,desc){d.push({title:title||'暂无内容',desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});};
R.formatTime=function(ts){ts=Number(ts||0);if(!ts)return'未记录';try{var d=new Date(ts),p=function(n){return n<10?'0'+n:String(n);};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());}catch(e){return'未记录';}};
R.modeText=function(mode){return mode==='remote'?'远程':(mode==='share'?'分享版':'本地');};
R.statusMark=function(item){var s=this.statusOf(item);return s==='可更新'?'↑ 可更新':(s==='已同步'?'✓ 已同步':'· 未记录');};
R.statCard=function(title,value,url){return{title:title+'  '+String(value),url:url||'hiker://empty',col_type:'text_4',extra:{lineVisible:false}};};
R.quickCard=function(title,url){return{title:title,url:url||'hiker://empty',col_type:'text_3',extra:{lineVisible:false}};};
R.categoryTab=function(title,id,active){return{title:(active===id?'● ':'')+title,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_home_category',v);refreshPage(false);return'hiker://empty';},id),extra:{lineVisible:false}};};
R.uiFoundationVersion='1.0.0';
})(HikerRuleRepo);
