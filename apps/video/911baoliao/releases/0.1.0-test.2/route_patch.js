/* 911爆料 0.1.0-test.2 - Hiker Chinese rule-name route fix */
(function(C,R){
  var RULE_NAME=String(C.ruleTitle?C.ruleTitle():'911爆料').replace(/[?&#]/g,'');
  C.version='0.1.0-test.2';
  C.build=10102;
  C.page=function(path,params){
    var a=['rule='+RULE_NAME,'simple=true'],k;
    params=params||{};
    for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));
    return'hiker://page/'+path+'?'+a.join('&');
  };
  function card(p){return{title:p.title||'911爆料',desc:p.desc||'热点事件',pic_url:p.img||'',url:C.page('bl911Detail',{post_url:p.url}),col_type:'movie_2',extra:{id:'bl911_post_'+C.hash(p.url),lineVisible:false}};}
  function empty(d,t,desc){d.push({title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  R.version='0.1.0-test.2';
  R.build=10102;
  R.routeContract='raw-rule-name-v2';
  R.searchPage=function(){
    var q=C.param('q',''),p=C.pageNo(),d=[],r,a,i,inputRule=RULE_NAME.replace(/'/g,'%27');
    try{setPageTitle(q?'搜索 · '+q:'搜索');}catch(e){}
    if(p===1){
      d.push({title:'搜索爆料',desc:q||'输入标题、人物或事件关键词',col_type:'input',url:"(function(){var q=String(input||'').trim();return 'hiker://page/bl911Search?rule="+inputRule+"&simple=true&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
      if(!q){d.push({title:'‘‘’’<b>站内搜索</b>',desc:'输入关键词后进入独立结果页',col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});setResult(d);return;}
    }
    if(!q||C.restrictedText(q)){empty(d,'该关键词未开放搜索','请换一个普通事件或人物关键词。');setResult(d);return;}
    r=C.search(q,p);a=r&&r.posts?r.posts:[];
    for(i=0;i<a.length;i++)d.push(card(a[i]));
    if(!a.length&&p===1)empty(d,'没有匹配结果','当前站点搜索结构可能需要继续适配。');
    setResult(d);
  };
})(Bl911Core,Bl911RemoteRuntime.module());
