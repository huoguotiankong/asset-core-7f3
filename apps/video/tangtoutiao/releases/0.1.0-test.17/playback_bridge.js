/* 汤头条 0.1.0-test.17 Short Playback / APK contract source_240 fast path */
var TangTouTiaoPlaybackBridgeV025=(function(){
  var B=TangTouTiaoPlaybackBridgeV023,V='0.1.0-test.17',UA='Mozilla/5.0 (Linux; Android 13; HikerView) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
  function headers(){var h={'User-Agent':UA,'Accept':'*/*','Cache-Control':'no-cache'},r=String(getItem('ttt_player_refer','')||''),a=String(getItem('ttt_player_xauth','')||'');if(r)h.Referer=r;if(a)h['X-Auth']=a;return h;}
  function esc(v){return String(v||'').replace(/;/g,'；；');}
  function player(u,h){var a=[];h=h||headers();for(var k in h)if(h.hasOwnProperty(k)&&h[k])a.push(k+'@'+esc(h[k]));return String(u||'')+'#isVideo=true#;{'+a.join('&&')+'}';}
  function fast(u,label){u=String(u||'').trim();if(!/^https?:\/\//i.test(u))return'';var h=headers();if(/\.m3u8(?:\?|$)/i.test(u))try{var name='ttt17_'+String(label||'short').replace(/[^0-9A-Za-z_-]/g,'_')+'_'+Date.now()+'.m3u8',c=cacheM3u8(u,h,name);if(c){var out=String(c).split('##')[0].replace(/;\{[\s\S]*$/,'').trim();setItem('ttt_last_handoff',JSON.stringify({time:Date.now(),mode:'short-source240-cache',label:label,url:u.substring(0,220),cached:out.substring(0,180)}));return out+'#isVideo=true#';}}catch(e){try{setItem('ttt_last_handoff',JSON.stringify({time:Date.now(),mode:'short-source240-cache-failed',label:label,error:String(e.message||e).slice(0,180),url:u.substring(0,220)}));}catch(e0){}}
    try{setItem('ttt_last_handoff',JSON.stringify({time:Date.now(),mode:'short-source240-direct',label:label,url:u.substring(0,220)}));}catch(e1){}return player(u,h);
  }
  function short(rec){var x={};try{x=typeof rec==='string'?JSON.parse(rec):rec||{};}catch(e){}var id=String(x.id||''),u=String(x.source240||x.source_240||'').trim();
    try{setItem('ttt_last_short_contract',JSON.stringify({time:Date.now(),id:id,duration:String(x.duration||''),hasSource240:!!u,source240:u.substring(0,220),hasPreview:!!x.preview,isFree:Number(x.isFree||0),isPay:!!x.isPay,coins:Number(x.coins||0)}));}catch(e0){}
    if(u){var out=fast(u,'apk-list-source240');if(out){try{setItem('ttt_last_short_play',JSON.stringify({time:Date.now(),id:id,mode:'apk-list-source240-fast',source:u.substring(0,220)}));}catch(e1){}return out;}}
    try{setItem('ttt_last_short_play',JSON.stringify({time:Date.now(),id:id,mode:'fallback-test15-no-list-source240'}));}catch(e2){}return B.short(rec);
  }
  return{version:V,external:B.external,short:short,authorized:B.authorized,rewrite:B.rewrite,fast:fast};
})();
TangTouTiaoPlaybackBridgeV023=TangTouTiaoPlaybackBridgeV025;
