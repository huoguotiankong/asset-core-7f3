/* Pornhub Remote Core Patch 0.1.0-test.5 */
(function(){
  if(typeof PornhubCore!=='object')throw new Error('PornhubCore missing for Test5 core patch');
  var C=PornhubCore;
  C.version='0.1.0-test.5';
  C.build=10105;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/bootstrap_test_v5_b10105.js?v=10105';
  C.categoryZhKey='ph_category_zh_v5';
  C.creatorAvatarCachePrefix='ph_creator_avatar_v5_';

  C.categoryKey=function(name,url){
    var u=C.clean(url),m=u.match(/\/categories\/([^\/?#]+)/i),k=m?m[1]:C.clean(name);
    try{k=decodeURIComponent(k);}catch(e){}
    return C.clean(k).toLowerCase().replace(/&/g,'and').replace(/[_\s]+/g,'-').replace(/[^a-z0-9\u4e00-\u9fff-]+/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
  };
  C.categoryZhFallback={
    '18-25':'18-25岁','180-1':'180°','2d':'2D','360-1':'360°','3d':'3D','60fps-1':'60帧',
    'ai':'AI生成','ai-gay':'AI男同','ai-straight':'AI异性恋','amateur':'业余自拍','amateur-gay':'业余男同','amateur-lesbian':'业余女同',
    'anal':'肛交','anal-lesbian':'女同肛交','arab':'阿拉伯','arab-lesbian':'阿拉伯女同','asian':'亚洲人','asian-gay':'亚洲男同','asian-lesbian':'亚洲女同',
    'babe':'美女','babysitter-18':'保姆','bareback-gay':'无套男同','bbw':'大码丰腴','bbw-lesbian':'大码女同','bear-gay':'熊系男同',
    'behind-the-scenes':'幕后花絮','big-ass':'大屁股','big-ass-lesbian':'大屁股女同','big-dick':'大鸡巴','big-dick-gay':'大鸡巴男同',
    'big-tits':'巨乳','big-tits-lesbian':'巨乳女同','bisexual-male':'双性恋男性','black':'黑人','black-gay':'黑人男同',
    'blonde':'金发','blonde-lesbian':'金发女同','blowjob':'口交','blowjob-gay':'男同口交','bondage':'捆绑','brazilian':'巴西',
    'brazilian-lesbian':'巴西女同','british':'英国','brunette':'棕发','bukkake':'多人颜射','butch-lesbian':'T女同',
    'cartoon':'卡通','cartoon-gay':'男同卡通','cartoon-lesbian':'女同卡通','celebrity':'名人','college':'大学生','compilation':'合集',
    'cosplay':'角色扮演','creampie':'中出','cuckold':'绿帽','cumshot':'射精','double-penetration':'双插','ebony':'黑人女性',
    'european':'欧洲','exclusive':'独家','female-orgasm':'女性高潮','fetish':'恋物','fingering':'指交','fisting':'拳交',
    'french':'法国','funny':'搞笑','gangbang':'多人群交','german':'德国','handjob':'手交','hardcore':'重口硬核','hd-porn':'高清',
    'hentai':'成人动漫','indian':'印度','interracial':'跨种族','italian':'意大利','japanese':'日本人','korean':'韩国人',
    'latina':'拉丁裔','lesbian':'女同','massage':'按摩','masturbation':'自慰','mature':'熟女','milf':'熟女人妻',
    'mom':'妈妈系','muscular-men':'肌肉男','orgy':'群交','party':'派对','pissing':'尿液','pov':'第一视角','public':'公共场所',
    'red-head':'红发','role-play':'角色扮演','rough-sex':'粗暴性爱','russian':'俄罗斯','school':'校园','small-tits':'小胸',
    'solo-female':'女性单人','solo-male':'男性单人','squirt':'潮吹','squirting':'潮吹','teen':'年轻女孩','threesome':'三人',
    'toys':'情趣玩具','transgender':'跨性别','verified-amateurs':'认证业余','verified-models':'认证模特','vintage':'复古',
    'webcam':'网络直播','young-and-old':'老少配'
  };
  C.readCategoryZhMap=function(){
    try{var o=JSON.parse(getItem(C.categoryZhKey,'{}'));return o&&typeof o==='object'?o:{};}catch(e){return{};}
  };
  C.writeCategoryZhMap=function(o){try{setItem(C.categoryZhKey,JSON.stringify(o||{}));}catch(e){}};
  C.cleanCategoryLabel=function(v){
    var s=C.clean(v).replace(/[\d,.]+\s*Videos?/ig,'').replace(/\bVideos?\b/ig,'').replace(/\s+/g,' ');
    return C.trim(s);
  };
  C.learnCategoryZh=function(html,base){
    var a=C.allAnchors(html,base||C.base()),map=C.readCategoryZhMap(),changed=false,i,it,k,n;
    for(i=0;i<a.length;i++){
      it=a[i];if(!(/\/categories\//i.test(it.href)||/[?&]c=\d+/i.test(it.href)))continue;
      n=C.cleanCategoryLabel(it.text||it.title);if(!n||n.length>36)continue;
      k=C.categoryKey(n,it.href);if(!k)continue;
      if(/[\u4e00-\u9fff]/.test(n)&&map[k]!==n){map[k]=n;changed=true;}
    }
    if(changed)C.writeCategoryZhMap(map);
    return map;
  };
  C.zhCategory=function(name,url){
    var k=C.categoryKey(name,url),map=C.readCategoryZhMap(),n=map[k]||C.categoryZhFallback[k]||'';
    if(n)return n;
    var base=k.replace(/-(?:gay|lesbian)$/,'');
    if(/-gay$/.test(k)){
      n=map[base]||C.categoryZhFallback[base]||C.clean(name).replace(/[-_]+/g,' ');
      return n+'·男同';
    }
    if(/-lesbian$/.test(k)){
      n=map[base]||C.categoryZhFallback[base]||C.clean(name).replace(/[-_]+/g,' ');
      return n+'·女同';
    }
    return C.clean(name).replace(/[-_]+/g,' ');
  };
  C.categoryGroup=function(name,url){
    var k=C.categoryKey(name,url);
    if(/lesbian/.test(k))return'lesbian';
    if(/(?:^|-)gay(?:-|$)|bear-gay|bisexual-male|muscular-men/.test(k))return'gay';
    return'straight';
  };
  C.parseCategoryCards=function(html,base){
    var s=C.s(html),a=C.allAnchors(s,base||C.base()),out=[],seen={},i,it,ctx,img,n,k;
    for(i=0;i<a.length;i++){
      it=a[i];if(!(/\/categories\//i.test(it.href)||/[?&]c=\d+/i.test(it.href)))continue;
      ctx=C.context(s,it.index,450,1000);
      img=it.img||C.imgFrom(ctx,it.href);if(!img)continue;
      n=C.cleanCategoryLabel(it.text||it.title);
      if(!n){var m=ctx.match(/(?:alt|title)=[\"']([^\"']{1,80})[\"']/i);n=m?C.cleanCategoryLabel(m[1]):'';}
      if(!n)continue;k=C.categoryKey(n,it.href);if(!k||seen[k])continue;seen[k]=1;
      out.push({key:k,name:C.zhCategory(n,it.href),rawName:n,url:it.href,rawImg:img,img:C.image(img,it.href),group:C.categoryGroup(n,it.href)});
    }
    return out;
  };
  C.categoriesLocalized=function(force){
    var a=C.categories(!!force),out=[],i,x,n;
    for(i=0;i<a.length;i++){x=a[i];n=C.zhCategory(x.name,x.url);out.push({id:x.id,name:n,rawName:x.name,url:x.url,group:C.categoryGroup(x.name,x.url)});}
    return out;
  };
  C.categoryHub=function(force){
    var u=C.base()+'/categories',h=C.fetchText(u,{force:!!force,ttl:30*60*1000}),cn='',cards;
    if(!C.isBad(h))C.learnCategoryZh(h,u);
    try{cn=C.fetchText('https://cn.pornhub.com/categories',{force:false,ttl:6*60*60*1000,timeout:7000});}catch(e){cn='';}
    if(cn&&!C.isBad(cn))C.learnCategoryZh(cn,'https://cn.pornhub.com/categories');
    cards=C.parseCategoryCards(cn&&!C.isBad(cn)?cn:h,cn&&!C.isBad(cn)?'https://cn.pornhub.com/categories':u);
    return{url:u,cards:cards,all:C.categoriesLocalized(false)};
  };

  C.creatorAvatar=function(url,seedHtml){
    var key=C.creatorAvatarCachePrefix+C.hash(url),old=C.clean(getItem(key,'')),img='',h='';
    if(old)return old;
    if(seedHtml&&C.profileAvatar)img=C.profileAvatar(seedHtml,url);
    if(!img){
      h=C.fetchText(url,{ttl:30*60*1000,auth:C.accountReady(),timeout:9000});
      if(!C.isBad(h))img=(C.profileAvatar?C.profileAvatar(h,url):'')||C.meta(h,'og:image')||'';
    }
    img=C.abs(img,url);
    if(img&&!/(default|placeholder|blank|loading)/i.test(img)){try{setItem(key,img);}catch(e){}return img;}
    return'';
  };
  C.authorFrom=function(html){
    var s=C.s(html),a=C.allAnchors(s,C.base()),best=null,bestScore=-1,i,it,t,n,ctx,img,score;
    for(i=0;i<a.length;i++){
      it=a[i];t=C.profileType(it.href);if(!t)continue;
      n=C.clean(it.text||it.title);if(!n||n.length>100||(C.isBadProfileLabel&&C.isBadProfileLabel(n)))continue;
      ctx=C.context(s,it.index,1800,2600);score=1;
      if(/Video Underplayer|usernameBadgesWrapper|underplayer|videoUploader|userInfo|userAvatar|video-author|videoAuthor/i.test((it.raw||'')+ctx))score+=20;
      if(/class=[\"'][^\"']*(?:bolded|username|userName)/i.test(it.raw||''))score+=6;
      if(t==='model'||t==='pornstar'||t==='channel')score+=2;
      if(score>bestScore){bestScore=score;best={it:it,type:t,name:n,ctx:ctx};}
    }
    if(!best)return null;
    img=best.it.img||(C.profileAvatar?C.profileAvatar(best.ctx,best.it.href):'')||C.imgFrom(best.ctx,best.it.href);
    img=C.abs(img,best.it.href);
    if(!img||/(default|placeholder|blank|loading)/i.test(img))img=C.creatorAvatar(best.it.href,best.ctx);
    return{url:best.it.href,name:best.name,type:best.type,rawImg:img,img:C.image(img,best.it.href)};
  };

  var detail4=C.detail;
  C.detail=function(html,url){
    var x=detail4(html,url),i;
    if(x&&x.categories)for(i=0;i<x.categories.length;i++)x.categories[i].name=C.zhCategory(x.categories[i].name,x.categories[i].url);
    if(x&&x.tags)for(i=0;i<x.tags.length;i++)x.tags[i].name=C.zhCategory(x.tags[i].name,x.tags[i].url);
    return x;
  };

  C.commentCandidateUrls=function(html,url){
    var s=C.s(html),out=[],seen={},re=/(?:data-(?:comment|comments|load|ajax)[^=]{0,30}|href)\s*=\s*[\"']([^\"']*comment[^\"']*)[\"']/ig,m,u;
    while((m=re.exec(s))){u=C.abs(m[1],url);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    return out.slice(0,6);
  };
  C.commentPayloadHtml=function(raw){
    raw=C.s(raw);if(!raw)return'';
    try{
      var j=JSON.parse(raw),parts=[],keys=['html','content','comments','result','template'],i,v;
      for(i=0;i<keys.length;i++){v=j&&j[keys[i]];if(typeof v==='string')parts.push(v);else if(v&&typeof v.html==='string')parts.push(v.html);}
      if(parts.length)return parts.join('\n');
    }catch(e){}
    return raw;
  };
  C.comments=function(url){
    var h=C.fetchText(url,{force:false,ttl:2*60*1000,auth:C.accountReady()}),a=C.parseComments(h,url),count=C.commentCount(h),cands,i,raw,hh,more;
    if(!a.length){
      cands=C.commentCandidateUrls(h,url);
      for(i=0;i<cands.length;i++){
        raw=C.accountReady()?C.fetchAuthPage(cands[i],{ttl:60*1000,timeout:9000}):C.fetchText(cands[i],{ttl:60*1000,timeout:9000});
        hh=C.commentPayloadHtml(raw);more=C.parseComments(hh,cands[i]);
        if(more.length){a=more;break;}
      }
    }
    return{url:url,comments:a,count:count,html:h};
  };
})();