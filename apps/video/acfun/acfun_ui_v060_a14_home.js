/** ACFun 0.6.0-alpha14 / Build 165 - short-video action recovery on Alpha12 UI. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldHome=ac.home,BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v070.js?v=7000',BVER=7000;
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function I(n){return BASE+n+'.svg'}
function P(){try{return Math.max(1,Number(MY_PAGE||1)||1)}catch(e){return 1}}
function setSec(s){return $('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_v050_section',v);setItem('acfun_v060_section',v);refreshPage(false);return'hiker://empty'},s)}
function icon(s,on){var n=({featured:'featured',comic:'comic',anime:'anime',video:'video',lifan:'lifan',short:'short',community:'community',fiction:'novel',audio:'audio'})[s]||'featured';return I(n+(on?'':'_off'))}
function top(d){
    d.push({title:'搜索视频、漫画、小说与社区',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 全站搜索',lineVisible:false}});
    var main=[['featured','精选'],['comic','漫画'],['anime','动漫'],['video','视频'],['lifan','里番']];for(var i=0;i<main.length;i++)d.push({title:main[i][1],pic_url:icon(main[i][0],false),img:icon(main[i][0],false),col_type:'icon_5',url:setSec(main[i][0]),extra:{lineVisible:false}});
    var ext=[['short','短视频'],['community','社区'],['fiction','小说'],['audio','有声']];for(var j=0;j<ext.length;j++)d.push({title:ext[j][1],pic_url:icon(ext[j][0],ext[j][0]==='short'),img:icon(ext[j][0],ext[j][0]==='short'),col_type:'icon_small_4',url:setSec(ext[j][0]),extra:{lineVisible:false}});
    [['收藏','favorite_off','acfun_favorites'],['历史','history_off','acfun_history'],['设置','settings_off','acfun_settings']].forEach(function(x){d.push({title:x[0],pic_url:I(x[1]),img:I(x[1]),col_type:'icon_small_3',url:'hiker://page/'+x[2]+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:x[0],lineVisible:false}})})
}
function currentName(rows,id,def){for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id||rows[i].value)===S(id))return S(rows[i].name);return def||''}
function filter(d){
    var rows=ac.__v050ShortTabs||[],cur=S(getMyVar('acfun_v050_short_load_type','')||getItem('acfun_v060_state_acfun_v050_short_load_type','2')||'2'),opts=[],vals=[];
    for(var i=0;i<rows.length;i++){opts.push(S(rows[i].name));vals.push(S(rows[i].id||rows[i].value))}
    d.push({title:'短视频 · '+currentName(rows,cur,'推荐')+' ▾',col_type:'scroll_button',url:opts.length?('select://'+JSON.stringify({title:'选择短视频流',options:opts,selectedIndex:Math.max(0,vals.indexOf(cur)),col:3,js:$.toString(function(os,vs){var i=os.indexOf(input);if(i<0)return;putMyVar('acfun_v050_short_load_type',String(vs[i]));setItem('acfun_v060_state_acfun_v050_short_load_type',String(vs[i]));refreshPage(false)},opts,vals)})):'toast://暂无短视频分类',extra:{lineVisible:false}});
    d.push({title:'重置',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){putMyVar('acfun_v050_short_load_type','2');setItem('acfun_v060_state_acfun_v050_short_load_type','2');refreshPage(false);return'hiker://empty'}),extra:{lineVisible:false}});d.push({col_type:'line'})
}
function playUrl(info){
    var raw=info.raw||{};try{if(raw&&typeof raw==='object'&&!Array.isArray(raw)){var cp={};for(var k in raw)cp[k]=raw[k];cp.shortVideo=true;raw=cp}}catch(e){}
    return $('hiker://empty#noLoading#').lazyRule(function(id,r,uri,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();return ac.play(String(id),String(r),String(uri||''))}catch(e){return'toast://短视频播放失败：'+String(e.message||e)}},S(info.id),JSON.stringify(raw),S(info.uri||''),BOOT,BVER)
}
function shortHome(){
    var d=[],p=P();if(p===1){top(d);filter(d);d.push({title:'短视频',desc:'点击卡片直接播放',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}})}
    var list=[];try{list=ac.__v050ShortList(p)||[]}catch(e){try{setItem('acfun_v060_a14_short_error',S(e.message||e))}catch(e0){}}
    for(var i=0;i<list.length;i++){var info=ac.itemInfo(list[i]);if(!info.id)continue;var meta=[];if(info.watch)meta.push('▶ '+ac.fmtNum(info.watch));if(info.duration)meta.push(info.duration);var pic=info.img?ac.image(info.img):I('short_off');d.push({title:info.title||'短视频',desc:meta.join(' · '),pic_url:pic,img:pic,col_type:'movie_3',url:playUrl(info),extra:{content_kind:'video',video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),lineVisible:false}})}
    if(!list.length&&p===1)d.push({title:'短视频暂未返回内容',desc:'可切换推荐/发现或稍后刷新。',col_type:'long_text',url:'hiker://empty'});setResult(d)
}
ac.home=function(){var s='';try{s=ac.__v050Section?S(ac.__v050Section()):S(getMyVar('acfun_v050_section','featured'))}catch(e){s=S(getMyVar('acfun_v050_section','featured'))}if(s==='short')return shortHome();return typeof oldHome==='function'?oldHome.call(ac):undefined};
try{setItem('acfun_v060_home_a14','short current bootstrap v070 on alpha12 UI')}catch(e){}ac.build='2026.08.23-v0.6.0-alpha14';
})();
