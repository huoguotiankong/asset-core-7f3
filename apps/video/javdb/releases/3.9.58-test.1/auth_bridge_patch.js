/* JavDB v3 3.9.58-test.1 : isolated VIP + custom magnet authentication bridge.
 * No credential logging; no changes to official signing algorithm or HLS media pipeline.
 */
var JavDBAuthBridge3958=(function(){
  var VERSION='3.9.58-test.1';
  var MAGNET_START='function api(path){';
  var MAGNET_END='\nfunction isSub(';
  function magnetSource(src){
    src=String(src==null?'':src);
    var begin=src.indexOf(MAGNET_START),end=begin>=0?src.indexOf(MAGNET_END,begin):-1;
    if(begin<0||end<=begin||src.indexOf("'/api/v1/movies/'",end)<0)
      throw new Error('JavDB 磁链原始业务结构不匹配，拒绝不安全覆盖');
    // Keep all list/filter/longClick source byte-for-byte. Replace ONLY the private
    // unsigned stand-alone API helper, routing through the live JDB API client.
    var replacement=[
      'function api(path){',
      '  var r=JDB.apiSafe(String(path),{});',
      '  if(r&&r.ok)return r.data||{};',
      '  throw new Error(String(r&&r.error||"磁链官方接口未返回可用结果"));',
      '}'
    ].join('\n');
    return src.substring(0,begin)+replacement+src.substring(end);
  }
  function stripNoPre(u){return String(u==null?'':u).replace(/#noPre#/gi,'');}
  function restoreVip(items){
    if(!(items instanceof Array))return items;
    for(var i=0;i<items.length;i++){
      var x=items[i],u,o,changed,j,old,n;
      if(!x||typeof x!=='object'||typeof x.url!=='string')continue;
      u=String(x.url||'');
      if(u.charAt(0)==='{'){
        try{
          o=JSON.parse(u);changed=false;
          if(o&&o.urls instanceof Array){
            for(j=0;j<o.urls.length;j++){old=String(o.urls[j]||'');n=stripNoPre(old);if(n!==old){o.urls[j]=n;changed=true;}}
            if(changed)x.url=JSON.stringify(o);
          }
        }catch(_e){}
      }else if(u.indexOf('#noPre#')>=0)x.url=stripNoPre(u);
    }
    return items;
  }
  return{version:VERSION,magnetSource:magnetSource,restoreVip:restoreVip};
})();
