/* 夜社短剧 Provider 0.1.0-test.5 */
var YesheProvider=(function(){
  var P=YesheProtocol,VERSION='0.1.0-test.5',BUILD=10105;
  var PAGER_KEY='yeshe_pager_mode_v2',SEARCH_KEY='yeshe_search_route_v2';
  var GROUPS=[
    {id:'video',name:'视频',items:['AI短剧','擦边短剧','国产视频','日本AV','欧美无码','韩国BJ']},
    {id:'anime',name:'动漫',items:['同人作品','动画卡通','3D动漫','中文动漫','里番','泡面番']},
    {id:'audio',name:'有声',items:['有声小说','淫词艳曲','激情强麦']},
    {id:'comic',name:'漫画',items:['韩国H漫','日本H漫','3D漫画']},
    {id:'photo',name:'写真',items:['素人系列','网红COS','机构套图','内购私拍','各国套图']},
    {id:'novel',name:'小说',items:['都市生活','学生校园','家庭乱伦','玄幻武侠','同人改编']}
  ];
  var SHORT_TABS=[
    {id:'hot',name:'热播',tid:''},{id:'yanqing',name:'言情',tid:'yanqing'},{id:'dushi',name:'都市',tid:'dushi'},
    {id:'guzhuang',name:'古装',tid:'guzhuang'},{id:'chuanyue',name:'穿越',tid:'chuanyue'},{id:'chongsheng',name:'重生',tid:'chongsheng'},
    {id:'nixi',name:'逆袭',tid:'nixi'},{id:'tianchong',name:'甜宠',tid:'tianchong'},{id:'xuanyi',name:'悬疑',tid:'xuanyi'}
  ];
  function s(v){return v==null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function norm(v){return P.clean(v).toLowerCase().replace(/[\s·•|｜\-—_\/\\:：，,。.!！?？()（）【】\[\]]+/g,'');}
  function pageNo(){var p=1;try{p=Number(MY_PAGE||1)||1;}catch(e){p=1;}return p<1?1:p;}
  function shortUrl(tid){var u=P.discover(false)+'/type/13.html?chl=yeshetv';if(tid)u+='&tid='+encodeURIComponent(tid);return u;}
  function kindPlayable(k){return k==='video'||k==='anime'||k==='audio';}
  function pageCandidates(base,page){
    if(page<=1)return[base];var a=[],mode=getItem(PAGER_KEY,''),u=s(base),q='',main=u,m;
    m=u.match(/([?#].*)$/);if(m){q=m[1];main=u.substring(0,u.length-q.length);}
    function byMode(x){
      if(x==='dash'&&/\.html$/i.test(main))return main.replace(/\.html$/i,'-'+page+'.html')+q;
      if(x==='query')return u+(u.indexOf('?')>=0?'&':'?')+'page='+page;
      if(x==='slash')return main.replace(/\/$/,'')+'/'+page+q;
      return'';
    }
    if(mode&&byMode(mode))a.push(byMode(mode));
    if(/\.html$/i.test(main))a.push(main.replace(/\.html$/i,'-'+page+'.html')+q);
    a.push(u+(u.indexOf('?')>=0?'&':'?')+'page='+page);
    a.push(main.replace(/\/$/,'')+'/'+page+q);
    return a;
  }
  function detectMode(base,chosen,page){
    if(page<=1)return;var main=s(base).replace(/([?#].*)$/,'');
    if(chosen.indexOf('page='+page)>=0)setItem(PAGER_KEY,'query');
    else if(new RegExp('-'+page+'\\.html(?:[?#]|$)','i').test(chosen))setItem(PAGER_KEY,'dash');
    else if(new RegExp('/'+page+'(?:[?#]|$)').test(chosen))setItem(PAGER_KEY,'slash');
  }
  function tagItems(items,kind){for(var i=0;i<(items||[]).length;i++)items[i].kind=kind||items[i].kind||'';return items||[];}
  function feed(base,page,kind){
    page=Number(page||1)||1;var cs=pageCandidates(base,page),best={items:[],url:cs[0],html:'',kind:kind||''},i,p,it;
    for(i=0;i<cs.length&&i<3;i++){
      p=P.requestUrl(cs[i],{timeout:10000});it=tagItems(P.cards(p.body,cs[i]),kind);
      if(it.length>best.items.length)best={items:it,url:cs[i],html:p.body,kind:kind||''};
      if(it.length>=6){detectMode(base,cs[i],page);break;}
    }
    return best;
  }
  function home(tab,page){
    var tid='',i;tab=s(tab||'hot');
    for(i=0;i<SHORT_TABS.length;i++)if(SHORT_TABS[i].id===tab){tid=SHORT_TABS[i].tid;break;}
    var r=feed(shortUrl(tid),page||pageNo(),'video');r.tab=tab;r.tabs=SHORT_TABS;return r;
  }
  function navIndex(nav){
    var byNorm={},all=nav.all||[],i,k;
    for(i=0;i<all.length;i++){k=norm(all[i].name);if(k&&!byNorm[k])byNorm[k]=all[i].url;}
    return byNorm;
  }
  function resolveCategory(name,nav){
    name=P.clean(name);if(!name)return'';
    if(name==='AI短剧'||name==='短剧'||name==='热播短剧')return shortUrl('');
    var map=nav.map||{},idx=navIndex(nav),n=norm(name),i,x,k,best='';
    if(map[name])return map[name];
    if(idx[n])return idx[n];
    for(i=0;i<(nav.all||[]).length;i++){
      x=nav.all[i];k=norm(x.name);
      if(!k||k.length<2)continue;
      if(k===n)return x.url;
      if((k.indexOf(n)>=0||n.indexOf(k)>=0)&&(!best||Math.abs(k.length-n.length)<best.diff))best={url:x.url,diff:Math.abs(k.length-n.length)};
    }
    return best&&best.url?best.url:'';
  }
  function catalog(){
    var n=P.navCached(false),groups=[],i,j,g,x,url,used={},extras=[];
    for(i=0;i<GROUPS.length;i++){
      g={id:GROUPS[i].id,name:GROUPS[i].name,items:[]};
      for(j=0;j<GROUPS[i].items.length;j++){
        x=GROUPS[i].items[j];url=resolveCategory(x,n);
        g.items.push({name:x,url:url,kind:GROUPS[i].id,available:!!url});
        if(url)used[url]=1;
      }
      groups.push(g);
    }
    for(i=0;i<(n.all||[]).length;i++){
      x=n.all[i];if(!x.url||used[x.url]||!x.name||x.name.length>14||/首页|更多|全部|登录|注册/i.test(x.name))continue;
      extras.push({name:x.name,url:x.url,kind:'unknown',available:true});used[x.url]=1;
    }
    return{groups:groups,extras:extras,host:n.host||P.discover(false),navCount:(n.all||[]).length,transport:n.transport||'',htmlLen:n.len||0};
  }
  function category(name,url,page,kind){
    name=P.clean(name);url=trim(url);kind=trim(kind)||'unknown';
    if(!url){var n=P.navCached(true);url=resolveCategory(name,n);}
    if(!url)return{items:[],url:'',html:'',error:'当前线路未解析到“'+name+'”的真实分类地址',kind:kind};
    var r=feed(url,page||pageNo(),kind);r.name=name;r.kind=kind;return r;
  }
  function formInfo(html,base){
    var forms=[],i,f,action='',name='';try{forms=pdfa(html,'form')||[];}catch(e){}
    for(i=0;i<forms.length;i++){
      f=s(forms[i]);if(!/(搜索|search|keyword|\bwd\b|name=["'](?:wd|keyword|key|q)["'])/i.test(f))continue;
      action=(f.match(/action\s*=\s*["']([^"']+)["']/i)||[])[1]||'';
      name=(f.match(/name\s*=\s*["'](wd|keyword|key|q)["']/i)||[])[1]||'wd';
      if(action)return{action:P.abs(action,base),name:name};
    }
    return null;
  }
  function searchCandidates(keyword){
    var host=P.discover(false),root=P.requestUrl(host+'/',{timeout:8000}).body,fi=formInfo(root,host),saved=getItem(SEARCH_KEY,''),a=[],enc=encodeURIComponent(keyword);
    if(saved)try{a.push(saved.replace('{kw}',enc));}catch(e){}
    if(fi)a.push(fi.action+(fi.action.indexOf('?')>=0?'&':'?')+fi.name+'='+enc);
    a.push(host+'/search/-------------.html?wd='+enc);
    a.push(host+'/search.html?wd='+enc);
    a.push(host+'/?s='+enc);
    return a;
  }
  function saveSearchTemplate(url,keyword){try{var enc=encodeURIComponent(keyword);if(enc&&url.indexOf(enc)>=0)setItem(SEARCH_KEY,url.replace(enc,'{kw}'));}catch(e){}}
  function search(keyword,page){
    keyword=trim(keyword);if(!keyword)return{items:[],url:'',html:'',error:''};
    var cs=searchCandidates(keyword),best={items:[],url:cs[0],html:''},i,r,p,it;
    for(i=0;i<cs.length&&i<4;i++){
      r=cs[i];
      if((page||pageNo())>1){p=feed(r,page||pageNo(),'unknown');it=p.items;}
      else{p=P.requestUrl(r,{timeout:10000});it=tagItems(P.cards(p.body,r),'unknown');p={items:it,url:r,html:p.body};}
      if(it.length>best.items.length)best=p;
      if(it.length>=3){saveSearchTemplate(r,keyword);break;}
    }
    best.keyword=keyword;return best;
  }
  function relatedCards(html,url,kind){
    var all=P.cards(html,url),cur=s(url),out=[],i;
    for(i=0;i<all.length&&out.length<18;i++)if(all[i].url!==cur){all[i].kind=kind||'unknown';out.push(all[i]);}
    return out;
  }
  function chapterLinks(html,url){
    var as=P.anchors(html,url),out=[],seen={},i,a;
    for(i=0;i<as.length&&out.length<300;i++){
      a=as[i];if(!/(\/read\/|\/chapter\/|\/novel\/read|\/book\/read)/i.test(a.href)||seen[a.href])continue;
      seen[a.href]=1;out.push({title:a.text||('章节'+(out.length+1)),url:a.href});
    }
    return out;
  }
  function summary(metaDesc,seedDesc){
    var x=P.clean(seedDesc)||P.clean(metaDesc)||'';
    x=x.replace(/为保证正常访问[\s\S]*$/,'').replace(/推荐使用(?:Chrome|Edge|Safari)[\s\S]*$/i,'');
    if(x.length>260)x=x.substring(0,260)+'…';
    return x;
  }
  function detail(url,seed){
    url=trim(url);seed=seed||{};
    var p=P.requestUrl(url,{timeout:11000}),html=p.body,m=P.meta(html,url),hint=trim(seed.kind)||'unknown';
    var title=P.clean(seed.title)||P.clean(m.title)||'夜社内容';
    if(/^(夜社|夜社短剧|首页|详情)$/i.test(title)&&seed.title)title=P.clean(seed.title);
    var cover=P.clean(seed.cover)||P.clean(m.cover),desc=summary(m.desc,seed.desc);
    var eps=[],chapters=[],article='',gallery=[],kind=hint,related=[];
    if(kindPlayable(kind)||/\/play\/\d+\/\d+\/\d+\.html/i.test(url)){
      kind=kindPlayable(kind)?kind:'video';
      eps=P.episodes(html,url,url);
      related=relatedCards(html,url,kind);
    }else if(kind==='comic'||kind==='photo'){
      gallery=P.gallery(html,url);related=relatedCards(html,url,kind);
    }else if(kind==='novel'){
      chapters=chapterLinks(html,url);article=P.article(html);related=relatedCards(html,url,kind);
    }else{
      eps=P.episodes(html,url,url);
      if(eps.length){kind='video';related=relatedCards(html,url,'video');}
      else{
        gallery=P.gallery(html,url);
        if(gallery.length>=5){kind='gallery';related=relatedCards(html,url,'gallery');}
        else{
          chapters=chapterLinks(html,url);
          if(chapters.length){kind='novel';article=P.article(html);}
          else{article=P.article(html);kind=article.length>120?'text':'unknown';}
          related=relatedCards(html,url,kind);
        }
      }
    }
    return{url:url,title:title,cover:cover,desc:desc,kind:kind,episodes:eps,chapters:chapters,article:article,gallery:gallery,related:related,html:html,status:p.status};
  }
  function toolLinks(){
    var n=P.navCached(false),as=n.all||[],want=['红灯秘境','每日签到','签到','闲聊吹水','登录','登陆'],out=[],seen={},i,j,a;
    for(i=0;i<want.length;i++)for(j=0;j<as.length;j++){a=as[j];if((a.name===want[i]||a.name.indexOf(want[i])>=0)&&!seen[a.url]){seen[a.url]=1;out.push(a);break;}}
    return out;
  }
  return{version:VERSION,build:BUILD,groups:GROUPS,shortTabs:SHORT_TABS,pageNo:pageNo,shortUrl:shortUrl,home:home,catalog:catalog,category:category,search:search,detail:detail,toolLinks:toolLinks,resolveCategory:resolveCategory};
})();