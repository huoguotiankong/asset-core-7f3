/* Shared JAV Playback Upgrade 1.1.0-test.1 */
var JAVPlaybackUpgrade11001=(function(){
var VERSION='1.1.0-test.1',BUILD=11001;
function uniq(a){var o=[],s={},i,v;for(i=0;i<(a||[]).length;i++){v=String(a[i]||'').trim();if(!v||s[v])continue;s[v]=1;o.push(v);}return o;}
function apply(S,opt){
if(!S||typeof S.resolve!=='function')throw new Error('JAV Playback base SDK unavailable');opt=opt||{};S.version=VERSION;S.build=BUILD;S._localReentry=!!opt.localReentry;
S._diag=function(id,stage,ok,msg){try{setItem('jav_playback_last_diag',JSON.stringify({time:Date.now(),provider:String(id||''),stage:String(stage||''),ok:!!ok,message:String(msg||'').slice(0,160)}));}catch(_e){}return ok;};
S.codeVariants=function(code){var n=this.normalizeCode(code),a=[n],m=n.match(/^fc2-ppv-(\d+)$/i);if(m)a=a.concat(['fc2ppv-'+m[1],'fc2ppv '+m[1]]);else a=a.concat([n.replace(/-/g,''),n.replace(/-/g,' ')]);return uniq(a);};
S.webFallback=function(u){return u?'video://'+u:'hiker://empty';};
S.providers=function(){return[{id:'missav',name:'MissAV',icon:'https://missav.live/favicon.ico'},{id:'123av',name:'123AV',icon:String(opt.icon123||'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/assets/123av.svg')},{id:'jable',name:'Jable',icon:'https://jable.tv/favicon.ico'},{id:'av01',name:'AV01',icon:'https://www.av01.tv/favicon.ico'},{id:'tktube',name:'TKTUBE',icon:'https://tktube.com/favicon.ico'},{id:'javguru',name:'JavGuru',icon:'https://jav.guru/favicon.ico'}];};

/* MissAV: keep Test4 parser, improve domain rotation and remember last good base. */
var oldMissSearch=S.missavSearch,oldExtract=S.extractMissavSource;
S.missavBases=function(){var last='';try{last=getItem('jav_playback_missav_base','');}catch(_e){}return uniq([last,'https://missav.live','https://missav.to','https://missav.ws','https://missav.ai','https://missav123.com']);};
S.missavSearch=function(code){var out=oldMissSearch?oldMissSearch.call(this,code):[];if(out&&out.length){try{setItem('jav_playback_missav_base',String(out[0].base||this.origin(out[0].url)||''));}catch(_e){}}return out||[];};
S.extractMissavSource=function(html){var u='';try{u=oldExtract?oldExtract.call(this,html):'';}catch(_e){}if(u)return u;var s=String(html||''),m=s.match(/(?:\?|&|\bid=)([A-Za-z0-9_-]{6,})(?:["'&\s]|$)/i);if(m&&/missav\.to|embedmv|hls/i.test(s))return'https://emb.missav.to/embedmv/hls/'+m[1]+'.m3u8';return'';};

/* AV01: follow current av01.tv redirect to the real content host, then parse direct/script HLS. */
S.av01Detail=function(code){var vs=this.codeVariants(code),i,u,j,loc,h;for(i=0;i<vs.length&&i<3;i++){u='https://www.av01.tv/'+encodeURIComponent(vs[i]);try{j=JSON.parse(String(fetch(u,{onlyHeaders:true,timeout:4500,headers:{'User-Agent':this.ua}})||'{}'));loc=String(j.url||u);if(/\/error\b/i.test(loc))continue;h=this.html(loc,'https://www.av01.tv/',6500);if(h&&h.length>300)return{url:loc,html:h};}catch(e){}}return null;};
S.resolveAV01=function(code){var d=this.av01Detail(code);if(!d)return'toast://AV01 暂无该番号视频';var origin=this.origin(d.url),hdr={'User-Agent':this.ua,'Referer':d.url,'Origin':origin},urls=this.findM3u8(d.html),names=[],hs=[],i;if(!urls.length){var sm=String(d.html).match(/<script[^>]+src=["']([^"']+)["'][^>]*>/i),src=sm?this.absolute(d.url,sm[1]):'',js='',m;if(src)try{js=this.html(src,d.url,6500);m=js.match(/base64,([A-Za-z0-9+\/=]+)/i);if(m)try{urls=this.findM3u8(String(base64Decode(m[1])||''));}catch(_e){}if(!urls.length)urls=this.findM3u8(js);}catch(e){}}
if(urls.length){for(i=0;i<urls.length;i++){names.push('线路 '+(i+1));hs.push(hdr);}this._diag('av01','direct',true,String(urls.length));return this.playlistOrOne(urls,names,hs);}this._diag('av01','fallback',false,d.url);return this.webFallback(d.url);};

/* TKTUBE: self-contained KVS flashvars parser; no dependency on another Hiker rule. */
S.tktubeDetail=function(code){var q=this.normalizeCode(code).replace(/-/g,'--'),search='https://tktube.com/zh/search/'+q+'/',h='',list=[],i,href,title,abs,needle=this.normalizeCode(code).replace(/-/g,'');try{h=this.html(search,'https://tktube.com/',6500);}catch(e){}if(!h)return null;try{list=pdfa(h,'.list-videos&&.item')||[];}catch(e1){}for(i=0;i<list.length;i++){try{href=pdfh(list[i],'a&&href')||'';title=pdfh(list[i],'.title&&Text')||'';}catch(e2){href='';title='';}if(!href)continue;abs=this.absolute(search,href);if(String(title+' '+abs).toLowerCase().replace(/[-_\s]/g,'').indexOf(needle)<0&&i>0)continue;try{return{url:abs,html:this.html(abs,search,6500)};}catch(e3){}}return null;};
S.parseTktube=function(html){var s=String(html||''),m=s.match(/var\s+flashvars\s*=\s*(\{[\s\S]*?\});/i),o=null,urls=[],names=[],ks=['video_alt_url2','video_alt_url','video_url'],ts=['video_alt_url2_text','video_alt_url_text','video_url_text'],i;if(m)try{o=eval('('+m[1]+')');}catch(e){}if(o)for(i=0;i<ks.length;i++)if(o[ks[i]]){urls.push(String(o[ks[i]]));names.push(String(o[ts[i]]||('线路 '+(urls.length))));}if(!urls.length)urls=this.findM3u8(s);return{urls:urls,names:names};};
S.resolveTktube=function(code){var d=this.tktubeDetail(code);if(!d)return'toast://TKTUBE 暂无该番号视频';var p=this.parseTktube(d.html),origin=this.origin(d.url),hs=[],i;if(p.urls.length){for(i=0;i<p.urls.length;i++)hs.push({Referer:d.url,Origin:origin,'User-Agent':this.ua});this._diag('tktube','direct',true,String(p.urls.length));return this.playlistOrOne(p.urls,p.names,hs);}return this.webFallback(d.url);};

/* JavGuru: structured search; direct/WebView media extraction, browser-assisted final fallback. */
S.javguruDetail=function(code){var vs=this.codeVariants(code),i,url,h,list,j,href,title,needle=this.normalizeCode(code).replace(/-/g,'');for(i=0;i<vs.length&&i<3;i++){url='https://jav.guru/?s='+encodeURIComponent(vs[i]);try{h=this.html(url,'https://jav.guru/',6500);}catch(e){h='';}if(!h)continue;try{list=pdfa(h,'main&&.inside-article:has(.imgg)')||[];}catch(e1){list=[];}for(j=0;j<list.length;j++){try{href=pdfh(list[j],'a&&href')||'';title=pdfh(list[j],'h2&&a&&title')||'';}catch(e2){href='';title='';}if(!href)continue;if(String(title+' '+href).toLowerCase().replace(/[-_\s]/g,'').indexOf(needle)<0&&j>0)continue;var abs=this.absolute(url,href);try{return{url:abs,html:this.html(abs,url,6500)};}catch(e3){return{url:abs,html:''};}}}return null;};
S.resolveJavGuru=function(code){var d=this.javguruDetail(code);if(!d)return'toast://JavGuru 暂无该番号视频';var origin=this.origin(d.url),hdr={'User-Agent':this.ua,'Referer':d.url,'Origin':origin},urls=this.findM3u8(d.html),p;if(urls.length){p=this.highest(urls[0],hdr);this._diag('javguru','html',true,p);return this.hls(p,d.url,origin);}try{var wh=this.webHtml(d.url,origin+'/');urls=this.findM3u8(wh);if(urls.length){p=this.highest(urls[0],hdr);this._diag('javguru','webview',true,p);return this.hls(p,d.url,origin);}}catch(e){}return this.webFallback(d.url);};

var baseResolve=S.resolve;
S.resolve=function(id,code){id=String(id||'').toLowerCase();if(id==='av01')return this.resolveAV01(code);if(id==='tktube')return this.resolveTktube(code);if(id==='javguru')return this.resolveJavGuru(code);return baseResolve.call(this,id,code);};
if(S._localReentry)S.providerUrl=function(id,code){return $('#noLoading#').lazyRule(function(id,code){try{return $.require('javdb3').playback().resolve(id,code);}catch(e){return'toast://'+id+' 解析失败：'+String(e.message||e);}},id,code);};
return S;}
return{version:VERSION,build:BUILD,apply:apply};
})();
if(typeof $!=='undefined')$.exports=JAVPlaybackUpgrade11001;
