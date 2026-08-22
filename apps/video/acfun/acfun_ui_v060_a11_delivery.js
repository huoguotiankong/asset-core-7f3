/** ACFun 0.6.0-alpha11 / Build 162 - settings/diagnostics overlay. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldSettings=ac.settings,ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/acfun.svg';
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'ACFun',desc:'Test 0.6.0-alpha11 · Build 162\nCloud Shell 6.7 · 播放 / 漫画 / 有声 / 封面恢复',pic_url:ICON,img:ICON,col_type:'avatar',url:'hiker://home@我的规则仓库||hiker://home'});
    d.push({title:'Alpha11 本轮重点',desc:'普通视频与短视频恢复 Stable/Alpha8 cacheM3u8 播放链；有声增加 chapter seed + longFormAudio/audioSource/sourcePath 解析和带 Header 音频线路；漫画章节改用当前 Shell 的 comicsId/comicId GET+POST 矩阵；封面增加 JSON 字符串、dynamicImg、shortCover 等包装字段。',col_type:'long_text',url:'hiker://empty'});
    d.push({title:'播放探针',desc:getItem('acfun_v060_a11_play_probe','尚未播放'),col_type:'text_1',url:'hiker://empty'});
    d.push({title:'有声探针',desc:getItem('acfun_v060_a11_audio_probe','尚未播放'),col_type:'text_1',url:'hiker://empty'});
    d.push({title:'漫画探针',desc:getItem('acfun_v060_a11_comic_probe','尚未打开章节'),col_type:'text_1',url:'hiker://empty'});
    d.push({title:'最近错误',desc:getItem('acfun_v060_a11_last_error',getItem('acfun_v060_a10_last_error','无')),col_type:'text_1',url:'hiker://empty'});
    d.push({col_type:'line'});
    d.push({title:'完整资源诊断',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'清理资源缓存',desc:'不清收藏、历史与个人设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var s=getItem('acfun_core_src_v018','');if(s)eval(s);try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败：'+String(e.message||e)}})});
    d.push({title:'本机版本与恢复',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'ACFun 图标地址',desc:ICON,col_type:'text_1',url:'copy://'+ICON});
    setResult(d)
};
ac.build='2026.08.22-v0.6.0-alpha11';ac.runtimeMode='test-ui-v060-alpha11-shell67';try{setItem('acfun_test_runtime','0.6.0-alpha11 shell67')}catch(e){}
})();