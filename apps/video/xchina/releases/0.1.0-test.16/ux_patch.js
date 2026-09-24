/* Test16: image extraction, model paging and collections, native UI. Test15 playback remains diagnostic. */
(function(K,R){
  if(!K||!R||R.version!=='0.1.0-test.15')throw Error('Test16 requires Test15');
  var oldDetail=R.detail, oldList=R.list, oldReader=R.reader, oldMedia=R.media;
  var C=K.C, S=K.s, D=K.decode, page=K.page, param=K.param, safe=K.safeDecode;
  function clean(u,base){u=D(S(u)).replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/');u=K.trim(u);if(!u||/^(?:data:|javascript:|about:|blob:)/i.test(u))return '';return K.abs(u,base);}
  function imageScope(html,type){var sel=type==='comic'?'.comic-img-box&&Html':type==='amateur'?'.amateur-image&&Html':'.photo-image&&Html';return K.domHtml(html,sel)||'';}
  K.extractImages=function(html,url,type){
    var scope=imageScope(html,type),out=[],seen={},m,u,attrs,re,css;
    if(!scope)return out;
    re=/<(?:img|source)\b[^>]*>/ig;
    while((m=re.exec(scope))){attrs=m[0];u='';
      var names=['data-original','data-src','data-lazy-src','data-url','src','srcset'];for(var ai=0;ai<names.length;ai++){var a=names[ai];
        var x=attrs.match(new RegExp('(?:^|\\s)'+a+'\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1','i'));
        if(x&&x[2]){u=x[2].split(',')[0].trim().split(/\s+/)[0];if(u&&!/^(?:data:|about:)/i.test(u))break;}
      }
      u=clean(u,url);if(u&&!seen[u]){seen[u]=1;out.push(u);}
    }
    css=/url\(\s*(["']?)([^"')]+)\1\s*\)/ig;
    while((m=css.exec(scope))){u=clean(m[2],url);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    return out;
  };
  // The original card parser can truncate style="...url(\'...\')..." at the inner quote.
  function cardImage(block,base,type){var tag=(S(block).match(/<[^>]*class=["\'][^"\']*\bimg\b[^"\']*["\'][^>]*>/i)||[])[0]||'',st='',m,u='';
    m=tag.match(/\bstyle\s*=\s*"([\s\S]*?)"/i)||tag.match(/\bstyle\s*=\s*'([\s\S]*?)'(?=\s|>)/i);if(m)st=m[1];
    m=st.match(/url\(\s*(["']?)([^"')]+)\1\s*\)/i);if(m)u=m[2];
    if(!u){var names=['data-original','data-src','data-lazy-src','data-poster','src'];for(var ai=0;ai<names.length;ai++){var a=names[ai];m=S(block).match(new RegExp('(?:^|\\s)'+a+'\\s*=\\s*(["\\\'])([^"\\\']+)\\1','i'));if(m&&m[2]&&!/^(?:data:|about:)/i.test(m[2])){u=m[2];break;}}}
    return clean(u,base);
  }
  var originalCard=K.cardFromBlock;
  K.cardFromBlock=function(block,base,type){var item=originalCard(block,base,type),img=cardImage(block,base,type);if(item&&img){item.rawImg=img;item.img=K.coverFor(img,base,type);}return item;};
  K.parseCards=function(html,base,type){var blocks=K.cardBlocks(html,type),out=[],seen={};for(var i=0;i<blocks.length;i++){var item=K.cardFromBlock(blocks[i],base,type);if(item&&!seen[item.href]){seen[item.href]=1;out.push(item);}}return out;};
  K.listResult=function(type,path){var r=K.fetchPage(path,type);return{r:r,items:K.parseCards(r.html,r.url,type)};};
  // A comic image is hosted independently; photo pages keep the main-site referer.
  K.contentImage=function(u,type){var ref=type==='comic'?C.comic+'/':C.primary+'/';u=clean(u,ref);if(!u)return'';var h={'User-Agent':C.ua,'Referer':ref};var cookie=K.cookieFor(u);if(cookie)h.Cookie=cookie;return u+'@headers='+JSON.stringify(h);};
  R.reader=function(){var type=param('t','');if(type==='fiction')return oldReader();var url=safe(param('xc_url','')),res=K.fetchPage(url,type),imgs=K.extractImages(res.html,res.url,type),d=[];setPageTitle(type==='comic'?'🎨 漫画阅读':'🖼️ 套图阅读');if(!imgs.length)d.push(K.empty('图片暂未解析','可通过原站入口核对当前页'));for(var i=0;i<imgs.length;i++){var img=K.contentImage(imgs[i],type);d.push({title:'',img:img,pic_url:img,url:img,col_type:'pic_1_full',extra:{lineVisible:false}});}d.push({title:'🌐 原站',url:'web://'+url,col_type:'text_1'});setResult(d);};
  function favorites(){try{return JSON.parse(getItem('xc_model_favorites_v1','{}')||'{}');}catch(e){return {};}}
  function favButton(url,title){var on=!!favorites()[url];return {title:on?'♥ 已收藏模特':'♡ 收藏模特',desc:on?'点击取消收藏':'保存到本机，方便再次查看',url:$('#noLoading#').lazyRule(function(u,t){var k='xc_model_favorites_v1',x={};try{x=JSON.parse(getItem(k,'{}')||'{}');}catch(e){}if(x[u])delete x[u];else x[u]=t;setItem(k,JSON.stringify(x));refreshPage(false);return'toast://收藏已更新';},url,title),col_type:'text_2',extra:{lineVisible:false}};}
  function modelDetail(){var url=safe(param('xc_url','')),res=K.fetchPage(url,'model'),m=K.modelMeta(res.html,res.url),items=K.parseCards(res.html,res.url,'video'),count=K.modelCount(res.html),all=K.modelAllUrl(res.html,res.url)||url,title=m.name||'模特',d=[];setPageTitle(title);d.push({title:title,desc:'👩 模特 · '+(count||items.length)+' 部作品',img:m.cover,pic_url:m.cover,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});d.push(favButton(url,title));d.push({title:'📚 查看全部视频 · '+(count||items.length)+' ›',desc:'继续下滑可加载下一页',url:page('xchinaCatalog',{t:'video',name:title+' · 全部视频',xc_path:all,model_all:'1'})+'&page=fypage',col_type:'text_center_1',extra:{lineVisible:false}});if(m.desc)d.push({title:m.desc,url:'hiker://empty',col_type:'long_text'});d.push(K.section('💽 最新作品','预览 '+Math.min(6,items.length)+' 部'));for(var i=0;i<Math.min(6,items.length);i++)d.push(K.card(items[i]));if(!items.length)d.push(K.empty('没有解析到作品','可在原站检查'));d.push({title:'🌐 原站',url:'web://'+url,col_type:'text_1'});setResult(d);}
  R.modelDetail=modelDetail;
  R.detail=function(){var url=safe(param('xc_url','')),type=param('t','');if(type==='model'||(!type&&/\/models?\//.test(url)))return modelDetail();return oldDetail();};
  R.list=function(){if(param('model_all','')!=='1')return oldList();var p=K.currentPage(),base=safe(param('xc_path','')),r=K.modelAllResult(base,p),d=[];if(p===1)d.push(K.section('🎬 全部视频',r.max?'共 '+r.max+' 页 · 下滑继续加载':'下滑继续加载'));for(var i=0;i<r.items.length;i++)d.push(K.card(r.items[i]));if(!r.items.length&&p===1)d.push(K.empty('没有解析到模特作品',r.r.url));setResult(d);};R.catalog=R.list;
  R.home=function(){var type=getMyVar('xc_home_type','photo'),p=K.currentPage(),r=K.listResult(type,K.listPath(type,p)),d=[];if(p===1){d.push({title:'小黄书 · 发现',desc:'小说 / 套图 / 漫画 / 视频',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});K.tabs(d,'xc_home_type',type);[['🔎 搜索','xchinaSearch'],['🗂 分类','xchinaCategories'],['👩 模特','xchinaCatalog'],['♥ 收藏','xchinaFavorites'],['⚙️ 设置','xchinaSettings']].forEach(function(x){d.push(K.btn(x[0],page(x[1],x[1]==='xchinaCatalog'?{t:'model',name:'模特'}:{})));});d.push(K.section(K.typeIcon(type)+' '+K.typeName(type)+' · 最新',''));}if(!r.items.length)d.push(K.empty('没有解析到内容',r.r.url));for(var i=0;i<r.items.length;i++)d.push(K.card(r.items[i]));setResult(d);};
  R.favorites=function(){var f=favorites(),d=[],keys=Object.keys(f);setPageTitle('♥ 收藏的模特');d.push(K.section('♥ 已收藏模特',keys.length+' 位'));keys.forEach(function(u){d.push({title:'👩 '+f[u],url:page('xchinaModel',{xc_url:u,t:'model'}),col_type:'text_1'});});if(!keys.length)d.push(K.empty('暂无收藏','在模特详情页点击收藏'));setResult(d);};
  var originalModule=R.module;R.module=function(){var m=originalModule();m.favorites=R.favorites;return m;};
  R.media=oldMedia;R.version=K.version='0.1.0-test.16';R.build=K.build=10116;
})(XChinaTest9Core,XChinaRemoteRuntime);
