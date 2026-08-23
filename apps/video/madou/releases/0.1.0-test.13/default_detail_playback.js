/* 麻豆传媒 Test13 - default detail extras + restored proven playback */
(function(){
  if(typeof MadouCore==='undefined'||typeof MadouRemoteRuntime==='undefined'||typeof MadouT12State==='undefined') throw new Error('Madou Test13 base unavailable');
  var C=MadouCore,R=MadouRemoteRuntime,S=MadouT12State;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var DETAIL_FILE='madou_t13_detail_models.json';
  var DETAIL_TTL=30*60*1000;
  C.version='0.1.0-test.13';C.build=10113;R.version='0.1.0-test.13';R.build=10113;
  C.bootstrap=ROOT+'bootstrap_test_v13_b10113.js?v=10113';

  function str(v){return v===undefined||v===null?'':String(v);}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function hash(v){return S.hash(v);}
  function rawImage(c){var x=str((c&&c.rawImg)||'');if(x)return x;var y=str((c&&c.img)||''),p=y.indexOf('@headers=');return p>0?y.substring(0,p):y;}
  function routeCard(c){return C.page('madouDetail',{u:c.url,t:c.title||'影片',im:rawImage(c),ds:c.desc||''});}
  function renderCards(d,cards,limit,prefix){var max=limit||cards.length,i,c;for(i=0;i<cards.length&&i<max;i++){c=cards[i]||{};add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||'',img:c.img||'',url:routeCard(c),col_type:'movie_2',extra:{lineVisible:false,id:(prefix||'madou_t13_card_')+i}});}}

  function directFromHtml(html,base){
    var src=[];try{src=C.mediaSources(html,base)||[];}catch(e0){src=[];}
    src.sort(function(a,b){try{return C.mediaScore(b)-C.mediaScore(a);}catch(e){return 0;}});
    return src.length?src[0]:'';
  }
  function playerTarget(html,detailUrl){
    var s=str(html).replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':').replace(/\\\//g,'/'),m,u;
    m=s.match(/<iframe\b[^>]*(?:src|data-src|data-url)\s*=\s*["']([^"']+)["'][^>]*>/i);
    if(m){try{u=C.abs(m[1],detailUrl);}catch(e0){}if(u)return u;}
    m=s.match(/(?:playerUrl|player_url|embedUrl|embed_url|iframe|player|embed|playUrl|play_url)\s*[:=]\s*["']([^"']+)["']/i);
    if(m){try{u=C.abs(m[1],detailUrl);}catch(e1){}if(u)return u;}
    return detailUrl;
  }
  function directPlay(url,ref){
    return url+';{User-Agent@'+C.ua+'&&Referer@'+ref+'}#isVideo=true#';
  }
  function sniffPlay(target,detailUrl,id){
    return {title:'▶ 立即播放',desc:'网页媒体自动提取',col_type:'text_center_1',url:'video://'+target,extra:{id:id,lineVisible:false,blockRules:['.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','banner','advert','ads','doubleclick','googleads','analytics'],videoRules:['.m3u8','.mp4','m3u8','mp4'],videoExcludeRules:['advert','promo','banner','?ad='],cacheM3u8:true,referer:detailUrl}};
  }

  function compactDetail(x,u,direct,player){
    var o={url:str(u).substring(0,1800),title:str(x&&x.title||'').substring(0,220),cover:str(x&&x.cover||'').substring(0,1800),date:str(x&&x.date||'').substring(0,80),duration:str(x&&x.duration||'').substring(0,80),direct:str(direct||'').substring(0,3500),player:str(player||u).substring(0,2200),tags:[],related:[],ts:Date.now()},i,c,raw;
    for(i=0;i<((x&&x.tags)||[]).length&&i<16;i++){c=x.tags[i]||{};if(c.name&&c.url)o.tags.push({name:str(c.name).substring(0,80),url:str(c.url).substring(0,1600)});}
    for(i=0;i<((x&&x.related)||[]).length&&i<16;i++){c=x.related[i]||{};raw=rawImage(c);if(c.url)o.related.push({url:str(c.url).substring(0,1600),title:str(c.title||'影片').substring(0,180),desc:str(c.desc||'').substring(0,220),rawImg:str(raw).substring(0,1600)});}
    return o;
  }
  function inflate(o){var i,c;if(!o)return null;for(i=0;i<(o.related||[]).length;i++){c=o.related[i];c.img=c.rawImg?C.image(c.rawImg,c.url):'';}return o;}
  function readStore(){var a=S.readJson(DETAIL_FILE,[]);return Object.prototype.toString.call(a)==='[object Array]'?a:[];}
  function readDetail(u){var a=readStore(),now=Date.now(),i,x;for(i=0;i<a.length;i++){x=a[i];if(x&&x.url===u&&now-Number(x.ts||0)<DETAIL_TTL)return inflate(x);}return null;}
  function saveDetail(model){var a=readStore(),out=[model],i,txt;for(i=0;i<a.length&&out.length<12;i++)if(a[i]&&a[i].url!==model.url&&Date.now()-Number(a[i].ts||0)<DETAIL_TTL)out.push(a[i]);txt=JSON.stringify(out);while(txt.length>180000&&out.length>2){out.pop();txt=JSON.stringify(out);}try{saveFile(DETAIL_FILE,txt);}catch(e){}}

  R.detail=function(){
    var u=C.param('u',''),seedTitle=C.param('t',''),seedImg=C.param('im',''),seedDesc=C.param('ds','');
    try{setPageTitle(seedTitle||'影片详情');}catch(e0){}
    var d=[],x=readDetail(u),html='',title=seedTitle||'影片',rawCover=seedImg||'',cover='',meta=seedDesc||'',direct='',target=u,i,historyOk=false;
    if(!x){
      try{html=str(fetch(u,{timeout:6500,headers:C.headers(u)}));}catch(e1){html='';}
      if(!C.isBadHtml(html)){
        try{x=C.detail(html,u);}catch(e2){x=null;}
        direct=directFromHtml(html,u);target=playerTarget(html,u);
        if(x){x=compactDetail(x,u,direct,target);saveDetail(x);x=inflate(x);}
      }
    }
    if(x){title=x.title||title;rawCover=x.cover||rawCover;meta=(x.date||'')+(x.date&&x.duration?' · ':'')+(x.duration||'')||meta;direct=x.direct||'';target=x.player||u;}
    try{setPageTitle(title||'影片详情');}catch(e3){}
    cover=rawCover?C.image(rawCover,u):'';
    try{historyOk=C.addHistory({url:u,title:title||'影片',img:cover,rawImg:rawCover,desc:meta||''});}catch(e4){}
    if(cover)add(d,{title:'',pic_url:cover,img:cover,url:'hiker://empty',col_type:'pic_1_full',extra:{lineVisible:false}});
    add(d,{title:title||'影片',desc:meta||'',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    if(direct)add(d,{title:'▶ 立即播放',desc:'直连播放',col_type:'text_center_1',url:directPlay(direct,u),extra:{id:'madou_t13_play_'+hash(u),lineVisible:false}});
    else add(d,sniffPlay(target||u,u,'madou_t13_play_'+hash(u)));
    divider(d);

    if(x&&x.tags&&x.tags.length){
      section(d,'相关标签','');
      for(i=0;i<x.tags.length&&i<16;i++)add(d,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),extra:{lineVisible:false}});
    }
    if(x&&x.related&&x.related.length){section(d,'相关推荐','');renderCards(d,x.related,16,'madou_t13_related_');}
    if(!x)section(d,'扩展信息加载失败','当前网络未取到完整详情；播放仍按原网页媒体解析策略处理。');

    var fav=C.isFav(u);
    add(d,{title:fav?'★ 取消本地收藏':'☆ 加入本地收藏',desc:historyOk?'已记录本次浏览':'浏览记录写入失败时已自动跳过',col_type:'text_center_1',url:$(u).lazyRule(function(boot,targetUrl,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10113);MadouBoot.loadOnly();MadouCore.toggleFav({url:targetUrl,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return'toast://收藏状态已更新';},C.bootstrap,u,title||'影片',rawCover||'',meta||''),extra:{lineVisible:false}});
    setResult(d);
  };

  R.settings=function(){
    try{setPageTitle('运行说明');}catch(e0){}
    var d=[];
    section(d,'当前策略','Test13 已取消详情加载/免嗅开关，避免设置动作再次触发旧私有 KV 问题。');
    add(d,{title:'详情信息',desc:'标签 + 相关推荐默认开启；首次进入请求一次详情，30分钟内复用结构化详情缓存。',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'播放',desc:'恢复已实机验证可播放的策略：详情直链优先；无直链时使用 video:// 对播放器/详情页做媒体自动提取。',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'存储',desc:'收藏、历史、详情缓存继续使用规则私有文件；本页不提供任何需要写 setItem 的设置项。',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'版本',desc:'Test13 · Build 10113',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    setResult(d);
  };
})();