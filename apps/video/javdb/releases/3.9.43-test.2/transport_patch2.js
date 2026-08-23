/* JavDB v3 3.9.43-test.2 transport recovery identity */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260823-v3.9.43-test.2';
  J.javPlaybackChannel='stable';
  var s0=J.settings;
  J.settings=function(d){
    var a=[],i,x;
    s0.call(this,a);
    for(i=0;i<a.length;i++){
      x=a[i]||{};
      if(typeof x.title==='string'&&x.title.indexOf('JavDB v3.9.42')>=0)x.title='JavDB v3.9.43-test.2';
      if(typeof x.desc==='string')x.desc=x.desc.replace('远程正式版','远程传输恢复测试版');
      d.push(x);
    }
  };
})(JDB);
