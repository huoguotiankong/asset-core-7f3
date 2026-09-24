/* PikPak Test19 Build10121 - local multi-account Web Session registry */
(function(C){
    var KEY='accounts',CURRENT='current_account_id',MAX=8,baseSave=C.saveSession;
    function now(){return new Date().getTime();}
    function clone(o){try{return JSON.parse(JSON.stringify(o||{}));}catch(e){return {};}}
    function read(){var a=C.readJsonItem(KEY,[]);if(!(a instanceof Array))a=[];var out=[];for(var i=0;i<a.length;i++){var x=a[i]||{};if(x.id&&x.session&&(x.session.access_token||x.session.refresh_token))out.push(x);}return out;}
    function write(a){C.writeJsonItem(KEY,(a instanceof Array?a:[]).slice(0,MAX));}
    function idOf(s){s=s||{};if(s.sub)return 'sub-'+String(s.sub);var seed=String(s.refresh_token||s._device_id||s.access_token||'');return seed?'web-'+md5(seed):'';}
    function defaultLabel(s,index){var u=String((s&&s.username)||'').trim();if(u)return u;var sub=String((s&&s.sub)||'');return sub?'PikPak · '+sub.slice(-6):'PikPak 账号 '+String(index||1);}
    function current(){var id=C.item(CURRENT,''),a=read(),s=C.session(),sid=idOf(s),i;if(id)for(i=0;i<a.length;i++)if(a[i].id===id)return id;if(sid)for(i=0;i<a.length;i++)if(a[i].id===sid){C.set(CURRENT,sid);return sid;}return '';}
    function upsert(s,label){s=clone(s);var id=idOf(s);if(!id)return null;var a=read(),old=null,i;for(i=a.length-1;i>=0;i--)if(a[i].id===id){old=a[i];a.splice(i,1);}var entry={id:id,label:String(label||old&&old.label||defaultLabel(s,a.length+1)),username:String(s.username||old&&old.username||''),session:s,captcha_token:String(C.item('captcha_token','')||old&&old.captcha_token||''),savedAt:now(),lastUsed:now()};a.unshift(entry);write(a);C.set(CURRENT,id);return entry;}
    C.saveSession=function(s,profile,deviceId){var out=baseSave(s,profile,deviceId);if(out&&(out.access_token||out.refresh_token))upsert(out,'');return out;};
    C.accounts=function(){return read();};
    C.currentAccountId=current;
    C.ensureCurrentAccount=function(){var s=C.session();if(!s||(!s.access_token&&!s.refresh_token))return null;var id=idOf(s),a=read(),i;for(i=0;i<a.length;i++)if(a[i].id===id){C.set(CURRENT,id);return a[i];}return upsert(s,C.username&&C.username());};
    C.switchAccount=function(id){id=String(id||'');var a=read(),x=null,i;for(i=0;i<a.length;i++)if(a[i].id===id){x=a[i];break;}if(!x)return {error:'ACCOUNT_NOT_FOUND',error_description:'本机未找到这个账号会话'};var s=clone(x.session),p=(C.webAuthProfile&&String(s._auth_profile||'web')==='web')?C.webAuthProfile:null;baseSave(s,p,s._device_id||'');if(x.captcha_token)C.set('captcha_token',x.captcha_token);else C.clear('captcha_token');if(x.username&&C.setUsername)C.setUsername(x.username);else if(C.setUsername)C.setUsername('');C.set(CURRENT,id);C.clear('quota_cache');C.clear('quota_ts');C.clear('my_pack_id');x.lastUsed=now();a.splice(i,1);a.unshift(x);write(a);return {ok:true,account:x};};
    C.renameAccount=function(id,label){id=String(id||'');label=String(label||'').trim();if(!label)return {error:'EMPTY_LABEL',error_description:'账号名称不能为空'};var a=read(),i;for(i=0;i<a.length;i++)if(a[i].id===id){a[i].label=label;write(a);return {ok:true,account:a[i]};}return {error:'ACCOUNT_NOT_FOUND',error_description:'本机未找到这个账号'};};
    C.removeAccount=function(id){id=String(id||'');var a=read(),next=[],removed=null,wasCurrent=current()===id,i;for(i=0;i<a.length;i++){if(a[i].id===id)removed=a[i];else next.push(a[i]);}if(!removed)return {error:'ACCOUNT_NOT_FOUND',error_description:'本机未找到这个账号'};write(next);if(wasCurrent){if(next.length)return C.switchAccount(next[0].id);C.logout();C.clear(CURRENT);}return {ok:true,remaining:next.length};};
    C.ensureCurrentAccount();
})(PikPakCore);
