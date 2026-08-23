/* MyAv 0.1.0-test.6 - actor favorites + layout preferences + search history */
(function(C){
  if(!C)throw new Error('MyAvCore missing for Test6 core patch');
  C.version='0.1.0-test.6';
  C.build=10106;
  C.actorFavoritePath='hiker://files/rules/MyAv/actor_favorites.json';
  C.searchHistoryKey='myav_search_history_v1';

  C.readLocalJson=function(path,def){
    var raw='';try{raw=fetchPC(path)||'';}catch(e){}
    if(!raw)return def;
    try{return JSON.parse(raw);}catch(e2){return def;}
  };
  C.writeLocalJson=function(path,obj){try{writeFile(path,JSON.stringify(obj));return true;}catch(e){return false;}};
  C.actorFavoriteList=function(){var a=C.readLocalJson(C.actorFavoritePath,[]);return a instanceof Array?a:[];};
  C.isActorFavorite=function(key){var a=C.actorFavoriteList(),i;for(i=0;i<a.length;i++)if(C.s(a[i].key||a[i].href)===C.s(key))return true;return false;};
  C.toggleActorFavorite=function(item){
    item=item||{};var key=C.s(item.key||item.href),a=C.actorFavoriteList(),out=[],found=false,i;
    if(!key)return false;
    for(i=0;i<a.length;i++){if(C.s(a[i].key||a[i].href)===key){found=true;continue;}out.push(a[i]);}
    if(!found){item.key=key;item.savedAt=new Date().getTime();out.unshift(item);}
    if(out.length>300)out=out.slice(0,300);
    C.writeLocalJson(C.actorFavoritePath,out);return !found;
  };

  C.layoutKey=function(name){return'myav_layout_'+name;};
  C.layoutGet=function(name,def){var v='';try{v=getItem(C.layoutKey(name),def||'2');}catch(e){v=def||'2';}return v||def||'2';};
  C.layoutSet=function(name,value){try{setItem(C.layoutKey(name),String(value));return true;}catch(e){return false;}};
  C.layoutReset=function(){var xs=['home','search','actresses','entity','favorites'],i;for(i=0;i<xs.length;i++){try{clearItem(C.layoutKey(xs[i]));}catch(e){}}};

  C.searchHistory=function(){var raw='';try{raw=getItem(C.searchHistoryKey,'');}catch(e){}if(!raw)return[];try{var a=JSON.parse(raw);return a instanceof Array?a:[];}catch(e2){return[];}};
  C.pushSearchHistory=function(q){q=C.trim(q);if(!q)return;var a=C.searchHistory(),out=[q],i;for(i=0;i<a.length;i++)if(C.s(a[i])!==q)out.push(C.s(a[i]));if(out.length>10)out=out.slice(0,10);try{setItem(C.searchHistoryKey,JSON.stringify(out));}catch(e){}};
  C.clearSearchHistory=function(){try{clearItem(C.searchHistoryKey);}catch(e){}};

  C.indexUrlExact=function(label){
    var g=C.menuGroups?C.menuGroups():{tags:[]},a=g.tags||[],i,t;
    for(i=0;i<a.length;i++){t=C.menuText?C.menuText(a[i].text):C.trim(a[i].text);if(t===label)return a[i].href;}
    return'';
  };
  C.actorIndexDefs=function(){return[
    {id:'normalActress',label:'有码女优',etype:'actress',sec:'normal'},
    {id:'westernActress',label:'欧美女优',etype:'actress',sec:'western'},
    {id:'domesticActress',label:'国产女优',etype:'actress',sec:'domestic'},
    {id:'maleActor',label:'男优',etype:'actor',sec:'normal'}
  ];};
})(MyAvCore);
