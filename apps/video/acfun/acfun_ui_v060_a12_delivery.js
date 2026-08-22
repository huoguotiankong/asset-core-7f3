/** ACFun 0.6.0-alpha12 / Build 163 - diagnostics/settings overlay. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function I(n){return BASE+n+'.svg'}
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');d.push({title:'ACFun Alpha12',desc:'Build 163 · Shell 6.8\n本轮只定点修复播放、音频与漫画章节；小说分类/正文成功链保持不动。',pic_url:I('settings'),img:I('settings'),col_type:'avatar',url:'hiker://empty'});
    d.push({title:'播放探针',desc:getItem('acfun_v060_a12_play_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a12_play_probe','暂无')});
    d.push({title:'有声探针',desc:getItem('acfun_v060_a12_audio_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a12_audio_probe','暂无')});
    d.push({title:'漫画探针',desc:getItem('acfun_v060_a12_comic_probe','暂无'),col_type:'long_text',url:'copy://'+getItem('acfun_v060_a12_comic_probe','暂无')});
    d.push({title:'完整资源诊断',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});d.push({title:'清理资源缓存',desc:'不清收藏、历史与设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败：'+String(e.message||e)}})});setResult(d)
};
try{setItem('acfun_test_runtime','0.6.0-alpha12 shell68')}catch(e){}ac.build='2026.08.22-v0.6.0-alpha12';ac.runtimeMode='test-ui-v060-alpha12-shell68';
})();
