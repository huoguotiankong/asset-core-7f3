/* Hanime1 2.0.0-test.6 - WebView only for challenge/login, native fetch afterwards */
var HanimeSession6=(function(C){
  var BUILD='2.0.0-test.6';
  var oldGet=C.get,oldPost=C.post,oldVideo=C.video,oldComic=C.comic;
  function ht(h){try{return JSON.stringify(h||{});}catch(e){return String(h||'');}}
  function challenge(r){r=r||{};var b=String(r.body||''),h=ht(r.headers),code=Number(r.statusCode||0),a=b+'\n'+h;
    var strong=/cf-chl-|challenge-form|Just a moment|Attention Required|Checking your browser|Verify you are human|challenges\.cloudflare\.com|cf-turnstile|turnstile/i.test(a);
    var header=/cf-mitigated[\s\S]{0,200}challenge/i.test(h);
    return header||strong||((code===403||code===429||code===503)&&/cloudflare|challenge/i.test(a));
  }
  function browserVerify(url){
    var base=C.origin(url),before='';try{before=C.browserCookie(base);}catch(e){}
    try{
      var html=fetchCodeByWebView(url,{headers:{'User-Agent':C.ua,'Referer':base+'/'},timeout:45000,blockRules:['doubleclick.net','googlesyndication.com'],checkJs:$.toString(function(){var t=(document.title||'')+' '+(document.body?document.body.innerText:'');if(/Just a moment|Attention Required|Checking your browser|Verify you are human|請稍等|请稍等/i.test(t))return null;if(document.querySelector('#challenge-form,[id*=challenge-stage],.cf-turnstile'))return null;return document.documentElement&&document.documentElement.outerHTML.length>500?document.documentElement.outerHTML.length:null;})});
      var after='';try{after=C.browserCookie(base);}catch(e){}
      return {ok:!!(html&&String(html).length>500)||!!(after&&after!==before),cookie:after};
    }catch(e){return {ok:false,error:String(e.message||e)};}
  }
  function retry(getter,url,verify){var r=getter();if(challenge(r)&&verify!==false){browserVerify(url);r=getter();}if(r){r.challenge=challenge(r);r.url=r.url||url;}return r;}
  C.get=function(url,opt){opt=opt||{};return retry(function(){return oldGet(url,opt);},url,opt.verify);};
  C.post=function(url,data,opt){opt=opt||{};return retry(function(){return oldPost(url,data,opt);},url,opt.verify);};
  C.video=function(path,opt){var target=/^https?:\/\//i.test(String(path||''))?String(path):C.resolveHost(false)+(String(path||'').charAt(0)==='/'?'':'/')+String(path||'');return retry(function(){return oldVideo(path,opt);},target,opt&&opt.verify);};
  C.comic=function(path){var target=/^https?:\/\//i.test(String(path||''))?String(path):C.comicHost+(String(path||'').charAt(0)==='/'?'':'/')+String(path||'');return retry(function(){return oldComic(path);},target,true);};
  C.challenge=challenge;
  C.browserVerify=browserVerify;
  C.ensureSession=function(url){var base=C.origin(url),r=C.get(url,{base:base,referer:base+'/',verify:false,timeout:12000});if(!challenge(r)&&Number(r.statusCode||0)>0&&Number(r.statusCode||0)<400)return {ok:true,verified:false,status:r.statusCode};var v=browserVerify(url);r=C.get(url,{base:base,referer:base+'/',verify:false,timeout:12000});return {ok:!challenge(r)&&Number(r.statusCode||0)>0&&Number(r.statusCode||0)<400,verified:!!v.ok,status:r.statusCode,error:v.error||''};};
  C.build=BUILD;
  return {build:BUILD,challenge:challenge,browserVerify:browserVerify};
})(HanimeCore);
