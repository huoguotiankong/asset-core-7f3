/* Shared JAV Playback SDK 1.0.0-test.3 - MissAV search-chain recovery */
(function(){
  var baseUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/releases/1.0.0-test.2/index.js';
  var key='jav_playback_sdk_base_10002';
  var src=getItem(key,'');
  if(!src){src=fetch(baseUrl,{timeout:12000,headers:{'Cache-Control':'no-cache'}});if(!src||src.indexOf("1.0.0-test.2")<0)throw new Error('JAV Playback base SDK加载失败');setItem(key,src);}
  eval(src);
  JAVPlayback.version='1.0.0-test.3';
  JAVPlayback.providers=function(){return[
    {id:'missav',name:'MissAV',icon:'https://missav.live/favicon.ico'},
    {id:'123av',name:'123AV',icon:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/assets/123av.svg'},
    {id:'jable',name:'Jable',icon:'https://jable.tv/favicon.ico'}
  ];};
  JAVPlayback.missavBases=function(){return['https://missav.live','https://missav.ws','https://missav.ai','https://missav123.com'];};
  JAVPlayback.missavLabel=function(url){var u=String(url||'').toLowerCase();if(u.indexOf('chinese-subtitle')>=0)return'中文字幕';if(u.indexOf('uncensored-leak')>=0)return'无码流出';if(u.indexOf('uncensored')>=0)return'无码版';if(u.indexOf('leaked')>=0)return'流出版';return'默认视频';};
  JAVPlayback.missavSearch=function(code){var lc=this.normalizeCode(code),bases=this.missavBases(),bi,base,search,h,list,i,href,abs,out,seen,label,low;for(bi=0;bi<bases.length;bi++){base=bases[bi];search=base+'/cn/search/'+encodeURIComponent(lc);try{h=this.html(search,base+'/',7000);}catch(e){h='';}if(!h||h.length<300)continue;out=[];seen={};try{list=pdfa(h,'.grid&&.relative:has(a[href])')||[];}catch(e2){list=[];}for(i=0;i<list.length;i++){try{href=pdfh(list[i],'a&&href')||'';}catch(e3){href='';}if(!href)continue;abs=this.absolute(search,href);low=String(abs).toLowerCase();if(low.indexOf(lc)<0&&low.replace(/-/g,'').indexOf(lc.replace(/-/g,''))<0)continue;if(seen[abs])continue;seen[abs]=1;label=this.missavLabel(abs);out.push({name:label,url:abs,base:base});}
      if(!out.length){var re=/href=["']([^"']+)["']/ig,m;while((m=re.exec(h))){abs=this.absolute(search,m[1]);low=String(abs).toLowerCase();if(low.indexOf('/cn/')<0)continue;if(low.indexOf(lc)<0&&low.replace(/-/g,'').indexOf(lc.replace(/-/g,''))<0)continue;if(seen[abs])continue;seen[abs]=1;out.push({name:this.missavLabel(abs),url:abs,base:base});}}
      if(out.length)return out;
    }return[];};
  JAVPlayback.extractMissavSource=function(html){var s=String(html||''),direct=this.findM3u8(s);if(direct.length)return direct[0];var pats=[/eval.*?source.*?(?:\r?\n|<\/script>)/i,/eval\(function\(p,a,c,k,e,d\)[\s\S]*?<\/script>/i],i,m,code,source='';for(i=0;i<pats.length;i++){m=s.match(pats[i]);if(!m)continue;code=String(m[0]||'').replace(/<\/script>[\s\S]*$/i,'');try{eval(code);}catch(e){}if(source)return this.cleanUrl(source);direct=this.findM3u8(code);if(direct.length)return direct[0];}return'';};
  JAVPlayback.resolveMissavVariant=function(item,code){var detail=String(item&&item.url||''),base=String(item&&item.base||this.origin(detail)||''),headers={'User-Agent':this.ua,'Referer':base+'/' ,'Origin':base},html='',master='',wh='';if(!detail)return'toast://MissAV 线路无效';try{html=this.html(detail,base+'/',9000);master=this.extractMissavSource(html);if(!master){wh=this.webHtml(detail,base+'/');master=this.extractMissavSource(wh);}if(!master)return'video://'+detail;master=this.absolute(detail,master);var play=this.highest(master,headers);return this.hls(play,base+'/',base);}catch(e){return'video://'+detail;}};
  JAVPlayback.resolveMissav=function(code){var items=this.missavSearch(code),manager=this.managerUrl,channel=this.channel;if(!items.length)return'toast://MissAV 暂无该番号视频';var names=[],seen={},i,n;for(i=0;i<items.length;i++){n=items[i].name;if(seen[n])n=n+' '+(seen[n]+1);seen[items[i].name]=(seen[items[i].name]||0)+1;names.push(n);}return $(names,1,'MissAV').select(function(items,names,code,manager,channel){var i=names.indexOf(input);if(i<0)return'hiker://empty';eval(fetch(manager,{timeout:10000,headers:{'Cache-Control':'no-cache'}}));var sdk=JAVPlaybackManager.load(channel);return sdk.resolveMissavVariant(items[i],code);},items,names,code,manager,channel);};
  if(typeof $!=='undefined')$.exports=JAVPlayback;
})();
