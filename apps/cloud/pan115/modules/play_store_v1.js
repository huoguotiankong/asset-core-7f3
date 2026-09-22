(function(){
/*__PAN115_PLAY_STORE_V1__*/
function read(key){try{var a=JSON.parse(getItem(key,"[]"));return a instanceof Array?a:[];}catch(e){return[];}}
function write(key,a){try{setItem(key,JSON.stringify(a||[]));}catch(e){}}
function norm(raw){var v={};try{v=typeof raw==="string"?JSON.parse(raw):(raw||{});}catch(e){v={};}return {fid:String(v.fid||""),pc:String(v.pc||""),name:String(v.name||"视频"),size:Number(v.size||0),sourceCid:String(v.sourceCid||""),sourceName:String(v.sourceName||""),trail:String(v.trail||"")};}
function upsertRecent(v){if(!v.fid)return;var a=read("115PlayRecentV2"),out=[];v.playAt=Date.now();out.push(v);for(var i=0;i<a.length&&out.length<50;i++)if(String((a[i]||{}).fid||"")!==v.fid)out.push(a[i]);write("115PlayRecentV2",out);}
function isFav(id){var a=read("115PlayFavoriteV2");for(var i=0;i<a.length;i++)if(String((a[i]||{}).fid||"")===String(id))return true;return false;}
function toggle(raw){try{var v=norm(raw);if(!v.fid)return"toast://缺少文件ID";var a=read("115PlayFavoriteV2"),out=[],found=false;for(var i=0;i<a.length;i++){var x=a[i]||{};if(String(x.fid||"")===v.fid){found=true;continue;}out.push(x);}if(!found){v.favAt=Date.now();out.unshift(v);}if(out.length>100)out=out.slice(0,100);write("115PlayFavoriteV2",out);return"toast://"+(found?"已取消收藏":"已收藏");}catch(e){return"toast://操作失败："+String(e.message||e);}}
function play(raw){var v=norm(raw);if(!v.fid&&!v.pc)return"toast://缺少播放信息";try{upsertRecent(v);}catch(e){}try{return $.require("115Api").player.resolve(JSON.stringify({pc:v.pc,fid:v.fid,name:v.name,kind:"video"}));}catch(ex){return"toast://播放失败："+String(ex.message||ex);}}
$.exports={play:play,toggle:toggle,isFav:isFav,norm:norm};
})();
