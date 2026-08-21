/** ACFun 0.6.0-alpha9 / Build 160 - settings/delivery overlay. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/',ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/acfun.svg',M='#8A8A8A';
function I(n){return BASE+n+'.svg'}
function E(v){return String(v===undefined||v===null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function section(d,t,sub){d.push({title:'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function toggle(d,t,k,def,desc){d.push({title:t+'：'+(getItem(k,def)==='1'?'开':'关'),desc:desc||'',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(key,df){setItem(key,getItem(key,df)==='1'?'0':'1');refreshPage(false);return'hiker://empty'},k,def),extra:{lineVisible:false}})}
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'ACFun',desc:'Test 0.6.0-alpha9 · Build 160\nCloud Shell 6.5 · 分类/正文/音频/社区继续强化',pic_url:ICON,img:ICON,col_type:'avatar',url:'hiker://home@我的规则仓库||hiker://home'});
    section(d,'首页体验','保持单页切换，减少返回栈');
    toggle(d,'内容扩展入口','acfun_v060_show_extensions','1','显示短视频、社区、小说、有声。');
    toggle(d,'个人工具行','acfun_v060_show_personal','1','显示收藏、历史、设置。');
    toggle(d,'焦点大卡','acfun_v060_hero','0','默认关闭，避免无有效封面时出现空白大图；开启后使用紧凑横卡。');
    d.push({title:'视频排版：'+(getItem('acfun_v060_video_layout','movie_2')==='movie_3'?'三列紧凑':'双列舒适'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['双列舒适','三列紧凑'];return'select://'+JSON.stringify({title:'视频排版',options:a,selectedIndex:getItem('acfun_v060_video_layout','movie_2')==='movie_3'?1:0,col:1,js:$.toString(function(){setItem('acfun_v060_video_layout',input==='三列紧凑'?'movie_3':'movie_2');refreshPage(false)})})})});
    d.push({title:'每页数量：'+getItem('acfun_page_size','12'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['8','12','16','20'];return'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_page_size','12'))),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false)})})})});
    section(d,'播放与阅读');
    toggle(d,'极速详情','acfun_fast_detail','1','常规视频继续优先复用列表数据。');
    toggle(d,'自动弹幕','acfun_auto_danmu','1','常规视频播放时自动附加弹幕。');
    d.push({title:'漫画阅读：海阔原生多图',desc:'章节继续使用 pics:// 连续阅读，不恢复普通详情页模拟。',col_type:'text_1',url:'hiker://empty'});
    d.push({title:'小说/有声章节：Alpha9 深度恢复',desc:'chapterInfo GET/POST + fictionUrl 外链正文 + longFormAudio/voice/media 字段。',col_type:'text_1',url:'hiker://empty'});
    section(d,'数据与诊断');
    d.push({title:'最近资源路由',desc:getItem('acfun_v060_a9_last_route','尚无 Alpha9 命中记录'),col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'最近接口异常',desc:getItem('acfun_v060_a9_last_error','无'),col_type:'text_1',url:'hiker://empty'});
    d.push({title:'章节外链异常',desc:getItem('acfun_v060_a9_fiction_source_error','无'),col_type:'text_1',url:'hiker://empty'});
    d.push({title:'清理资源缓存',desc:'不影响收藏、历史和设置；下次进入会重新读取最新分类和内容。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var s=getItem('acfun_core_src_v018','');if(s)eval(s);try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败：'+String(e.message||e)}})});
    section(d,'版本与恢复','测试版仍通过云端仓库覆盖');
    d.push({title:'从云端仓库更新 ACFun',desc:'我的规则仓库 → ACFun → 测试版 → 导入 / 覆盖。',pic_url:I('more'),img:I('more'),col_type:'text_icon',url:'hiker://home@我的规则仓库||hiker://home',extra:{lineVisible:false}});
    d.push({title:'本机版本与恢复',desc:'重新加载当前模块、回退上一测试业务版本或恢复正式版。',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'版本边界',desc:'Test 0.6.0-alpha9 · Build 160 · Shell 6.5.0-test\nStable 0.4.9 · Build 149（保持不变）',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
};
ac.build='2026.08.22-v0.6.0-alpha9';ac.runtimeMode='test-ui-v060-alpha9-shell65';try{setItem('acfun_test_runtime','0.6.0-alpha9 shell65')}catch(e){}
})();