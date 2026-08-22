/* JavDB v3 3.9.42-test.5 release identity / playback-sdk pointer */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260823-v3.9.42-test.5';
  var settings4=J.settings;
  J.settings=function(d){var a=[],i,x;settings4.call(this,a);for(i=0;i<a.length;i++){x=a[i]||{};if(typeof x.title==='string')x.title=x.title.replace('JavDB v3.9.42-test.4','JavDB v3.9.42-test.5');if(typeof x.desc==='string')x.desc=x.desc.replace('JAV Playback SDK test.3','JAV Playback SDK test.4');d.push(x);}};
})(JDB);
