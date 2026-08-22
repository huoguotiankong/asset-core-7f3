/* JavDB v3 3.9.42 Stable promotion patch */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260823-v3.9.42';
  J.javPlaybackChannel='stable';
  var s0=J.settings;
  J.settings=function(d){
    var a=[],i,x;
    s0.call(this,a);
    for(i=0;i<a.length;i++){
      x=a[i]||{};
      if(typeof x.title==='string'&&x.title.indexOf('JavDB v3.9.42')>=0)x.title='JavDB v3.9.42';
      if(typeof x.desc==='string'){
        x.desc=x.desc.replace('远程测试版','远程正式版').replace('JAV Playback SDK test.4','JAV Playback SDK Stable');
      }
      d.push(x);
    }
  };
})(JDB);
