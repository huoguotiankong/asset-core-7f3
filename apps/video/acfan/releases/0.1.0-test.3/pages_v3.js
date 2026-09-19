/* ACFAN 0.1.0-test.3 pages */
var ACFANPages=(function(){
  var C=ACFANCore,P=ACFANProvider,I=ACFANImage,B=ACFANPlayback,U=ACFANUI,D=U.design;
  var TAB='acfan_t3_tab',SORT='acfan_t3_sort',SEARCH_KIND='acfan_t3_search_kind',MINE='acfan_t3_mine';
  var TABS=[['featured','ç²¾é€‰'],['lifan','é‡Œç•ª'],['anime','åŠ¨æ¼«'],['video','è§†é¢‘'],['short','çŸ­è§†é¢‘'],['comic','æ¼«ç”»'],['fiction','å°è¯´'],['audio','æœ‰å£°'],['community','ç¤¾åŒº']];
  function tabName(id){for(var i=0;i<TABS.length;i++)if(TABS[i][0]===id)return TABS[i][1];return'ç²¾é€‰';}
  function page(path,p){return C.page(path,p);}
  function searchInput(home){return{title:'æœç´¢',desc:'è§†é¢‘ / æ¼«ç”» / å°è¯´ / æœ‰å£° / ç¤¾åŒº',col_type:'input',url:home?"(function(){var w=String(input||'').trim();if(!w)return 'toast://è¯·è¾“å…¥å…³é”®è¯';putMyVar('acfan_t3_search_kw',w);return 'hiker://page/acfanT3Search?rule=&simple=true&q='+encodeURIComponent(w);})()":"(function(){var w=String(input||'').trim();putMyVar('acfan_t3_search_kw',w);if(w)$.require('acfanT3').saveSearch(w);refreshPage(false);return 'hiker://empty';})()",extra:{defaultValue:home?'':C.param('q',getMyVar('acfan_t3_search_kw','')),titleVisible:true}};}
  function homeHeader(d){d.push(searchInput(true));var cur=getMyVar(TAB,'featured')||'featured';for(var i=0;i<TABS.length;i++)d.push(U.chip(TABS[i][1],cur===TABS[i][0],U.state(TAB,TABS[i][0]),'scroll_button'));d.push(U.line());d.push(U.quick('æ”¶è—',D.icons.fav,$('#noLoading#').lazyRule(function(){putMyVar('acfan_t3_mine','fav');return'hiker://page/acfanT3Mine?rule=&simple=true';})));d.push(U.quick('å†å²',D.icons.history,$('#noLoading#').lazyRule(function(){putMyVar('acfan_t3_mine','history');return'hiker://page/acfanT3Mine?rule=&simple=true';})));d.push(U.quick('è®¾ç½®',D.icons.settings,page('acfanT3Settings')));d.push(U.quick('ç½‘ç«™',D.icons.logo,C.getH5()));d.push(U.line());}
  function stateFor(section){return{station:getMyVar('acfan_t3_station_'+section,''),classId:getMyVar('acfan_t3_class_'+section,''),zoneId:getMyVar('acfan_t3_tag_'+section,''),tagId:getMyVar('acfan_t3_fiction_tag_'+section,''),categoryId:getMyVar('acfan_t3_cat_'+section,''),shortType:getMyVar('acfan_t3_short_type','2'),sort:getMyVar(SORT,'1')};}
  function filters(d,section,r){var f=r.filters||{},i;if(f.stations&&f.stations.length){for(i=0;i<f.stations.length;i++)d.push(U.chip(f.stations[i].name,f.selectedStation&&String(f.selectedStation.id)===String(f.stations[i].id),U.state('acfan_t3_station_'+section,f.stations[i].id),'scroll_button'));d.push(U.line());}if(f.classes&&f.classes.length){for(i=0;i<f.classes.length;i++)d.push(U.chip(f.classes[i].name,f.selectedClass&&String(f.selectedClass.id)===String(f.classes[i].id),U.state('acfan_t3_class_'+section,f.classes[i].id),'scroll_button'));d.push(U.line());}if(f.zones&&f.zones.length){for(i=0;i<f.zones.length;i++)d.push(U.chip(f.zones[i].name,f.selectedZone&&String(f.selectedZone.id)===String(f.zones[i].id),U.state('acfan_t3_tag_'+section,f.zones[i].id),'scroll_button'));d.push(U.line());}if(f.tags&&f.tags.length){for(i=0;i<f.tags.length;i++)d.push(U.chip(f.tags[i].name,f.selectedTag&&String(f.selectedTag.id)===String(f.tags[i].id),U.state('acfan_t3_fiction_tag_'+section,f.tags[i].id),'scroll_button'));d.push(U.line());}if(section==='anime'||section==='video'||section==='featured'||section==='lifan'||section==='comic'){var sort=getMyVar(SORT,'1');d.push(U.chip('æ¨è',sort==='1',U.state(SORT,'1'),'scroll_button'));d.push(U.chip('æœ€æ–°',sort==='2',U.state(SORT,'2'),'scroll_button'));d.push(U.line());}if(section==='short'){var st=getMyVar('acfan_t3_short_type','2');d.push(U.chip('æ¨è',st==='2',U.state('acfan_t3_short_type','2'),'scroll_button'));d.push(U.chip('æœ€æ–°',st==='1',U.state('acfan_t3_short_type','1'),'scroll_button'));d.push(U.line());}}
  function normalize(section,x){if(section==='comic')return P.comicInfo(x);if(section==='fiction'||section==='audio')return P.fictionInfo(x,section);if(section==='community')return P.dynamicInfo(x);var v=P.videoInfo(x);if(section==='short')v.kind='short';return v;}
  function home(){var d=[],pg=C.pageNo(),section=getMyVar(TAB,'featured')||'featured';setPageTitle('ACFANÂ·T3');try{if(pg===1)homeHeader(d);var r=P.list(section,pg,stateFor(section));if(pg===1){d.push(U.section(tabName(section),section==='anime'||section==='video'?'æŒ‰ 1.9.7 å½“å‰åˆ†ç±»åè®®åŠ è½½':'ç¬¬ '+pg+' é¡µ'));filters(d,section,r);}for(var i=0;i<r.items.length;i++){var info=normalize(section,r.items[i]);if(info.id)d.push(U.card(info));}if(!r.items.length)d.push(U.empty('å½“å‰æš‚æ— å†…å®¹','åˆ‡æ¢åˆ†ç±»æˆ–ç¨åé‡è¯•'));}catch(e){d.push(U.empty('åŠ è½½å¤±è´¥',String(e.message||e)));}setResult(d);}
  function search(){var d=[],pg=C.pageNo(),q=C.clean(getMyVar('acfan_t3_search_kw',C.param('q',''))),kind=getMyVar(SEARCH_KIND,'video')||'video';setPageTitle('ACFANÂ·T3 æœç´¢');d.push(searchInput(false));var kinds=[['video','è§†é¢‘'],['comic','æ¼«ç”»'],['fiction','å°è¯´'],['audio','æœ‰å£°'],['community','ç¤¾åŒº']];for(var k=0;k<kinds.length;k++)d.push(U.chip(kinds[k][1],kind===kinds[k][0],U.state(SEARCH_KIND,kinds[k][0]),'scroll_button'));d.push(U.line());if(!q){var h=C.searchHistory();if(h.length){d.push(U.section('æœ€è¿‘æœç´¢',''));for(var j=0;j<h.length;j++)d.push(U.chip(h[j],false,$('#noLoading#').lazyRule(function(x){putMyVar('acfan_t3_search_kw',x);refreshPage(false);return'hiker://empty';},h[j]),'flex_button'));}else d.push(U.empty('è¾“å…¥å…³é”®è¯å¼€å§‹æœç´¢'));setResult(d);return;}C.saveSearch(q);try{var rows=P.search(kind,q,pg);if(pg===1)d.push(U.section('â€œ'+q+'â€',rows.length?'å·²æ‰¾åˆ°å†…å®¹':'æš‚æ— ç»“æœ'));for(var i=0;i<rows.length;i++){var info=kind==='comic'?P.comicInfo(rows[i]):(kind==='fiction'||kind==='audio'?P.fictionInfo(rows[i],kind):(kind==='community'?P.dynamicInfo(rows[i]):P.videoInfo(rows[i])));if(info.id)d.push(U.card(info));}if(!rows.length)d.push(U.empty('æ²¡æœ‰æ‰¾åˆ°ç›¸å…³å†…å®¹','æ¢ä¸ªå…³é”®è¯è¯•è¯•'));}catch(e){d.push(U.empty('æœç´¢å¤±è´¥',String(e.message||e)));}setResult(d);}
  function favButton(item){var on=C.isFav(item.kind,item.id);return{title:on?'â˜… å·²æ”¶è—':'â˜† æ”¶è—',url:$('#noLoading#').lazyRule(function(j){var x=JSON.parse(j),on=$.require('acfanT3').toggleFav(x);refreshPage(false);return'toast://'+(on?'å·²æ”¶è—':'å·²å–æ¶ˆæ”¶è—');},JSON.stringify(item)),col_type:'text_3',extra:{lineVisible:false}};}
  function videoDetail(seed,d){var obj={};try{obj=P.detail('video',seed.id)||{};}catch(e){}var i=P.videoInfo(C.merge(seed,obj));if(!i.id)i.id=seed.id;if(!i.title||i.title==='æœªå‘½åè§†é¢‘')i.title=seed.title;if(!i.img)i.img=seed.img;if(!i.author)i.author=seed.author;setPageTitle(i.title||'è§†é¢‘è¯¦æƒ…');var pic=I.url(i.img);d.push({title:i.title,desc:[i.author,i.watch?'æ’­æ”¾ '+C.fmtNum(i.watch):'',i.like?'ç‚¹èµ '+C.fmtNum(i.like):'',i.duration].filter(Boolean).join(' Â· '),img:pic,pic_url:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});d.push({title:'â–¶ ç«‹å³æ’­æ”¾',desc:'æ‰“å¼€å½“å‰ ACFAN ç½‘ç«™å¹¶è‡ªåŠ¨å®šä½',img:D.icons.play,url:B.bridgeUrl('video',i.id,i.title,''),col_type:'text_icon',extra:{lineVisible:false}});d.push(favButton({kind:'video',id:i.id,title:i.title,img:i.img,author:i.author,desc:i.desc,uri:i.uri}));d.push({title:'è¯„è®º',url:page('acfanT3Comments',{id:i.id,title:i.title}),col_type:'text_3',extra:{lineVisible:false}});d.push({title:'å¤åˆ¶æ ‡é¢˜',url:'copy://'+i.title,col_type:'text_3',extra:{lineVisible:false}});if(i.desc){d.push(U.line());d.push(U.section('ä»«ç»',''));d.push({title:C.html(i.desc),url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false}});}C.addHistory({kind:'video',id:i.id,title:i.title,img:i.img,author:i.author,desc:i.desc,uri:i.uri});}
  function comicDetail(seed,d){var obj={};try{obj=P.detail('comic',seed.id)||{};}catch(e){}var i=P.comicInfo(C.merge(seed,obj));if(!i.id)i.id=seed.id;if(!i.title*i.title=seed.title;if(!i.img)i.img=seed.img;if(!i.author)Z.author=seed.author;setPageTitle(i.title||'æ¼«ç”»è¯¦æƒ…ç);var pic=I.url(i.img);d.push({title:i.title,desc:[i.author,i.desc].filter(Boolean).join(' Â·È	ÊK[YÎœXËX×İ\›œXË\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰Û[İšYWÌWÛYÜXÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
˜]]ÛŠÚÚ[™‰ØÛÛZXÉËYšKšY]NšK]K[YÎšKš[YË]]ÜšK˜]]Ü‹\ØÎšKœÙ\ØßJJNÙœ\Ú
İ]N‰ùïdzhmzf!z+îÉË\›‹˜œšYÙU\›
	ØÛÛZXÉËKšYK]K	ÉÊKÛÛİ\N‰İ^ÌÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
İ]N‰ùi#yb-¹¨!úh¦	Ë\›‰ØÛÜN‹ËÉÊÚK]KÛÛİ\N‰İ^ÌÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNİ˜\ˆÚT˜Ú\\”›İÜÊØš‹	ØÛÛZXÉÊNÙœ\Ú
K›[™J
JNÙœ\Ú
KœÙXİ[ÛŠ	ùêè:" ¹æë¹oeIËÚ›[™İÉùal	ÊØÚ›[™İ
ÉÈ9êè	Î‰ù£©ycèù¦ ¹¥è:/å9fçºç›ùoeIÊJNÙ›ÜŠ˜\ˆÏLØÏÚ›[™İØÊÊÊYœ\Ú
İ]N˜ÚØÖØ×K]K\›œYÙJ	ØXÙ˜[•ĞÛÛZXÔ™XY\‰ËØÛÛZXÎšKšYÚ\\˜ÚØ×KšY]NšK]JÉÈ0­È	ÊØÚØ×K]_JKÛÛİ\N‰İ^Í	Ë^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÚYŠXÚ›[™İ
Yœ\Ú
İ]N‰ù/oùå*9ïdyêæzf!z+îÉË\ØÎ‰ùodùbcy£©ycèùæëùoey..¹ên¹¥í9éà9.ã¹odùbcyo 9o 	ÊK\›‹˜œšYÙU\›
	ØÛÛZXÉËKšYK]K	ÉÊKÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNĞË˜Y\İÜJÚÚ[™‰ØÛÛZXÉËYšKšY]NšK]K[YÎšKš[YË]]ÜšK˜]]Ü‹\ØÎšK™\ØßJNßBˆ[˜İ[ÛˆšXİ[Û‘]Z[
ÙYYÚ[™
^İ˜\ˆØš^ßNİ^ÛØšT™]Z[
Ú[™ÙYYšY
_ßNßXØ]Ú
J^ß]˜\ˆOT™šXİ[Û’[™›ÊË›Y\™ÙJÙYYØšŠKÚ[™
NÚYŠZKšY
ZKšY\ÙYYšYÚYŠZK]JZK]O\ÙYY]NÚYŠZKš[YÊZKš[YÏ\ÙYYš[YÎÚYŠZK˜]]ÜŠZK˜]]Ü\ÙYY˜]]ÜÜÙ]YÙU]JK]_
Ú[™OOIØ]Y[ÉÏÉù§"yhì:+é¹ áyÊN‰ùl#ú+í:+é¹ áIÊJNİ˜\ˆXÏRK\›
Kš[YÊNÙœ\Ú
İ]NšK]K\ØÎ–ÚK˜]]Ü‹K™\Ø×K™š[\Š›ÛÛX[ŠKš›Ú[Š	È0­È	ÊK[YÎœXËX×İ\›œXË\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰Û[İšYWÌWÛYÜXÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
˜]]ÛŠÚÚ[™šÚ[™YšKšY]NšK]K[YÎšKš[YË]]ÜšK˜]]Ü‹\ØÎšK™\ØßJJNÙœ\Ú
İ]N‰ùïdzhmy¢dùo 	Ë\›‹˜œšYÙU\›
Ú[™KšYK]K	ÉÊKÛÛİ\N‰İ^ÌÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
İ]N‰ùi#yb-¹¨!úh¦	Ë\›‰ØÛÜN‹ËÉÊÚK]KÛÛİ\N‰İ^ÌÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNİ˜\ˆÚT˜Ú\\”›İÜÊØš‹	ÙšXİ[Û‰ÊNÙœ\Ú
K›[™J
JNÙœ\Ú
KœÙXİ[ÛŠÚ[™OOIØ]Y[ÉÏÉúgìúh¤yæë¹oeIÎ‰ùêè:" ¹æë¹oeIËÚ›[™İÉùalH	ÊØÚ›[™İ
ÉÈ9êè	Î‰ù£©ycèù¦ ¹§*º/å9fç¹æë¹oeIÊJNÙ›ÜŠ˜\ˆÏLØÏÚ›[™İØÊÊÊYœ\Ú
İ]N˜ÚØ×K]K\›œYÙJ	ØXÙ˜[•ÑšXİ[Û”™XY\‰ËÚÚ[™šÚ[™šYšKšYÚY˜ÚØ×KšY]NšK]JÉÈ0­È	ÊØÚØ×K]_JKÛÛİ\N‰İ^Ì‰Ë^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÚYŠXÚ›[™İ
Yœ\Ú
İ]N‰ù/oùå*9ïdyêæy¢dùo 	Ë\›‹˜œšYÙU\›
Ú[™KšYK]K	ÉÊKÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNĞË˜Y\İÜJÚÚ[™šÚ[™YšKšY]NšK]K[YÎšKš[YË]]ÜšK˜]]Ü‹\ØÎšK™\ØßJNßBˆ[˜İ[ÛˆÛÛ[][š]Q]Z[
ÙYY
^İ˜\ˆØš^ßNİ^ÛØšT™]Z[
	ØÛÛ[][š]IËÙYYšY
_ßNßXØ]Ú
J^ß]˜\ˆOT™[˜[ZXÒ[™›ÊË›Y\™ÙJÙYYØšŠJNÚYŠZKšY
ZKšY\ÙYYšYÚYŠZK]JZK]O\ÙYY]NÚYŠZKš[YÊZKš[YÏ\ÙYYš[YÎÚYŠZK˜]]ÜŠZK˜]]Ü\ÙYY˜]]ÜÜÙ]YÙU]J	ùé/¹c.¹bª9  IÊNÚYŠKš[YÊ^İ˜\ˆXÏRK\›
Kš[YÊNÙœ\Ú
İ]NšK˜]]ÜŸ	ùé/¹c.‰Ë\ØÎšK]K[YÎœXËX×İ\›œXË\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰Û[İšYWÌWÛYÜXÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNßY[ÙHœ\Ú
İ]NšK˜]]ÜŸ	ùé/¹c.¹bª9  IË\ØÎšK]K\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
˜]]ÛŠÚÚ[™‰ØÛÛ[][š]IËYšKšY]NšK]K[YÎšKš[YË]]ÜšK˜]]Ü‹\ØÎšK]_JJNÙœ\Ú
İ]N‰ùïdzhmy§éyç"ÉË\›‹˜œšYÙU\›
	ØÛÛ[][š]IËKšYK]K	ÉÊKÛÛİ\N‰İ^ÌÉË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNĞË˜Y\İÜJÚÚ[™‰ØÛÛ[][š]IËYšKšY]NšK]K[YÎšKš[YË]]ÜšK˜]]Ü‹\ØÎšK]_JNßBˆ[˜İ[Ûˆ]Z[

^İ˜\ˆV×KÚ[™PËœ\˜[J	ØXÙ—ÚÚ[™	Ë	İšY[ÉÊKÙYY^ÚÚ[™šÚ[™YËœ\˜[J	ØXÙ—ÚY	Ë	ÉÊK]NËœ\˜[J	ØXÙ—İ]IË	ÉÊK[YÎËœ\˜[J	ØXÙ—Ú[YÉË	ÉÊK]]ÜËœ\˜[J	ØXÙ—Ø]]Ü‰Ë	ÉÊ_NÚYŠ\ÙYYšY
^ÜÙ]™\İ[
ÕK™[\J	ú+é¹ áycà¹¥l9ï.¹i,IÊWJNÜ™]\›ß]^ÚYŠÚ[™OOIİšY[ÉßÚ[™OOIÜÚÜ	Ê]šY[Ñ]Z[
ÙYY
NÙ[ÙHYŠÚ[™OOIØÛÛZXÉÊXÛÛZXÑ]Z[
ÙYY
NÙ[ÙHYŠÚ[™OOIÙšXİ[Û‰ßÚ[™OOIØ]Y[ÉÊYšXİ[Û‘]Z[
ÙYYÚ[™
NÙ[ÙHYŠÚ[™OOIØÛÛ[][š]IÊXÛÛ[][š]Q]Z[
ÙYY
NÙ[ÙHšY[Ñ]Z[
ÙYY
NßXØ]Ú
J^Ùœ\Ú
K™[\J	ú+é¹ áyb¨:/oyi,z-)IËİš[™ÊK›Y\ÜØYÙ_JJJNß\Ù]™\İ[

NßBˆ[˜İ[ÛˆÛÛ[Y[Ê
^İ˜\ˆV×KYPËœ\˜[J	ÚY	Ë	ÉÊK]OPËœ\˜[J	İ]IË	ú)áºh¤IÊKÏPËœYÙS›Ê
KÛÜYÙ]^U˜\Š	ØXÙ˜[—İ×ØÛÛ[Y[ÜÛÜ	Ë	Úİ	ÊNÜÙ]YÙU]J]JÉÈ0­È:+á:+®‰ÊNÚYŠÏOOLJ^Ùœ\Ú
K˜Ú\
	ùàëzeê	ËÛÜOOIÚİ	ËKœİ]J	ØXÙ˜[—İ×ØÛÛ[Y[ÜÛÜ	Ë	Úİ	ÊK	İ^Ì‰ÊJNÙœ\Ú
K˜Ú\
	ù§ 9¥¬	ËÛÜOOIÛ™]ÉËKœİ]J	ØXÙ˜[—İ×ØÛÛ[Y[ÜÛÜ	Ë	Û™]ÉÊK	İ^Ì‰ÊJNÙœ\Ú
K›[™J
JNß]^İ˜\ˆ›İÜÏT˜ÛÛ[Y[ÊYËÛÜ
NÙ›ÜŠ˜\ˆOLÚO›İÜË›[™İÚJÊÊ^İ˜\ˆ\›İÜÖÚW_ßK˜[YOPË˜ÛX[ŠË™Y\
ÉÛšXÚÛ˜[YIË	ÛšXÚÓ˜[YIË	Û˜[YIË	İ\Ù\“˜[YIË	Ø]]Ü“˜[YI×K
_	ùå*9¢-ÉÊK^PË˜ÛX[ŠË™Y\
ÉØÛÛ[	Ë	ØÛÛ[Y[ÛÛ[	Ë	İ^	Ë	ÛY\ÜØYÙI×K
JNÙœ\Ú
İ]N›˜[YK\ØÎ^\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNßZYŠ\›İÜË›[™İ
Yœ\Ú
K™[\J	ù¦ ¹¥è:+á:+®‰ÊJNßXØ]Ú
J^Ùœ\Ú
K™[\J	ú+á:+®¹b¨:/oyi,z-)IËİš[™ÊK›Y\ÜØYÙ_JJJNß\Ù]™\İ[

NßBˆ[˜İ[ÛˆÛÛZXÔ™XY\Š
^İ˜\ˆV×KÛÛZXÏPËœ\˜[J	ØÛÛZXÉË	ÉÊKÚ\\PËœ\˜[J	ØÚ\\‰Ë	ÉÊK]OPËœ\˜[J	İ]IË	ù¯*ùå.úf!z+îÉÊNÜÙ]YÙU]J]JNİ^İ˜\ˆ›ÛİT˜ÛÛZXĞÚ\\ŠÛÛZXËÚ\\ŠK[YÜÏT˜ÛÛZXÒ[XYÙ\Ê›Ûİ
NÙ›ÜŠ˜\ˆOLÚO[YÜË›[™İÚJÊÊ^İ˜\ˆORK›ÜšYÚ[˜[
[YÜÖÚWK\›[YÜÖÚWK™ÛXZ[ŠNÙœ\Ú
İ]N‰ÉË[YÎKX×İ\›K\›KÛÛİ\N‰ÜX×ÌWÙ[	Ë^˜NÛ[™Uš\ÚX›N™˜[Ù__JNßZYŠZ[YÜË›[™İ
Yœ\Ú
K™[\J	ù§+9êè9fï¹âaù..¹ên‰Ë	ú/å9fçº+é¹ áycëù/oùå*9ïdzhmzf!z+îÉÊJNßXØ]Ú
J^Ùœ\Ú
K™[\J	ùêè:" ¹b¨:/oyi,z-)IËİš[™ÊK›Y\ÜØYÙ_JJJNß\Ù]™\İ[

NßBˆ[˜İ[ÛˆšXİ[Û”™XY\Š
^İ˜\ˆV×KÚ[™PËœ\˜[J	ÚÚ[™	Ë	ÙšXİ[Û‰ÊKšYPËœ\˜[J	ÙšY	Ë	ÉÊKÚYPËœ\˜[J	ØÚY	Ë	ÉÊK]OPËœ\˜[J	İ]IË	úf!z+îÉÊNÜÙ]YÙU]J]JNİ^İ˜\ˆ›ÛİT™šXİ[ÛÚ\\ŠšYÚY
K^[ØYT™šXİ[Û”^[ØY
›Ûİ
NÚYŠÚ[™OOIØ]Y[ÉÉ‰œ^[ØY˜]Y[ÜË›[™İ
^Ù›ÜŠ˜\ˆOLØO^[ØY˜]Y[ÜË›[™İØJÊÊYœ\Ú
İ]N‰ø¥­ˆ9¤«y¥/ˆ	ÊÊJÌJK\›‰
	ÈÛ›ÓØY[™ÈÉÊK›^T[J[˜İ[ÛŠK
^Ü™]\›ˆ	œ™\]Z\™J	ØXÙ˜[•ÉÊK™\™Xİ]Y[ÊK
NßK^[ØY˜]Y[ÜÖØWK]JKÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
K›[™J
JNßY›ÜŠ˜\ˆOLÚO^[ØYš[XYÙ\Ë›[™İÚJÊÊ^İ˜\ˆ[ORK\›
^[ØYš[XYÙ\ÖÚWJNÙœ\Ú
İ]N‰ÉË[YÎš[KX×İ\›š[K\›š[KÛÛİ\N‰ÜX×ÌWÙ[	Ë^˜NÛ[™Uš\ÚX›N™˜[Ù__JNßZYŠ^[ØY^Ë›[™İ
Yœ\Ú
İ]NËš[
^[ØY^Ëš›Ú[Š	×—‰ÊJK\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰ÜšXÚİ^	Ë^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÚYŠ\^[ØY^Ë›[™İ	‰ˆ\^[ØY˜]Y[ÜË›[™İ	‰ˆ\^[ØYš[XYÙ\Ë›[™İ
Yœ\Ú
K™[\J	ù§+9êè9a¡yk®y..¹ên‰Ë	ú/å9fçº+é¹ áycëù/oùå*9ïdzhmy¢dùo 	ÊJNßXØ]Ú
J^Ùœ\Ú
K™[\J	ùêè:" ¹b¨:/oyi,z-)IËİš[™ÊK›Y\ÜØYÙ_JJJNß\Ù]™\İ[

NßBˆ[˜İ[ÛˆœšYÙJ
^İ˜\ˆÚ[™PËœ\˜[J	ØXÙ—ÚÚ[™	Ë	İšY[ÉÊKYPËœ\˜[J	ØXÙ—ÚY	Ë	ÉÊK]OPËœ\˜[J	ØXÙ—İ]IË	ĞPÑS‰ÊKÚ\\PËœ\˜[J	ØXÙ—ØÚ\\‰Ë	ÉÊNÜÙ]YÙU]J]JNÜÙ]™\İ[
Şİ\›Ë™Ù]J
KÛÛİ\N‰ŞWİÙXšY]×ÜÚ[™ÛIË\ØÎ‰Û\İ	‰œØÜ™Y[‹LL	Ë^˜NØØ[˜XÚÎYKÚİÔ›ÙÜ™\ÜÎYKXNËXKœÎ‹˜œšYÙTØÜš\
Ú[™Y]KÚ\\ŠKœÓØY[™Ò[š™XİYK›Ø]šY[ÎY__WJNßBˆ[˜İ[ÛˆZ[™J
^İ˜\ˆV×K[ÙOYÙ]^U˜\ŠRS‘K	Ù˜]‰Ê_	Ù˜]‰ÎÚYŠ[ÙHOOIÚ\İÜIÊ[[ÙOIÙ˜]‰ÎÜÙ]YÙU]J[ÙOOOIÙ˜]‰ÏÉù¢$yæ¡9¥-º%ãÉÎ‰ú)à¹ç"ùc¡¹cì‰ÊNÙœ\Ú
K˜Ú\
	ù¥-º%ãÉË[ÙOOOIÙ˜]‰ËKœİ]JRS‘K	Ù˜]‰ÊK	İ^Ì‰ÊJNÙœ\Ú
K˜Ú\
	ùc¡¹cì‰Ë[ÙOOOIÚ\İÜIËKœİ]JRS‘K	Ú\İÜIÊK	İ^Ì‰ÊJNÙœ\Ú
K›[™J
JNİ˜\ˆO[[ÙOOOIÙ˜]‰ÏĞË™˜]›Üš]\Ê
NËš\İÜJ
NÙ›ÜŠ˜\ˆOLÚOK›[™İÚJÊÊYœ\Ú
K˜Ø\™
VÚWJJNÚYŠXK›[™İ
Yœ\Ú
K™[\J[ÙOOOIÙ˜]‰ÏÉú/æ9¬¨y§"y¥-º%ãÉÎ‰ú/æ9¬¨y§"z)à¹ç"ú+¬9oeIÊJNÜÙ]™\İ[

NßBˆ[˜İ[ÛˆÙ][™ÜÊ
^İ˜\ˆV×KÏPË™Ù]XYÊ
NÜÙ]YÙU]J	ĞPÑS°­ÕÈ:+¯¹ïk‰ÊNÙœ\Ú
KœÙXİ[ÛŠ	ùodùbcyâb9§+	Ë	Õ\İŒKŒ]\İŒÈ0­ÈZ[LLÉÊJNÙœ\Ú
İ]N‰ÒH9g,9g`	Ë\ØÎË™Ù]J
K\›‰
Ë™Ù]J
K	ú/¤ùaiyodùbcHPÑSˆÛ[Øš[H9g,9g`	ÊKš[œ]
[˜İ[ÛŠ
^İ˜\ˆOIœ™\]Z\™J	ØXÙ˜[•ÉÊKœÙ]J[œ]
NÜ™Yœ™\ÚYÙJ˜[ÙJNÜ™]\›‰İØ\İ‹Ëùmì¹/çykf	ÊİNßJKÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
İ]N‰úaãy¥¬9nî¹êâù®.9k¨¹/&º+çIË\›‰
	ÈÛ›ÓØY[™ÈÉÊK›^T[J[˜İ[ÛŠ
^İ˜\ˆOIœ™\]Z\™J	ØXÙ˜[•ÉÊNÛK˜ÛX\“ØØ[
	ÜÙ\ÜÚ[Û‰ÊNİ˜\ˆÚÏ[Kœ™Yœ™\ÚÙ\ÜÚ[ÛŠ
NÜ™Yœ™\ÚYÙJ˜[ÙJNÜ™]\›‰İØ\İ‹ËÉÊÊÚÏÉù£©ycèùmì¹ h¹i#IÎ‰ù¦ ¹§*¹¢o¹b,9cëùå*9£©ycèÉÊNßJKÛÛİ\N‰İ^ÌIË^˜NÛ[™Uš\ÚX›N™˜[Ù__JNÙœ\Ú
K›[™J
JNÙœ\Ú
İ]N‰ù®!yên¹¤'9í(º+¬9oeIË\›‰
	ÈÛ›ÓØY[™ÈÉÊK›^T[J[˜İ[ÛŠ
^Éœ™\]Z\™J	ØXÙ˜[•ÉÊK˜ÛX\“ØØ[
	ÜÙX\˜Ú	ÊNÜ™]\›‰İØ\İ‹Ëùmì¹®!yên‰ÎßJKÛÛİ\N‰İ^ÌIßJNÙœ\Ú
İ]N‰ù®!yênº)à¹ç"ùc¡¹cì‰Ë\›‰
	ÈÛ›ÓØY[™ÈÉÊK›^T[J[˜İ[ÛŠ
^Éœ™\]Z\™J	ØXÙ˜[•ÉÊK˜ÛX\“ØØ[
	Ú\İÜIÊNÜ™Yœ™\ÚYÙJ˜[ÙJNÜ™]\›‰İØ\İ‹Ëùmì¹®!yên‰ÎßJKÛÛİ\N‰İ^ÌIßJNÙœ\Ú
K›[™J
JNÙœ\Ú
İ]N‰ù§ :/äz+â¹¥«{ï&‰ÊĞË˜ÛX[ŠËœİYÙ_	ù¦ ¹¥è	ÊK\ØÎË˜ÛX[ŠË›\Ùß	ÉÊK\›‰ÚZÙ\‹ËÙ[\IËÛÛİ\N‰ÛÛ™×İ^	ßJNÜÙ]™\İ[

NßBˆ™]\›ÚÛYNšÛYKÙX\˜ÚœÙX\˜Ú]Z[™]Z[ÛÛ[Y[Î˜ÛÛ[Y[ËÛÛZXÔ™XY\˜ÛÛZXÔ™XY\‹šXİ[Û”™XY\™šXİ[Û”™XY\‹œšYÙN˜œšYÙKZ[™N›Z[™KÙ][™ÜÎœÙ][™ÜßNÂŸJJ
NÂ