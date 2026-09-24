/* Test17: restore exact reading-source image scan and avoid empty webRule playback. */
(function(K,R){
  if(!K||!R||R.version!=='0.1.0-test.16')throw Error('Test17 requires Test16');
  var oldDetail=R.detail,oldMedia=R.media,C=K.C,s=K.s,param=K.param,safe=K.safeDecode,page=K.page;
  function urlHost(u){var m=s(u).match(/^https?:\/\/[^/]+/i);return m?m[0]:'';}
  function sourceImages(html,url,type){
    var scope=K.domHtml(html,type==='comic'?'.comic-img-box&&Html':type==='amateur'?'.amateur-image&&Html':'.photo-image&&Html'),out=[],seen={},re=/https?:\/\/[^\s"'<>]+?\.(?:webp|jpe?g|png|gif)(?:\?[^\s"'<>]*)?/ig,m,u;
    while((m=re.exec(scope||''))){u=K.decode(m[0]).replace(/\\\//g,'/').replace(/&amp;/ig,'&');if(!seen[u]){seen[u]=1;out.push(u);}}
    // The uploaded source treats the absolute URLs inside the content container as authoritative.
    if(out.length)return out;
    return K.extractImagesFallback(html,url,type);
  }
  K.extractImagesFallback=K.extractImages;K.extractImages=sourceImages;
  function imageMode(){try{return getItem('xc_img_route_v1','source')||'source';}catch(e){return'source';}}
  function imageUrl(u,type){var mode=imageMode(),ref=type==='comic'?C.comic+'/':C.primary+'/';if(mode==='none')return s(u);if(mode==='host')ref=urlHost(u)+'/';return s(u)+'@headers='+JSON.stringify({'Referer':ref,'User-Agent':C.ua});}
  K.contentImage=function(u,type){return imageUrl(u,type);};
  K.coverFor=function(u,base,type){return imageUrl(u,type);};
  var oldReader=R.reader;
  R.reader=function(){var type=param('t','');if(type==='fiction')return oldReader();var url=safe(param('xc_url','')),r=K.fetchPage(url,type),imgs=K.extractImages(r.html,r.url,type),d=[];setPageTitle(type==='comic'?'🎨 漫画阅读':'🖼️ 套图阅读');
    var modes=[['源站 Referer','source'],['图片域 Referer','host'],['无附加 Header','none']];for(var j=0;j<modes.length;j++)d.push({title:(imageMode()===modes[j][1]?'● ':'')+modes[j][0],url:$('#noLoading#').lazyRule(function(v){setItem('xc_img_route_v1',v);refreshPage(false);return'hiker://empty';},modes[j][1]),col_type:'scroll_button'});
    if(!imgs.length)d.push(K.empty('未取得图片地址','页面 '+(r.ok?'已获取':'获取失败')+' · '+r.via));
    for(var i=0;i<imgs.length;i++){var src=K.contentImage(imgs[i],type);d.push({title:'',img:src,pic_url:src,url:src,col_type:'pic_1_full',extra:{lineVisible:false}});}
    if(imgs.length)d.push({title:'图片诊断 · '+imgs.length+' 张',desc:'首图域名：'+urlHost(imgs[0])+' · 点击查看原图 URL',url:imgs[0],col_type:'text_1'});
    d.push({title:'🌐 原站',url:'web://'+url,col_type:'text_1'});setResult(d);};
  var oldCard=K.cardFromBlock;
  K.cardFromBlock=function(block,base,type){var item=oldCard(block,base,type),style='',m,u;
    if(!item)return item;
    try{style=s(K.domHtml(block,'.img&&style')||'');}catch(e){}
    m=style.match(/url\(\s*['"]([^'"]+)['"]\s*\)/i);
    if(m){u=K.abs(K.decode(m[1]).replace(/\\\//g,'/'),base);if(u){item.rawImg=u;item.img=K.coverFor(u,base,type);}}
    return item;
  };
  var oldModel=K.modelMeta;
  K.modelMeta=function(html,url){var m=oldModel(html,url),raw='';
    try{raw=K.domUrl(html,'.model-avatar&&img&&data-original',url)||K.domUrl(html,'.model-avatar&&img&&data-src',url)||K.domUrl(html,'.model-avatar&&img&&src',url)||K.domUrl(html,'.model-info&&img&&src',url)||'';}catch(e){}
    if(raw)m.cover=K.abs(raw,url); // Direct image URL: model avatar is not necessarily served with the primary domain Referer.
    if(/这个人很懒/.test(m.desc))m.desc='这个人很懒，什么都没留下';
    return m;
  };
  function videoDetail(){
    var d=[],url=safe(param('xc_url','')),res=K.fetchPage(url,'video'),info=K.detailInfo(res.html,res.url,'video'),media=K.mediaFromHtml(res.html,res.url,'video'),tags=K.detailTags(res.html,res.url,'video'),i;
    setPageTitle(info.title);d.push({title:info.title,desc:'💽 视频',img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    for(i=0;i<tags.length;i++)if(tags[i].kind==='model'&&tags[i].href)d.push({title:'👩 '+tags[i].name,url:page('xchinaModel',{xc_url:tags[i].href,t:'model'}),col_type:'scroll_button'});
    if(media.length)d.push({title:'▶️ 直接播放',desc:'已从页面正片容器取得 M3U8',url:K.playMedia(media[0],res.url),col_type:'text_center_1'});
    else d.push({title:'🌐 打开原网页播放器',desc:'当前未提取到正片地址；不再打开会返回空链接的 webRule',url:'x5://'+res.url,col_type:'text_center_1'});
    d.push({title:'🔎 播放诊断',desc:'查看源页面状态及直链候选',url:page('xchinaMedia',{xc_url:res.url,t:'video'}),col_type:'text_2'});
    setResult(d);
  }
  R.videoDetail=videoDetail;R.detail=function(){var u=safe(param('xc_url','')),t=param('t','');if(t==='video'||(!t&&/\/video\//.test(u)))return videoDetail();return oldDetail();};
  R.media=function(){var d=[],u=safe(param('xc_url','')),r=K.fetchPage(u,'video'),m=K.mediaFromHtml(r.html,r.url,'video');setPageTitle('播放诊断');d.push(K.section('源页面','获取：'+(r.ok?'成功':'失败')+' · '+r.via+' · HTML '+s(r.html).length+' 字符 · M3U8 '+m.length+' 条'));
    for(var i=0;i<m.length;i++)d.push({title:'▶️ 正片候选 '+(i+1),desc:urlHost(m[i]),url:K.playMedia(m[i],r.url),col_type:'text_1'});
    d.push({title:'🌐 原网页播放器',url:'x5://'+r.url,col_type:'text_1'});setResult(d);};
  R.version=K.version='0.1.0-test.17';R.build=K.build=10117;
})(XChinaTest9Core,XChinaRemoteRuntime);
