/* Test18 evidence-only diagnostics for live Hiker HTML. No claim of media/image repair. */
(function(K,R){
 if(!K||!R||R.version!=='0.1.0-test.17')throw Error('Test18 requires Test17');
 var oldModel=R.modelDetail,oldDetail=R.detail,oldMedia=R.media,C=K.C,s=K.s,param=K.param,safe=K.safeDecode,page=K.page;
 function host(u){var m=s(u).match(/^https?:\/\/[^/]+/i);return m?m[0]:'';}
 function short(u){u=s(u).replace(/@headers=.*$/,'').replace(/[?#].*$/,'');return u.length>140?u.substring(0,140)+'…':u;}
 function line(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
 R.modelDetail=function(){try{setItem('xc_diag_model_v1',safe(param('xc_url','')));}catch(e){}return oldModel();};
 R.detail=function(){var t=param('t',''),u=safe(param('xc_url',''));if(t==='model'||(!t&&/\/models?\//.test(u)))return R.modelDetail();return oldDetail();};
 R.media=function(){var u=safe(param('xc_url',''));try{setItem('xc_diag_video_v1',u);}catch(e){}var r=K.fetchPage(u,'video'),xs=K.mediaFromHtml(r.html,r.url,'video'),d=[];setPageTitle('播放诊断');d.push(K.section('源页面','获取 '+(r.ok?'成功':'失败')+' · '+r.via+' · HTML '+s(r.html).length+' 字符 · M3U8 '+xs.length+' 条'));for(var i=0;i<xs.length;i++)d.push({title:'▶️ 候选 '+(i+1),url:K.playMedia(xs[i],r.url),col_type:'text_1'});d.push({title:'🔬 页面与图片诊断',desc:'查看页面结构和实际封面地址',url:page('xchinaDebug',{}),col_type:'text_1'});d.push({title:'🌐 原站',url:'x5://'+r.url,col_type:'text_1'});setResult(d);};
 R.diagnostics=function(){var d=[],u='',r={},html='',scope='',photo={},comic={},model={},i,as,src,raw,scriptSrc=[],re,m;
   setPageTitle('小黄书 · 运行诊断');d.push(K.section('🎬 视频页面结构','仅显示计数和地址特征，不输出 Cookie/Token'));
   try{u=getItem('xc_diag_video_v1','');}catch(e){}if(u){r=K.fetchPage(u,'video',{noWeb:true});html=s(r.html);scope=s(K.sourceMain(html));
     d.push(line('页面来源 '+r.via+' · '+html.length+' 字符','main-container '+scope.length+' 字符 · 全页 m3u8 '+((html.match(/m3u8/ig)||[]).length)+' 次 · 容器 '+((scope.match(/m3u8/ig)||[]).length)+' 次'));
     d.push(line('媒体结构', 'video 标签 '+((html.match(/<video\b/ig)||[]).length)+' · iframe '+((html.match(/<iframe\b/ig)||[]).length)+' · script '+((html.match(/<script\b/ig)||[]).length)));
     re=/<(?:iframe|script)\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1/ig;while((m=re.exec(html))&&scriptSrc.length<5){src=K.abs(m[2],r.url);if(src)scriptSrc.push(host(src)+src.replace(/^https?:\/\/[^/]+/i,'').replace(/[?#].*$/,'').slice(-48));}for(i=0;i<scriptSrc.length;i++)d.push(line('资源 '+(i+1),scriptSrc[i]));
   }else d.push(line('未记录视频','先打开一个视频的“播放诊断”，再回来查看'));
   d.push(K.section('🖼️ 第一张封面','显示解析器得到的原始地址；空值意味着提取失败'));
   try{photo={r:K.fetchPage(K.listPath('photo',1),'photo',{noWeb:true,timeout:6000})};photo.items=K.parseCards(photo.r.html,photo.r.url,'photo');as=photo.items||[];for(i=0;i<Math.min(2,as.length);i++)d.push(line('套图 '+(i+1)+' · '+(as[i].rawImg?'有地址':'无地址'),short(as[i].rawImg)));if(!as.length)d.push(line('套图列表未取得卡片',photo.r.url));}catch(e1){d.push(line('套图列表异常',s(e1)));}
   try{comic={r:K.fetchPage(K.listPath('comic',1),'comic',{noWeb:true,timeout:6000})};comic.items=K.parseCards(comic.r.html,comic.r.url,'comic');as=comic.items||[];for(i=0;i<Math.min(2,as.length);i++)d.push(line('漫画 '+(i+1)+' · '+(as[i].rawImg?'有地址':'无地址'),short(as[i].rawImg)));if(!as.length)d.push(line('漫画列表未取得卡片',comic.r.url));}catch(e2){d.push(line('漫画列表异常',s(e2)));}
   d.push(K.section('👩 模特头像','先打开任一模特页再回到此页'));
   try{u=getItem('xc_diag_model_v1','');}catch(e3){u='';}if(u){try{model=K.fetchPage(u,'model',{noWeb:true});var info=K.modelMeta(model.html,model.url);d.push(line('头像候选',short(info.cover)));}catch(e4){d.push(line('头像提取异常',s(e4)));}}else d.push(line('未记录模特',''));
   setResult(d);
 };
 var oldModule=R.module;R.module=function(){var m=oldModule();m.diagnostics=R.diagnostics;return m;};
 R.version=K.version='0.1.0-test.18';R.build=K.build=10118;
})(XChinaTest9Core,XChinaRemoteRuntime);
