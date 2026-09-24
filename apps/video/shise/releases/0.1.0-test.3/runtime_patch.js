/* Shise Remote Runtime patch 0.1.0-test.3
 * Import-compatibility release. Keeps Test1 parser/playback and Test2 settings semantics.
 */
(function(){
  if(typeof ShiseRemoteRuntime!=='object'||String(ShiseRemoteRuntime.version||'')!=='0.1.0-test.2')throw new Error('Shise Test3 base runtime mismatch');
  var R=ShiseRemoteRuntime;
  R.version='0.1.0-test.3';
  R.build=10103;
  R.settings=function(){
    var d=[],base='https://shise.me',ck='';
    try{if(typeof getCookie==='function')ck=String(getCookie(base)||getCookie(base+'/')||'');}catch(e){}
    try{setPageTitle('视色设置');}catch(e2){}
    function line(title,desc,url,type){return{title:title,desc:desc||'',url:url||'hiker://empty',col_type:type||'text_1',extra:{lineVisible:false}};}
    d.push(line('‘‘’’<b><font color="#7C3AED">站点与验证</font></b>','当前线路已配置'));
    d.push(line('打开当前线路完成 X5 验证','遇到 403 / Just a moment / 空列表时先使用此项','x5://'+base+'/'));
    d.push(line('Cookie 状态',ck?'已读取当前浏览器会话 Cookie':'当前未读取到 Cookie'));
    d.push(line('刷新当前页面','完成验证后返回并刷新页面即可重新请求',$('#noLoading#').lazyRule(function(){refreshPage(true);return'hiker://empty';})));
    d.push(line('‘‘’’<b><font color="#7C3AED">快捷入口</font></b>',''));
    d.push(line('收藏','','hiker://collection?rule='+encodeURIComponent('视色'),'text_4'));
    d.push(line('历史','','hiker://history?rule='+encodeURIComponent('视色'),'text_4'));
    d.push(line('原站','', 'web://'+base,'text_4'));
    d.push(line('‘‘’’<b><font color="#7C3AED">版本状态</font></b>','Test 0.1.0-test.3 · Build 10103'));
    d.push(line('当前能力','内容浏览 / 分类 / 搜索 / 人物 / 详情 / 多线路播放 / 收藏历史 / X5 会话验证 / stale cache','hiker://empty','long_text'));
    d.push(line('实机测试说明','先验证能否正常导入，再检查首页、搜索、人物详情、内容详情和播放。','hiker://empty','long_text'));
    setResult(d);
  };
})();
