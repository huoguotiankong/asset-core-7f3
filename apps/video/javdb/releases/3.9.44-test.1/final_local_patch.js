/* JavDB v3 3.9.44-test.1 Local-First delivery overlay */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260825-v3.9.44-test.1';
  J.localFirstVersion='3.9.44-test.1';
  J.localFirstBuild=2026082501;
  J.javPlaybackChannel='stable-local';

  var settings0=J.settings;
  J.settings=function(d){
    var a=[],i,x;
    settings0.call(this,a);
    for(i=0;i<a.length;i++){
      x=a[i]||{};
      if(typeof x.title==='string'&&x.title.indexOf('JavDB v3.9.42')>=0){
        x.title='JavDB v3.9.44-test.1';
        x.desc='Native Local-First · Build2026082501 · 业务基线 Stable 3.9.42';
      }
      if(typeof x.desc==='string'){
        x.desc=x.desc.replace('远程正式版','Native Local-First').replace('JAV Playback SDK Stable','JAV Playback SDK Stable · Local');
      }
      d.push(x);
    }
    d.push({col_type:'blank_block'});
    d.push({
      title:'本地化诊断',
      desc:'Runtime Bundle / Shared Playback SDK / 本地重建',
      url:'hiker://page/javdb3LocalFirst?rule=&simple=true',
      col_type:'text_1',
      extra:{lineVisible:false}
    });
  };

  J.externalPlayPage=function(){
    setPageTitle('更多播放');
    var d=[],p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},code=String(p.jdb3_number||'').trim().toUpperCase(),movieId=String(p.jdb3_id||'').trim(),preview=String(p.jdb3_preview||'').trim(),canPlay=!!p.jdb3_can_play;
    if(!code){d.push({title:'暂无番号',url:'hiker://empty',col_type:'text_center_1'});setResult(d);return;}
    d.push({title:'播放中心 · '+code,url:'copy://'+code,col_type:'text_1',extra:{lineVisible:false}});
    var token=String(getItem('jdb3_token','')||'').trim(),vip=false;
    try{var u=JSON.parse(getItem('jdb3_user','{}')||'{}');vip=!!u.is_vip;}catch(e){}
    if(movieId&&token&&vip)d.push({title:'JavDB VIP 在线播放',desc:canPlay?'官方播放线路':'尝试读取官方播放线路',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:'hiker://page/javdb3Play?rule=&simple=true',col_type:'icon_1_left_pic',extra:{lineVisible:false,jdb3_id:movieId,pageTitle:'VIP播放 · '+code}});
    if(preview)d.push({title:'JavDB 官方预览',desc:'官方预览视频',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:preview+'#isVideo=true#',col_type:'icon_1_left_pic',extra:{lineVisible:false}});
    d.push({col_type:'blank_block'});
    d.push(this.section('第三方播放',''));
    try{
      if(typeof JDBCLOUD!=='object'||typeof JDBCLOUD.playback!=='function')throw new Error('Local Playback Runtime 未就绪');
      JDBCLOUD.playback().renderInto(d,{code:code});
    }catch(e2){
      d.push({title:'第三方播放模块加载失败',desc:String(e2.message||e2),url:'hiker://empty',col_type:'text_center_1'});
    }
    d.push({col_type:'blank_block'});
    d.push({title:'JavDB 官方磁链',url:'hiker://page/javdb3Magnets?rule=&simple=true',col_type:'text_1',extra:{lineVisible:false,jdb3_id:movieId,jdb3_number:code,pageTitle:'磁链 · '+code}});
    setResult(d);
  };
})(JDB);
