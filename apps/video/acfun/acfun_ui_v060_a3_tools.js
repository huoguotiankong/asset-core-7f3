/** ACFun 0.6.0-alpha3 / Build 154 - library + settings polish */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha3';
var A='#FF4D4F',M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function I(n){return BASE+n+'.svg'}
function age(ts){var d=Math.max(0,Date.now()-Number(ts||0));if(d<60000)return'刚刚';if(d<3600000)return Math.floor(d/60000)+'分钟前';if(d<86400000)return Math.floor(d/3600000)+'小时前';if(d<604800000)return Math.floor(d/86400000)+'天前';var x=new Date(Number(ts||0));return(x.getMonth()+1)+'/'+x.getDate()}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function sel(t,on){return on?'““””<b><font color="'+A+'">'+E(t)+'</font></b>':E(t)}
function extra(info){return{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,lineVisible:false,longClick:[{title:'加入本地收藏',js:$.toString(function(){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);return ac.favoriteFromParams()})},{title:'复制标题',js:$.toString(function(){return'copy://'+String(MY_PARAMS.video_title||'')})}]}}
function section(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function toggle(d,t,k,def,desc){d.push({title:t+'：'+(getItem(k,def)==='1'?'开':'关'),desc:desc||'',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(key,df){setItem(key,getItem(key,df)==='1'?'0':'1');refreshPage(false);return'hiker://empty'},k,def),extra:{lineVisible:false}})}

ac.localPage=function(type){
    var fav=type==='fav',d=[],list=fav?ac.favoriteList():ac.historyList(),title=fav?'本地收藏':'播放历史';putMyVar('acfun_v060_local_page_type',type);setPageTitle(title);
    d.push({title:rich(title,list.length+' 条'),col_type:'rich_text',extra:{textSize:17,lineVisible:false}});
    d.push({title:'搜索'+title,desc:'输入标题关键词',col_type:'input',url:$.toString(function(){var t=getMyVar('acfun_v060_local_page_type','fav');putMyVar('acfun_v060_local_kw_'+t,String(input||'').trim());refreshPage(false);return'hiker://empty'}),extra:{titleVisible:false,defaultValue:getMyVar('acfun_v060_local_kw_'+type,''),lineVisible:false}});
    var sort=S(getMyVar('acfun_v060_local_sort_'+type,'recent'));[['最近','recent'],['标题','title']].forEach(function(x){d.push({title:sel(x[0],sort===x[1]),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(t,v){putMyVar('acfun_v060_local_sort_'+t,v);refreshPage(false);return'hiker://empty'},type,x[1]),extra:{lineVisible:false}})});
    if(getMyVar('acfun_v060_local_kw_'+type,''))d.push({title:'清除搜索',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(t){clearMyVar('acfun_v060_local_kw_'+t);refreshPage(false);return'hiker://empty'},type),extra:{lineVisible:false}});
    d.push({title:'清空'+title,pic_url:I(fav?'favorite_off':'history_off'),img:I(fav?'favorite_off':'history_off'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(t){return $(['确认清空','取消'],2).select(function(tt){if(String(input)==='确认清空'){setItem(tt==='fav'?'acfun_favs':'acfun_hist','[]');refreshPage(false);return'toast://已清空'}return'hiker://empty'},t)},type),extra:{lineVisible:false}});
    d.push({col_type:'line'});
    var kw=S(getMyVar('acfun_v060_local_kw_'+type,'')).toLowerCase();if(kw)list=list.filter(function(x){return S(x.title).toLowerCase().indexOf(kw)>=0});if(sort==='title')list=list.slice().sort(function(a,b){return S(a.title).localeCompare(S(b.title))});
    list.forEach(function(it){var raw=ac.safeJson(it.data)||{},info=ac.itemInfo({videoId:it.id,title:it.title,cover:it.img,videoUri:it.uri,video:raw}),m=[];if(info.author)m.push(info.author);if(it.time)m.push(age(it.time));if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));d.push({title:info.title,desc:m.join(' · '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.detailUrl(info),col_type:'movie_2',extra:extra(info)})});
    if(!list.length)d.push({title:kw?'没有匹配的本地内容':(fav?'还没有收藏':'还没有播放历史'),desc:kw?'换一个关键词试试。':(fav?'长按视频卡片即可加入收藏。':'播放过的视频会自动出现在这里。'),col_type:'long_text',url:'hiker://empty'});
    setResult(d)
};

ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'ACFun',desc:'Test 0.6.0-alpha3 · Build 154\n当前运行：'+S(ac.build),pic_url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/acfun.svg',img:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/acfun.svg',col_type:'avatar',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    section(d,'首页与浏览','只保留真正影响体验的选项');
    toggle(d,'首页快捷入口','acfun_v060_show_quick','1','关闭后隐藏短视频/收藏/历史/设置图标行，让内容更早进入首屏。');
    toggle(d,'焦点卡片','acfun_v060_hero','1','当前栏目第一条内容使用精选大卡展示。');
    toggle(d,'继续观看','acfun_v060_continue','1','有播放记录时显示最近一次内容。');
    toggle(d,'记住上次栏目','acfun_v060_remember_section','1','重新打开后回到上次浏览栏目。');
    d.push({title:'视频布局：'+(getItem('acfun_v060_video_layout','movie_2')==='movie_3'?'三列紧凑':'双列舒适'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['双列舒适','三列紧凑'];return'select://'+JSON.stringify({title:'视频布局',options:a,selectedIndex:getItem('acfun_v060_video_layout','movie_2')==='movie_3'?1:0,col:1,js:$.toString(function(){setItem('acfun_v060_video_layout',input==='三列紧凑'?'movie_3':'movie_2');refreshPage(false)})})})});
    d.push({title:'分类与筛选中心',desc:'频道、分类、标签与排序集中管理。',pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}});
    d.push({title:'每页数量：'+getItem('acfun_page_size','8'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['8','12','16','20'];return'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_page_size','8'))),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false)})})})});

    section(d,'性能与图片');
    toggle(d,'极速切换','acfun_instant_switch','1','优先使用可复用缓存，减少栏目切换等待。');
    toggle(d,'极速详情','acfun_fast_detail','1','详情先使用列表数据；路由缺字段时 Alpha3 会自动恢复完整资料。');
    toggle(d,'快速接口','acfun_fast_api','1','已有可用 Host 时减少无意义线路探测。');
    d.push({title:'图片质量：'+(getItem('acfun_image_quality','480')==='original'?'原图':'极速 480'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['极速 480','原图'];return'select://'+JSON.stringify({title:'图片质量',options:a,selectedIndex:getItem('acfun_image_quality','480')==='original'?1:0,col:1,js:$.toString(function(){setItem('acfun_image_quality',input==='原图'?'original':'480');refreshPage(false)})})})});

    section(d,'播放与内容');
    toggle(d,'自动弹幕','acfun_auto_danmu','1','播放时自动附加弹幕缓存。');
    d.push({title:'相关推荐数量：'+getItem('acfun_related_count','6'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['0','3','6','9'];return'select://'+JSON.stringify({title:'相关推荐数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_related_count','6'))),col:1,js:$.toString(function(){setItem('acfun_related_count',input);refreshPage(false)})})})});

    section(d,'数据与维护');
    d.push({title:'清空搜索历史',desc:'只清除本机关键词，不影响浏览历史。',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_v060_search_history','[]');return'toast://搜索历史已清空'}),extra:{lineVisible:false}});
    d.push({title:'清理页面数据缓存',desc:'不影响收藏、播放历史和封面缓存。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var s=getItem('acfun_core_src_v018','');if(s)eval(s);try{if(ac.__v042ClearDataCache)ac.__v042ClearDataCache();return'toast://页面缓存已清理'}catch(e){return'toast://清理失败'}})});
    d.push({title:'清理封面缓存',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){try{var p=String(getPath('hiker://files/cache/acfun_cover')).replace(/^file:\/\/+/,'/'),f=new java.io.File(p);function del(x){if(!x||!x.exists())return;var a=x.listFiles();if(a)for(var i=0;i<a.length;i++)del(a[i]);x.delete()}del(f);return'toast://封面缓存已清理'}catch(e){return'toast://清理失败'}})});
    d.push({title:'接口诊断',desc:'当前 API：'+(getItem('acfun_good_host','')||'自动识别'),col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'测试通道更新',desc:'检查、重新加载或回退测试版本。',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'版本与恢复',desc:'Test 0.6.0-alpha3 · Build 154 · Shell 6.0.0-test\nStable 0.4.9 · Build 149',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
};

try{setItem('acfun_test_runtime','0.6.0-alpha3 tools')}catch(e){}
})();
