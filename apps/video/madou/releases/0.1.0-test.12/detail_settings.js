/* 麻豆传媒 Test12C - detail/settings UI on private-file state */
(function(){
  if(typeof MadouCore==='undefined'||typeof MadouRemoteRuntime==='undefined'||typeof MadouT12State==='undefined'||typeof MadouT12Protocol==='undefined') throw new Error('Madou Test12 modules unavailable');
  var C=MadouCore,R=MadouRemoteRuntime,S=MadouT12State,P=MadouT12Protocol;
  function str(v){return S.str(v);}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function rawImage(c){var x=str((c&&c.rawImg)||'');if(x)return x;var y=str((c&&c.img)||''),p=y.indexOf('@headers=');return p>0?y.substring(0,p):y;}
  function routeCard(c){return C.page('madouDetail',{u:c.url,t:c.title||'影片',im:rawImage(c),ds:c.desc||''});}
  function renderCards(d,cards,limit,prefix){var max=limit||cards.length,i,c;for(i=0;i<cards.length&&i<max;i++){c=cards[i]||{};add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||'',img:c.img||'',url:routeCard(c),col_type:'movie_2',extra:{lineVisible:false,id:(prefix||'madou_t12_card_')+i}});}}
  function compactDetail(x){var o={title:str(x&&x.title||'').substring(0,220),cover:str(x&&x.cover||'').substring(0,1800),date:str(x&&x.date||'').substring(0,80),duration:str(x&&x.duration||'').substring(0,80),tags:[],related:[]},i,c,raw;for(i=0;i<((x&&x.tags)||[]).length&&i<14;i++){c=x.tags[i]||{};if(c.name&&c.url)o.tags.push({name:str(c.name).substring(0,80),url:str(c.url).substring(0,1600)});}for(i=0;i<((x&&x.related)||[]).length&&i<18;i++){c=x.related[i]||{};raw=rawImage(c);if(c.url)o.related.push({url:str(c.url).substring(0,1600),title:str(c.title||'影片').substring(0,180),desc:str(c.desc||'').substring(0,220),rawImg:str(raw).substring(0,1600)});}return o;}
  function storeDetailVar(key,x){var txt='';try{txt=JSON.stringify(compactDetail(x));if(txt.length<65000)putMyVar(key,txt);}catch(e){}}
  function readDetailVar(key){var raw='',o=null,i;try{raw=str(getMyVar(key,''));if(raw)o=JSON.parse(raw);}catch(e0){o=null;}if(!o)return null;for(i=0;i<(o.related||[]).length;i++){var c=o.related[i];c.img=c.rawImg?C.image(c.rawImg,c.url):'';}return o;}
  R.detail=function(){
    var u=C.param('u',''),seedTitle=C.param('t',''),seedImg=C.param('im',''),seedDesc=C.param('ds',''),cfg=S.settings();
    var fullKey='madou_t12_detail_full_'+S.hash(u),dataKey=fullKey+'_data',mode=cfg.detailMode,manual=false,needFetch=false;
    try{manual=getMyVar(fullKey,'0')==='1';}catch(e0){}try{setPageTitle(seedTitle||'影片详情');}catch(e1){}
    var d=[],x=readDetailVar(dataKey),html='',title=seedTitle||'影片',rawCover=seedImg||'',cover='',meta=seedDesc||'',i,historyOk=false,showTags=false,showRelated=false;
    needFetch=!x&&(!seedTitle||manual||mode!=='manual');
    if(needFetch){html=C.fetchHtml(u,true);if(!C.isBadHtml(html)){x=C.detail(html,u);storeDetailVar(dataKey,x);var tt=P.collectTargets(html,u);if(tt.length){try{putMyVar('madou_t12_player_hint_'+S.hash(u),tt[0].url);}catch(e2){}}}}
    if(x){title=x.title||title;rawCover=x.cover||rawCover;meta=(x.date||'')+(x.date&&x.duration?' · ':'')+(x.duration||'')||meta;}
    try{setPageTitle(title||'影片详情');}catch(e3){}cover=rawCover?C.image(rawCover,u):'';try{historyOk=C.addHistory({url:u,title:title||'影片',img:cover,rawImg:rawCover,desc:meta||''});}catch(e4){}
    if(cover)add(d,{title:'',pic_url:cover,img:cover,url:'hiker://empty',col_type:'pic_1_full',extra:{lineVisible:false}});
    add(d,{title:title||'影片',desc:meta||'',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    var pc=P.readCache(u),playDesc=pc?'免嗅直连 · 已缓存真实媒体':'纯免嗅 · HTTP/player/API 静态协议解析';
    add(d,{title:'▶ 立即播放',desc:playDesc,col_type:'text_center_1',url:$(u).lazyRule(function(boot,target,settingsFile){require(boot,{headers:{'Cache-Control':'no-cache'}},10112);MadouBoot.loadOnly();var out=MadouCore.resolveNoSniff(target);if(out)return out;var fb=false;try{var o=JSON.parse(readFile(settingsFile)||'{}');fb=o.sniffFallback===true;}catch(e){}if(fb)return 'video://'+target;return 'toast://纯免嗅未解析到媒体；设置页已生成协议诊断';},C.bootstrap,u,S.SETTINGS_FILE),extra:{id:'madou_t12_play_'+S.hash(u),lineVisible:false}});
    divider(d);
    showTags=!!x&&(manual||mode==='tags'||mode==='all');showRelated=!!x&&(manual||mode==='all');
    if(showTags&&x.tags&&x.tags.length){section(d,'相关标签','');for(i=0;i<x.tags.length&&i<14;i++)add(d,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),extra:{lineVisible:false}});}
    if(showRelated&&x.related&&x.related.length){section(d,'相关推荐','');renderCards(d,x.related,18,'madou_t12_related_');}
    if(mode==='manual'&&!manual)add(d,{title:'加载标签与相关推荐',desc:'当前设置：手动加载（最快）',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){putMyVar(k,'1');refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    else if(mode==='tags'&&!manual)add(d,{title:'加载相关推荐',desc:'当前设置：标签自动加载，相关推荐手动加载',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){putMyVar(k,'1');refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    else if(manual&&mode!=='all')add(d,{title:'收起手动扩展信息',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){clearMyVar(k);refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    var fav=C.isFav(u);add(d,{title:fav?'★ 取消本地收藏':'☆ 加入本地收藏',desc:historyOk?'已记录本次浏览':'浏览记录写入失败时已自动跳过',col_type:'text_center_1',url:$(u).lazyRule(function(boot,targetUrl,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10112);MadouBoot.loadOnly();MadouCore.toggleFav({url:targetUrl,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return'toast://收藏状态已更新';},C.bootstrap,u,title||'影片',rawCover||'',meta||''),extra:{lineVisible:false}});
    add(d,{title:'⚙ 详情与播放设置',desc:'设置、诊断、媒体缓存已迁移到私有文件',col_type:'text_center_1',url:C.page('madouSettings'),extra:{lineVisible:false}});setResult(d);
  };
  R.settings=function(){
    try{setPageTitle('设置与诊断');}catch(e0){}var d=[],cfg=S.settings(),diag=P.readDiag();section(d,'影片详情','所有设置使用规则私有文件，不再写已饱和的 setItem KV');
    add(d,{title:(cfg.detailMode==='manual'?'● ':'')+'手动加载',desc:'最快：详情首屏不请求标签/推荐，按需再加载',col_type:'text_1',url:$('#noLoading#').lazyRule(function(file,mode){var o={};try{o=JSON.parse(readFile(file)||'{}');}catch(e){}o.detailMode=mode;saveFile(file,JSON.stringify(o));refreshPage(false);return'hiker://empty';},S.SETTINGS_FILE,'manual'),extra:{lineVisible:false}});
    add(d,{title:(cfg.detailMode==='tags'?'● ':'')+'自动加载标签',desc:'进入详情时请求一次详情，只自动显示标签',col_type:'text_1',url:$('#noLoading#').lazyRule(function(file,mode){var o={};try{o=JSON.parse(readFile(file)||'{}');}catch(e){}o.detailMode=mode;saveFile(file,JSON.stringify(o));refreshPage(false);return'hiker://empty';},S.SETTINGS_FILE,'tags'),extra:{lineVisible:false}});
    add(d,{title:(cfg.detailMode==='all'?'● ':'')+'自动加载标签 + 相关推荐',desc:'进入详情时自动请求并显示全部扩展信息',col_type:'text_1',url:$('#noLoading#').lazyRule(function(file,mode){var o={};try{o=JSON.parse(readFile(file)||'{}');}catch(e){}o.detailMode=mode;saveFile(file,JSON.stringify(o));refreshPage(false);return'hiker://empty';},S.SETTINGS_FILE,'all'),extra:{lineVisible:false}});
    divider(d);section(d,'播放策略','默认严格 HTTP-only；不会把 WebView/video:// 冒充免嗅');
    add(d,{title:'● 纯免嗅优先',desc:'支持 player_aaaa/player_data、encrypt=1/2、parse/jx、iframe/player/API/script、Base64/Percent/P.A.C.K.E.R、302 Location 和无扩展 HLS',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:(cfg.sniffFallback?'● ':'')+'免嗅失败后允许兼容嗅探',desc:cfg.sniffFallback?'已开启：仅 HTTP-only 失败后回退 video://':'已关闭：失败只显示诊断，不启动浏览器',col_type:'text_1',url:$('#noLoading#').lazyRule(function(file,val){var o={};try{o=JSON.parse(readFile(file)||'{}');}catch(e){}o.sniffFallback=!val;saveFile(file,JSON.stringify(o));refreshPage(false);return'hiker://empty';},S.SETTINGS_FILE,cfg.sniffFallback),extra:{lineVisible:false}});
    add(d,{title:'清空免嗅媒体缓存',desc:'下次播放重新执行协议解析',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(file){try{deleteFile(file);}catch(e){}refreshPage(false);return'toast://免嗅媒体缓存已清空';},S.PLAY_CACHE_FILE),extra:{lineVisible:false}});
    if(diag)add(d,{title:'最近一次免嗅诊断',desc:diag,col_type:'long_text',url:'copy://'+diag,extra:{lineVisible:false}});
    divider(d);section(d,'存储恢复','Test1-Test11 旧 KV 可能仍占用空间，但 Test12 核心状态已迁移到私有文件，主链不再依赖 setItem 写入。');
    add(d,{title:'版本',desc:'Test12 · Build 10112 · Storage Rescue + Protocol No-Sniff',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'原站网页',desc:C.base,col_type:'text_center_1',url:'web://'+C.base+'/',extra:{lineVisible:false}});setResult(d);
  };
})();