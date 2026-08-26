/* 麻豆AI 2.9.0-test.1 - explicit Core / API / Storage */
var MDAICoreV290=(function(){
  var FALLBACK_VIDEO=[
    {id:27,name:'每日更新',menuId:1,sortOrder:1},{id:10,name:'麻豆x性吧联合原创',menuId:1,sortOrder:2},{id:13,name:'清纯少女',menuId:1,sortOrder:3},{id:6,name:'麻豆原创AI',menuId:1,sortOrder:4},{id:19,name:'黑料吃瓜',menuId:1,sortOrder:5},{id:14,name:'重口调教',menuId:1,sortOrder:6},{id:15,name:'直播大秀',menuId:1,sortOrder:7},{id:16,name:'网红主播',menuId:1,sortOrder:8},{id:9,name:'麻豆传媒',menuId:1,sortOrder:9},{id:17,name:'媚黑母狗',menuId:1,sortOrder:10},{id:18,name:'白虎少女',menuId:1,sortOrder:11},
    {id:1,name:'国产自拍（最新更新）',menuId:2,sortOrder:1},{id:21,name:'反差母狗',menuId:2,sortOrder:2},{id:4,name:'探花大神',menuId:2,sortOrder:3},{id:7,name:'91大神',menuId:2,sortOrder:4},{id:20,name:'破解偷拍',menuId:2,sortOrder:5},{id:28,name:'世界杯专栏',menuId:2,sortOrder:6},{id:22,name:'白虎嫩妹',menuId:2,sortOrder:7},{id:23,name:'家庭乱伦',menuId:2,sortOrder:8},{id:24,name:'熟女偷情',menuId:2,sortOrder:9},{id:25,name:'网黄原创',menuId:2,sortOrder:10},
    {id:2,name:'AV - 中文字幕',menuId:3,sortOrder:1},{id:8,name:'AV - 无码流出',menuId:3,sortOrder:2}
  ];
  var FALLBACK_POST=[{id:3,name:'交友闲谈',menuId:4,sortOrder:1},{id:26,name:'每日吃瓜',menuId:4,sortOrder:3}];
  var MASK=['性瘾','S级','偷拍','无码','有码','口爆','伦理','啪啪','约炮','少妇','翘臀','呻吟','双飞','姿势','情色','女优','人妻','性爱','乱伦','强奸','母狗','媚黑','白虎','熟女','网黄','调教','自慰','口交','性交','群交','内射','颜射','潮吹','乳交','肛交','SM','萝莉'];
  var core={
    id:'mdai',title:'麻豆AI',version:'2.9.0-test.1',defaultHost:'https://mdcmai4.xyz',
    ua:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    historyKey:'mdai_watch_history_v1',favKey:'mdai_favorites_v1',searchKey:'mdai_search_history_v1',
    host:function(){var h=getItem('mdai_host',this.defaultHost)||this.defaultHost;return String(h).replace(/\/+$/,'');},
    pageSize:function(){var n=parseInt(getItem('mdai_page_size','30'));if(!(n>0))n=30;if(n>60)n=60;return n;},
    headers:function(){return {'User-Agent':this.ua,'Referer':this.host()+'/','Accept':'application/json,text/plain,*/*'};},
    parse:function(raw){if(raw==null)return{};if(typeof raw==='object')return raw;var s=String(raw||'').trim();if(!s)return{};try{return JSON.parse(s);}catch(e){throw new Error('接口返回不是有效 JSON：'+s.slice(0,120));}},
    request:function(path,timeout){var u=/^https?:\/\//i.test(String(path||''))?String(path):this.host()+String(path||'');return this.parse(fetch(u,{headers:this.headers(),timeout:timeout||10000}));},
    payload:function(obj){if(!obj)return{};return obj.data!=null?obj.data:obj;},
    items:function(obj){var x=this.payload(obj);if(Array.isArray(x))return x;if(!x)return[];if(Array.isArray(x.items))return x.items;if(Array.isArray(x.records))return x.records;if(Array.isArray(x.list))return x.list;if(Array.isArray(x.rows))return x.rows;if(Array.isArray(x.content))return x.content;return[];},
    maskText:function(v){var s=String(v==null?'':v);for(var i=0;i<MASK.length;i++){var w=MASK[i];if(w.length<2)continue;var safe=w.charAt(0)+'\u200b'+w.substring(1);s=s.split(w).join(safe);}return s;},
    cleanText:function(v){if(v==null)return'';var s=String(v).replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\\n/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();return this.maskText(s);},
    shortTitle:function(v,n){var s=this.cleanText(v);n=parseInt(n||16);return s.length>n?s.slice(0,n)+'…':s;},
    image:function(u){u=String(u||'').trim();if(!u)return'';if(/^data:image\//i.test(u)||/^https?:\/\//i.test(u))return u;if(u.indexOf('/api/v1/')===0||u.indexOf('/uploads/')===0)return this.host()+u;return this.host()+'/api/v1/image/proxy?path='+encodeURIComponent(u);},
    fmtDate:function(v){if(!v)return'';var s=String(v).replace('T',' ');return s.length>19?s.slice(0,19):s;},
    fmtDuration:function(sec){sec=parseInt(sec||0);if(!(sec>0))return'';var h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?(h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')):(String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'));},
    compactNum:function(n){n=parseInt(n||0);if(!(n>0))return'0';if(n>=100000000)return(n/100000000).toFixed(n>=1000000000?0:1).replace(/\.0$/,'')+'亿';if(n>=10000)return(n/10000).toFixed(n>=100000?0:1).replace(/\.0$/,'')+'万';return String(n);},
    readList:function(key){try{var a=JSON.parse(getItem(key,'[]')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}},
    writeList:function(key,a){try{setItem(key,JSON.stringify(a||[]));}catch(e){}},
    saveHistory:function(info){if(!info||info.id==null||String(info.id)==='')return;var a=this.readList(this.historyKey),out=[];for(var i=0;i<a.length;i++)if(!(String(a[i].id)===String(info.id)&&String(a[i].type)===String(info.type)))out.push(a[i]);info.time=new Date().getTime();out.unshift(info);if(out.length>80)out=out.slice(0,80);this.writeList(this.historyKey,out);},
    saveSearchWord:function(word){word=String(word||'').trim();if(!word)return;var a=this.readList(this.searchKey),out=[word];for(var i=0;i<a.length;i++)if(String(a[i])!==word)out.push(a[i]);if(out.length>12)out=out.slice(0,12);this.writeList(this.searchKey,out);},
    isFav:function(id,type){var a=this.readList(this.favKey);for(var i=0;i<a.length;i++)if(String(a[i].id)===String(id)&&String(a[i].type)===String(type))return true;return false;},
    toggleFav:function(info){info=info||{};var a=this.readList(this.favKey),out=[],removed=false;for(var i=0;i<a.length;i++){if(String(a[i].id)===String(info.id)&&String(a[i].type)===String(info.type)){removed=true;continue;}out.push(a[i]);}if(removed){this.writeList(this.favKey,out);return false;}info.time=new Date().getTime();out.unshift(info);this.writeList(this.favKey,out);return true;},
    normalizeMediaUrl:function(u){u=String(u||'').trim();if(!u)return'';u=u.split('##')[0].replace(/#isVideo=true#/g,'').replace(/;\{[\s\S]*$/,'').trim();if(u.indexOf('/api/v1/m3u8/proxy?path=')>=0){try{var p=u.indexOf('path='),pre=u.substring(0,p+5),raw=u.substring(p+5),dec=decodeURIComponent(raw),mi=dec.toLowerCase().indexOf('.m3u8');if(mi>=0)return pre+encodeURIComponent(dec.substring(0,mi+5));}catch(e){}return u;}var low=u.toLowerCase(),m=low.indexOf('.m3u8');if(m>=0)return u.substring(0,m+5);var em=low.indexOf('%2em3u8');if(em>=0)return u.substring(0,em+7);return u;},
    playProxyUrl:function(u){u=String(u||'').trim();if(!u)return'';if(u.indexOf('/api/v1/m3u8/proxy?path=')>=0)return /^https?:\/\//i.test(u)?u:this.host()+u;return this.host()+'/api/v1/m3u8/proxy?path='+encodeURIComponent(u);},
    getCategories:function(type){type=type||'video';var key='mdai_categories_cache_'+type,tk=key+'_time',cached=getItem(key,''),ts=parseInt(getItem(tk,'0'))||0;if(cached&&(new Date().getTime()-ts)<21600000){try{var ca=JSON.parse(cached);if(Array.isArray(ca)&&ca.length)return ca;}catch(e){}}try{var x=this.payload(this.request('/api/v1/categories?type='+encodeURIComponent(type))),a=Array.isArray(x)?x:this.items(x);a=(a||[]).filter(function(c){return c&&c.enabled!==false;});a.sort(function(a,b){return (parseInt(a.sortOrder||0)-parseInt(b.sortOrder||0))||(parseInt(a.id||0)-parseInt(b.id||0));});if(a.length){setItem(key,JSON.stringify(a));setItem(tk,String(new Date().getTime()));return a;}}catch(e2){}return(type==='post'?FALLBACK_POST:FALLBACK_VIDEO).slice();},
    buildVideoPath:function(cat,pg,size,allowFilter){var p='/api/v1/videos?page='+pg+'&size='+size;if(cat)p+='&categoryId='+encodeURIComponent(cat);if(allowFilter){var tr=getMyVar('mdai_filter_time',''),md=getMyVar('mdai_filter_duration',''),sb=getMyVar('mdai_filter_sort','');if(tr)p+='&timeRange='+encodeURIComponent(tr);if(md)p+='&minDuration='+encodeURIComponent(md);if(sb)p+='&sortBy='+encodeURIComponent(sb);}return p;}
  };
  return{build:'2.9.0-test.1',module:function(){return core;}};
})();
