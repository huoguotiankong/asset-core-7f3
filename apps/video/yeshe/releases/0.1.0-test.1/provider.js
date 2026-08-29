/* 夜社短剧 Provider 0.1.0-test.1 */
var YesheProvider=(function(){
  var P=YesheProtocol,VERSION='0.1.0-test.1',BUILD=10101;
  var PAGER_KEY='yeshe_pager_mode_v1',SEARCH_KEY='yeshe_search_route_v1';
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
  function pageNo(){var p=1;try{p=Number(MY_PAGE||getParam('page')||1)||1;}catch(e){try{p=Number(getParam('page')||1)||1;}catch(e2){p=1;}}return p<1?1:p;}
  function shortUrl(tid){var u=P.discover(false)+'/type/13.html?chl=yeshetv';if(tid)u+='&tid='+encodeURIComponent(tid);return u;}
  function pageCandidates(base,page){
    if(page<=1)return[base];var a=[],mode=getItem(PAGER_KEY,''),u=s(base),hash='',q='',main=u,m;
    m=u.match(/([?#].*)$/);if(m){hash=m[1];main=u.substring(0,u.length-hash.length);q=hash;}
    function byMode(x){
      if(x==='dash'&&/\.html$/i.test(main))return main.replace(/\.html$/i,'-'+page+'.html')+q;
      if(x==='query')return u+(u.indexOf('?')>=0?'&':'?')+'page='+page;
      if(x==='slash')return main.replace(/\/$/,'')+'/'+page+q;
      return'';
    }
    if(mode&&byMode(mode))a.push(byMode(mode));
    if(/\.html$/i.test(main))a.push(main.replace(/\.html$/i,'-'+page+'.html')+q);
    a.push(u+(u.indexOf('?')>=0?'&':'?')+'page='+page);a.push(main.replace(/\/$/,'')+'/'+page+q);
    return a;
  }
  function detectMode(base,chosen,page){
    if(page<=1)return;var main=s(base).replace(/([?#].*)$/,'');if(chosen.indexOf('page='+page)>=0)setItem(PAGER_KEY,'query');else if(new RegExp('-'+page+'\\.html(?:[?#]|$)','i').test(chosen))setItem(PAGER_KEY,'dash');else if(new RegExp('/'+page+'(?:[?#]|$)').test(chosen))setItem(PAGER_KEY,'slash');
  }
  function feed(base,page){
    page=Number(page||1)||1;var cs=pageCandidates(base,page),best={items:[],url:cs[0],html:''},i,p,it;
    for(i=0;i<cs.length&&i<3;i++){
      p=P.requestUrl(cs[i],{timeout:10000});it=P.cards(p.body,cs[i]);
      if(it.length>best.items.length)best={items:it,url:cs[i],html:p.body};if(it.length>=6){detectMode(base,cs[i],page);break;}
    }
    return best;
  }
  function home(tab,page){
    var tid='',i;tab=s(tab||'hot');for(i=0;i<SHORT_TABS.length;i++)if(SHORT_TABS[i].id===tab){tid=SHORT_TABS[i].tid;break;}
    var r=feed(shortUrl(tid),page||pageNo());r.tab=tab;r.tabs=SHORT_TABS;return r;
  }
  function catalog(){
    var n=P.navCached(false),map=n.map||{},groups=[],i,j,g,x,url,used={};
    for(i=0;i<GROUPS.length;i++){g={id:GROUPS[i].id,name:GROUPS[i].name,items:[]};for(j=0;j<GROUPS[i].items.length;j++){x=GROUPS[i].items[j];url=map[x]||'';g.items.push({name:x,url:url});if(url)used[x]=1;}groups.push(g);}
    var extras=[];for(i=0;i<(n.all||[]).length;i++){x=n.all[i];if(!used[x.name]&&x.name&&x.name.length<=12&&!/首页|更多|短剧|全部/i.test(x.name))extras.push(x);}
    return{groups:groups,extras:extras,host:n.host||P.discover(false)};
  }
  function category(name,url,page){
    name=s(name);url=s(url);if(!url){var n=P.navCached(true);url=(n.map||{})[name]||'';}if(!url)return{items:[],url:'',html:'',error:'未解析到“'+name+'”的分类地址'};
    var r=feed(url,page||pageNo());r.name=name;return r;
  }
  function formInfo(html,base){
    var forms=[],i,f,action='',name='';try{forms=pdfa(html,'form')||[];}catch(e){}
    for(i=0;i<forms.length;i++){f=s(forms[i]);if(!/(搜索|search|keyword|\bwd\b|name=["'](?:wd|keyword|key|q)["'])/i.test(f))continue;action=(f.match(/action\s*=\s*["']([^"']+)["']/i)||[])[1]||'';name=(f.match(/name\s*=\s*["'](wd|keyword|key|q)["']/i)||[])[1]||'wd';if(action)return{action:P.abs(action,base),name:name};}
    return null;
  }
  function searchCandidates(keyword){
    var host=P.discover(false),root=P.requestUrl(host+'/',{timeout:8000}).body,fi=formInfo(root,host),saved=getItem(SEARCH_KEY,''),a=[];
    keyword=encodeURIComponent(keyword);
    if(saved){try{a.push(saved.replace('{kw}',keyword));}catch(e){}}
    if(fi){var sep=fi.action.indexOf('?')>=0?'&':'?';a.push(fi.action+sep+fi.name+'='+keyword);}
    a.push(host+'/search/-------------.html?wd='+keyword);
    a.push(host+'/search.html?wd='+keyword);
    a.push(host+'/?s='+keyword);
    return a;
  }
  function saveSearchTemplate(url,keyword){
    try{var enc=encodeURIComponent(keyword);if(enc&&url.indexOf(enc)>=0)setItem(SEARCH_KEY,url.replace(enc,'{kw}'));}catch(e){}
  }
  function search(keyword,page){
    keyword=s(keyword).replace(/^\s+|\s+$/g,'');if(!keyword)return{items:[],url:'',html:'',error:''};
    var cs=searchCandidates(keyword),best={items:[],url:cs[0],html:''},i,r,p,it;
    for(i=0;i<cs.length&&i<4;i++){
      r=cs[i];if((page||pageNo())>1){p=feed(r,page||pageNo());it=p.items;}else{p=P.requestUrl(r,{timeout:10000});it=P.cards(p.body,r);p={items:it,url:r,html:p.body};}
      if(it.length>best.items.length)best=p;if(it.length>=3){saveSearchTemplate(r,keyword);break;}
    }
    best.keyword=keyword;return best;
  }
  function relatedCards(html,url){var all=P.cards(html,url),cur=s(url),out=[],i;if(!all.length)return out;for(i=0;i<all.length&&out.length<18;i++)if(all[i].url!==cur)out.push(all[i]);return out;}
  function chapterLinks(html,url){
    var as=P.anchors(html,url),out=[],seen={},i,a;if(!as.length)return out;
    for(i=0;i<as.length&&out.length<300;i++){a=as[i];if(!/(\/read\/|\/chapter\/|\/novel\/read|\/book\/read)/i.test(a.href))continue;if(seen[a.href])continue;seen[a.href]=1;out.push({title:a.text||('章节'+(out.length+1)),url:a.href});}return out;
  }
  function detail(url,seed){
    url=s(url);seed=seed||{};var p=P.requestUrl(url,{timeout:11000}),html=p.body,m=P.meta(html,url),eps=P.episodes(html,url,url),chapters=chapterLinks(html,url),article=P.article(html),gallery=P.gallery(html,url),related=relatedCards(html,url);
    var title=m.title||s(seed.title)||'夜社内容',cover=m.cover||s(seed.cover),desc=m.desc||s(seed.desc);
    var kind='unknown';if(eps.length||/\/play\//i.test(url))kind='video';else if(chapters.length)kind='book';else if(article.length>120)kind='text';else if(gallery.length>=3)kind='gallery';
    return{url:url,title:title,cover:cover,desc:desc,kind:kind,episodes:eps,chapters:chapters,article:article,gallery:gallery,related:related,html:html,status:p.status};
  }
  function toolLinks(){
    var n=P.navCached(false),as=n.all||[],want=['红灯秘境','每日签到','签到','闲聊吹水','登录','登陆'],out=[],seen={},i,j,a;
    for(i=0;i<want.length;i++)for(j=0;j<as.length;j++){a=as[j];if((a.name===want[i]||a.name.indexOf(want[i])>=0)&&!seen[a.url]){seen[a.url]=1;out.push(a);break;}}
    return out;
  }
  return{version:VERSION,build:BUILD,groups:GROUPS,shortTabs:SHORT_TABS,pageNo:pageNo,shortUrl:shortUrl,home:home,catalog:catalog,category:category,search:search,detail:detail,toolLinks:toolLinks};
})();