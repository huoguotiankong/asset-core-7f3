/* 91porna 0.1.0-test.3 - two-column/in-place tabs/cover recovery */
var P91Runtime=(function(){
  var VERSION='0.1.0-test.3', BUILD=10103;
  var APP='p91t3', DEFAULT_BASE='https://91porna.com';
  var UA='Mozilla/5.0 (Linux; Android 16; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0 Mobile Safari/537.36';
  var FAV_KEY='p91_collection_favorites_v2', BASE_KEY='p91_last_good_base_v2', SETS_URL_KEY='p91_sets_url_v3';
  var HOME_SORT_KEY='p91_home_sort_v3', COVER_CACHE_KEY='p91_cover_cache_v3';
  var ASSET_ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/91porna/assets/';
  function s(v){return String(v==null?'':v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function dec(v){try{return decodeURIComponent(s(v).replace(/\+/g,'%20'));}catch(e){return s(v);}}
  function html(v){return s(v).replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');}
  function strip(v){return trim(html(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')));}
  function attr(a,n){var r=new RegExp('(?:^|\\s)'+n+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'),m=r.exec(s(a));return m?html(m[1]):'';}
  function base(){return getItem(BASE_KEY,DEFAULT_BASE)||DEFAULT_BASE;}
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';}
  function abs(u,b){u=trim(html(u)).replace(/\\\//g,'/');if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return 'https:'+u;b=origin(b||base())||base();if(u.charAt(0)==='/')return b+u;return b+'/'+u.replace(/^\.\//,'');}
  function requestText(u,opt){
    opt=opt||{};
    var h={'User-Agent':UA,'Referer':opt.referer||base()+'/','Accept':'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8'};
    var t='';
    try{t=s(request(u,{timeout:opt.timeout||9000,headers:h}));}catch(e1){try{t=s(fetch(u,{timeout:opt.timeout||9000,headers:h}));}catch(e2){throw new Error('REQUEST_FAIL '+s(e2.message||e1.message||e2||e1));}}
    if(!t||/^\s*(?:<!doctype html>)?\s*<(?:title>)?(?:502|503|504|Bad Gateway|Service Unavailable)/i.test(t))throw new Error('EMPTY_OR_GATEWAY');
    var o=origin(u);if(o&&/91porn/i.test(t))setItem(BASE_KEY,o);
    return t;
  }
  function param(name,def){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+name+'=([^&#]*)'));if(m)return dec(m[1]);try{var v=getParam(name);if(v!==undefined&&v!==null&&s(v)!=='')return dec(v);}catch(e){}return def==null?'':def;}
  function pageNo(){try{return Math.max(1,Number(MY_PAGE||1)||1);}catch(e){return 1;}}
  function page(path,p,theme){var q=[],k;p=p||{};for(k in p)if(p[k]!==undefined&&p[k]!==null&&s(p[k])!=='')q.push(encodeURIComponent(k)+'='+encodeURIComponent(s(p[k])));return'hiker://page/'+path+'?rule=&simple=true'+(q.length?'&'+q.join('&'):'')+(theme?'#'+theme+'#':'');}
  function line(){return{col_type:'line',extra:{lineVisible:false}};}
  function section(title,desc){return{title:'『'+title+'』',desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(t,d,u){return{title:t||'暂无内容',desc:d||'',url:u||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function chip(title,on,url,type){return{title:on?('● '+title):title,url:url||'hiker://empty',col_type:type||'scroll_button',extra:{lineVisible:false}};}
  function isBadImage(u){u=s(u).toLowerCase();if(!u||/^data:|^javascript:|^blob:/i.test(u))return true;return /(?:favicon|logo|avatar|icon|menu|search|arrow|close|qrcode|qr[-_]?code|placeholder|loading|loader|default|blank|sprite|banner|nav[-_]?)/i.test(u);}
  function imageCandidate(u,b){u=trim(html(u)).replace(/\\\//g,'/').replace(/\\u0026/g,'&');if(!u)return'';u=abs(u,b);if(!u||isBadImage(u))return'';return u;}
  function imageUrl(u,ref){if(!u)return ASSET_ROOT+'logo.svg';if(/^(?:data:|file:|hiker:)/i.test(u))return u;return u+'@headers='+JSON.stringify({'User-Agent':UA,'Referer':ref||base()+'/'});}
  function imageFrom(raw,b){
    var s0=s(raw),m,u,a,i,j,keys=['data-original','data-original-src','data-src','data-lazy-src','data-lazy','data-lazyload','data-echo','data-url','data-bg','data-background','data-background-image','data-image','data-img','data-thumb','data-thumbnail','data-cover','data-poster','poster','src'];
    var re=/<(?:img|source|video|div|a|figure|span|picture)\b([^>]*)>/ig;
    while((m=re.exec(s0))){
      a=m[1];
      for(i=0;i<keys.length;i++){u=imageCandidate(attr(a,keys[i]),b);if(u)return u;}
      var ss=attr(a,'srcset')||attr(a,'data-srcset')||attr(a,'data-lazy-srcset');
      if(ss){var ps=ss.split(','),cu;for(j=ps.length-1;j>=0;j--){cu=imageCandidate(trim(ps[j]).split(/\s+/)[0],b);if(cu)return cu;}}
      var ar=/([\w:-]*(?:src|img|image|cover|thumb|poster|background)[\w:-]*)\s*=\s*["']([^"']+)["']/ig,am;
      while((am=ar.exec(a))){u=imageCandidate(am[2],b);if(u)return u;}
      var style=attr(a,'style'),sm=style.match(/(?:background(?:-image)?|content)\s*:\s*url\((?:["']?)([^)"']+)(?:["']?)\)/i);if(sm){u=imageCandidate(sm[1],b);if(u)return u;}
    }
    re=/(?:["']?(?:cover|thumb|thumbnail|image|img|poster|pic)(?:Url|URL|_url|Src|_src)?["']?\s*[:=]\s*["'])([^"']+)["']/ig;
    while((m=re.exec(s0))){u=imageCandidate(m[1],b);if(u)return u;}
    re=/((?:https?:)?\\?\/\\?\/[^\s"'<>]+?\.(?:jpe?g|png|webp|gif|avif)(?:\?[^\s"'<>]*)?)/ig;
    while((m=re.exec(s0))){u=imageCandidate(m[1],b);if(u)return u;}
    re=/(?:background(?:-image)?\s*:\s*url\(|["'])([^"'()\s<>]+\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"'()\s<>]*)?)/ig;
    while((m=re.exec(s0))){u=imageCandidate(m[1],b);if(u)return u;}
    return'';
  }
  function metaImage(src,b){var m=s(src).match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i)||s(src).match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']/i);return m?imageCandidate(m[1],b):'';}
  function coverCache(){try{var j=JSON.parse(getItem(COVER_CACHE_KEY,'{}')||'{}');return j&&typeof j==='object'?j:{};}catch(e){return{};}}
  function enrichCovers(rows,max){
    if(!rows||!rows.length)return rows||[];
    max=max||16;var cache=coverCache(),now=Date.now(),todo=[],i,x,c;
    for(i=0;i<rows.length;i++){
      x=rows[i];c=cache[x.url];
      if(c&&now-Number(c.time||0)<259200000){if(c.img){x.img=c.img;x.imgRef=x.url;}continue;}
      if(todo.length<max)todo.push({idx:i,url:x.url,old:x.img||''});
    }
    if(!todo.length)return rows;
    var reqs=[];for(i=0;i<todo.length;i++)reqs.push({url:todo[i].url,options:{timeout:6500,headers:{'User-Agent':UA,'Referer':base()+'/'}}});
    try{
      var res=batchFetch(reqs);
      for(i=0;i<todo.length;i++){
        var body=s(res[i]),img=metaImage(body,todo[i].url)||imageFrom(body,todo[i].url)||todo[i].old;
        rows[todo[i].idx].img=img||'';rows[todo[i].idx].imgRef=todo[i].url;
        cache[todo[i].url]={img:img||'',time:now};
      }
      setItem(COVER_CACHE_KEY,JSON.stringify(cache));
    }catch(e){}
    return rows;
  }
  function context(src,i,before,after){return s(src).substring(Math.max(0,i-(before||1200)),Math.min(s(src).length,i+(after||2200)));}
  function hrefType(u){u=s(u);if(/\/comic\/index\/detail\?video_key=/i.test(u))return'video';if(/\/moviesets\/[^/?#]+/i.test(u))return'collection';if(/\/novels\//i.test(u))return'novel';if(/%E9%BB%91%E6%96%99|黑料吃瓜|\/archives\//i.test(u))return'article';return'generic';}
  function detailUrl(row){if(row.kind==='collection')return page('p91t3SetDetail',{p91_url:row.url,p91_title:row.title,p91_img:row.img,p91_count:row.count||''});if(row.kind==='video')return page('p91t3Detail',{p91_url:row.url,p91_title:row.title,p91_img:row.img});return row.url;}
  function cleanTitle(v){return trim(s(v).replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/,'').replace(/\s{2,}/g,' '));}
  function parseVideos(src,b){
    var out=[],seen={},re=/<a\b([^>]*)href\s*=\s*["']([^"']*\/comic\/index\/detail\?video_key=[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,u,key,inner,ctx,title,img,dur,tags;
    while((m=re.exec(s(src)))&&out.length<80){
      u=abs(m[2],b);key=u.replace(/&amp;/g,'&');if(seen[key])continue;
      inner=m[4];ctx=context(src,m.index,1200,2400);
      title=cleanTitle(attr(m[1]+' '+m[3],'title')||attr(m[1]+' '+m[3],'aria-label')||strip(inner));
      if(!title||title.length<2||/^(?:首页|视频|更多|登录|注册)$/i.test(title))continue;
      img=imageFrom(inner,u)||imageFrom(ctx,u);
      dur='';var dm=ctx.match(/(?:^|[>\s])(\d{1,2}:\d{2}(?::\d{2})?)(?:[<\s]|$)/);if(dm)dur=dm[1];
      tags=[];var tr=/<a\b[^>]*href=["'][^"']*(?:tag|keyword)[^"']*["'][^>]*>([\s\S]*?)<\/a>/ig,tm;while((tm=tr.exec(ctx))&&tags.length<4){var tt=strip(tm[1]);if(tt&&tags.indexOf(tt)<0)tags.push(tt);}seen[key]=1;
      out.push({kind:'video',url:u,title:title,img:img,imgRef:b,duration:dur,tags:tags,desc:[dur,tags.slice(0,2).join(' · ')].filter(function(x){return!!x;}).join(' · ')});
    }
    return out;
  }
  function parseCollections(src,b){
    var out=[],seen={},re=/<a\b([^>]*)href\s*=\s*["']([^"']*\/moviesets\/[^"'?#]+(?:[?#][^"']*)?)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,u,key,inner,ctx,title,img,count,cm;
    while((m=re.exec(s(src)))&&out.length<120){
      u=abs(m[2],b);key=u.replace(/[?#].*$/,'');if(seen[key])continue;
      inner=m[4];ctx=context(src,m.index,1200,2400);
      title=cleanTitle(attr(m[1]+' '+m[3],'title')||attr(m[1]+' '+m[3],'aria-label')||strip(inner));
      img=imageFrom(inner,u)||imageFrom(ctx,u);
      cm=ctx.match(/视频数量\s*[:：]?\s*([\d,]+)/i)||ctx.match(/([\d,]+)\s*(?:个)?视频/i);count=cm?cm[1]:'';
      if((!title||title.length>80)&&img){var hm=ctx.match(/<(?:h2|h3|h4|strong|p)[^>]*>([\s\S]*?)<\/(?:h2|h3|h4|strong|p)>/i);if(hm)title=strip(hm[1]);}
      title=cleanTitle(title.replace(/视频数量[\s\S]*$/,'').replace(/^[A-Z]\s*$/,''));
      if(!title||title.length<2)continue;
      seen[key]=1;out.push({kind:'collection',url:u,title:title,img:img,imgRef:b,count:count,desc:count?'视频数量：'+count:''});
    }
    return out;
  }
  function parseGeneric(src,b){
    var vids=parseVideos(src,b);if(vids.length)return vids;
    var out=[],seen={},re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,u,title,inner,ctx,img,k;
    while((m=re.exec(s(src)))&&out.length<80){
      u=abs(m[2],b);if(origin(u)!==origin(b))continue;if(/(?:login|register|privacy|terms|dmca|contact|faq|dizhi|javascript:)/i.test(u))continue;
      k=u.replace(/[?#].*$/,'');if(seen[k])continue;inner=m[4];title=cleanTitle(attr(m[1]+' '+m[3],'title')||strip(inner));if(!title||title.length<4||title.length>160||/^(?:首页|更多|搜索|登录|注册|最新地址|返回|顶部)$/i.test(title))continue;
      ctx=context(src,m.index,900,1800);img=imageFrom(inner,u)||imageFrom(ctx,u);seen[k]=1;out.push({kind:hrefType(u),url:u,title:title,img:img,imgRef:b,desc:''});
    }
    return out;
  }
  function buildCard(x,i){
    var isSet=x.kind==='collection',isVideo=x.kind==='video',title=(isSet&&isFav(x.url)?'★ ':'')+x.title;
    var ct=(isVideo||isSet)?'movie_2':(x.img?'movie_1_left_pic':'text_1');
    var pic=imageUrl(x.img,x.imgRef||x.url);
    return{title:title,desc:x.desc||'',img:(isVideo||isSet)?pic:(x.img?pic:''),url:detailUrl(x),col_type:ct,extra:{lineVisible:false,id:'p91-'+x.kind+'-'+i}};
  }
  function renderRows(d,rows){for(var i=0;i<rows.length;i++)d.push(buildCard(rows[i],i));}
  function addPage(u,n){var p=pageNo();if(p<=1)return u;if(/[?&]page=\d+/i.test(u))return u.replace(/([?&]page=)\d+/i,'$1'+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p;}
  var CATALOG=[
    {name:'91视频',main:'/comic/index/video?category=play',items:[['热门排行榜','/comic/index/video?category=now_month_hot'],['国产原创','/comic/index/video?category=original'],['吃瓜爆料','/comic/index/search?keyword='+encodeURIComponent('吃瓜 黑料 爆料')],['熟女做爱','/comic/index/search?keyword='+encodeURIComponent('熟女')],['可爱萝莉','/comic/index/search?keyword='+encodeURIComponent('萝莉')],['成人动漫','/comic/index/search?keyword='+encodeURIComponent('动漫')],['大屌黑人','/comic/index/search?keyword='+encodeURIComponent('黑人')],['童颜巨乳','/comic/index/search?keyword='+encodeURIComponent('巨乳')],['少妇换妻','/comic/index/search?keyword='+encodeURIComponent('换妻')],['内射中出','/comic/index/search?keyword='+encodeURIComponent('内射')],['会所按摩','/comic/index/search?keyword='+encodeURIComponent('按摩')],['91探花','/comic/index/search?keyword='+encodeURIComponent('探花')],['家庭乱伦','/comic/index/search?keyword='+encodeURIComponent('乱伦')],['三级片','/comic/index/search?keyword='+encodeURIComponent('三级片')]]},
    {name:'91短视频',main:'/melonshort',items:[['高燃混剪','/melonshort/cat/hunjian'],['反差系列','/melonshort/cat/fancha'],['网红达人','/melonshort/cat/wanghong'],['明星大瓜','/melonshort/cat/mingxing'],['原创自拍','/melonshort/cat/zipai'],['素人自拍','/melonshort/cat/amateur']]},
    {name:'黑料吃瓜',main:'/黑料吃瓜/推荐',items:[['今日吃瓜','/黑料吃瓜/今日吃瓜/最新'],['学生校园','/黑料吃瓜/学生校园/推荐'],['明星黑料','/黑料吃瓜/明星黑料/推荐'],['网红黑料','/黑料吃瓜/网红黑料/推荐'],['每日大赛','/黑料吃瓜/每日大赛/推荐'],['名人合集','/黑料吃瓜/名人合集/推荐']]},
    {name:'AI成人',main:'/comic/index/search?keyword='+encodeURIComponent('ai成人'),items:[['AI成人短剧','/comic/index/search?keyword='+encodeURIComponent('ai短剧')],['AI漫剧','/comic/index/search?keyword='+encodeURIComponent('ai漫剧')],['AI美女','/comic/index/search?keyword='+encodeURIComponent('ai美女')],['AI换脸','/comic/index/search?keyword='+encodeURIComponent('ai换脸')],['91成人短剧','/comic/index/search?keyword='+encodeURIComponent('短剧')]]},
    {name:'日本AV',main:'/comic/index/search?keyword='+encodeURIComponent('中文字幕'),items:[['多P群交','/comic/index/search?keyword='+encodeURIComponent('群交')],['无码解放','/comic/index/search?keyword='+encodeURIComponent('无码')],['中文字幕','/comic/index/search?keyword='+encodeURIComponent('中文字幕')],['制服诱惑','/comic/index/search?keyword='+encodeURIComponent('制服')],['黑人专区','/comic/index/search?keyword='+encodeURIComponent('黑人')],['SM调教','/comic/index/search?keyword='+encodeURIComponent('SM')]]},
    {name:'91动漫',main:'/comic/index/search?keyword='+encodeURIComponent('动漫'),items:[['成人动漫','/comic/index/search?keyword='+encodeURIComponent('成人动漫')],['日本动漫','/comic/index/search?keyword='+encodeURIComponent('日本动漫')],['国产动漫','/comic/index/search?keyword='+encodeURIComponent('国产动漫')],['3d动漫','/comic/index/search?keyword='+encodeURIComponent('3d动漫')],['同人动漫','/comic/index/search?keyword='+encodeURIComponent('同人动漫')],['动漫合集','/moviesets/chengrendongman']]},
    {name:'精选合集',main:'/moviesets',items:[['后入精选','/moviesets/hourujingxuan'],['瘦猴探花','/moviesets/souhoutanhua'],['口爆吞精','/moviesets/koubaotunjing'],['小欣奈','/moviesets/xiaoxinnai'],['小宝寻花','/moviesets/xiaobaoxunhua'],['性感黑丝','/moviesets/xingganheisi']]},
    {name:'色情小说',main:'/novels',items:[['都市激情','/novels/dushi-jiqing/new'],['校园之恋','/novels/xiaoyuan-zhilian/new'],['人妻熟女','/novels/renqi-shunv/new'],['家庭乱伦','/novels/jiating-luanlun/new']]}
  ];
  function routeFor(name,path){var u=abs(path,base());if(/\/moviesets(?:\/|$|\?)/i.test(u)){if(/\/moviesets\/[^/?#]+/i.test(u))return page('p91t3SetDetail',{p91_url:u,p91_title:name});return page('p91t3Sets',{p91_url:u});}return page('p91t3Feed',{p91_url:u,p91_title:name,p91_kind:/novels/i.test(u)?'novel':(/黑料吃瓜/i.test(u)?'article':'video')});}
  function quick(d){
    var root=ASSET_ROOT,a=[['全部分类','category.svg','p91t3Category'],['精选合集','collection.svg','p91t3Sets'],['我的合集','favorite.svg','p91t3SetFavs'],['搜索','search.svg','p91t3Search']];
    for(var i=0;i<a.length;i++)d.push({title:a[i][0],img:root+a[i][1],url:page(a[i][2]),col_type:'icon_4',extra:{lineVisible:false}});
    d.push(line());
  }
  function home(){
    var d=[],p=pageNo(),cur=getMyVar(HOME_SORT_KEY,'play')||'play';setPageTitle('91porna');
    var sorts=[['正在播放','play'],['当前最热','now_hot'],['最近更新','new_update'],['91原创','original'],['本月最热','now_month_hot']];
    if(p===1){
      d.push({title:'搜索 91porna',desc:'视频 / 标签 / 关键词',col_type:'input',url:"(function(){var q=String(input||'').trim();if(!q)return 'toast://请输入关键词';return 'hiker://page/p91t3Search?rule=&simple=true&p91_q='+encodeURIComponent(q);})()",extra:{titleVisible:true}});
      quick(d);
      for(var i=0;i<sorts.length;i++)d.push(chip(sorts[i][0],cur===sorts[i][1],$('#noLoading#').lazyRule(function(k){putMyVar('p91_home_sort_v3',k);refreshPage(false);return'hiker://empty';},sorts[i][1])));
      d.push(line());
    }
    try{
      var u=addPage(base()+'/comic/index/video?category='+encodeURIComponent(cur),p),src=requestText(u),rows=parseVideos(src,u);
      enrichCovers(rows,16);
      renderRows(d,rows);
      if(!rows.length)d.push(empty('暂无视频','当前分类暂未解析到内容。'));
    }catch(e){d.push(empty('首页加载失败',s(e.message||e),page('p91t3Diag')));}
    setResult(d);
  }
  function categoryHub(){
    var d=[];setPageTitle('91porna · 全部分类');
    d.push(section('全部分类','按原网站侧栏完整收录；广告与外站入口不纳入分类。'));
    for(var g=0;g<CATALOG.length;g++){
      var x=CATALOG[g];
      d.push({title:'▌'+x.name,desc:'进入 '+x.name,url:routeFor(x.name,x.main),col_type:'text_1',extra:{lineVisible:false}});
      for(var i=0;i<x.items.length;i++)d.push(chip(x.items[i][0],false,routeFor(x.items[i][0],x.items[i][1]),'flex_button'));
      d.push(line());
    }
    setResult(d);
  }
  function feed(){
    var d=[],title=param('p91_title','分类内容'),kind=param('p91_kind','video'),u=param('p91_url',base()+'/comic/index/video?category=play'),p=pageNo();
    setPageTitle('91porna · '+title);
    try{u=addPage(u,p);var src=requestText(u),rows=kind==='video'?parseVideos(src,u):parseGeneric(src,u);if(kind==='video')enrichCovers(rows,16);if(p===1)d.push(section(title,rows.length?'本页 '+rows.length+' 条':'当前无结果'));renderRows(d,rows);if(!rows.length)d.push(empty('没有解析到内容','该栏目可能使用不同模板；继续按实机结果适配。',u));}catch(e){d.push(empty('栏目加载失败',s(e.message||e),u));}setResult(d);
  }
  function search(){
    var d=[],q=param('p91_q',param('kw','')),p=pageNo();setPageTitle('91porna · 搜索');
    d.push({title:'搜索',desc:'输入关键词',col_type:'input',url:"(function(){var q=String(input||'').trim();if(!q)return 'toast://请输入关键词';return 'hiker://page/p91t3Search?rule=&simple=true&p91_q='+encodeURIComponent(q);})()",extra:{defaultValue:q,titleVisible:true}});
    if(!q){d.push(empty('输入关键词开始搜索','搜索结果按源站视频搜索返回。'));setResult(d);return;}
    try{var u=addPage(base()+'/comic/index/search?keyword='+encodeURIComponent(q),p);var rows=parseVideos(requestText(u),u);enrichCovers(rows,16);if(p===1)d.push(section('搜索：'+q,'本页 '+rows.length+' 条'));renderRows(d,rows);if(!rows.length)d.push(empty('没有搜索结果','可换一个关键词。'));}catch(e){d.push(empty('搜索失败',s(e.message||e)));}setResult(d);
  }
  function favs(){try{var j=JSON.parse(getItem(FAV_KEY,'{}')||'{}');return j&&typeof j==='object'?j:{};}catch(e){return{};}}
  function isFav(u){return!!favs()[u];}
  function toggleFav(o){var j=favs(),u=s(o.url);if(j[u]){delete j[u];setItem(FAV_KEY,JSON.stringify(j));return false;}j[u]={url:u,title:s(o.title),img:s(o.img),count:s(o.count),time:Date.now()};setItem(FAV_KEY,JSON.stringify(j));return true;}
  function parseLetters(src,b){var out=[{name:'全部',url:base()+'/moviesets'}],seen={'全部':1},re=/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,m,t,u;while((m=re.exec(s(src)))){t=strip(m[2]).toUpperCase();if(!/^[A-Z]$/.test(t)||seen[t])continue;u=abs(m[1],b);if(!/moviesets/i.test(u))continue;seen[t]=1;out.push({name:t,url:u});}if(out.length===1){for(var c=65;c<=90;c++)out.push({name:String.fromCharCode(c),url:base()+'/moviesets?letter='+String.fromCharCode(c)});}return out;}
  function collections(){
    var d=[],requested=param('p91_url',''),active=requested||getMyVar(SETS_URL_KEY,base()+'/moviesets')||base()+'/moviesets';setPageTitle('91porna · 精选合集');
    try{var src=requestText(active),letters=parseLetters(src,active),rows=parseCollections(src,active);enrichCovers(rows,16);if(pageNo()===1){for(var i=0;i<letters.length;i++){var x=letters[i],on=(active===x.url)||(active.replace(/\/$/,'')===x.url.replace(/\/$/,''));d.push(chip(x.name,on,$('#noLoading#').lazyRule(function(u){putMyVar('p91_sets_url_v3',u);refreshPage(false);return'hiker://empty';},x.url),'scroll_button'));}d.push(line());}renderRows(d,rows);if(!rows.length)d.push(empty('暂未解析到合集','源站 /moviesets 结构可能发生变化，请把页面截图发我。',active));}catch(e){d.push(empty('合集加载失败',s(e.message||e),active));}setResult(d);
  }
  function collectionDetail(){
    var d=[],u=param('p91_url',''),seedTitle=param('p91_title','合集'),seedImg=param('p91_img',''),seedCount=param('p91_count',''),title=seedTitle,img=seedImg,count=seedCount,rows=[];setPageTitle('91porna · '+seedTitle);
    try{var src=requestText(u),cm=src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||src.match(/<title[^>]*>([\s\S]*?)<\/title>/i);if(cm&&strip(cm[1]))title=strip(cm[1]).replace(/\s*[-|].*$/,'');img=img||metaImage(src,u)||imageFrom(src,u);var ctm=src.match(/视频数量\s*[:：]?\s*([\d,]+)/i);if(ctm)count=ctm[1];rows=parseVideos(src,u);}catch(e){d.push(empty('合集详情读取失败',s(e.message||e),u));}
    d.unshift({title:title,desc:(count?'视频数量：'+count+' · ':'')+(isFav(u)?'已收藏合集':'可收藏合集'),img:img?imageUrl(img,u):ASSET_ROOT+'logo.svg',url:u,col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.splice(1,0,{title:isFav(u)?'取消合集收藏':'收藏合集',desc:isFav(u)?'从“我的合集”移除':'保存合集入口、封面和数量到本机',url:$('#noLoading#').lazyRule(function(j){var o=JSON.parse(j),on=$.require('p91t3').toggleCollectionFavorite(o);refreshPage(false);return'toast://'+(on?'已收藏合集':'已取消收藏');},JSON.stringify({url:u,title:title,img:img,count:count})),col_type:'text_2',extra:{lineVisible:false}});
    d.splice(2,0,{title:'打开原网页',desc:'用于核对源站合集页面',url:u,col_type:'text_2',extra:{lineVisible:false}});d.splice(3,0,line());d.splice(4,0,section('合集视频',rows.length?'共解析 '+rows.length+' 条':'暂无已解析视频'));renderRows(d,rows);setResult(d);
  }
  function collectionFavs(){
    var d=[],j=favs(),a=[],k;setPageTitle('91porna · 我的合集');for(k in j)a.push(j[k]);a.sort(function(x,y){return Number(y.time||0)-Number(x.time||0);});d.push(section('我的合集','本机收藏，不依赖源站账号'));for(var i=0;i<a.length;i++){var x=a[i];d.push({title:'★ '+x.title,desc:x.count?'视频数量：'+x.count:'已收藏',img:imageUrl(x.img,x.url),url:page('p91t3SetDetail',{p91_url:x.url,p91_title:x.title,p91_img:x.img,p91_count:x.count}),col_type:(x.img?'movie_2':'text_2'),extra:{lineVisible:false}});}if(!a.length)d.push(empty('还没有收藏合集','进入“精选合集”，打开合集后点击“收藏合集”。',page('p91t3Sets')));setResult(d);
  }
  function extractPlay(src,b){var arr=[],seen={},patterns=[/(?:source|video_url|videoUrl|playUrl|url)\s*[:=]\s*["'](https?:\\?\/\\?\/[^"']+?\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/ig,/(https?:\\?\/\\?\/[^\s"'<>]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>]*)?)/ig];for(var i=0;i<patterns.length;i++){var re=patterns[i],m;while((m=re.exec(s(src)))&&arr.length<8){var u=html(m[1]).replace(/\\\//g,'/').replace(/\\u0026/g,'&');if(!/^https?:\/\//i.test(u))u=abs(u,b);if(!seen[u]){seen[u]=1;arr.push(u);}}}return arr;}
  function detail(){
    var d=[],u=param('p91_url',''),seedTitle=param('p91_title','视频详情'),seedImg=param('p91_img',''),title=seedTitle,img=seedImg,desc='',plays=[];setPageTitle('91porna · 详情');
    try{var src=requestText(u,{referer:base()+'/'}),hm=src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);if(hm&&strip(hm[1]))title=strip(hm[1]);img=img||metaImage(src,u)||imageFrom(src,u);var intro=src.match(/(?:视频简介|简介)[\s\S]{0,300}?<(?:p|div)[^>]*>([\s\S]{20,1800}?)<\/(?:p|div)>/i);if(intro)desc=strip(intro[1]);plays=extractPlay(src,u);}catch(e){d.push(empty('详情解析失败',s(e.message||e),u));}
    d.unshift({title:title,desc:desc||'91porna 视频',img:img?imageUrl(img,u):ASSET_ROOT+'logo.svg',url:u,col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    if(plays.length){d.splice(1,0,{title:'立即播放',desc:plays.length>1?'已解析 '+plays.length+' 条媒体地址':'已解析直链',url:$('#noLoading#').lazyRule(function(a,ref){var x=JSON.parse(a),hs=[],ns=[];for(var i=0;i<x.length;i++){hs.push({'User-Agent':'Mozilla/5.0','Referer':ref});ns.push('线路 '+(i+1));}if(x.length===1)return x[0]+'#isVideo=true#';return JSON.stringify({urls:x,names:ns,headers:hs});},JSON.stringify(plays),u),col_type:'text_1',extra:{lineVisible:false,cls:'playlist video'}});}else{d.splice(1,0,{title:'网页辅助播放',desc:'当前仍未解析到直链时使用源站播放页兜底',url:'video://'+u,col_type:'text_1',extra:{lineVisible:false,cls:'playlist video'}});}d.splice(2,0,{title:'源网页',desc:'核对详情 / 评论 / 登录能力',url:u,col_type:'text_2',extra:{lineVisible:false}});setResult(d);
  }
  function diag(){var d=[];setPageTitle('91porna · 诊断');d.push({title:'运行版本',desc:VERSION+' · Build '+BUILD,url:'hiker://empty',col_type:'text_1'});d.push({title:'当前站点',desc:base(),url:base(),col_type:'text_1'});d.push({title:'收藏合集',desc:String(Object.keys(favs()).length)+' 个',url:page('p91t3SetFavs'),col_type:'text_1'});d.push({title:'Test3',desc:'视频双列卡片；首页热门/更新等改为页内切换；封面解析扩展任意 data-* / JSON 字段，并对缺失封面使用 batchFetch 并发详情补全与缓存。',url:'hiker://empty',col_type:'long_text'});setResult(d);}
  function module(){return{home:home,categoryHub:categoryHub,feed:feed,search:search,collections:collections,collectionDetail:collectionDetail,collectionFavs:collectionFavs,detail:detail,diag:diag,toggleCollectionFavorite:toggleFav,version:VERSION,build:BUILD};}
  return{version:VERSION,build:BUILD,module:module};
})();
