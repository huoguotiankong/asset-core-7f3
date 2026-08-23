/** ACFun Web-Native 1.2.0-web3 - native cover + Flutter H5 terminal bridge */
(function(){
if(typeof ACFunNext!=='object'||typeof ACFunWebNative!=='object')throw new Error('ACFun Web-Native base missing');
var A=ACFunNext,W=ACFunWebNative;
W.version='1.2.0-web3';
W.buildNumber=11003;
W.build='2026.08.23-v1.2.0-web3';
W.runtimeMode='native-ui+flutter-h5-terminal';
A.runtimeMode=W.runtimeMode;
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_web_v120.js?v=11003';
A.bootVer=11003;
A.image=function(raw,domain){
    var plain=A.absImage(raw,domain);if(!plain)return'';
    if(/^(?:data:|hiker:|file:)/i.test(plain))return plain;
    if(!/\.asigoo\.com\//i.test(plain))return plain+'@Referer=';
    var target=A.__a2ImageTarget?A.__a2ImageTarget(plain):plain;
    var cache='hiker://files/cache/acfun_web3_img/'+A.md5(target)+'.jpg',abs='';
    try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}
    var headers={'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};
    try{
        return $(target,headers).image(function(cacheAbs){
            var FileUtil=com.example.hikerview.utils.FileUtil;
            var data=FileUtil.toBytes(input);if(!data||data.length<4)return FileUtil.toInputStream(data);
            function u(i){return data[i]&255;}
            function valid(){
                var jpg=data.length>2&&u(0)===255&&u(1)===216&&u(2)===255;
                var png=data.length>7&&u(0)===137&&u(1)===80&&u(2)===78&&u(3)===71&&u(4)===13&&u(5)===10&&u(6)===26&&u(7)===10;
                var gif=data.length>2&&u(0)===71&&u(1)===73&&u(2)===70;
                var webp=data.length>11&&u(0)===82&&u(1)===73&&u(2)===70&&u(3)===70&&u(8)===87&&u(9)===69&&u(10)===66&&u(11)===80;
                return jpg||png||gif||webp;
            }
            if(!valid()){
                var ks='2020-zq3-888',lim=Math.min(100,data.length);
                for(var i=0;i<lim;i++)data[i]=data[i]^ks.charCodeAt(i%ks.length);
            }
            if(valid()&&cacheAbs){
                try{
                    var p=String(cacheAbs);if(p.indexOf('file://')===0)p=p.replace(/^file:\/\/+/,'/');
                    var f=new java.io.File(p),pa=f.getParentFile();if(pa&&!pa.exists())pa.mkdirs();
                    var tmp=new java.io.File(p+'.tmp.'+java.lang.Thread.currentThread().getId());
                    var out=new java.io.FileOutputStream(tmp);out.write(data);out.flush();out.close();
                    if(!f.exists())tmp.renameTo(f);if(tmp.exists())tmp.delete();
                }catch(e1){}
            }
            return FileUtil.toInputStream(data);
        },abs);
    }catch(e){
        try{A.setDiag('web3_image_error',target+'\n'+String(e.message||e));}catch(e2){}
        return target+'@Referer=';
    }
};
W.bridgeUrl=function(kind,id,title,chapterId,chapterTitle){
    return W.nativePage('acfun_web_native_bridge',{
        acf_web_kind:kind||'',acf_web_id:id||'',acf_web_title:title||'',
        acf_web_chapter:chapterId||'',acf_web_chapter_title:chapterTitle||''
    });
};
W.bridgeScript=function(kind,id,title,chapterId,chapterTitle){
    var cfg={kind:String(kind||''),id:String(id||''),title:String(title||''),chapterId:String(chapterId||''),chapterTitle:String(chapterTitle||'')};
    return '('+function(c){
        var key='acf_web3_'+[c.kind,c.id,c.chapterId,c.title].join('|');
        try{if(sessionStorage.getItem('acf_web3_key')!==key){sessionStorage.setItem('acf_web3_key',key);sessionStorage.setItem('acf_web3_phase','0');}}catch(e){}
        function phase(v){try{if(v!==undefined)sessionStorage.setItem('acf_web3_phase',String(v));return Number(sessionStorage.getItem('acf_web3_phase')||0);}catch(e){return 0;}}
        function norm(s){return String(s==null?'':s).replace(/\s+/g,' ').trim();}
        function label(el){if(!el)return'';var a='';try{a=el.getAttribute('aria-label')||el.getAttribute('data-semantics-label')||el.getAttribute('title')||'';}catch(e){}return norm(a+' '+(el.innerText||el.textContent||''));}
        function visible(el){if(!el)return false;try{var r=el.getBoundingClientRect();return r.width>1&&r.height>1;}catch(e){return true;}}
        function all(){return document.querySelectorAll('flt-semantics,[aria-label],[role="button"],button,a,input,textarea,[contenteditable="true"],div,span');}
        function best(words,excludeInput){var es=all(),best=null,bscore=0;for(var i=0;i<es.length;i++){var el=es[i];if(!visible(el))continue;if(excludeInput&&/^(INPUT|TEXTAREA)$/.test(el.tagName))continue;var s=label(el);if(!s)continue;var score=0;for(var j=0;j<words.length;j++){var w=norm(words[j]);if(!w)continue;if(s===w)score=Math.max(score,100);else if(s.indexOf(w)>=0)score=Math.max(score,50+Math.min(30,w.length));}if(score>bscore){best=el;bscore=score;}}return best;}
        function tap(el){if(!el)return false;try{el.scrollIntoView({block:'center',inline:'center'});}catch(e){}try{el.click();return true;}catch(e2){}try{var r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(t){document.elementFromPoint(x,y).dispatchEvent(new MouseEvent(t,{bubbles:true,clientX:x,clientY:y}));});return true;}catch(e3){return false;}}
        function inputBox(){return document.querySelector('input[type="search"],input[placeholder*="搜索"],input[placeholder*="搜"],input[type="text"],textarea');}
        function fill(el,val){if(!el)return false;try{var p=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');if(p&&p.set)p.set.call(el,val);else el.value=val;}catch(e){try{el.value=val;}catch(e2){return false;}}try{el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}catch(e3){}return true;}
        function enter(el){try{['keydown','keypress','keyup'].forEach(function(t){el.dispatchEvent(new KeyboardEvent(t,{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));});}catch(e){}try{var f=el.closest('form');if(f)f.submit();}catch(e2){}}
        function mediaReady(){
            if(c.kind==='video'){
                var v=document.querySelector('video');
                if(v){try{v.muted=false;v.play();}catch(e){}try{v.scrollIntoView({block:'start'});}catch(e2){}return true;}
                var pb=best(['播放','立即播放','开始播放','play'],true);if(pb&&phase()>=2){tap(pb);return false;}
            }else if(c.kind==='comic'){
                var imgs=document.images||[],hit=null;for(var i=0;i<imgs.length;i++){try{var r=imgs[i].getBoundingClientRect();if(r.width>240&&r.height>240){hit=imgs[i];break;}}catch(e){}}
                if(hit&&phase()>=3){try{hit.scrollIntoView({block:'start'});}catch(e2){}return true;}
            }
            return false;
        }
        function tick(){
            try{document.documentElement.style.background='#fff';if(document.body)document.body.style.background='#fff';}catch(e){}
            if(mediaReady())return;
            var p=phase();
            if(p===0){
                var inp=inputBox();
                if(!inp){var sb=best(['搜索','搜一搜','search'],true);if(sb){tap(sb);return;}}
                inp=inputBox();if(inp&&c.title){fill(inp,c.title);enter(inp);phase(1);return;}
            }
            if(p<=1){
                var hit=best([c.title,c.title.slice(0,18),c.title.slice(0,12)],true);
                if(hit){tap(hit);phase(2);return;}
                var inp2=inputBox();if(inp2&&c.title&&norm(inp2.value)!==norm(c.title)){fill(inp2,c.title);enter(inp2);phase(1);return;}
            }
            if(c.kind==='comic'&&p>=2&&p<3){
                var ch=best([c.chapterTitle,c.chapterId?('第'+c.chapterId+'章'):''],true);
                if(ch){tap(ch);phase(3);return;}
                var read=best(['开始阅读','继续阅读','阅读','看漫画'],true);if(read){tap(read);phase(3);return;}
            }
            if(c.kind==='video'&&p>=2){var play=best(['播放','立即播放','开始播放','play'],true);if(play){tap(play);phase(3);return;}}
        }
        if(!window.__acfWeb3Timer){window.__acfWeb3Timer=setInterval(tick,700);setTimeout(tick,180);}
    }+'('+JSON.stringify(cfg)+');';
};
W.bridge=function(){
    var kind=A.param('acf_web_kind')||'video',id=A.param('acf_web_id'),title=A.param('acf_web_title')||'ACFun',chapterId=A.param('acf_web_chapter'),chapterTitle=A.param('acf_web_chapter_title');
    try{setPageTitle(title);}catch(e){}
    setResult([{url:W.appUrl,col_type:'x5_webview_single',desc:'list&&screen',extra:{canBack:true,showProgress:true,ua:W.ua,js:W.bridgeScript(kind,id,title,chapterId,chapterTitle),jsLoadingInject:true,floatVideo:true,autoPlay:true,imgLongClick:false}}]);
};
A.videoDetail=function(seed){
    var obj=A.videoObject(seed.id,seed.raw),i=A.videoInfo(obj);if(!i.id)i.id=seed.id;if((!i.title||i.title==='未命名视频')&&seed.title)i.title=seed.title;if(!i.img&&seed.img)i.img=seed.img;if(!i.uri&&seed.uri)i.uri=seed.uri;
    setPageTitle(i.title||'视频详情');try{if(i.img)setPagePicUrl(A.image(i.img));}catch(e){}
    var d=[],meta=[];if(i.author)meta.push(i.author);if(i.watch)meta.push('播放 '+A.fmtNum(i.watch));if(i.like)meta.push('点赞 '+A.fmtNum(i.like));if(i.duration)meta.push(i.duration);
    d.push({title:i.title,desc:meta.join(' · '),pic_url:A.image(i.img),img:A.image(i.img),col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'播放',desc:'网页授权兜底',pic_url:A.icon('play'),img:A.icon('play'),col_type:'text_icon',url:W.bridgeUrl('video',i.id,i.title,'',''),extra:{inheritTitle:false,pageTitle:i.title,lineVisible:false}});
    var favItem={kind:'video',id:i.id,title:i.title,img:i.img,uri:i.uri,data:JSON.stringify(obj||{})};
    d.push({title:A.isFavorite(i.id)?'已收藏':'收藏',col_type:'text_3',url:A.favoriteLazy(favItem),extra:{lineVisible:false}});
    d.push({title:'评论',col_type:'text_3',url:A.page('acfun_next_comments',{video_id:i.id,video_title:i.title}),extra:{lineVisible:false}});
    d.push({title:'复制标题',col_type:'text_3',url:'copy://'+i.title,extra:{lineVisible:false}});if(i.desc)d.push({title:A.html(i.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});setResult(d);
};
A.comicDetail=function(seed){
    var obj=A.comicObject(seed.id,seed.raw),i=A.comicInfo(obj);if(!i.id)i.id=seed.id;if(!i.title&&seed.title)i.title=seed.title;if(!i.img&&seed.img)i.img=seed.img;setPageTitle(i.title||'漫画详情');
    var d=[];d.push({title:i.title,desc:[i.author,i.desc].join('\n').trim(),pic_url:A.image(i.img),img:A.image(i.img),col_type:'movie_1_vertical_pic_blur',url:'hiker://empty',extra:{gradient:true,lineVisible:false}});
    var favItem={kind:'comic',id:i.id,title:i.title,img:i.img,data:JSON.stringify(obj||{})};d.push({title:A.isFavorite(i.id)?'已收藏':'收藏漫画',col_type:'scroll_button',url:A.favoriteLazy(favItem),extra:{lineVisible:false}});d.push({title:'网页阅读',col_type:'scroll_button',url:W.bridgeUrl('comic',i.id,i.title,'',''),extra:{inheritTitle:false,pageTitle:i.title,lineVisible:false}});d.push({title:'复制标题',col_type:'scroll_button',url:'copy://'+i.title,extra:{lineVisible:false}});
    var ch=A.chapterRows(obj,'comic');d.push({title:'章节目录 · '+ch.length,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});for(var c=0;c<ch.length;c++)d.push({title:ch[c].title,col_type:'text_2',url:W.bridgeUrl('comic',i.id,i.title,ch[c].id,ch[c].title),extra:{inheritTitle:false,pageTitle:ch[c].title,lineVisible:false}});if(!ch.length)d.push({title:'网页站内阅读',col_type:'text_1',url:W.bridgeUrl('comic',i.id,i.title,'',''),extra:{inheritTitle:false,lineVisible:false}});setResult(d);
};
W.diag=function(){var text='版本：'+W.version+' / Build '+W.buildNumber+'\n运行：'+W.build+'\n架构：'+W.runtimeMode+'\n终端：固定 APP H5 '+W.appUrl+'\n图片：Web3 内联 XOR + 新缓存\nProvider：ACFunNext '+String(A.version||'')+' / '+String(A.build||'')+'\n图片错误：'+A.getDiag('web3_image_error');try{setPageTitle('ACFun Web3 诊断');}catch(e){}setResult([{title:text,col_type:'long_text',url:'hiker://empty'},{title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}}]);};
})();
