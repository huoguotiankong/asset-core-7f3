/** ACFun 0.6.0-alpha10 / Build 161 - delivery/settings overlay. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/',ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/acfun.svg';
function I(n){return BASE+n+'.svg'}
function toggle(d,t,k,def,desc){d.push({title:t+'：'+(getItem(k,def)==='1'?'开':'关'),desc:desc||'',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(key,df){setItem(key,getItem(key,df)==='1'?'0':'1');refreshPage(false);return'hiker://empty'},k,def),extra:{lineVisible:false}})}
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'ACFun',desc:'Test 0.6.0-alpha10 · Build 161\nCloud Shell 6.6 · Alpha8 恢复基线 + 封面/播放/小说有声修复',pic_url:ICON,img:ICON,col_type:'avatar',url:'hiker://home@我的规则仓库||hiker://home'});
    d.push({title:'首页与交互',col_type:'text_1',url:'hiker://empty'});toggle(d,'记住上次栏目','acfun_v060_remember_section','1','主栏目继续在同一首页切换，不增加页面栈。');toggle(d,'自动弹幕','acfun_auto_danmu','1','视频播放时附加已缓存弹幕。');
    d.push({col_type:'line'});d.push({title:'Alpha10 诊断',desc:'最近数据错误：'+getItem('acfun_v060_a10_last_error','无')+'\n最近播放 ID：'+getItem('acfun_v060_a10_play_id','无')+'\n章节探针：'+getItem('acfun_v060_a10_chapter_probe','无'),col_type:'long_text',url:'hiker://empty'});
    d.push({title:'完整资源诊断',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'清理资源缓存',desc:'只清 ACFun 页面/接口缓存，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var s=getItem('acfun_core_src_v018','');if(s)eval(s);try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败：'+String(e.message||e)}})});
    d.push({col_type:'line'});d.push({title:'版本与恢复',desc:'Alpha9 已冻结，不再作为恢复基线。Alpha10 直接从 Alpha8 模块链重新向前叠加修复。\nStable 仍为 0.4.9 / Build149。',col_type:'long_text',url:'hiker://empty'});
    d.push({title:'从我的规则仓库覆盖测试版',pic_url:I('more'),img:I('more'),col_type:'text_icon',url:'hiker://home@我的规则仓库||hiker://home',extra:{lineVisible:false}});
    d.push({title:'本机版本与恢复',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'ACFun 图标地址',desc:ICON,col_type:'text_1',url:'copy://'+ICON});setResult(d)
};
ac.build='2026.08.22-v0.6.0-alpha10';ac.runtimeMode='test-ui-v060-alpha10-shell66';try{setItem('acfun_test_runtime','0.6.0-alpha10 shell66')}catch(e){}
})();