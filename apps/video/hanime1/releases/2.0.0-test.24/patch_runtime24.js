/* Hanime1 Test24: Shell/Bootstrap recovery + serialized updater callbacks */
(function(C,P,E,H,L){
var BUILD='2.0.0-test.24';
var BUILDNO=20024;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/hanime1/bootstrap_test_v4.js?v=20024';
var BOOTVER=20024;
var KEY_DIAG='hanime_avatar_diag24_result';
function bootAction(kind){
  return $('#noLoading#').lazyRule(function(boot,ver,action){
    try{
      require(boot,{headers:{'Cache-Control':'no-cache'}},ver);
      var r;
      if(action==='check'){
        r=HanimeBoot.check();
        return 'toast://'+(r.hasUpdate?'发现新测试版 '+r.latest.version:'当前已是最新测试版');
      }
      if(action==='update'){
        r=HanimeBoot.update();
        if(r.ok&&r.changed){refreshPage(false);return 'toast://已更新到 '+r.current.version;}
        return 'toast://'+(r.error||'暂无更新');
      }
      if(action==='rollback'){
        r=HanimeBoot.rollback();
        if(r.ok){refreshPage(false);return 'toast://已回退 '+r.current.version;}
        return 'toast://'+(r.error||'没有可回退版本');
      }
      if(action==='reinstall'){
        r=HanimeBoot.reinstall();
        if(r.ok){refreshPage(false);return 'toast://当前测试版已重新加载';}
        return 'toast://'+(r.error||'重新加载失败');
      }
      if(action==='reset'){
        r=HanimeBoot.reset();
        if(r.ok){refreshPage(false);return 'toast://已恢复 Test24 基线';}
        return 'toast://'+(r.error||'恢复失败');
      }
      return 'toast://未知操作';
    }catch(e){return 'toast://更新链异常：'+String(e.message||e);}
  },BOOT,BOOTVER,kind);
}
P.avatarDiagnostic24=function(){
  var r={};
  try{r=P.avatarDiagnostic23?P.avatarDiagnostic23():{};}catch(e){r={error:String(e.message||e)};}
  r.runtimeBuild=BUILD;
  r.runtimeBuildNo=BUILDNO;
  r.avatarEngine='xpath23';
  setItem(KEY_DIAG,JSON.stringify(r));
  return r;
};
function diagSummary(x){
  x=x||{};var a=[];
  a.push('运行 '+String(x.runtimeBuild||BUILD)+' · Build '+String(x.runtimeBuildNo||BUILDNO));
  a.push('头像引擎 '+String(x.avatarEngine||'xpath23')+' / XPath '+(x.xpathAvailable?'可用':'不可用'));
  a.push('视频 '+String(x.videoId||'-'));
  a.push('作者 '+String(x.artist||'-')+' / '+String(x.artistMethod||'none')+' / '+(x.artistUrl?'已取URL':'无URL'));
  a.push('主评论 items '+Number(x.commentItems||0)+' / XPath头像 '+Number(x.commentXPath||0)+' / 已应用 '+Number(x.commentApplied||0));
  a.push('回复 items '+Number(x.replyItems||0)+' / XPath头像 '+Number(x.replyXPath||0)+' / 已应用 '+Number(x.replyApplied||0));
  if(x.error)a.push('诊断错误 '+x.error);
  if(x.commentError)a.push('评论错误 '+x.commentError);
  if(x.replyError)a.push('回复错误 '+x.replyError);
  if(x.videoError)a.push('作者错误 '+x.videoError);
  return a.join('\n');
}
P.avatarDiagnostic24Summary=diagSummary;
E.renderSettings=function(d){
  var st=C.state(),acc=C.activeAccount();
  d.push(H.sec('运行版本',BUILD+' · Build '+BUILDNO+' · Shell v4'));
  d.push(H.btn('重新加载当前测试版',bootAction('reinstall'),'text_center_1'));
  d.push(H.btn('恢复 Test24 基线',bootAction('reset'),'text_center_1'));
  d.push(H.sec('账号',acc?(acc.name+(acc.email?' · '+acc.email:'')):'未登录'));
  d.push(H.btn(acc?'账号中心':'登录 Hanime1',acc?H.route('hanimeAccount',{}):H.route('hanimeLogin',{})));
  d.push(H.sec('界面','每个主要页面可独立设置封面列数和图文排版。'));
  d.push(H.btn('页面封面布局',H.route('hanimeLayoutSettings',{}),'text_center_1'));
  d.push(H.sec('网络','当前线路 · '+st.base));
  d.push(H.btn('重新检测线路',$('#noLoading#').lazyRule(function(){clearItem('hanime2_active_host');clearItem('hanime2_host_ts');try{var h=$.require('hanime').core().resolveHost(true);refreshPage(false);return 'toast://当前线路 '+h;}catch(e){return 'toast://'+String(e.message||e);}})));
  d.push(H.btn('浏览器验证',H.route('hanimeVerify',{url:st.base})));
  d.push(H.sec('测试版本',BUILD+' · Build '+BUILDNO));
  d.push(H.btn('检查远程更新',bootAction('check')));
  d.push(H.btn('更新测试版',bootAction('update')));
  d.push(H.btn('回退上一测试版',bootAction('rollback')));
  d.push(H.sec('头像诊断','先打开一个头像有问题的视频详情和一条楼中楼，再回这里运行。'));
  d.push(H.btn('运行头像诊断',$('#noLoading#').lazyRule(function(){try{var p=$.require('hanime').provider(),r=p.avatarDiagnostic24();setItem('hanime_avatar_diag24_result',JSON.stringify(r));refreshPage(false);return 'toast://头像诊断完成';}catch(e){return 'toast://诊断失败：'+String(e.message||e);}}),'text_center_1'));
  var cached=getItem(KEY_DIAG,'');
  if(cached){try{var o=JSON.parse(cached),s=diagSummary(o);d.push({title:s,url:$('#noLoading#').lazyRule(function(t){return 'copy://'+t;},s),col_type:'long_text',extra:{lineVisible:false,textSize:14}});}catch(e){}}
};
HanimePages.build=BUILD;HanimeCore.build=BUILD;HanimeProvider.build=BUILD;
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9,HanimeLayout12);
