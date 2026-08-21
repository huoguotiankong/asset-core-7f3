/** ACFun 0.6.0-alpha5 / Build 156 - cloud repository delivery and recovery UI. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');

var A='#FF4D4F',M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function I(n){return BASE+n+'.svg'}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function section(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function toggle(d,t,k,def,desc){d.push({title:t+'：'+(getItem(k,def)==='1'?'开':'关'),desc:desc||'',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(key,df){setItem(key,getItem(key,df)==='1'?'0':'1');refreshPage(false);return'hiker://empty'},k,def),extra:{lineVisible:false}})}

ac.build='2026.08.21-v0.6.0-alpha5';
ac.runtimeMode='test-ui-v060-alpha5-cloud-shell';

ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'ACFun',desc:'Test 0.6.0-alpha5 · Build 156\nCloud Shell 6.1 · 完整资源恢复',pic_url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/acfun.svg',img:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/acfun.svg',col_type:'avatar',url:'hiker://home@我的规则仓库||hiker://home'});
    section(d,'资源入口','原 APP 内容模块');
    [{name:'社区',view:'community',icon:'community'},{name:'小说',view:'fiction',icon:'novel'},{name:'有声',view:'audio',icon:'audio'}].forEach(function(x){d.push({title:x.name,pic_url:I(x.icon),img:I(x.icon),col_type:'icon_small_3',url:'hiker://page/acfun_category?rule=ACFun&simple=true&view='+x.view+'#noRecordHistory#',extra:{lineVisible:false}})});
    section(d,'首页与排版','内容优先，工具降权');
    toggle(d,'内容扩展入口','acfun_v060_show_extensions','1','显示短视频、社区、小说、有声四个资源入口。');
    toggle(d,'个人工具行','acfun_v060_show_personal','1','显示分类、收藏、历史、设置入口。');
    toggle(d,'焦点大卡','acfun_v060_hero','1','每个主栏目首条内容使用横向大卡。');
    toggle(d,'继续观看','acfun_v060_continue','1','显示最近一次播放内容。');
    toggle(d,'记住上次栏目','acfun_v060_remember_section','1','重新打开后回到上次浏览栏目。');
    d.push({title:'视频排版：'+(getItem('acfun_v060_video_layout','movie_2')==='movie_3'?'三列紧凑':'双列舒适'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['双列舒适','三列紧凑'];return'select://'+JSON.stringify({title:'视频排版',options:a,selectedIndex:getItem('acfun_v060_video_layout','movie_2')==='movie_3'?1:0,col:1,js:$.toString(function(){setItem('acfun_v060_video_layout',input==='三列紧凑'?'movie_3':'movie_2');refreshPage(false)})})})});
    d.push({title:'每页数量：'+getItem('acfun_page_size','12'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['8','12','16','20'];return'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_page_size','12'))),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false)})})})});
    section(d,'性能与播放');
    toggle(d,'极速切换','acfun_instant_switch','1','优先使用有效缓存，空结果不会覆盖旧数据。');
    toggle(d,'极速详情','acfun_fast_detail','1','视频先用列表数据；漫画、小说按实体 ID 恢复。');
    toggle(d,'快速接口','acfun_fast_api','1','复用最近成功的 API Host。');
    toggle(d,'自动弹幕','acfun_auto_danmu','1','视频播放时自动附加弹幕。');
    d.push({title:'图片质量：'+(getItem('acfun_image_quality','480')==='original'?'原图':'极速 480'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['极速 480','原图'];return'select://'+JSON.stringify({title:'图片质量',options:a,selectedIndex:getItem('acfun_image_quality','480')==='original'?1:0,col:1,js:$.toString(function(){setItem('acfun_image_quality',input==='原图'?'original':'480');refreshPage(false)})})})});
    section(d,'数据与诊断');
    d.push({title:'全站搜索',desc:'视频、漫画、小说、有声、社区五类搜索。',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}});
    d.push({title:'分类与筛选',desc:'动态频道、分类、标签与排序。',pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}});
    d.push({title:'资源接口诊断',desc:'最近命中：'+getItem('acfun_v060_a4_last_route','尚无记录'),col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'清理资源缓存',desc:'不影响收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var s=getItem('acfun_core_src_v018','');if(s)eval(s);try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://资源缓存已清理'}catch(e){return'toast://清理失败'}})});
    d.push({title:'清空搜索记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_v060_search_history','[]');return'toast://搜索记录已清空'})});
    section(d,'版本与恢复','新版本由云端仓库下发');
    d.push({title:'从云端仓库更新 ACFun',desc:'打开“我的规则仓库” → ACFun → 测试版 → 导入 / 覆盖。',pic_url:I('more'),img:I('more'),col_type:'text_icon',url:'hiker://home@我的规则仓库||hiker://home',extra:{lineVisible:false}});
    d.push({title:'本机版本与恢复',desc:'用于重新加载当前业务模块或回退；不负责替换规则壳。',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'版本边界',desc:'Test 0.6.0-alpha5 · Build 156 · Shell 6.1.0-test\nStable 0.4.9 · Build 149（保持不变）',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
};

try{setItem('acfun_test_runtime','0.6.0-alpha5 cloud-shell delivery')}catch(e){}
})();
