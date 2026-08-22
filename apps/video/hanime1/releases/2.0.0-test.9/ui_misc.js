/* Hanime1 Test9 previews/settings */
(function(C,P,E,H){var BUILD='2.0.0-test.9',pv=H.pv,route=H.route,sec=H.sec,btn=H.btn,chip=H.chip,video=H.video,comic=H.comic,esc=H.esc,label=H.label;
E.previews=function(){var base=C.resolveHost(false),m='';try{m=P.previewMonth(pv('month',''));}catch(e){var n=new Date(),mo=String(n.getMonth()+1);if(mo.length<2)mo='0'+mo;m=String(n.getFullYear())+mo;}setPageTitle('新番预告');setResult([sec('上游暂不可用','已确认 Hanime1 官网当前预告页本身异常，因此这里不再反复重试或把 HTTP 500 当成本程序解析故障。官网恢复后再恢复原生预告数据。'),btn('打开官网预告','x5://'+base+'/previews/'+m,'text_center_1')]);};
var oldSettings=E.renderSettings;
E.renderSettings=function(d){oldSettings(d);d.push(sec('Test9','2.0.0-test.9 · Build 20009 · 筛选点即结果 / 原生账号登录 / UI 重排'));};
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9);
HanimePages.build='2.0.0-test.9';HanimeProvider.build='2.0.0-test.9';HanimeCore.build='2.0.0-test.9';
