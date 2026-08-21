/**
 * ACFun 0.5.0-rc2 / Build 151
 * Native UI polish + compact taxonomy patch.
 * Loaded after acfun_ui_v050_rc1.js.
 */
(function(){
    if (typeof ac === 'undefined' || !ac) return;

    ac.build = '2026.08.21-v0.5.0-rc2';
    ac.runtimeMode = 'test-ui-v050-rc2';

    var ACCENT = '#FF5A4E';
    var TEXT = '#555555';
    var MUTED = '#999999';
    var ASSET = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';

    function str(v){ return String(v === undefined || v === null ? '' : v); }
    function esc(v){
        return str(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function clip(v,n){
        var s=str(v).replace(/\s+/g,' ').trim();
        n=Number(n||20);
        return s.length>n?s.slice(0,n-1)+'…':s;
    }
    function cleanRows(rows){
        var out=[],seen={}; rows=rows||[];
        for(var i=0;i<rows.length;i++){
            var x=rows[i]||{},id=str(x.id),name=str(x.name).replace(/\s+/g,' ').trim();
            if(!id||!name)continue;
            if(/^[>›»→▶]+$/.test(name))continue;
            var k=id+'|'+name;if(seen[k])continue;seen[k]=1;
            out.push({id:id,name:name,value:x.value,raw:x.raw});
        }
        return out;
    }
    function selectedTitle(name,on){
        name=esc(name);
        return on?('<b><font color="'+ACCENT+'">'+name+'</font></b>'):('<font color="'+TEXT+'">'+name+'</font>');
    }
    function sectionName(s){
        return ({featured:'精选',comic:'漫画',anime:'动漫',video:'视频',lifan:'里番',short:'短视频'})[s]||'内容';
    }
    function asset(name){ return ASSET+name+'.svg'; }
    function currentPage(){
        try{return Math.max(1,Number(MY_PAGE||1)||1);}catch(e){return 1;}
    }

    ac.__v050Sorts=[
        {name:'综合',value:'0'},
        {name:'最新',value:'1'},
        {name:'最多观看',value:'2'},
        {name:'最多点赞',value:'3'}
    ];

    // 每个主栏目保存自己的排序，切栏目不再互相覆盖。
    ac.__v050Sort=function(section){
        var s=section||ac.__v050Section();
        return str(getMyVar('acfun_v050_sort_'+s,getMyVar('acfun_v050_sort','1'))||'1');
    };

    ac.__v052SortName=function(){
        var v=ac.__v050Sort();
        for(var i=0;i<ac.__v050Sorts.length;i++)if(str(ac.__v050Sorts[i].value)===v)return ac.__v050Sorts[i].name;
        return '最新';
    };

    ac.__v052Summary=function(s){
        s=s||ac.__v050Section();
        try{
            if(s==='featured'||s==='lifan'){
                var st=ac.__v050Station(s==='lifan'?1:0);
                return st?clip(st.name,16):sectionName(s);
            }
            if(s==='comic'){
                var cs=ac.__v050ComicStation();
                return cs?clip(cs.name,16):'漫画';
            }
            if(s==='anime'||s==='video'){
                var cl=ac.__v050Class(s),tg=ac.__v050Tag(s,cl),a=[];
                if(cl)a.push(clip(cl.name,10));
                if(tg)a.push(clip(tg.name,10));
                return a.length?a.join(' · '):sectionName(s);
            }
            if(s==='short'){
                var lt=str(getMyVar('acfun_v050_short_load_type','3')||'3');
                return lt==='4'?'发现':'推荐';
            }
        }catch(e){}
        return sectionName(s);
    };

    ac.__v052Search=function(d){
        d.push({
            title:'搜索视频 / UP / 标签',
            img:asset('search'),
            col_type:'icon_1_search',
            url:$('输入视频 / UP / 标签').input(function(){
                var q=String(input||'').trim();
                if(!q)return 'toast://请输入搜索关键词';
                return 'hiker://search?s='+encodeURIComponent(q)+'&rule=ACFun';
            }),
            extra:{lineVisible:false}
        });
    };

    ac.__v050Top=function(d){
        var cur=ac.__v050Section();
        for(var i=0;i<ac.__v050MainSections.length;i++)(function(x){
            d.push({
                title:selectedTitle(x.name,cur===x.key),
                col_type:'flex_button',
                url:$('hiker://empty#noLoading#').lazyRule(function(k){
                    putMyVar('acfun_v050_section',k);
                    refreshPage(false);
                    return 'hiker://empty';
                },x.key),
                extra:{lineVisible:false}
            });
        })(ac.__v050MainSections[i]);
    };

    ac.__v050Quick=function(d){
        var cur=ac.__v050Section();
        var items=[
            {name:'短视频',icon:'short',key:'short'},
            {name:'收藏',icon:'favorite',page:'acfun_favorites'},
            {name:'历史',icon:'history',page:'acfun_history'},
            {name:'设置',icon:'settings',page:'acfun_settings'}
        ];
        for(var i=0;i<items.length;i++)(function(x){
            var title=x.name;
            var url=x.key?$('hiker://empty#noLoading#').lazyRule(function(){
                putMyVar('acfun_v050_section','short');
                refreshPage(false);
                return 'hiker://empty';
            }):('hiker://page/'+x.page+'?rule=ACFun&simple=true#noRecordHistory#');
            d.push({
                title:title,
                img:asset(x.icon),
                col_type:'icon_small_4',
                url:url,
                extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}
            });
        })(items[i]);
    };

    function label(d,name){
        d.push({
            title:'<font color="'+MUTED+'">'+esc(name)+'</font>',
            col_type:'rich_text',
            extra:{textSize:12,lineVisible:false}
        });
    }

    function pushChoice(d,rows,selected,key,clearKey,expanded){
        rows=cleanRows(rows);
        for(var i=0;i<rows.length;i++)(function(x){
            d.push({
                title:selectedTitle(x.name,str(selected)===str(x.id)),
                col_type:expanded?'flex_button':'scroll_button',
                url:$('hiker://empty#noLoading#').lazyRule(function(v,k,ck){
                    putMyVar(k,String(v));
                    if(ck)clearMyVar(ck);
                    refreshPage(false);
                    return 'hiker://empty';
                },x.id,key,clearKey||''),
                extra:{lineVisible:false}
            });
        })(rows[i]);
    }

    function pushAllChoice(d,title,selected,key,expanded){
        d.push({
            title:selectedTitle(title,!selected),
            col_type:expanded?'flex_button':'scroll_button',
            url:$('hiker://empty#noLoading#').lazyRule(function(k){
                clearMyVar(k);
                refreshPage(false);
                return 'hiker://empty';
            },key),
            extra:{lineVisible:false}
        });
    }

    ac.__v052FilterHeader=function(d,s){
        var k='acfun_v052_filter_expand_'+s;
        var expanded=str(getMyVar(k,'0'))==='1';
        var summary=ac.__v052Summary(s);
        d.push({
            title:'筛选 · '+summary+(expanded?'  · 收起':'  · 展开'),
            img:asset('filter'),
            col_type:'text_icon',
            url:$('hiker://empty#noLoading#').lazyRule(function(key){
                putMyVar(key,String(getMyVar(key,'0'))==='1'?'0':'1');
                refreshPage(false);
                return 'hiker://empty';
            },k),
            extra:{lineVisible:false}
        });
        return expanded;
    };

    ac.__v050Bars=function(d){
        var s=ac.__v050Section();
        if(s==='short'){
            var st=str(getMyVar('acfun_v050_short_load_type','3')||'3');
            pushChoice(d,ac.__v050ShortTabs,st,'acfun_v050_short_load_type','',false);
            return;
        }

        var expanded=ac.__v052FilterHeader(d,s);

        if(s==='featured'||s==='lifan'){
            var r=s==='lifan'?1:0;
            var rows=cleanRows(ac.__v050Stations(r));
            var key=r?'acfun_v050_station_lifan':'acfun_v050_station_featured';
            var cur=str(getMyVar(key,'')||'');
            if(!cur&&rows.length)cur=str(rows[0].id);
            if(expanded)label(d,'频道');
            pushChoice(d,rows,cur,key,'',expanded);
        }else if(s==='comic'){
            var comics=cleanRows(ac.__v050ComicStations());
            var cc=str(getMyVar('acfun_v050_comic_station','')||'');
            if(!cc&&comics.length)cc=str(comics[0].id);
            if(expanded)label(d,'漫画频道');
            pushChoice(d,comics,cc,'acfun_v050_comic_station','',expanded);
        }else if(s==='anime'||s==='video'){
            var classes=cleanRows(ac.__v050Catalog(s));
            var ck=s==='video'?'acfun_v050_class_video':'acfun_v050_class_anime';
            var tk=s==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime';
            var cs=str(getMyVar(ck,'')||'');
            if(!cs&&classes.length)cs=str(classes[0].id);
            if(expanded)label(d,'分类');
            pushChoice(d,classes,cs,ck,tk,expanded);

            var cls=ac.__v050Class(s);
            var tags=cleanRows(ac.__v050Tags(s,cls));
            var ts=str(getMyVar(tk,'')||'');
            if(tags.length){
                if(expanded)label(d,'标签');
                pushAllChoice(d,'全部',ts,tk,expanded);
                pushChoice(d,tags,ts,tk,'',expanded);
            }
        }

        if(expanded)label(d,'排序');
        var sort=ac.__v050Sort(s);
        for(var q=0;q<ac.__v050Sorts.length;q++)(function(x){
            d.push({
                title:selectedTitle(x.name,sort===str(x.value)),
                col_type:'scroll_button',
                url:$('hiker://empty#noLoading#').lazyRule(function(v,sec){
                    putMyVar('acfun_v050_sort_'+sec,String(v));
                    refreshPage(false);
                    return 'hiker://empty';
                },x.value,s),
                extra:{lineVisible:false}
            });
        })(ac.__v050Sorts[q]);
    };

    ac.__v050SectionTitle=function(){
        var s=ac.__v050Section();
        var base=sectionName(s)+(s==='short'?'':'推荐');
        var tail=ac.__v052Summary(s);
        if(s!=='short')tail+=' · '+ac.__v052SortName();
        return '<b>'+esc(base)+'</b>  <font color="'+MUTED+'">'+esc(tail)+'</font>';
    };

    ac.addVideoCard=function(d,x,col){
        var info=ac.itemInfo(x),meta=[];
        if(info.watch)meta.push('▶ '+ac.fmtNum(info.watch));
        if(info.like)meta.push('♥ '+ac.fmtNum(info.like));
        if(info.duration)meta.push(str(info.duration));
        if(!meta.length&&info.author)meta.push(str(info.author));
        d.push({
            title:info.title||'未命名视频',
            desc:meta.join('  '),
            img:ac.image(info.img),
            url:ac.detailUrl(info),
            col_type:col||'movie_2',
            extra:{
                video_id:info.id,
                video_title:info.title,
                video_img:info.img,
                video_uri:info.uri,
                video_data:JSON.stringify(info.raw||{}),
                pageTitle:info.title,
                lineVisible:false,
                longClick:[
                    {title:'加入本地收藏',js:$.toString(function(){var s=getItem('acfun_core_src_v018','');if(!s)return 'toast://核心缓存不存在';eval(s);return ac.favoriteFromParams();})},
                    {title:'复制标题',js:$.toString(function(){return 'copy://'+String(MY_PARAMS.video_title||'');})}
                ]
            }
        });
    };

    ac.home=function(){
        var d=[],p=currentPage(),s=ac.__v050Section();
        if(p===1){
            ac.__v052Search(d);
            ac.__v050Top(d);
            ac.__v050Quick(d);
            ac.__v050Bars(d);
            d.push({col_type:'line'});
            d.push({title:ac.__v050SectionTitle(),col_type:'rich_text',url:'hiker://empty',extra:{textSize:17,lineVisible:false}});
        }

        var list=[];
        try{
            if(s==='featured')list=ac.__v050StationList(p,0);
            else if(s==='lifan')list=ac.__v050StationList(p,1);
            else if(s==='comic')list=ac.__v050ComicList(p);
            else if(s==='short')list=ac.__v050ShortList(p);
            else list=ac.__v050CatalogList(p,s);
        }catch(e){
            try{setItem('acfun_v050_home_error',String(e.message||e));}catch(e0){}
        }

        if(s==='comic'){
            for(var i=0;i<list.length;i++){
                var ci=ac.__v047ComicInfo(list[i]);
                if(!ci.id)continue;
                d.push({
                    title:ci.title,
                    desc:ci.desc,
                    img:ac.image(ci.img),
                    col_type:'movie_3',
                    url:ac.__v047ComicUrl(),
                    extra:{inheritTitle:false,pageTitle:ci.title,comics_id:ci.id,comics_title:ci.title,content_kind:'comic',lineVisible:false}
                });
            }
        }else{
            for(var j=0;j<list.length;j++)ac.addVideoCard(d,list[j],'movie_2');
        }

        if(!list.length&&p===1)d.push({
            title:'这里暂时没有内容',
            desc:'试试切换分类、标签或排序',
            col_type:'text_center_1',
            url:'hiker://empty',
            extra:{lineVisible:false}
        });
        setResult(d);
    };

    try{setItem('acfun_test_runtime','0.5.0-rc2 premium native UI + compact taxonomy');}catch(e){}
})();
