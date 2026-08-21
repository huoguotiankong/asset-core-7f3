/** ACFun 0.6.0-alpha8 / Build 159 - delivery/settings overlay. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/',ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/acfun.svg',M='#8A8A8A';
function I(n){return BASE+n+'.svg'}
function E(v){return String(v===undefined||v===null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function section(d,t,sub){d.push({title:'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function toggle(d,t,k,def,desc){d.push({title:t+'：'+(getItem(k,def)==='1'?'开':'关'),desc:desc||'',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(key,df){setItem(key,getItem(key,df)==='1'?'0':'1');refreshPage(false);return'hiker://empty'},k,def),extra:{lineVisible:false}})}
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');d.push({title:'ACFun',desc:'Test 0.6.0-alpha8 · Build 159\nCloud Shell 6.4 · 原页筛选 / 原生漫画阅读 / 资源恢复',pic_url:ICON,img:ICON,col_type:'avatar',url:'hiker://home@我的规则仓库||hiker://home'});
    section(d,'常用入口','筛选已整合回首页');
    [{name:'返回首页筛选',icon:'filter',url:'hiker://home@ACFun'},{name:'搜索',icon:'search',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#'},{name:'收藏',icon:'favorite_off',url:'hiker://page/acfun_favorites?rule=ACFun&simple=true#noRecordHistory#'},{name:'历史',icon:'history_off',url:'hiker://page/acfun_history?rule=ACFun&simple=true#noRecordHistory#'}].forEach(function(x){d.push({title:x.name,pic_url:I(x.icon),img:I(x.icon),col_type:'icon_small_4',url:x.url,extra:{lineVisible:false}})});
    section(d,'首页与交互','减少页面堆叠');toggle(d,'内容扩展入口','acfun_v060_show_extensions','1','显示短视频、社区、小说、有声。');toggle(d,'个人工具行','acfun_v060_show_personal','1','显示收藏、历史、设置。筛选不再单独开页。');toggle(d,'焦点大卡','acfun_v060_hero','1','常规主栏目首条内容使用大卡。');toggle(d,'记住上次栏目','acfun_v060_remember_section','1','重新打开后回到上次浏览栏目。');
    d.push({title:'视频排版：'+(getItem('acfun_v060_video_layout','movie_2')==='movie_3'?'三列紧凑':'双列舒适'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['双列舒适','三列紧凑'];return'select://'+JSON.stringify({title:'视频排版',options:a,selectedIndex:getItem('acfun_v060_video_layout','movie_2')==='movie_3'?1:0,col:1,js:$.toString(function(){setItem('acfun_v060_video_layout',input==='三列紧凑'?'movie_3':'movie_2');refreshPage(false)})})})});
    section(d,'播放与阅读');toggle(d,'极速详情','acfun_fast_detail','1','常规视频优先复用列表数据；短视频仍首页直接播放。');toggle(d,'自动弹幕','acfun_auto_danmu','1','常规视频播放时自动附加弹幕。');d.push({title:'漫画阅读模式',desc:'Alpha8 章节点击直接返回 pics:// 多图模式，交给海阔原生漫画阅读器连续铺满显示。',col_type:'long_text',url:'hiker://empty'});
    section(d,'数据与诊断');d.push({title:'最近 Alpha8 路由',desc:getItem('acfun_v060_a8_last_route','尚无记录'),col_type:'text_1',url:'hiker://empty'});d.push({title:'最近 Alpha8 错误',desc:getItem('acfun_v060_a8_last_error','尚无错误记录'),col_type:'text_1',url:'hiker://empty'});d.push({title:'资源接口诊断',desc:'打开完整诊断页',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'ACFun 图标地址',desc:ICON,col_type:'text_1',url:'copy://'+ICON,extra:{lineVisible:false}});
    d.push({title:'清理资源缓存',desc:'不影响收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var s=getItem('acfun_core_src_v018','');if(s)eval(s);try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败'}})});
    section(d,'版本与恢复','测试版通过云端仓库覆盖');d.push({title:'从云端仓库更新 ACFun',desc:'我的规则仓库 → ACFun → 测试版 → 导入 / 覆盖。',pic_url:I('more'),img:I('more'),col_type:'text_icon',url:'hiker://home@我的规则仓库||hiker://home',extra:{lineVisible:false}});d.push({title:'本机版本与恢复',desc:'重新加载当前模块或业务回退。',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});d.push({title:'版本边界',desc:'Test 0.6.0-alpha8 · Build 159 · Shell 6.4.0-test\nStable 0.4.9 · Build 149（保持不变）',col_type:'long_text',url:'hiker://empty'});setResult(d)
};
ac.build='2026.08.22-v0.6.0-alpha8';ac.runtimeMode='test-ui-v060-alpha8-shell64';try{setItem('acfun_test_runtime','0.6.0-alpha8 shell64')}catch(e){}
})();
