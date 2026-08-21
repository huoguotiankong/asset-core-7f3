// v0.1.9 protocol diagnostics
(function(){
ac.diag=function(){
    var d=[];setPageTitle('接口诊断');
    var fd=ac.getDiscovered(),routers=ac.getRouterNodes(false),bases=ac.getApiBases(false);
    var token=String(getItem('acfun_token','')||''),did=String(getItem('acfun_device_id','')||'');
    d.push(ac.diagBlock('版本 / 原生协议','小程序：'+ac.build+'\nAPK：'+ac.appVersion+'\nUser-Mark：'+ac.userMark+'\nChannel：'+ac.channel+'\n游客令牌：'+(token?'已获取':'未获取')+'\nDeviceId：'+(did?did.slice(0,10)+'…':'尚未生成')));
    d.push(ac.diagBlock('Direct API Bases',bases.join('\n')||'无'));
    d.push(ac.diagBlock('最近一次真实 API 请求','Last='+getItem('acfun_last_api','')+'\nHTTP='+getItem('acfun_last_status','')+' code='+getItem('acfun_last_business_code','')+'\n\n'+getItem('acfun_last_attempts','暂无请求记录')));
    var te=getItem('acfun_traveler_error','');if(te)d.push(ac.diagBlock('游客登录 / aut',te));
    var le=getItem('acfun_last_list_error','');if(le)d.push(ac.diagBlock('列表错误',le));
    var se=getItem('acfun_last_search_error','');if(se)d.push(ac.diagBlock('搜索错误',se));
    var pe=getItem('acfun_last_probe_error','');if(pe)d.push(ac.diagBlock('最近协议失败',pe));
    d.push({title:'重建游客令牌',desc:'清除当前 aut / 失败冷却，下次请求重新执行 user/traveler。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){clearItem('acfun_token');clearItem('acfun_traveler_error');setItem('acfun_traveler_try_ts','0');refreshPage(false);return 'toast://游客令牌已清除，下次请求将重新登录';})});
    d.push({title:'解析当前 Web 前端接口',desc:'保留作为动态路由兜底；主请求已经按 APK 原生 /api 协议执行。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('解析 Web 前端中…');var __s=getItem('acfun_core_src_v019','')||getItem('acfun_core_src_v018','');if(!__s){hideLoading();return 'toast://核心缓存不存在，请先打开首页';}eval(__s);var fd=ac.discoverFrontend(true);clearItem('acfun_good_host');hideLoading();refreshPage(false);return 'toast://完成：'+((fd.scripts||[]).length)+' 个脚本，'+Object.keys(fd.routes||{}).length+' 条路由';})});
    d.push({title:'复制完整诊断摘要',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var x='ACFun v0.1.9\nProtocol=t+s(md5)+deviceId+User-Mark(acfun)+aut+AES-CBC\nToken='+(getItem('acfun_token','')?'YES':'NO')+'\nTravelerErr='+getItem('acfun_traveler_error','')+'\nFrontend='+getItem('acfun_frontend_discovery','')+'\nHost='+getItem('acfun_good_host','')+'\nLast='+getItem('acfun_last_api','')+'\nAttempts=\n'+getItem('acfun_last_attempts','')+'\nListErr='+getItem('acfun_last_list_error','')+'\nSearchErr='+getItem('acfun_last_search_error','')+'\nDetailErr='+getItem('acfun_last_detail_error','')+'\nCommentErr='+getItem('acfun_last_comment_error','');return 'copy://'+x;})});
    setResult(d);
};
})();
