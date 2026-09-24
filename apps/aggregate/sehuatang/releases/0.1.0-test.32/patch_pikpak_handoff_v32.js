/* 色花堂 0.1.0-test.32 / Build 10132 - route PikPak magnet actions to the Hiker PikPak mini-app handoff page */
var SeHuaTangPatchTest32=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var VERSION='0.1.0-test.32',BUILD=10132;
function s(v){return v==null?'':String(v)}
function magnetFromNative(u){
  var x=s(u),mark='add_url=',i=x.indexOf(mark),raw='';
  if(i<0)return'';
  raw=x.slice(i+mark.length);
  if(!/^magnet:/i.test(raw)){try{raw=decodeURIComponent(raw)}catch(e){}}
  return /^magnet:\?xt=urn:btih:/i.test(raw)?raw:'';
}
function miniAppRoute(magnet){return 'hiker://page/fxlj?rule=PikPak&page=fypage&realurl='+encodeURIComponent(s(magnet));}
function install(){
  if(C.__shtPikPakMiniAppV32)return;
  var oldQuick=C.quick;
  C.quick=function(title,url,ico){
    var t=s(title),u=s(url),mag;
    if(t==='PikPak'&&/^pikpakapp:\/\//i.test(u)){
      mag=magnetFromNative(u);
      u=mag?miniAppRoute(mag):'toast://未识别到 PikPak 调用磁链';
    }
    return oldQuick(t,u,ico);
  };
  C.__shtPikPakMiniAppV32=1;
}
function module(){
  install();
  var m=BASE.module();
  m.version=VERSION;m.build=BUILD;
  m._debug=m._debug||{};
  m._debug.pikpakHandoffV32={target:'hiker://page/fxlj?rule=PikPak',param:'realurl',nativeAppSchemeDisabled:true};
  return m;
}
var P={version:VERSION,build:BUILD,module:module};
SeHuaTangRemoteRuntime=P;
return P;
})();
