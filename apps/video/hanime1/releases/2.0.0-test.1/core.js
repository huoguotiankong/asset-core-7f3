/* Hanime1 Remote Test 2.0.0-test.1 - Core / Protocol / Challenge */
var HanimeCore=(function(){
  var BUILD='2.0.0-test.1';
  var UA='Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36';
  var VIDEO_HOSTS=['https://hanime1.com','https://hanime1.me','https://www.hanime2.sbs'];
  var COMIC_HOST='https://hanimeone.me';
  var KEY_HOST='hanime2_active_host';
  var KEY_HOST_TS='hanime2_host_ts';
  var KEY_ACCOUNTS='hanime2_accounts';
  var KEY_ACTIVE_ACCOUNT='hanime2_active_account';
  var KEY_ACCOUNT_MODE='hanime2_account_mode';

  function trim(v){return String(v==null?'':v).replace(/^\s+|\s+$/g,'');}
  function clean(v){return trim(String(v==null?'':v).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' '));}
  function abs(base,u){u=trim(u).replace(/&amp;/g,'&');if(!u)return '';if(/^https?:\/\//i.test(u))return u;if(u.indexOf('//')===0)return 'https:'+u;base=String(base||'').replace(/\/+$/,'');return base+(u.charAt(0)==='/'?'':'/')+u;}
  function parseFetch(raw){
    try{var x=JSON.parse(String(raw||''));if(x&&typeof x==='object'&&x.body!==undefined)return {body:String(x.body||''),headers:x.headers||{},statusCode:Number(x.statusCode||200)};}catch(e){}
    return {body:String(raw||''),headers:{},statusCode:200};
  }
  function challenge(resp){
    resp=resp||{};var b=String(resp.body||''),h=resp.headers||{},mit=(h['cf-mitigated']||h['CF-Mitigated']||[]);if(typeof mit==='string')mit=[mit];
    return Number(resp.statusCode||0)===403&&(mit.join(' ').toLowerCase().indexOf('challenge')>=0||/cf-chl-|challenge-form|Just a moment|Attention Required|請稍等|请稍等/i.test(b));
  }
  function validHtml(resp){var b=String((resp&&resp.body)||'');return !!b&&b.length>500&&!challenge(resp)&&!/<title>\s*(?:403|Access denied|Error)\b/i.test(b);}
  function form(data){var a=[];Object.keys(data||{}).forEach(function(k){var v=data[k];if(v===undefined||v===null)return;if(Array.isArray(v)){v.forEach(function(x){a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(x)));});}else a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(v)));});return a.join('&');}
  function query(url,params){var a=[];Object.keys(params||{}).forEach(function(k){var v=params[k];if(v===undefined||v===null||v==='')return;if(Array.isArray(v)){v.forEach(function(x){a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(x)));});}else a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(v)));});return url+(a.length?(url.indexOf('?')>=0?'&':'?')+a.join('&'):'');}
  function cookieMap(s){var out={};String(s||'').split(';').forEach(function(p){var i=p.indexOf('=');if(i<=0)return;var k=trim(p.substring(0,i)),v=trim(p.substring(i+1));if(!k)return;var low=k.toLowerCase();if(['path','domain','expires','max-age','secure','httponly','samesite','priority','partitioned'].indexOf(low)>=0)return;out[k]=v;});return out;}
  function mergeCookies(){var out={};for(var i=0;i<arguments.length;i++){var m=cookieMap(arguments[i]);Object.keys(m).forEach(function(k){out[k]=m[k];});}return Object.keys(out).map(function(k){return k+'='+out[k];}).join('; ');}
  function onlyClearance(s){var m=cookieMap(s),out=[];Object.keys(m).forEach(function(k){if(k.toLowerCase()==='cf_clearance')out.push(k+'='+m[k]);});return out.join('; ');}
  function withoutClearance(s){var m=cookieMap(s),out=[];Object.keys(m).forEach(function(k){if(k.toLowerCase()!=='cf_clearance')out.push(k+'='+m[k]);});return out.join('; ');}
  function accounts(){try{var a=JSON.parse(getItem(KEY_ACCOUNTS,'[]'));return Array.isArray(a)?a:[];}catch(e){return [];}}
  function activeAccount(){var id=getItem(KEY_ACTIVE_ACCOUNT,'');if(!id||id==='__anonymous__')return null;var a=accounts();for(var i=0;i<a.length;i++)if(String(a[i].id)===String(id))return a[i];return null;}
  function accountCookie(base){
    var mode=getItem(KEY_ACCOUNT_MODE,'browser');
    if(mode==='managed'){var a=activeAccount();return a?String(a.cookie||''):'';}
    try{return String(getCookie(base)||'');}catch(e){return '';}
  }
  function browserCookie(base){try{return String(getCookie(base)||'');}catch(e){return '';}}
  function headers(base,referer,extra){var h={'User-Agent':UA,'Referer':referer||base+'/'};var c=mergeCookies(accountCookie(base),onlyClearance(browserCookie(base)));if(c)h.Cookie=c;Object.keys(extra||{}).forEach(function(k){h[k]=extra[k];});return h;}
  function rawRequest(url,opt){opt=opt||{};var base=opt.base||origin(url),o={headers:headers(base,opt.referer||base+'/',opt.headers||{}),timeout:Number(opt.timeout||15000),withStatusCode:true};if(opt.method)o.method=opt.method;if(opt.body!==undefined)o.body=opt.body;try{return parseFetch(fetch(url,o));}catch(e){return {body:'',headers:{},statusCode:0,error:String(e.message||e)};}}
  function origin(url){var m=String(url||'').match(/^(https?:\/\/[^/]+)/i);return m?m[1]:'';}
  function autoVerify(url){
    try{
      var base=origin(url),before=onlyClearance(browserCookie(base));
      var html=fetchCodeByWebView(url,{headers:{'User-Agent':UA,'Referer':base+'/'},timeout:30000,blockRules:['doubleclick.net','googlesyndication.com'],checkJs:$.toString(function(){var t=(document.title||'')+' '+(document.body?document.body.innerText:'');if(/Just a moment|Attention Required|請稍等|请稍等/i.test(t))return null;if(document.querySelector('#challenge-form,[id*=challenge-stage]'))return null;return document.documentElement?document.documentElement.outerHTML.length:null;})});
      var after=onlyClearance(browserCookie(base));
      return {ok:!!(html&&String(html).length>500)||!!(after&&after!==before),cookie:after};
    }catch(e){return {ok:false,error:String(e.message||e)};}
  }
  function request(url,opt){
    opt=opt||{};var r=rawRequest(url,opt);if(challenge(r)&&opt.verify!==false){var v=autoVerify(url);if(v.ok)r=rawRequest(url,opt);}
    r.challenge=challenge(r);r.url=url;return r;
  }
  function get(url,opt){opt=opt||{};opt.method='GET';return request(url,opt);}
  function post(url,data,opt){opt=opt||{};opt.method='POST';opt.body=typeof data==='string'?data:form(data||{});opt.headers=opt.headers||{};if(!opt.headers['Content-Type'])opt.headers['Content-Type']='application/x-www-form-urlencoded; charset=UTF-8';return request(url,opt);}
  function hostOrder(){var a=[],saved=getItem(KEY_HOST,''),manual=getItem('hanime2_manual_host','auto');if(manual&&manual!=='auto')a.push(manual);if(saved)a.push(saved);VIDEO_HOSTS.forEach(function(x){a.push(x);});var out=[];a.forEach(function(x){x=String(x||'').replace(/\/+$/,'');if(x&&out.indexOf(x)<0)out.push(x);});return out;}
  function resolveHost(force){
    var ts=Number(getItem(KEY_HOST_TS,'0')||0),saved=getItem(KEY_HOST,'');if(!force&&saved&&new Date().getTime()-ts<6*60*60*1000)return saved;
    var list=hostOrder();for(var i=0;i<list.length;i++){var b=list[i],r=get(b+'/',{base:b,timeout:10000});if(validHtml(r)&&/Hanime|home-rows|horizontal-card|watch\?v=/i.test(r.body)){setItem(KEY_HOST,b);setItem(KEY_HOST_TS,String(new Date().getTime()));return b;}}
    return saved||VIDEO_HOSTS[0];
  }
  function video(path,opt){var b=resolveHost(false);path=String(path||'');var url=/^https?:\/\//i.test(path)?path:b+(path.charAt(0)==='/'?'':'/')+path;var r=get(url,{base:b,referer:b+'/',timeout:(opt&&opt.timeout)||15000});if(r.statusCode===0||(!r.challenge&&!validHtml(r))){var list=hostOrder();for(var i=0;i<list.length;i++){if(list[i]===b)continue;var u=list[i]+(path.charAt(0)==='/'?'':'/')+path,rr=get(u,{base:list[i],referer:list[i]+'/',timeout:12000});if(validHtml(rr)){setItem(KEY_HOST,list[i]);setItem(KEY_HOST_TS,String(new Date().getTime()));rr.base=list[i];return rr;}}}r.base=b;return r;}
  function comic(path){path=String(path||'');var url=/^https?:\/\//i.test(path)?path:COMIC_HOST+(path.charAt(0)==='/'?'':'/')+path;var r=get(url,{base:COMIC_HOST,referer:COMIC_HOST+'/',timeout:15000});r.base=COMIC_HOST;return r;}
  function state(){return {build:BUILD,base:resolveHost(false),cookie:browserCookie(resolveHost(false)),managed:getItem(KEY_ACCOUNT_MODE,'browser')==='managed',active:getItem(KEY_ACTIVE_ACCOUNT,'')};}
  function saveAccount(acc,cookie){var a=accounts(),id=String(acc.id||acc.name||new Date().getTime()),item={id:id,name:acc.name||('账号 '+id),email:acc.email||'',avatar:acc.avatar||'',cookie:withoutClearance(cookie||''),savedAt:new Date().getTime()};a=a.filter(function(x){return String(x.id)!==id;});a.unshift(item);if(a.length>8)a=a.slice(0,8);setItem(KEY_ACCOUNTS,JSON.stringify(a));setItem(KEY_ACTIVE_ACCOUNT,id);setItem(KEY_ACCOUNT_MODE,'managed');return item;}
  function activateAccount(id){setItem(KEY_ACCOUNT_MODE,'managed');setItem(KEY_ACTIVE_ACCOUNT,String(id||'__anonymous__'));}
  function removeAccount(id){var a=accounts().filter(function(x){return String(x.id)!==String(id);});setItem(KEY_ACCOUNTS,JSON.stringify(a));if(getItem(KEY_ACTIVE_ACCOUNT,'')===String(id))setItem(KEY_ACTIVE_ACCOUNT,'__anonymous__');}
  function useBrowserSession(){setItem(KEY_ACCOUNT_MODE,'browser');clearItem(KEY_ACTIVE_ACCOUNT);}
  return {build:BUILD,ua:UA,videoHosts:VIDEO_HOSTS,comicHost:COMIC_HOST,trim:trim,clean:clean,abs:abs,form:form,query:query,origin:origin,challenge:challenge,validHtml:validHtml,request:request,get:get,post:post,video:video,comic:comic,resolveHost:resolveHost,autoVerify:autoVerify,headers:headers,browserCookie:browserCookie,accountCookie:accountCookie,onlyClearance:onlyClearance,withoutClearance:withoutClearance,mergeCookies:mergeCookies,accounts:accounts,activeAccount:activeAccount,saveAccount:saveAccount,activateAccount:activateAccount,removeAccount:removeAccount,useBrowserSession:useBrowserSession,state:state};
})();
