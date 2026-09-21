function mjSafeJson(text, fallback) { try { return JSON.parse(text); } catch (e) { return fallback; } }
function mjNum(v) { var n = Number(v || 0); return isFinite(n) ? n : 0; }
function mjBytes(n) {
    n = mjNum(n); if (n <= 0) return "";
    var units=["B","KB","MB","GB","TB"], i=0;
    while(n>=1024 && i<units.length-1){n/=1024;i++;}
    return n.toFixed(n>=100?0:(n>=10?1:2))+" "+units[i];
}
function mjMagnet(hash,title){hash=String(hash||"").trim();if(!hash)return "";var u="magnet:?xt=urn:btih:"+hash;if(title)u+="&dn="+encodeURIComponent(String(title));return u;}
function mjHashFromMagnet(url){var m=String(url||"").match(/btih:([A-Za-z0-9]+)/i);return m?String(m[1]).toUpperCase():"";}
function mjDate(ts){var n=mjNum(ts);if(!n)return "";try{if(n<1000000000000)n*=1000;var d=new Date(n),m=String(d.getMonth()+1),day=String(d.getDate());if(m.length<2)m="0"+m;if(day.length<2)day="0"+day;return d.getFullYear()+"-"+m+"-"+day;}catch(e){return "";}}
function mjHtmlText(text){return String(text||"").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();}
function mjSizeTextToBytes(text){text=String(text||"").replace(/&nbsp;/g," ").trim();var m=text.match(/([0-9.]+)\s*(B|KB|MB|GB|TB)/i);if(!m)return 0;var n=Number(m[1]||0),u=String(m[2]||"B").toUpperCase(),pow={B:0,KB:1,MB:2,GB:3,TB:4}[u]||0;return Math.round(n*Math.pow(1024,pow));}

function mjProviders(){
    var arr=$.require("configs").getUsefulJson();
    var out=[{id:"all",name:"聚合"}];
    for(var i=0;i<arr.length;i++)out.push({id:arr[i].id,name:arr[i].name,type:arr[i].type});
    return out;
}
function mjReqBTDig(keyword,page){return {url:"https://www.btdig.com/search?q="+encodeURIComponent(String(keyword||""))+"&p="+(Math.max(1,page)-1)+"&order=0",options:{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","Accept-Language":"zh-CN,zh;q=0.9,en;q=0.6"},timeout:10000}};}
function mjParseBTDig(text){
    text=String(text||"");if(!text||text.indexOf("one_result")<0){if(/captcha|cloudflare|access denied|forbidden/i.test(text))throw new Error("被风控/拦截");return [];}
    var out=[],re=/<div class="one_result"[\s\S]*?(?=<div class="one_result"|$)/g,m;
    while((m=re.exec(text))!==null){var block=m[0],mm=block.match(/<a href="(magnet:\?xt=urn:btih:[^"]+)"/i),nm=block.match(/<div class="torrent_name"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i),sm=block.match(/<span class="torrent_size"[^>]*>([\s\S]*?)<\/span>/i);if(!mm||!nm)continue;var magnet=String(mm[1]||"").replace(/&amp;/g,"&");out.push({title:mjHtmlText(nm[1])||"未命名资源",magnet:magnet,rawUrl:magnet,hash:mjHashFromMagnet(magnet),bytes:mjSizeTextToBytes(sm?mjHtmlText(sm[1]):""),seeders:-1,peers:-1,date:""});}
    return out;
}
function mjRunBTDig(rule,keyword,page){var r=mjReqBTDig(keyword,page);return mjParseBTDig(fetch(r.url,r.options));}
function mjRunKnaben(rule,keyword,page){
    var size=40,body={query:String(keyword||""),order_by:"seeders",order_direction:"desc",from:(Math.max(1,page)-1)*size,size:size,hide_unsafe:true,hide_xxx:false};
    var text=fetch("https://api.knaben.org/v1",{headers:{"content-type":"application/json"},body:JSON.stringify(body),method:"POST",timeout:12000});
    var obj=mjSafeJson(text,null);if(!obj||!Array.isArray(obj.hits))throw new Error("返回不是有效 JSON hits");var out=[];
    for(var i=0;i<obj.hits.length;i++){var h=obj.hits[i]||{},magnet=h.magnetUrl||mjMagnet(h.hash,h.title);if(!magnet)continue;out.push({title:String(h.title||"未命名资源"),magnet:magnet,rawUrl:magnet,hash:String(h.hash||mjHashFromMagnet(magnet)||"").toUpperCase(),bytes:mjNum(h.bytes),seeders:mjNum(h.seeders),peers:mjNum(h.peers),date:String(h.date||h.lastSeen||"")});}
    return out;
}
function mjRunApiBay(rule,keyword,page){
    var text=fetch("https://apibay.org/q.php?q="+encodeURIComponent(String(keyword||""))+"&cat=0",{timeout:12000});var arr=mjSafeJson(text,null);if(!Array.isArray(arr))throw new Error("返回不是 JSON 数组");if(arr.length===1&&String((arr[0]||{}).name||"").indexOf("No results")>=0)return [];
    var all=[];for(var i=0;i<arr.length;i++){var h=arr[i]||{},hash=String(h.info_hash||"").toUpperCase();if(!hash||/^0+$/.test(hash))continue;var magnet=mjMagnet(hash,h.name);all.push({title:String(h.name||"未命名资源"),magnet:magnet,rawUrl:magnet,hash:hash,bytes:mjNum(h.size),seeders:mjNum(h.seeders),peers:mjNum(h.leechers),date:mjDate(h.added)});}
    all.sort(function(a,b){return b.seeders-a.seeders||b.bytes-a.bytes;});var size=25,start=(Math.max(1,page)-1)*size;return all.slice(start,start+size);
}
function mjRunBuiltin(rule,keyword,page){var id=rule.builtin||rule.id;if(id==="btdig")return mjRunBTDig(rule,keyword,page);if(id==="knaben")return mjRunKnaben(rule,keyword,page);if(id==="apibay")return mjRunApiBay(rule,keyword,page);throw new Error("未知内置 Provider: "+id);}

function mjNormalizeScriptItem(it,rule){
    if(!it)return null;if(typeof it==="string")it={title:it,url:it};
    var raw=String(it.magnet||it.url||it.ciliUrl||"").trim();if(!raw)return null;
    var magnet=(raw.indexOf("magnet:?")===0||raw.indexOf("ed2k://")===0)?raw:"";
    return {title:String(it.title||it.name||"未命名资源"),magnet:magnet,rawUrl:raw,hash:mjHashFromMagnet(magnet),bytes:mjNum(it.bytes||it.sizeBytes),seeders:it.seeders===undefined?-1:mjNum(it.seeders),peers:it.peers===undefined?-1:mjNum(it.peers),date:String(it.date||""),desc:String(it.desc||""),pic_url:it.pic_url||"",sharePwd:it.sharePwd||"",ruleId:rule.id,source:rule.name};
}
function mjRunScript(rule,keyword,page){
    if(!rule.find)throw new Error("find 为空");
    var fn=new Function("s","page","user","basicUrl",String(rule.find));
    var list=fn(keyword,page,rule.user||{},rule.basicUrl||"");
    if(!list)return [];if(!Array.isArray(list))throw new Error("find 必须返回数组");
    var out=[];for(var i=0;i<list.length;i++){var n=mjNormalizeScriptItem(list[i],rule);if(n)out.push(n);}return out;
}
function mjPreciseMatch(title,keyword){var t=String(title||"").toLowerCase(),q=String(keyword||"").toLowerCase().trim();if(!q)return true;var parts=q.split(/[\s._\-]+/).filter(function(v){return !!v;});if(!parts.length)return t.indexOf(q)>=0;for(var i=0;i<parts.length;i++)if(t.indexOf(parts[i])<0)return false;return true;}

function mjSearch(keyword,page,providerId,precise){
    keyword=String(keyword||"").trim();page=Math.max(1,Number(page||1));providerId=providerId||"all";if(!keyword)return {items:[],errors:[]};
    var rules=$.require("configs").getUsefulJson();if(providerId!=="all")rules=rules.filter(function(r){return r.id===providerId;});
    var items=[],errors=[];
    for(var i=0;i<rules.length;i++){
        var rule=rules[i];if(page>1&&rule.page===false)continue;
        try{var part=rule.type==="builtin"?mjRunBuiltin(rule,keyword,page):mjRunScript(rule,keyword,page);for(var j=0;j<part.length;j++){var it=part[j];it.source=it.source||rule.name;it.ruleId=rule.id;items.push(it);}}
        catch(e){errors.push(rule.name+"："+(e.message||e));}
    }
    var seen={},merged=[];
    for(var x=0;x<items.length;x++){var it=items[x];if(precise&&!mjPreciseMatch(it.title,keyword))continue;var key=it.hash||mjHashFromMagnet(it.magnet)||it.rawUrl||it.magnet;key=String(key||"").toUpperCase();if(!key||seen[key])continue;seen[key]=1;merged.push(it);}
    return {items:merged,errors:errors};
}

function mjRuleExists(name){try{var raw=fetch("hiker://home@"+name);return raw&&raw!=="null";}catch(e){return false;}}
function mjHasPage(name,path){try{var raw=fetch("hiker://home@"+name),obj=JSON.parse(raw),ps=typeof obj.pages==="string"?JSON.parse(obj.pages||"[]"):(obj.pages||[]);for(var i=0;i<ps.length;i++)if(ps[i]&&ps[i].path===path)return true;}catch(e){}return false;}
function mjCallDiaoyong(magnet,candidates,label){for(var i=0;i<candidates.length;i++){var name=candidates[i];if(!mjRuleExists(name))continue;if(!mjHasPage(name,"diaoyong"))return "toast://【"+name+"】未发现外部调用页 diaoyong";return "hiker://page/diaoyong?rule="+name+"&page=fypage#"+magnet;}return "toast://未检测到【"+label+"】海阔小程序，请先安装";}
function mjRouteMagnet(magnet,mode){magnet=String(magnet||"").trim();mode=mode||"海阔视界";if(!magnet)return "toast://磁力链接为空";if(mode==="海阔视界")return magnet;if(mode==="查询云数据")return "hiker://page/SelectTorrent?curl="+encodeURIComponent(magnet);if(mode==="复制磁链"){copy(magnet);return "toast://复制成功";}if(mode==="115云盘"){if(!mjRuleExists("115.简"))return "toast://未检测到【115.简】小程序，请先安装";return "hiker://page/115Offline?rule=115.简&page=fypage&add="+encodeURIComponent(magnet);}if(mode==="迅雷云盘")return mjCallDiaoyong(magnet,["迅雷","迅雷云盘"],"迅雷云盘");if(mode==="PikPak")return mjCallDiaoyong(magnet,["PikPakM","PikPak","PIKPAK"],"PikPak");if(mode==="光鸭云盘")return mjCallDiaoyong(magnet,["光鸭云盘","光鸭"],"光鸭云盘");if(mode==="123云盘")return mjCallDiaoyong(magnet,["123云盘","123云盘M","123Pan","123盘"],"123云盘");return magnet;}

function mjRouteItem(item,mode){
    item=item||{};if(item.magnet)return mjRouteMagnet(item.magnet,mode);
    var raw=String(item.rawUrl||"").trim();if(!raw)return "toast://规则未返回可打开链接";
    var rules=$.require("configs").getJson(),rule=null;for(var i=0;i<rules.length;i++)if(rules[i].id===item.ruleId){rule=rules[i];break;}
    if(rule&&rule.findAliUrl){
        try{
            var fn=new Function("input","basicUrl",String(rule.findAliUrl));var ret=fn(raw,rule.basicUrl||"");
            if(Array.isArray(ret)){var vals=[];for(var j=0;j<ret.length;j++){var v=ret[j];if(typeof v==="string")vals.push(v);else if(v&&typeof v==="object")vals.push(v.ciliUrl||v.url||v.magnet||"");}vals=vals.filter(function(v){return !!v;});if(!vals.length)return "toast://解析结果为空";if(vals.length===1)return mjRouteMagnet(vals[0],mode);return "select://"+JSON.stringify({title:"请选择链接",options:vals,col:1,js:$.toString(function(mode){return $.require("hiker://page/MJSearchCore").routeMagnet(input,mode);},mode)});}
            if(ret&&typeof ret==="object")ret=ret.ciliUrl||ret.url||ret.magnet||"";
            if(ret)return mjRouteMagnet(String(ret),mode);
        }catch(e){return "toast://"+rule.name+" 链接解析失败："+(e.message||e);}
    }
    if(raw.indexOf("magnet:?")===0||raw.indexOf("ed2k://")===0)return mjRouteMagnet(raw,mode);
    if(raw.indexOf("http")===0)return "web://"+raw;
    return raw;
}

$.exports={providers:mjProviders,search:mjSearch,routeMagnet:mjRouteMagnet,routeItem:mjRouteItem,bytes:mjBytes};