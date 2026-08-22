/** ACFun 0.6.0-alpha14 / Build 165 - recovery diagnostics/settings. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function I(n){return BASE+n+'.svg'}
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'ACFun Alpha14',desc:'Build 165 · Shell 6.10\nAlpha13 已隔离；本版从实机可用的 Alpha12 恢复，不加载 Alpha13 的封面评分和 pics:// 漫画覆盖。',pic_url:I('settings'),img:I('settings'),col_type:'avatar',url:'hiker://empty'});
    d.push({title:'播放探针',desc:getItem('acfun_v060_a14_play_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a14_play_probe','暂无')});
    d.push({title:'有声源探针',desc:getItem('acfun_v060_a14_audio_source_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a14_audio_source_probe','暂无')});
    d.push({title:'有声播放探针',desc:getItem('acfun_v060_a14_audio_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a14_audio_probe','暂无')});
    d.push({title:'漫画探针',desc:getItem('acfun_v060_a14_comic_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a14_comic_probe','暂无')});
    d.push({title:'完整资源诊断',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'清理资源缓存',desc:'不清收藏、历史与设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败：'+String(e.message||e)}})});
    setResult(d)
};
try{setItem('acfun_test_runtime','0.6.0-alpha14 shell610')}catch(e){}ac.build='2026.08.23-v0.6.0-alpha14';ac.runtimeMode='test-ui-v060-alpha14-shell610';
})();
