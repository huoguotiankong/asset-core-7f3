// ACFun v0.3.2 clean UI - raw @js image decrypt bridge
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.2';
ac.imageCipher='xor:2020-zq3-888 / raw @js + FileUtil';

// ---- cover extraction -------------------------------------------------------
ac.__coverCandidates=function(root){
    var out=[];
    function add(path,val){
        if(val===undefined||val===null)return;
        if(typeof val!=='string'&&typeof val!=='number')return;
        var s=String(val).trim();
        if(!s||s==='[object Object]'||s==='null'||s==='undefined')return;
        var p=String(path||'').toLowerCase(),score=0;
        if(/cover|poster|thumb|thumbnail|preview|image|img|picture|pic/.test(p))score+=90;
        if(/video/.test(p))score+=12;
        if(/^https?:\/\//i.test(s)||s.indexOf('//')===0)score+=35;
        if(/\.(?:jpe?g|png|webp|gif|avif|bmp)(?:\?|#|$)/i.test(s))score+=70;
        if(/\/(?:cover|poster|thumb|image|images|img|upload|uploads|file|files)\//i.test(s))score+=25;
        if(/gradient|placeholder|defaultposter|default_cover|blur|color|avatar|icon|logo/i.test(p+' '+s))score-=130;
        if(/^#?[0-9a-f]{3,8}$/i.test(s)||/^rgba?\(/i.test(s)||/^linear-gradient/i.test(s))score-=180;
        if(s.length<6)score-=60;
        if(score>0)out.push({path:path,value:s,score:score});
    }
    function walk(v,path,depth){
        if(v===undefined||v===null||depth>9)return;
        if(typeof v==='string'||typeof v==='number'){add(path,v);return;}
        if(Array.isArray(v)){for(var i=0;i<v.length&&i<30;i++)walk(v[i],path+'['+i+']',depth+1);return;}
        if(typeof v==='object')for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k))walk(v[k],path?(path+'.'+k):k,depth+1);
    }
    walk(root,'',0);
    out.sort(function(a,b){return b.score-a.score;});
    var seen={},r=[];
    for(var i=0;i<out.length;i++){var key=out[i].value;if(seen[key])continue;seen[key]=1;r.push(out[i]);if(r.length>=20)break;}
    return r;
};

var __baseItemInfo=ac.itemInfo;
ac.itemInfo=function(x){
    var root=x||{},info=__baseItemInfo.call(ac,root),cand=ac.__coverCandidates(root);
    var bad=!info.img||String(info.img)==='[object Object]'||/^\[object\s+Object\]$/i.test(String(info.img));
    if(bad&&cand.length)info.img=cand[0].value;
    else if(cand.length){
        var cur=String(info.img||''),curScore=-999;
        for(var i=0;i<cand.length;i++)if(cand[i].value===cur){curScore=cand[i].score;break;}
        if(curScore<50&&cand[0].score>curScore+25)info.img=cand[0].value;
    }
    if(cand.length)setItem('acfun_last_cover_candidates',cand.slice(0,8).map(function(c){return c.score+' | '+c.path+' = '+c.value;}).join('\n'));
    return info;
};

// ---- image pipeline ---------------------------------------------------------
ac.__cleanPlainImage=function(u){
    u=String(u||'').trim();if(!u)return '';
    u=u.replace(/\\\//g,'/');
    var marks=['@js=','@headers=','@Referer=','@Cookie='];
    for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(u.indexOf('//')===0)u='https:'+u;
    if(/^(data:|hiker:|file:)/i.test(u))return u;
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').trim();
    if(!d){
        try{var cfg=ac.fetchConfig(false)||{};d=String(ac.deepFind(cfg,['imgDomain','imageDomain','cdnDomain'],0)||'');}catch(e){}
    }
    if(d){
        if(d.indexOf('//')===0)d='https:'+d;
        if(!/^https?:\/\//i.test(d))d='https://'+d.replace(/^\/+/, '');
        return d.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
    }
    return String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
};

// Follow the official Hiker example literally: URL + '@js=' + $.toString(fn).
// Use Array.setByte so Rhino does not have to guess how to coerce Number -> Java byte.
ac.__cleanDecryptImage=function(url){
    var js=$.toString(function(){
        var javaImport=new JavaImporter();
        javaImport.importPackage(Packages.com.example.hikerview.utils);
        with(javaImport){
            var bytes=FileUtil.toBytes(input);
            var key=[50,48,50,48,45,122,113,51,45,56,56,56];
            for(var i=0;i<bytes.length;i++){
                var v=bytes[i];
                if(v<0)v+=256;
                v=v^key[i%key.length];
                if(v>127)v-=256;
                Packages.java.lang.reflect.Array.setByte(bytes,i,v);
            }
            return FileUtil.toInputStream(bytes);
        }
    });
    return String(url)+'@js='+js;
};

ac.image=function(u){
    var plain=ac.__cleanPlainImage(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return ac.__cleanDecryptImage(plain);
    return plain;
};

// ---- cards/details ----------------------------------------------------------
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];
    if(info.author)desc.push(info.author);
    if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));
    if(info.like)desc.push('♥ '+ac.fmtNum(info.like));
    if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    if(info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(pic)setItem('acfun_last_cover_resolved',String(pic));
    d.push({
        title:info.title,
        desc:desc.join('  '),
        pic_url:pic,
        img:pic,
        url:ac.detailUrl(info),
        col_type:col||getItem('acfun_card_style','movie_2'),
        extra:{
            video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,
            video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,
            longClick:[{title:'加入本地收藏',js:$.toString(function(){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);return ac.favoriteFromParams();})}]
        }
    });
};

ac.__tagName=function(t){
    if(t===undefined||t===null)return '';
    if(typeof t==='string'||typeof t==='number')return String(t);
    if(typeof t==='object'){
        var v=ac.deepFind(t,['tagName','name','title','label','text','value'],0);
        if(v!==undefined&&v!==null&&typeof v!=='object')return String(v);
    }
    return '';
};

ac.detail=function(){
    var d=[],id=String(MY_PARAMS.video_id||getParam('video_id','')||getParam('id',''));
    var fb=ac.safeJson(MY_PARAMS.video_data)||{};
    if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;
    if(MY_PARAMS.video_img&&!fb.cover)fb.cover=MY_PARAMS.video_img;
    if(MY_PARAMS.video_uri&&!fb.videoUri)fb.videoUri=MY_PARAMS.video_uri;
    var obj=ac.getDetail(id,fb),info=ac.itemInfo(obj);
    if(!info.id)info.id=id;if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';
    var pic=ac.image(info.img);
    setPageTitle(info.title);try{setPagePicUrl(pic);}catch(e){}
    var desc=[];if(info.author)desc.push('UP：'+info.author);if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch));if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));
    d.push({title:info.title,desc:desc.join('  '),pic_url:pic,img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);var it={id:vid,title:title,img:img,uri:uri,data:raw};ac.addHistory(it);return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');if(intro&&typeof intro!=='object')d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.deepFind(obj,['videoTags','tags','tagList'],0),names=[];
    if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__tagName(tags[ti]);if(nm&&names.indexOf(nm)<0)names.push(nm);}
    if(names.length)d.push({title:'标签：'+names.join(' · '),col_type:'long_text',url:'hiker://empty'});
    var rel=[];try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e2){}
    if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
    setResult(d);
};

// ---- diagnostics ------------------------------------------------------------
ac.__cleanVerify=function(url){
    var plain=ac.__cleanPlainImage(url),key=[50,48,50,48,45,122,113,51,45,56,56,56];
    setItem('acfun_clean_verify_err','');
    try{
        var hex=String(fetch(plain,{toHex:true,timeout:12000})||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var n=Math.min(hex.length,512),out='';
        for(var i=0;i<n;i+=2){var v=parseInt(hex.substring(i,i+2),16)^key[(i/2)%key.length];out+=('0'+v.toString(16)).slice(-2);}
        var magic='UNKNOWN';
        if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';
        else if(out.indexOf('ffd8ff')===0)magic='JPEG';
        else if(out.indexOf('52494646')===0&&out.substring(16,24)==='57454250')magic='WEBP';
        setItem('acfun_clean_verify_magic',magic);setItem('acfun_clean_verify_prefix',out.substring(0,160));
        return {ok:true,magic:magic,prefix:out.substring(0,160)};
    }catch(e){var msg=String(e.message||e);setItem('acfun_clean_verify_err',msg);return {ok:false,error:msg};}
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 封面诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__cleanPlainImage(raw),magic=getItem('acfun_clean_verify_magic',''),pref=getItem('acfun_clean_verify_prefix',''),err=getItem('acfun_clean_verify_err','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n结构：clean-single-ui\n图片算法：'+ac.imageCipher+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('当前封面','Plain='+plain+'\nDecryptMagic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        var pic=ac.image(plain);
        d.push({title:'Raw @js FileUtil 解密测试',desc:'严格使用 URL + @js + $.toString；显式 Array.setByte 写回 Java byte[]。',pic_url:pic,img:pic,url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'验证解密文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=401',{headers:{'Cache-Control':'no-cache'}},401);ACFunBoot.loadOnly();var r=ac.__cleanVerify(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?('解密后 '+r.magic):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制 0.3.2 诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nDecryptMagic='+getItem('acfun_clean_verify_magic','')+'\nDecryptPrefix='+getItem('acfun_clean_verify_prefix','')+'\nDecryptErr='+getItem('acfun_clean_verify_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

var __baseHome=ac.home;
ac.home=function(){try{setPageTitle('ACFun');}catch(e){}if(typeof MY_PAGE==='undefined'||MY_PAGE==1){clearItem('acfun_last_cover_raw');clearItem('acfun_last_cover_resolved');}return __baseHome.apply(ac,arguments);};

})();
