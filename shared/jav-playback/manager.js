/* Shared JAV Playback Manager - permanent entry */
var JAVPlaybackManager={
  base:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/',
  load:function(channel){
    channel=channel||'stable';
    var metaRaw=fetch(this.base+'channels.json?_='+new Date().getTime(),{timeout:10000,headers:{'Cache-Control':'no-cache'}}),meta=JSON.parse(metaRaw),c=meta[channel]||meta.stable||meta.test;
    if(!c||!c.path)throw new Error('JAV Playback '+channel+' 通道不可用');
    var key='jav_playback_sdk_'+String(c.version||'').replace(/[^0-9A-Za-z_.-]/g,'_'),src=getItem(key,'');
    if(!src){src=fetch(this.base+c.path,{timeout:12000,headers:{'Cache-Control':'no-cache'}});if(!src||src.indexOf(String(c.version))<0)throw new Error('JAV Playback SDK下载失败');setItem(key,src);}
    eval(src);if(typeof JAVPlayback==='undefined'||String(JAVPlayback.version)!==String(c.version))throw new Error('JAV Playback SDK校验失败');
    JAVPlayback.channel=channel;JAVPlayback.managerUrl=this.base+'manager.js';return JAVPlayback;
  }
};
