/* ACFAN 0.1.0-test.4 website terminal */
var ACFANPlayback=(function(){
  var C=ACFANCore;
  function bridgeUrl(kind,id,title,chapter){return C.page('acfanT4Bridge',{acf_kind:kind||'video',acf_id:id||'',acf_title:title||'',acf_chapter:chapter||''});}
  function bridgeScript(kind,id,title,chapter){var data={kind:String(kind||''),id:String(id||''),title:String(title||''),chapter:String(chapter||'')};return '('+function(cfg){
    try{document.documentElement.style.background='#fff';if(document.body)document.body.style.background='#fff';}catch(e){}
    var tries=0,lastHref=location.href,lastSubmit=0;
    function text(el){return String((el&&el.innerText)||'').replace(/\s+/g,' ').trim();}
    function visible(el){if(!el)return false;var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}
    function click(el){try{if(el&&visible(el)){el.click();return true;}}catch(e){}return false;}
    function fire(el,t){try{el.dispatchEvent(new Event(t,{bubbles:true}));}catch(e){}}
    function setVal(el,val){try{var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(el,val);else el.value=val;}catch(e){el.value=val;}fire(el,'input');fire(el,'change');}
    function searchInput(){return document.querySelector('input[type=search],input[placeholder*=搜索],input[placeholder*=搜],input[name*=search],input[name*=keyword],input[type=text]');}
    function searchButton(input){var root=(input&&input.parentElement&&input.parentElement.parentElement)||document;var list=root.querySelectorAll('button,a,[role=button],i,svg');for(var i=0;i<list.length;i++){var s=(text(list[i])+' '+String(list[i].className||'')+' '+String(list[i].getAttribute&&list[i].getAttribute('aria-label')||'')+' '+String(list[i].getAttribute&&list[i].getAttribute('title')||'')).toLowerCase();if(/搜索|search|magnify/.test(s)&&visible(list[i]))return list[i].closest&&list[i].closest('button,a,[role=button]')||list[i];}return null;}
    function submit(input){if(!input||!cfg.title)return false;setVal(input,cfg.title);try{input.focus();input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));input.dispatchEvent(new KeyboardEvent('keypress',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));input.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));}catch(e){}var form=input.closest&&input.closest('form');try{if(form&&form.requestSubmit){form.requestSubmit();lastSubmit=Date.now();return true;}if(form){form.submit();lastSubmit=Date.now();return true;}}catch(e2){}var b=searchButton(input);if(click(b)){lastSubmit=Date.now();return true;}return false;}
    function findTitle(){var q=String(cfg.title||'').replace(/\s+/g,' ').trim();if(!q)return null;var keys=[q,q.slice(0,20),q.slice(0,12),q.slice(0,8)].filter(function(x){return x.length>=4;}),all=document.querySelectorAll('a,article,li,[role=button],div');for(var k=0;k<keys.length;k++){for(var i=0;i<all.length;i++){var z=text(all[i]);if(z&&z.indexOf(keys[k])>=0&&visible(all[i])){var a=all[i].closest&&all[i].closest('a');return a||all[i];}}}return null;}
    function terminalReady(){if(cfg.kind==='video'){var v=document.querySelector('video');if(v&&visible(v)){try{v.scrollIntoView({block:'start'});v.play();}catch(e){}return true;}var p=document.querySelector('iframe,[class*=player],[id*=player],[class*=video-player]');if(p&&visible(p)){try{p.scrollIntoView({block:'start'});}catch(e2){}return true;}}if(cfg.kind==='comic'){var imgs=document.querySelectorAll('main img,[class*=reader] img,[class*=comic] img');if(imgs.length>6){try{imgs[0].scrollIntoView({block:'start'});}catch(e3){}return true;}}return false;}
    function tick(){tries++;if(location.href!==lastHref){lastHref=location.href;lastSubmit=0;}if(terminalReady())return;var hit=findTitle();if(hit&&click(hit))return;var input=searchInput();if(input){var cur=String(input.value||'').trim(),want=String(cfg.title||'').trim();if(want&&(cur!==want||Date.now()-lastSubmit>4500))submit(input);}else{var all=document.querySelectorAll('button,a,[role=button],i,svg');for(var i=0;i<all.length;i++){var s=(text(all[i])+' '+String(all[i].className||'')+' '+String(all[i].getAttribute&&all[i].getAttribute('aria-label')||'')+' '+String(all[i].getAttribute&&all[i].getAttribute('title')||'')).toLowerCase();if(/搜索|search|magnify/.test(s)&&click(all[i].closest&&all[i].closest('button,a,[role=button]')||all[i]))break;}}
      if(tries>60)clearInterval(timer);
    }
    var timer=setInterval(tick,700);setTimeout(tick,250);
  }+')('+JSON.stringify(data)+');';}
  function directAudio(url,title){url=C.s(url).trim();if(!url)return'toast://没有可用音频';return JSON.stringify({urls:[url],names:[title||'播放'],headers:[{'User-Agent':C.ua}]});}
  return{bridgeUrl:bridgeUrl,bridgeScript:bridgeScript,directAudio:directAudio};
})();
