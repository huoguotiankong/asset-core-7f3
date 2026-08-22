/* Hanime1 2.0.0-test.7 - public library + preview month fix */
(function(C,P){
var BUILD='2.0.0-test.7';
var oldPreviews=P.previews;
function previewMonth(v){v=String(v||'').replace(/[^0-9]/g,'');if(v.length>=6)return v.slice(0,6);var n=new Date(),m=String(n.getMonth()+1);if(m.length<2)m='0'+m;return String(n.getFullYear())+m;}
P.previews=function(month){return oldPreviews(previewMonth(month));};
P.previewMonth=previewMonth;
P.publicLibrary=function(opt){opt=opt||{};return P.search({query:'',genre:opt.genre||'',sort:opt.sort||'upload_date',date:opt.date||'',duration:opt.duration||'',type:'',page:Number(opt.page||1)});};
P.librarySorts=[['最新上传','upload_date'],['最新上市','release_date'],['今日排行','today'],['本周排行','week'],['本月排行','month'],['总排行','views']];
P.build=BUILD;C.build=BUILD;
})(HanimeCore,HanimeProvider);
