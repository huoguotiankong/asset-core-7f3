// ACFun v0.4.4 - hierarchical categories + cached m3u8 playback
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.4';
ac.runtimeMode='hierarchy-category-cachem3u8-044';

try{
    if(!getItem('acfun_migrated_044','')){
        clearMyVar('acfun_classify_id');
        clearMyVar('acfun_classify_parent');
        clearMyVar('acfun_classify_tag');
        clearMyVar('acfun_classify_child_id');
        try{if(typeof ac.__v042Delete==='function'){ac.__v042Delete('category-list');ac.__v042Delete('category-list-v043');}}catch(e0){}
        setItem('acfun_migrated_044','1');
    }
}catch(e){}

ac.__v044Arr=function(v){
    if(Array.isArray(v))return v;
    if(!v||typeof v!=='object')return [];
    var ks=['list','items','records','rows','classifyList','dataList','content'];
    for(var i=0;i<ks.length;i++)if(Array.isArray(v[ks[i]]))return v[ks[i]];
    if(v.data&&Array.isArray(v.data))return v.data;
    return [];
};
ac.__v044Pick=function(o,ks,def){
    o=o||{};for(var i=0;i<ks.length;i++){var v=o[ks[i]];if(v!==undefined&&v!==null&&v!=='')return v;}return def===undefined?'':def;
};
ac.__v044Children=function(o){
    if(!o||typeof o!=='object')return [];
    var ks=['children','childList','childrenList','classifyList','subList','subClassifyList','tagList','tags','videoTagList','videoTags','classifyTagList','labels'];
    for(var i=0;i<ks.length;i++)if(Array.isArray(o[ks[i]])&&o[ks[i]].length)return o[ks[i]];
    return [];
};
ac.__v044Node=function(o,isChild){
    o=o||{};
    var id=ac.__v044Pick(o,isChild?['tagId','videoTagId','classifyId','id','typeId']:['classifyId','id','videoTypeId','typeId'],'');
    var name=ac.__v044Pick(o,isChild?['tagsTitle','tagTitle','tagName','classifyTitle','classifyName','title','name','label']:['classifyTitle','classifyName','videoTypeName','title','name'],'');
    var parent=ac.__v044Pick(o,['parentId','pid','parentClassifyId','parent_id','upId'],'');
    var tag=ac.__v044Pick(o,['tagsTitle','tagTitle','tagName','videoTag','label'],'');
    var c=ac.__v044Children(o),children=[];
    for(var i=0;i<c.length;i++){
        var n=ac.__v044Node(c[i],true);if(n.name)children.push(n);
    }
    return {id:String(id||''),name:String(name||''),parentId:String(parent||''),tag:String(tag||''),children:children,raw:o};
};

ac.categoryTree=function(force){
    var key='category-tree-v044',c=(typeof ac.__v042Read==='function'?ac.__v042Read(key,21600,172800):{hit:false,stale:false,data:null});
    if(!force&&c.stale&&Array.isArray(c.data)&&c.data.length)return c.data;
    var raw=null,arr=[],nodes=[],byId={},roots=[];
    try{raw=ac.__v043Api('video/classifyList',{restricted:0},{timeout:1300,maxAttempts:2});}catch(e){try{setItem('acfun_last_classify_error',String(e.message||e));}catch(e0){}}
    arr=ac.__v044Arr(raw);
    for(var i=0;i<arr.length;i++){
        var n=ac.__v044Node(arr[i],false);if(!n.name)continue;nodes.push(n);if(n.id)byId[n.id]=n;
    }
    // Flat responses are rebuilt by parentId/pid.
    for(var j=0;j<nodes.length;j++){
        var x=nodes[j];
        if(x.parentId&&byId[x.parentId]&&byId[x.parentId]!==x){
            var p=byId[x.parentId],child={id:x.id,name:x.name,parentId:x.parentId,tag:x.tag||x.name,children:x.children,raw:x.raw};
            var exists=false;for(var q=0;q<p.children.length;q++)if((p.children[q].id&&p.children[q].id===child.id)||p.children[q].name===child.name){exists=true;break;}
            if(!exists)p.children.push(child);
        }else roots.push(x);
    }
    // If every item looked flat but no explicit roots survived, preserve server order.
    if(!roots.length)roots=nodes;
    if(!roots.length&&typeof ac.__v043FallbackCategories!=='undefined'){
        roots=ac.__v043FallbackCategories.map(function(z){return {id:String(z.classifyId||''),name:String(z.classifyTitle||''),parentId:'',tag:'',children:[],raw:z};});
    }
    if(typeof ac.__v042Write==='function'&&roots.length)ac.__v042Write(key,roots);
    return roots.length?roots:(c.hit&&Array.isArray(c.data)?c.data:[]);
};
ac.categoryList=function(){
    return ac.categoryTree(false).map(function(x){return {classifyId:x.id,classifyTitle:x.name,classifyName:x.name,name:x.name,children:x.children,raw:x.raw};});
};

ac.__v044SelectedParent=function(tree){
    tree=tree||ac.categoryTree(false);var pid=String(getMyVar('acfun_classify_parent','')||getMyVar('acfun_classify_id','')||'');
    var p=null;for(var i=0;i<tree.length;i++)if(String(tree[i].id)===pid){p=tree[i];break;}
    if(!p&&tree.length){p=tree[0];putMyVar('acfun_classify_parent',String(p.id||''));putMyVar('acfun_classify_id',String(p.id||''));}
    return p;
};

var __v044PrevVideoList=ac.videoList;
ac.videoList=function(tab,page){
    tab=String(tab||'recommend');page=Number(page||1);
    if(tab!=='classify')return __v044PrevVideoList.call(ac,tab,page);
    var tree=ac.categoryTree(false),p=ac.__v044SelectedParent(tree),pid=p?String(p.id||''):'',tag=String(getMyVar('acfun_classify_tag','')||''),childId=String(getMyVar('acfun_classify_child_id','')||'');
    var size=Number(getItem('acfun_page_size','8'))||8,key='list-v044|'+pid+'|'+tag+'|'+childId+'|'+page+'|'+size,ttl=Number(getItem('acfun_page_cache_seconds','300'))||300,stale=Number(getItem('acfun_stale_cache_seconds','3600'))||3600,c=(typeof ac.__v042Read==='function'?ac.__v042Read(key,ttl,stale):{hit:false,fresh:false,stale:false,data:null});
    if((c.fresh||(getItem('acfun_instant_switch','1')==='1'&&c.stale))&&Array.isArray(c.data))return c.data;
    var list=[],data=null;
    try{
        if(tag){
            data=ac.__v043Api('video/tagTitleList',{tagsTitle:tag,page:page,pageNum:page,pageSize:size,limit:size,sortType:0,restricted:0},{timeout:1300,maxAttempts:2});
        }else{
            var cid=childId||pid;
            data=ac.__v043Api('video/getByClassify',{classifyId:(/^\d+$/.test(cid)?Number(cid):cid),page:page,pageNum:page,pageSize:size,limit:size,sortType:0,restricted:0},{timeout:1300,maxAttempts:2});
        }
        list=ac.flattenVideos?ac.flattenVideos(data):ac.__v044Arr(data);if(!list.length)list=ac.__v044Arr(data);
    }catch(e){try{setItem('acfun_last_list_error',String(e.message||e));}catch(e0){}}
    if(list.length&&typeof ac.__v042Write==='function'){ac.__v042Write(key,list);return list;}
    if(c.hit&&Array.isArray(c.data))return c.data;
    return list;
};

// Compact navigation; category hierarchy itself is rendered inline, not in the old popup.
ac.nav=function(d){
    var tabs=[['推荐','recommend'],['最新','new'],['热门','hot'],['分类','classify'],['短视频','short']],cur=getMyVar('acfun_tab','recommend');
    for(var i=0;i<tabs.length;i++)(function(t){d.push({title:cur===t[1]?'““””<b><font color="#17A673">'+t[0]+'</font></b>':t[0],col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_tab',v);refreshPage(false);return 'hiker://empty';},t[1])});})(tabs[i]);
    d.push({title:'收藏',col_type:'scroll_button',url:'hiker://page/acfun_favorites?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'历史',col_type:'scroll_button',url:'hiker://page/acfun_history?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'设置',col_type:'scroll_button',url:'hiker://page/acfun_settings?rule=ACFun&simple=true#noRecordHistory#'});
};

ac.__v044CategoryBars=function(d){
    var tree=ac.categoryTree(false),p=ac.__v044SelectedParent(tree),pid=p?String(p.id||''):'',curTag=String(getMyVar('acfun_classify_tag','')||''),curChild=String(getMyVar('acfun_classify_child_id','')||'');
    if(!tree.length){d.push({title:'分类数据暂不可用',col_type:'text_center_1',url:'hiker://empty'});return;}
    d.push({title:'<small><b>频道</b></small>',col_type:'rich_text',url:'hiker://empty'});
    for(var i=0;i<tree.length;i++)(function(x){d.push({title:String(x.id)===pid?'““””<b><font color="#17A673">'+x.name+'</font></b>':x.name,col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(id){putMyVar('acfun_classify_parent',String(id));putMyVar('acfun_classify_id',String(id));clearMyVar('acfun_classify_tag');clearMyVar('acfun_classify_child_id');refreshPage(false);return 'hiker://empty';},x.id)});})(tree[i]);
    var children=p&&Array.isArray(p.children)?p.children:[];
    if(children.length){
        d.push({title:'<small><b>细分</b></small>',col_type:'rich_text',url:'hiker://empty'});
        d.push({title:(!curTag&&!curChild)?'““””<b><font color="#17A673">全部</font></b>':'全部',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){clearMyVar('acfun_classify_tag');clearMyVar('acfun_classify_child_id');refreshPage(false);return 'hiker://empty';})});
        for(var j=0;j<children.length;j++)(function(x){var tag=String(x.tag||x.name||''),cid=String(x.id||''),selected=(tag&&curTag===tag)||(!tag&&cid&&curChild===cid);d.push({title:selected?'““””<b><font color="#17A673">'+x.name+'</font></b>':x.name,col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(tag,id){if(tag){putMyVar('acfun_classify_tag',tag);clearMyVar('acfun_classify_child_id');}else{clearMyVar('acfun_classify_tag');putMyVar('acfun_classify_child_id',id);}refreshPage(false);return 'hiker://empty';},tag,cid)});})(children[j]);
    }
};

// Rebuild only the home composition. Existing card/image/cache adapters remain untouched.
ac.home=function(){
    var d=[],tab=getMyVar('acfun_tab','recommend');
    if(typeof MY_PAGE==='undefined'||MY_PAGE===1){
        d.push({title:'搜索',desc:'搜索视频 / UP / 标签',col_type:'input',url:$.toString(function(){if(!input)return 'hiker://empty';return 'hiker://search?s='+encodeURIComponent(input)+'&rule=ACFun';}),extra:{defaultValue:''}});
        ac.nav(d);
        if(tab==='classify')ac.__v044CategoryBars(d);
    }
    var list=[];try{list=ac.videoList(tab,typeof MY_PAGE==='undefined'?1:MY_PAGE)||[];}catch(e){try{setItem('acfun_last_home_error',String(e.message||e));}catch(e0){}}
    for(var i=0;i<list.length;i++)ac.addVideoCard(d,list[i],'movie_2');
    if(!list.length&&(typeof MY_PAGE==='undefined'||MY_PAGE===1))d.push({title:'暂未获取到内容',desc:tab==='classify'?'可切换上方频道/细分分类后重试':'可点击其它频道后重试',col_type:'long_text',url:'hiker://empty'});
    setResult(d);
};

// Playback v0.4.4: always obtain a fresh watch path when possible, then cache
// the decoded HLS index locally so Hiker fixes segment/key paths before playback.
ac.__v044PlayerHeaders=function(){var h=ac.__v043GoodHost();return {'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36','Referer':h+'/','Origin':h};};
ac.play=function(id,raw,direct){
    id=String(id||'');var obj=ac.safeJson(raw)||{},path='',watchErr='';
    if(id){
        try{var w=ac.__v043Api('video/can/watch',{videoId:(/^\d+$/.test(id)?Number(id):id)},{method:'POST',write:true,allowGet:false,timeout:1600,maxAttempts:2});path=ac.__v043FirstString(w&&w.path!==undefined?w.path:w)||ac.__v043FirstString(w);}catch(e){watchErr=String(e.message||e);}
    }
    if(!path)path=String(direct||'').trim();
    if(!path)path=ac.__v043FirstString(obj.videoUrl)||ac.__v043FirstString(obj.playUrl)||ac.__v043FirstString(obj.videoUri)||ac.__v043FirstString(obj.path);
    var decode=ac.__v043DecodePlayUrl(path);if(!decode){try{setItem('acfun_last_play_error',watchErr||'no path');}catch(e0){}return 'toast://未获取到可播放地址';}
    var headers=ac.__v044PlayerHeaders(),url=decode,cacheErr='';
    try{
        var name='acfun_'+(id||'video')+'_'+Math.floor(Date.now()/300000)+'.m3u8';
        var local=cacheM3u8(decode+'#isM3u8#',{headers:headers,timeout:8000},name);
        if(local)url=String(local)+'#noPre#';
    }catch(e1){cacheErr=String(e1.message||e1);url=decode+'#noPre#';}
    try{setItem('acfun_last_play_path',path);setItem('acfun_last_play_decode',decode);setItem('acfun_last_play_cached',url);setItem('acfun_last_play_error',[watchErr,cacheErr].filter(function(x){return !!x;}).join(' | '));}catch(e2){}
    var ret={urls:[url],names:['播放'],headers:[headers]};
    try{var dm=ac.danmuFile(id);if(dm)ret.danmu=dm;}catch(e3){}
    return JSON.stringify(ret);
};

})();
