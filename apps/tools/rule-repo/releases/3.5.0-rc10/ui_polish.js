/* 我的规则仓库 v3.5.0-rc10 - product polish helpers */
(function(R){
R.pushUiNotice=function(){};
R.friendlyError=function(e){var s=String(e&&e.message||e||'');if(!s)return'暂时不可用，请稍后重试';if(/云端读取失败|manifest|network|timeout|HTTP|GitHub|Raw/i.test(s))return'暂时无法连接云端，已优先保留本地可用数据';if(/找不到函数|undefined|not a function/i.test(s))return'页面组件加载异常，请进入更新页重新加载当前测试版';return'操作没有完成，请稍后重试';};
R.compactInfo=function(title,desc,url){return{title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};};
R.primaryAction=function(title,url){return{title:title,url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false}};};
R.secondaryAction=function(title,url){return{title:title,url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false}};};
R.uiPolishVersion='1.0.0';
})(HikerRuleRepo);
