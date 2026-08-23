/* 麻豆传媒 Test10 - performance-first runtime: zero-network category index + seed-first detail */
(function(){
  if (typeof MadouCore === 'undefined' || typeof MadouRemoteRuntime === 'undefined') throw new Error('Madou runtime unavailable');
  var C=MadouCore,R=MadouRemoteRuntime;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var MAJORS=['精选推荐','欧美P站','原创AV','网黄','乱伦','日韩','男同百合','Onlyfans','三级','猛料-SM','成人综艺','短视频','性爱教学','影视剧'];
  var CAT_KEY='madou_t10_category_index_v1';
  var FEED_KEY='madou_t10_feed_cache_v1';

  C.version='0.1.0-test.10'; C.build=10110;
  R.version='0.1.0-test.10'; R.build=10110;
  C.bootstrap=ROOT+'bootstrap_test_v10_b10110.js?v=10110';
  C.cachePrefix='madou_t10_';

  function str(v){return v===undefined||v===null?'':String(v);}
  function clean(v){return C.cleanLabel(str(v)).replace(/^\s+|\s+$/g,'');}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function same(a,b){a=clean(a).toLowerCase();b=clean(b).toLowerCase();return a===b||a.indexOf(b)>=0||b.indexOf(a)>=0;}
  function hash(v){var x=str(v),h=0,i;for(i=0;i<x.length;i++)h=((h<<5)-h+x.charCodeAt(i))|0;return Math.abs(h);}
  function safeClear(k){try{if(typeof clearItem==='function'){clearItem(k);return;}}catch(e0){}try{if(typeof removeItem==='function'){removeItem(k);return;}}catch(e1){}try{setItem(k,'');}catch(e2){}}
  function legacyKey(prefix,url){return prefix+hash(url);}
  function purgeLegacyUrl(url){var u=str(url);if(!u)return;['madou_v1_','madou_v2_'].forEach(function(p){safeClear(legacyKey(p,u));safeClear(legacyKey(p,u)+'_ts');});}
  purgeLegacyUrl(C.base); purgeLegacyUrl(C.base+'/');

  C.page=function(path,params){
    var u='hiker://page/'+path+'?rule=&simple=true',k;
    params=params||{};
    for(k in params) if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&str(params[k])!=='') u+='&'+encodeURIComponent(k)+'='+encodeURIComponent(str(params[k]));
    return u;
  };

  var baseParse=C.parseCards;
  C.parseCards=function(html,base){
    var src=baseParse(html,base),out=[],seen={},i,x,t;
    for(i=0;i<src.length;i++){
      x=src[i]||{}; t=clean(x.title||'');
      if(!t||/^(arrow|next|prev|previous|more|menu|home|logo|favicon|loading|返回|更多|上一页|下一页|首页)$/i.test(t))continue;
      if(!x.url||seen[x.url])continue;
      seen[x.url]=1; out.push(x);
    }
    return out;
  };

  C._t10Html={}; C._t10HtmlTs={};
  C.fetchPlainHtml=function(url,timeout){
    var target=str(url||C.base+'/'),h='';
    try{h=str(fetch(target,{timeout:Number(timeout||6500),headers:C.headers(target)}));}catch(e0){h='';}
    return h;
  };
  C.fetchHtml=function(url,force){
    var target=str(url||C.base+'/'),now=Date.now(),old=C._t10Html[target]||'',ts=Number(C._t10HtmlTs[target]||0),h='';
    if(!force&&old&&now-ts<180000)return old;
    h=C.fetchPlainHtml(target,6500);
    if(!C.isBadHtml(h)){
      C._t10Html[target]=h; C._t10HtmlTs[target]=now;
      try{setItem('madou_diag_last_html_len',String(h.length));}catch(e1){}
      try{setItem('madou_diag_last_fetch_ts',String(now));}catch(e2){}
      return h;
    }
    return old||h;
  };

  C.slimItem=function(item){
    var x=item||{},img=str(x.img||''),raw=str(x.rawImg||'');
    if(img.length>1800||/^data:/i.test(img))img='';
    if(raw.length>1800||/^data:/i.test(raw))raw='';
    return {url:str(x.url||'').substring(0,1800),title:str(x.title||'影片').substring(0,180),img:img,rawImg:raw,desc:str(x.desc||'').substring(0,240),time:Number(x.time||Date.now())};
  };
  C.readList=function(key){var raw='[]';try{raw=str(getItem(key,'[]'));}catch(e0){}if(raw.length>220000){safeClear(key);return [];}try{var a=JSON.parse(raw);return Object.prototype.toString.call(a)==='[object Array]'?a:[];}catch(e1){return [];}};
  C.writeList=function(key,items){
    var src=items||[],out=[],max=key===C.historyKey?60:90,i,text;
    for(i=0;i<src.length&&i<max;i++)out.push(C.slimItem(src[i]));
    text=JSON.stringify(out);
    while(text.length>120000&&out.length>10){out=out.slice(0,Math.max(10,Math.floor(out.length/2)));text=JSON.stringify(out);}
    try{setItem(key,text);return true;}catch(e0){return false;}
  };
  C.addHistory=function(item){var old=C.readList(C.historyKey),cur=C.slimItem(item),out=[cur],i;for(i=0;i<old.length&&out.length<60;i++)if(old[i]&&old[i].url!==cur.url)out.push(C.slimItem(old[i]));return C.writeList(C.historyKey,out);};
  C.toggleFav=function(item){var old=C.readList(C.favoriteKey),cur=C.slimItem(item),out=[],hit=false,i;for(i=0;i<old.length;i++){if(old[i]&&old[i].url===cur.url)hit=true;else out.push(C.slimItem(old[i]));}if(!hit)out.unshift(cur);C.writeList(C.favoriteKey,out);return !hit;};

  C.categoryGroups=function(html){
    var region=C.menuRegion(html)||str(html),anchors=C.allAnchors(region,C.base),marks=[],i,j,pos,label,href;
    for(i=0;i<MAJORS.length;i++){
      pos=region.indexOf(MAJORS[i]); href='';
      for(j=0;j<anchors.length;j++){label=clean(anchors[j].text||anchors[j].title);if(same(label,MAJORS[i])){if(pos<0)pos=anchors[j].index;href=anchors[j].href;break;}}
      if(pos>=0)marks.push({name:MAJORS[i],pos:pos,url:href});
    }
    marks.sort(function(a,b){return a.pos-b.pos;});
    var groups=[],start,end,item,name,isMajor,k,seen,children,m;
    for(i=0;i<marks.length;i++){
      start=marks[i].pos; end=i+1<marks.length?marks[i+1].pos:region.length; seen={}; children=[];
      for(j=0;j<anchors.length;j++){
        item=anchors[j]; if(item.index<=start||item.index>=end)continue;
        name=clean(item.text||item.title); if(!name||name.length>24||!C.internal(item.href)||C.isUtilityLabel(name))continue;
        if(/^(首页|最新|上一页|下一页|上页|下页|更多|展开|收起|arrow|next|prev|menu)$/i.test(name))continue;
        isMajor=false; for(m=0;m<MAJORS.length;m++)if(same(name,MAJORS[m])){isMajor=true;break;} if(isMajor)continue;
        k=name+'|'+item.href; if(seen[k])continue; seen[k]=1; children.push({name:name,url:item.href});
      }
      groups.push({name:marks[i].name,url:marks[i].url,children:children});
    }
    if(!groups.length)for(i=0;i<MAJORS.length;i++)groups.push({name:MAJORS[i],url:'',children:[]});
    return groups;
  };
  C.groupByName=function(groups,name){for(var i=0;i<groups.length;i++)if(same(groups[i].name,name))return groups[i];return null;};
  C.groupByUrl=function(groups,url){for(var i=0;i<groups.length;i++){if(groups[i].url===url)return groups[i];for(var j=0;j<groups[i].children.length;j++)if(groups[i].children[j].url===url)return groups[i];}return null;};

  function compactGroups(groups){
    var out=[],i,j,g,c;for(i=0;i<groups.length&&i<20;i++){g=groups[i]||{};var kids=[];for(j=0;j<(g.children||[]).length&&j<80;j++){c=g.children[j]||{};if(c.name&&c.url)kids.push({name:str(c.name).substring(0,40),url:str(c.url).substring(0,800)});}out.push({name:str(g.name).substring(0,40),url:str(g.url||'').substring(0,800),children:kids});}return out;
  }
  function saveGroups(groups){var obj={ts:Date.now(),groups:compactGroups(groups)},txt=JSON.stringify(obj);if(txt.length>120000)return false;try{setItem(CAT_KEY,txt);return true;}catch(e){return false;}}
  function readGroups(){var raw='';try{raw=str(getItem(CAT_KEY,''));}catch(e0){}if(!raw||raw.length>130000)return[];try{var o=JSON.parse(raw);return o&&Object.prototype.toString.call(o.groups)==='[object Array]'?o.groups:[];}catch(e1){return[];}}
  function groupsFast(allowNetwork){var groups=readGroups(),html;if(groups.length)return groups;if(!allowNetwork)return[];html=C.fetchHtml(C.base+'/',false);if(C.isBadHtml(html))return[];groups=C.categoryGroups(html);saveGroups(groups);return groups;}

  function rawImage(c){var x=str((c&&c.rawImg)||'');if(x)return x;var y=str((c&&c.img)||'');var p=y.indexOf('@headers=');return p>0?y.substring(0,p):y;}
  function compactCard(c){return {url:str(c.url||'').substring(0,1600),title:str(c.title||'影片').substring(0,180),rawImg:rawImage(c).substring(0,1600),desc:str(c.desc||'').substring(0,220)};}
  function readFeedStore(){var raw='';try{raw=str(getItem(FEED_KEY,''));}catch(e0){}if(!raw||raw.length>150000)return[];try{var a=JSON.parse(raw);return Object.prototype.toString.call(a)==='[object Array]'?a:[];}catch(e1){return[];}}
  function writeFeedStore(a){var out=a.slice(0,6),txt=JSON.stringify(out);while(txt.length>140000&&out.length>1){out.pop();txt=JSON.stringify(out);}try{setItem(FEED_KEY,txt);}catch(e){}}
  function getFeed(url,allowStale){var a=readFeedStore(),now=Date.now(),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url===url){if(allowStale||now-Number(a[i].ts||0)<20*60*1000)return a[i];}return null;}
  function putFeed(url,cards){var a=readFeedStore(),out=[],item={url:url,ts:Date.now(),cards:[]},i;for(i=0;i<cards.length&&i<30;i++)item.cards.push(compactCard(cards[i]));out.push(item);for(i=0;i<a.length&&out.length<6;i++)if(a[i]&&a[i].url!==url)out.push(a[i]);writeFeedStore(out);}
  function inflateCard(c){var raw=str(c.rawImg||'');return {url:c.url,title:c.title,desc:c.desc||'',rawImg:raw,img:raw?C.image(raw,c.url):''};}

  function routeCard(c){return C.page('madouDetail',{u:c.url,t:c.title||'影片',im:rawImage(c),ds:c.desc||''});}
  function renderCards(d,cards,limit,prefix){var max=limit||cards.length,i,c;for(i=0;i<cards.length&&i<max;i++){c=cards[i]||{};add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||'',img:c.img||'',url:routeCard(c),col_type:'movie_2',extra:{lineVisible:false,id:(prefix||'madou_t10_card_')+i}});}}
  function renderCachedCards(d,cards,limit,prefix){var a=[],i;for(i=0;i<cards.length;i++)a.push(inflateCard(cards[i]));renderCards(d,a,limit,prefix);}
  function quick(d,title,img,url){add(d,{title:title,img:img,pic_url:img,url:url,col_type:'icon_small_4',extra:{lineVisible:false}});}
  function directFromHtml(html,base){
    var s=str(html).replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':').replace(/\\\//g,'/'),re,m,out=[],seen={};
    function push(raw){var u='';try{u=C.abs(raw,base);}catch(e){}if(!u||!/\.(?:m3u8|mp4)(?:[?#]|$)/i.test(u)||seen[u])return;seen[u]=1;out.push(u);}
    re=/(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;while((m=re.exec(s)))push(m[1]);
    re=/(?:file|src|source|videoUrl|video_url|playUrl|play_url|m3u8)\s*[:=]\s*["']([^"']+)["']/ig;while((m=re.exec(s)))push(m[1]);
    if(!out.length)return'';out.sort(function(a,b){try{return C.mediaScore(b)-C.mediaScore(a);}catch(e){return 0;}});return out[0];
  }
  function playerTarget(html,detailUrl){
    var s=str(html).replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':').replace(/\\\//g,'/'),re,m,u;
    re=/<iframe\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["']/i;m=s.match(re);if(m){try{u=C.abs(m[1],detailUrl);}catch(e0){}if(u)return u;}
    re=/(?:player|embed|iframe|playUrl|play_url|playerUrl|player_url)\s*[:=]\s*["']([^"']+)["']/i;m=s.match(re);if(m){try{u=C.abs(m[1],detailUrl);}catch(e1){}if(u)return u;}
    return detailUrl;
  }
  function playItem(target,detailUrl,id){
    return {title:'▶ 立即播放',desc:'快速播放 · 媒体解析移出详情首屏',col_type:'text_center_1',url:'video://'+target,extra:{id:id,lineVisible:false,blockRules:['.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','banner','advert','ads','doubleclick','googleads','analytics'],videoRules:['.m3u8','.mp4','m3u8','mp4'],videoExcludeRules:['advert','promo','banner','?ad='],cacheM3u8:true,referer:detailUrl}};
  }
  function directPlay(url,ref){return url+';{User-Agent@'+C.ua+'&&Referer@'+ref+'}#isVideo=true#';}

  R.home=function(){
    try{setPageTitle('麻豆传媒');}catch(e0){}
    var d=[],cached=getFeed(C.base+'/',false),groups=groupsFast(false),html='',cards=[],i;
    if(cached&&cached.cards&&cached.cards.length){
      quick(d,'搜索',ROOT+'assets/quick_search.svg',C.page('madouSearch'));
      quick(d,'全部分类',ROOT+'assets/quick_categories.svg',C.page('madouCategories'));
      quick(d,'本地收藏',ROOT+'assets/quick_favorite.svg',C.page('madouFavorites'));
      quick(d,'浏览历史',ROOT+'assets/quick_history.svg',C.page('madouHistory'));
      add(d,{title:'首页',col_type:'scroll_button',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'})});
      for(i=0;i<groups.length&&i<8;i++)add(d,{title:groups[i].name,col_type:'scroll_button',url:C.page('madouCategories',{g:groups[i].name})});
      if(groups.length>8)add(d,{title:'更多',col_type:'scroll_button',url:C.page('madouCategories')});
      section(d,'首页精选','缓存优先 · '+cached.cards.length+' 项'); renderCachedCards(d,cached.cards,18,'madou_t10_home_');
      add(d,{title:'刷新首页数据',desc:'仅在需要时重新请求原站',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){var a=[];try{a=JSON.parse(getItem('madou_t10_feed_cache_v1','[]'));}catch(e){}var o=[];for(var i=0;i<a.length;i++)if(a[i]&&a[i].url!==k)o.push(a[i]);try{setItem('madou_t10_feed_cache_v1',JSON.stringify(o));}catch(e2){}refreshPage(false);return'hiker://empty';},C.base+'/'),extra:{lineVisible:false}});
      setResult(d);return;
    }
    html=C.fetchHtml(C.base+'/',false);
    if(C.isBadHtml(html)){section(d,'麻豆传媒','原站响应较慢或暂时不可用。');add(d,{title:'打开原站',col_type:'text_1',url:'web://'+C.base+'/'});setResult(d);return;}
    groups=C.categoryGroups(html);saveGroups(groups);cards=C.parseCards(html,C.base);putFeed(C.base+'/',cards);
    quick(d,'搜索',ROOT+'assets/quick_search.svg',C.page('madouSearch'));
    quick(d,'全部分类',ROOT+'assets/quick_categories.svg',C.page('madouCategories'));
    quick(d,'本地收藏',ROOT+'assets/quick_favorite.svg',C.page('madouFavorites'));
    quick(d,'浏览历史',ROOT+'assets/quick_history.svg',C.page('madouHistory'));
    add(d,{title:'首页',col_type:'scroll_button',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'})});
    for(i=0;i<groups.length&&i<8;i++)add(d,{title:groups[i].name,col_type:'scroll_button',url:C.page('madouCategories',{g:groups[i].name})});
    if(groups.length>8)add(d,{title:'更多',col_type:'scroll_button',url:C.page('madouCategories')});
    section(d,'首页精选',cards.length+' 项');renderCards(d,cards,18,'madou_t10_home_');setResult(d);
  };

  R.categories=function(){
    try{setPageTitle('全部分类');}catch(e0){}
    var d=[],groups=groupsFast(true),focus=C.param('g',''),key='madou_cat_active_t10',current='',active=null,i,j,total=0;
    try{current=getMyVar(key,'');}catch(e1){} if(focus)current=focus; if(!current&&groups.length)current=groups[0].name;
    for(i=0;i<groups.length;i++){total+=(groups[i].children||[]).length;if(same(groups[i].name,current))active=groups[i];}
    if(!active&&groups.length)active=groups[0];
    section(d,'分类中心',groups.length+' 个大分类 · '+total+' 个小分类 · 分类索引本地缓存');
    for(i=0;i<groups.length;i++)(function(g){var selected=active&&same(active.name,g.name);add(d,{title:(selected?'● ':'')+g.name,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,n){putMyVar(k,n);refreshPage(false);return'hiker://empty';},key,g.name),extra:{lineVisible:false}});})(groups[i]);
    if(!active){section(d,'暂无分类','分类索引还没有建立，可返回首页刷新一次。');setResult(d);return;}
    section(d,active.name,(active.children||[]).length+' 个小分类');
    if(active.url)add(d,{title:'全部',col_type:'text_3',url:C.page('madouList',{u:active.url,page:'fypage',n:'全部'+active.name,g:active.name}),extra:{lineVisible:false}});
    for(j=0;j<(active.children||[]).length;j++)add(d,{title:active.children[j].name,col_type:'text_3',url:C.page('madouList',{u:active.children[j].url,page:'fypage',n:active.children[j].name,g:active.name}),extra:{lineVisible:false}});
    setResult(d);
  };

  R.list=function(){
    var initialName=C.param('n','分类'),initialBase=C.param('u',C.base+'/'),groupName=C.param('g',''),page=1;
    try{page=Number(MY_PAGE||1);}catch(e0){} if(!page||page<1)page=1;
    var token=initialBase+'|'+groupName,stateKey='madou_list_active_t10_'+hash(token),nameKey=stateKey+'_name',activeBase=initialBase,activeName=initialName;
    try{activeBase=str(getMyVar(stateKey,initialBase)||initialBase);activeName=str(getMyVar(nameKey,initialName)||initialName);}catch(e1){}
    try{setPageTitle(activeName||initialName);}catch(e2){}
    var d=[],groups=groupsFast(false),group=groupName?C.groupByName(groups,groupName):C.groupByUrl(groups,activeBase),i,requestUrl,cached,stale,html,cards;
    if(!group&&initialBase!==activeBase)group=C.groupByUrl(groups,initialBase); if(group&&!groupName)groupName=group.name;
    if(page===1&&group){for(i=0;i<(group.children||[]).length;i++)(function(child){var selected=child.url===activeBase;add(d,{title:(selected?'● ':'')+child.name,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,nk,u,n){putMyVar(k,u);putMyVar(nk,n);refreshPage(false);return'hiker://empty';},stateKey,nameKey,child.url,child.name),extra:{lineVisible:false}});})(group.children[i]);if(group.children.length)add(d,{col_type:'blank_block'});}
    if(page===1){
      cached=getFeed(activeBase,false);
      if(cached&&cached.cards&&cached.cards.length){renderCachedCards(d,cached.cards,0,'madou_t10_list_');add(d,{title:'刷新当前分类',desc:'当前为20分钟内容缓存',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(u){var raw='';try{raw=getItem('madou_t10_feed_cache_v1','[]');}catch(e){}var a=[];try{a=JSON.parse(raw);}catch(e2){}var o=[];for(var i=0;i<a.length;i++)if(a[i]&&a[i].url!==u)o.push(a[i]);try{setItem('madou_t10_feed_cache_v1',JSON.stringify(o));}catch(e3){}refreshPage(false);return'hiker://empty';},activeBase),extra:{lineVisible:false}});setResult(d);return;}
      stale=getFeed(activeBase,true);
    }
    purgeLegacyUrl(activeBase);
    requestUrl=C.pageUrl(activeBase,page,''); html=C.fetchPlainHtml(requestUrl,6500);
    if(C.isBadHtml(html)){
      if(page===1&&stale&&stale.cards&&stale.cards.length){section(d,'网络较慢','已显示上一次成功内容');renderCachedCards(d,stale.cards,0,'madou_t10_stale_');setResult(d);return;}
      section(d,'加载超时','当前分类请求超过快速预算，请稍后重试。');add(d,{title:'原站打开',desc:requestUrl,col_type:'text_center_1',url:'web://'+requestUrl,extra:{lineVisible:false}});setResult(d);return;
    }
    cards=C.parseCards(html,requestUrl);if(page===1&&cards.length)putFeed(activeBase,cards);renderCards(d,cards,0,'madou_t10_list_');if(!cards.length&&page===1)section(d,'暂无内容','当前页面没有识别到有效影片。');setResult(d);
  };

  R.detail=function(){
    var u=C.param('u',''),seedTitle=C.param('t',''),seedImg=C.param('im',''),seedDesc=C.param('ds',''),fullKey='madou_t10_detail_full_'+hash(u),full=false;
    try{full=getMyVar(fullKey,'0')==='1';}catch(e0){}
    try{setPageTitle(seedTitle||'影片详情');}catch(e1){}
    purgeLegacyUrl(u);
    var d=[],x=null,html='',title=seedTitle||'影片',rawCover=seedImg||'',cover='',meta=seedDesc||'',direct='',target=u,i,historyOk=false;
    if(!seedTitle||full){
      html=C.fetchPlainHtml(u,6500);
      if(!C.isBadHtml(html)){
        x=C.detail(html,u); title=x.title||title; rawCover=x.cover||rawCover; meta=(x.date||'')+(x.date&&x.duration?' · ':'')+(x.duration||'')||meta; direct=directFromHtml(html,u); target=playerTarget(html,u);
      }
    }
    try{setPageTitle(title||'影片详情');}catch(e2){}
    cover=rawCover?C.image(rawCover,u):'';
    try{historyOk=C.addHistory({url:u,title:title||'影片',img:cover,rawImg:rawCover,desc:meta||''});}catch(e3){}
    if(cover)add(d,{title:'',pic_url:cover,img:cover,url:'hiker://empty',col_type:'pic_1_full',extra:{lineVisible:false}});
    add(d,{title:title||'影片',desc:meta||'',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    if(direct)add(d,{title:'▶ 立即播放',desc:'直连播放',col_type:'text_center_1',url:directPlay(direct,u),extra:{id:'madou_t10_play_'+hash(u),lineVisible:false}});
    else add(d,playItem(target,u,'madou_t10_play_'+hash(u)));
    divider(d);
    if(full&&x){
      if(x.tags&&x.tags.length){section(d,'相关标签','');for(i=0;i<x.tags.length&&i<14;i++)add(d,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),extra:{lineVisible:false}});}
      if(x.related&&x.related.length){section(d,'相关推荐','');renderCards(d,x.related,18,'madou_t10_related_');}
      add(d,{title:'收起扩展信息',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){clearMyVar(k);refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    }else{
      add(d,{title:'加载标签与相关推荐',desc:'默认不加载，避免阻塞详情首屏',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){putMyVar(k,'1');refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    }
    var fav=C.isFav(u);add(d,{title:fav?'★ 取消本地收藏':'☆ 加入本地收藏',desc:historyOk?'已记录本次浏览':'浏览记录写入失败时已自动跳过',col_type:'text_center_1',url:$(u).lazyRule(function(boot,targetUrl,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10110);MadouBoot.loadOnly();MadouCore.toggleFav({url:targetUrl,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return'toast://收藏状态已更新';},C.bootstrap,u,title||'影片',rawCover||'',meta||''),extra:{lineVisible:false}});
    setResult(d);
  };

  R.search=function(){
    var kw=C.param('kw',''),page=1,d=[],searchJs,r,cards,i;try{if(!kw&&typeof MY_KEYWORD!=='undefined')kw=str(MY_KEYWORD);}catch(e0){}try{page=Number(MY_PAGE||1);}catch(e1){}kw=str(kw).replace(/^\s+|\s+$/g,'');try{setPageTitle(kw?'搜索 · '+kw:'搜索');}catch(e2){}
    searchJs="(function(){var q=String(input||'').replace(/^\\s+|\\s+$/g,'');return q?('hiker://page/madouSearch?rule=&simple=true&kw='+encodeURIComponent(q)):'toast://请输入关键词';})()";
    add(d,{title:kw?'重新搜索：'+kw:'搜索全站内容',desc:'输入片名、演员或关键词',col_type:'text_1',url:'input://'+JSON.stringify({value:kw,hint:'输入片名、演员或关键词',js:searchJs}),extra:{lineVisible:false}});
    if(!kw){var groups=groupsFast(false);section(d,'快速浏览','分类索引本地读取');for(i=0;i<groups.length&&i<10;i++)add(d,{title:groups[i].name,col_type:'scroll_button',url:C.page('madouCategories',{g:groups[i].name})});setResult(d);return;}
    r=C.searchHtml(kw,page);cards=C.parseCards(r.html,r.url);section(d,'搜索结果',cards.length?'找到 '+cards.length+' 项':'没有找到匹配内容');renderCards(d,cards,0,'madou_t10_search_');setResult(d);
  };

  R.favorites=function(){try{setPageTitle('本地收藏');}catch(e0){}var d=[],a=C.readList(C.favoriteKey),i,c;section(d,'本地收藏',a.length+' 项');for(i=0;i<a.length;i++){c=a[i];add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||C.image(c.rawImg,c.url),url:C.page('madouDetail',{u:c.url,t:c.title||'影片',im:c.rawImg||'',ds:c.desc||''}),col_type:'movie_2'});}if(!a.length)section(d,'还没有收藏','进入详情页后可加入本地收藏。');setResult(d);};
  R.history=function(){try{setPageTitle('浏览历史');}catch(e0){}var d=[],a=C.readList(C.historyKey),i,c;section(d,'最近浏览',a.length+' 项');for(i=0;i<a.length;i++){c=a[i];add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||C.image(c.rawImg,c.url),url:C.page('madouDetail',{u:c.url,t:c.title||'影片',im:c.rawImg||'',ds:c.desc||''}),col_type:'movie_2'});}if(!a.length)section(d,'暂无历史','打开详情页后自动记录。');setResult(d);};
  R.settings=function(){try{setPageTitle('设置与诊断');}catch(e0){}var d=[],groups=readGroups(),feeds=readFeedStore();section(d,'运行信息','性能优先运行时');add(d,{title:'版本',desc:R.version+' · Build '+R.build,col_type:'text_1',url:'hiker://empty'});add(d,{title:'分类索引',desc:groups.length+' 个大分类 · 本地读取',col_type:'text_1',url:'hiker://empty'});add(d,{title:'内容缓存',desc:feeds.length+' 个最近页面 · 每页最多30项',col_type:'text_1',url:'hiker://empty'});add(d,{title:'清空页面缓存',desc:'不影响收藏和历史',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(){try{clearItem('madou_t10_category_index_v1');}catch(e){}try{clearItem('madou_t10_feed_cache_v1');}catch(e2){}refreshPage(false);return'toast://页面缓存已清空';}),extra:{lineVisible:false}});add(d,{title:'原站网页',desc:C.base,col_type:'text_center_1',url:'web://'+C.base+'/',extra:{lineVisible:false}});setResult(d);};
})();
