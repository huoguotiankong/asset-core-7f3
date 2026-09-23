/* 色花堂 0.1.0-test.21 / Build 10121 - mobile guide cards */
var SeHuaTangPatchTest21=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
function s(v){return v==null?'':String(v)}
function trim(v){return C.trim(v)}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function pageKey(mode){return'sht_guide_page_v21_'+mode}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function goodTitle(t){t=trim(t);return !!t&&t.length>=4&&t.length<=180&&!/本帖最后由.+编辑|^(查看帖子|查看|回复|最后发表|最后回复|上一页|下一页|返回|首页|论坛|社区版块|搜索|发帖|更多)$/i.test(t)&&!/^\d+$/.test(t)}
function fallbackParse(html,base){
  var x=s(html),re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,map={},order=[],u,id,t,sc,k,i,st,en,ctx,imgs;
  while((m=re.exec(x))!==null){u=C.abs(m[2]||m[3]||'',base);id=C.threadId(u);if(!id)continue;t=trim(C.strip(m[5]||''));if(!goodTitle(t))continue;sc=Math.min(t.length,140)+(t.length>=10?30:0)+(/[【\[].+[】\]]|原创|写真|无码|有码|预览|FC2|IPX|ROE|SSIS/i.test(t)?12:0);k=String(id);if(!map[k]){map[k]={id:k,title:t,url:C.toMobile(u),titleIndex:m.index,score:sc,imgs:[],meta:{},summary:''};order.push(k)}else if(sc>map[k].score){map[k].title=t;map[k].url=C.toMobile(u);map[k].titleIndex=m.index;map[k].score=sc}}
  order.sort(function(a,b){return map[a].titleIndex-map[b].titleIndex});
  for(i=0;i<order.length;i++){var it=map[order[i]];st=it.titleIndex;en=i+1<order.length?map[order[i+1]].titleIndex:Math.min(x.length,st+70000);if(en<=st||en-st>90000)en=Math.min(x.length,st+70000);ctx=x.slice(st,en);imgs=C.allImages(ctx,base,6)||[];it.imgs=imgs;it.summary=trim(C.strip(ctx).replace(it.title,' ').replace(/本帖最后由[^。\n]{0,80}编辑/gi,' ').replace(/查看帖子|查看全部|回复|最后发表|最后回复/g,' ').replace(/\s+/g,' '));if(it.summary.length>170)it.summary=it.summary.slice(0,170)+'…'}
  return order.map(function(q){return map[q]})
}
function segment(html,items,i){var x=s(html),it=items[i]||{},st=Number(it.titleIndex||0),en=i+1<items.length?Number(items[i+1].titleIndex||0):x.length;if(!st||en<=st||en-st>90000)return'';return x.slice(st,en)}
function enrich(items,html,base){var i,it,ctx,mt,tag;for(i=0;i<items.length;i++){it=items[i];it.url=C.toMobile(it.url||'');ctx=segment(html,items,i);if((!it.imgs||!it.imgs.length)&&ctx)it.imgs=C.allImages(ctx,base,6)||[];if(!it.meta)it.meta={};if(ctx){mt=C.strip(ctx);if(!it.meta.time){var tm=mt.match(/(\d+\s*(?:分钟|小时|天)前(?:发布)?|前天\s*\d{1,2}:\d{2}|昨天\s*\d{1,2}:\d{2}|\d{4}-\d{1,2}-\d{1,2}(?:\s+\d{1,2}:\d{2})?)/);if(tm)it.meta.time=tm[1]}tag=(mt.match(/#([^#]{2,20})#/i)||[])[1]||'';if(tag)it.tag='#'+tag+'#';try{if(typeof SeHuaTangV19Forum!=='undefined'&&SeHuaTangV19Forum.stats)it.stats=SeHuaTangV19Forum.stats(ctx,it)}catch(e){}}if(!goodTitle(it.title))it.title='主题 '+(i+1);if(it.summary){it.summary=trim(s(it.summary).replace(/本帖最后由[^。\n]{0,80}编辑/gi,' ').replace(/\s+/g,' '));if(it.summary===it.title)it.summary='';if(it.summary.length>170)it.summary=it.summary.slice(0,170)+'…'}if(it.imgs&&it.imgs.length>3)it.imgs=it.imgs.slice(0,3)}return items}
function parseItems(m,html,base){var a=[],fn=m._debug&&m._debug.parseCardsV15;try{if(fn)a=fn(html,base,0)||[]}catch(e){a=[]}if(!a.length)a=fallbackParse(html,base);return enrich(a,html,base)}
function statText(x){x=x||{};var a=[];if(x.replies)a.push('💬 '+x.replies);if(x.likes)a.push('👍 '+x.likes);if(x.views)a.push('👁 '+x.views);return a.join('　')}
function authorRow(d,it,ref){var m=it.meta||{},av=m.avatar?C.imageUrl(m.avatar,ref):'',desc=[];if(m.time)desc.push(m.time);if(it.tag)desc.push(it.tag);if(m.author||av||desc.length)d.push({title:(m.author||'发布者')+(m.role?' · '+m.role:''),desc:desc.join('　'),img:av,pic_url:av,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false,cls:'sht_v21_guide_author'}})}
function previewRows(d,it,ref,u){var imgs=it.imgs||[],j,p,ct;if(!imgs.length)return;ct=imgs.length>=3?'pic_3':(imgs.length===2?'pic_2':'pic_1_full');for(j=0;j<imgs.length&&j<3;j++){p=C.imageUrl(imgs[j],ref);d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v21_guide_preview'}})}}
function guide(m){
  var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=pageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),url=guideUrl(mode,p),html='',items=[],i,it,u,st;
  setPageTitle(name);
  html=C.renderList(url);items=parseItems(m,html,url);
  if(!items.length){html=C.fetchPage(url,false);items=parseItems(m,html,url)}
  if(!items.length){var pc=C.toPc(url);html=C.fetchPage(pc,true);items=parseItems(m,html,pc)}
  C.saveDiag('guide.cards.v21',mode+' p='+p+' items='+items.length+' url='+url);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());
  d.push(C.section(name,'手机端卡片 · 第 '+p+' 页 · '+items.length+' 条主题'));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());
  if(!items.length){d.push(C.empty('本页没有解析到主题','可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){it=items[i];u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});authorRow(d,it,url);d.push({title:it.title,desc:it.summary||'',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v21_guide_card'}});previewRows(d,it,url,u);st=statText(it.stats);if(st)d.push({title:'',desc:st,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:'sht_v21_guide_stat'}});d.push(C.line('sht_v21_guide_sep'))}
  d.push(pbtn('上一页',key,Math.max(1,p-1),p>1));d.push(pbtn('回第1页',key,1,p>1));d.push(pbtn('下一页',key,p+1,true));setResult(d)
}
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.21';m.build=10121;m.forum=function(){if(C.pageParam('sht_auto',''))return guide(m);return oldForum()};m.settings=(function(old){return function(){var d=[];setPageTitle('色花堂设置');d.push(C.section('Test21 三个话题手机卡片','最新发表/热门/精华使用和手机网页版接近的作者行 + 标题摘要 + 最多3张预览图 + 底部统计；预览图片沿用Cookie/Referer图片头。'));d.push({title:'打开旧设置',desc:'访问状态 / Cookie / 最近诊断',url:C.route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}})(m.settings);return m}
var P={version:'0.1.0-test.21',build:10121,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
