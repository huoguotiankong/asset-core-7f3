/* JavDB v3 Test57 · Homepage layout polish based on 2026-11-16 device screenshots.
 * Only modifies homepage presentation; no API, auth credentials or media pipeline.
 */
(function(J){
  if(!J)throw new Error('JavDB UI patch missing core');
  if(J.homeLayoutVersion==='3.9.57-test.1')return;
  J.homeLayoutVersion='3.9.57-test.1';
  var previous=J.home;
  if(typeof previous!=='function')throw new Error('JDB.home missing');
  var luckyUrl='hiker://page/javdb3Lucky?rule=&simple=true';
  function val(x){return String(x==null?'':x);}
  function polish(items){
    if(!(items instanceof Array)||Number(MY_PAGE||1)!==1)return items;
    var i,x,hasLucky=false,tabIdx=-1,lastTab=-1,actionCount=0;
    // Test55 inserted a full-width tile inside a group of 5 icon_5 shortcuts.
    // Remove only that duplicate, preserving the original quick actions.
    for(i=items.length-1;i>=0;i--){
      x=items[i]||{};
      if(val(x.url).indexOf('javdb3Lucky')>=0&&/手气不错/.test(val(x.title))){
        items.splice(i,1);
      }
    }
    for(i=0;i<items.length;i++){
      x=items[i]||{};
      if(x.col_type==='icon_5'&&/javdb3(?:Filters|RankHub|ActorHub|LibraryHub|MoreHub)/.test(val(x.url)))actionCount++;
      if(x.col_type==='scroll_button'){
        lastTab=i;
        if(/资讯/.test(val(x.title)))tabIdx=i;
      }
      // Search area: less whitespace and clearer action hierarchy.
      if(/搜索影片\s*\/\s*番号/.test(val(x.title))){
        x.title='🔍  搜索影片、番号、演员或系列';
        x.desc='';
        x.extra=x.extra||{};
        x.extra.lineVisible=false;
        x.extra.backgroundColor='#F1F6F3';
      }
      // On movie_2 cards Hiker paints 'desc' over the lower image.
      // Keep the number / useful badges but drop redundant YYYY-MM-DD clutter.
      if(/^movie_[23]$/.test(val(x.col_type))&&x.pic_url&&x.url&&/javdb3Detail/.test(val(x.url))){
        if(typeof x.desc==='string'){
          x.desc=x.desc.replace(/(?:\s*[·|]\s*)?\b\d{4}-\d{2}-\d{2}\b/g,'')
                       .replace(/^[\s·|]+|[\s·|]+$/g,'').replace(/\s{2,}/g,' ');
        }
        x.extra=x.extra||{};
        x.extra.lineVisible=false;
      }
    }
    if(lastTab>=0){
      // Native scroll buttons join a single horizontal row; don't disrupt icon_5 grouping.
      items.splice((tabIdx>=0?tabIdx:lastTab)+1,0,{
        title:'🎲 手气不错',url:luckyUrl,col_type:'scroll_button',
        extra:{backgroundColor:'#E9F5ED',lineVisible:false}
      });
    }else{
      // Unexpected older home layout: put a compact action after the search item,
      // never inside the five-icon row.
      var searchIdx=-1;
      for(i=0;i<items.length;i++)if(/搜索影片/.test(val(items[i]&&items[i].title))){searchIdx=i;break;}
      items.splice(searchIdx>=0?searchIdx+1:0,0,{
        title:'🎲 手气不错',url:luckyUrl,col_type:'text_center_1',
        extra:{backgroundColor:'#E9F5ED',lineVisible:false}
      });
    }
    J._homeLayout57={quickActions:actionCount,luckyCount:1,layout:'five-icon-row-plus-horizontal-lucky'};
    return items;
  }
  J.home=function(){
    var old=null,got=null,has=false,hooked=false,ret=null,err=null;
    try{old=setResult;setResult=function(v){got=v;has=true;};hooked=setResult!==old;}catch(e){hooked=false;}
    if(!hooked)return previous.call(this);
    try{ret=previous.call(this);}catch(e2){err=e2;}finally{setResult=old;}
    if(err)throw err;
    if(has)return old(polish(got));
    if(ret instanceof Array)return polish(ret);
    return ret;
  };
})(JDB);
