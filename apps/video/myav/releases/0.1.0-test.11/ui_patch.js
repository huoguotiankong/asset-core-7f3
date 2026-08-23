/* MyAv 0.1.0-test.11 - full filter control/result split */
(function(R,C){
if(!R||!C)throw new Error('MyAv runtime/core missing for Test11');
R.version='0.1.0-test.11';R.build=10111;R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v11_b10111.js';
function S(v){return v===undefined||v===null?'':String(v);}function sec(t,d){return{title:'▌ '+t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}function emp(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}function chip(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}};}function pg(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}function col(k){return C.layoutGet(k,'2')==='3'?'movie_3':'movie_2';}
function state(t,id,cur,k){return chip((id===cur?'● ':'')+t,$('#noLoading#').lazyRule(function(a,b){putMyVar(a,b);refreshPage(false);return'hiker://empty';},k,id));}
function tabs(d,key,current){var xs=[['有码','normal'],['欧美','western'],['国产','domestic'],['无码','uncensored']],i;for(i=0;i<xs.length;i++)d.push(state(xs[i][0],xs[i][1],current,key));}
function group(d,title,list,url,key){var i,x,active;if(!list||!list.length)return;d.push(sec(title,list.length+' 项 · 完整控制区'));for(i=0;i<list.length;i++){x=list[i];active=(C.asFullFilterUrl?C.asFullFilterUrl(x.href):x.href)===(C.asFullFilterUrl?C.asFullFilterUrl(url):url);d.push({title:(active?'● ':'')+x.text,url:$('#noLoading#').lazyRule(function(k,u){putMyVar(k,u);refreshPage(false);return'hiker://empty';},key,x.href),col_type:'flex_button',extra:{lineVisible:false}});}}
function card(m,s){var a=[];if(m.code)a.push(S(m.code).toUpperCase());if(m.date)a.push(m.date);if(m.flags&&m.flags.length)a.push(m.flags.join(' · '));return{title:m.title||m.code||'影片',desc:a.join(' · '),img:m.img||'',pic_url:m.img||'',url:C.page('myavDetail',{u:m.href,code:m.code||'',sec:s||m.section||'normal'}),col_type:col('home'),extra:{lineVisible:false,pageTitle:m.code||m.title||'影片'}};}
R.filters=function(){
 var d=[],p=pg(),s=getMyVar('myav_filter_section','normal'),key='myav_filter_url_'+s,root=s==='normal'?C.fullFilterRoot:C.sectionUrl(s),u=getMyVar(key,root),base,target,h,g,it,i,ctrl;
 if(!u)u=root;
 base=C.fetchHtml(u);target=C.paginatedUrl(u,p,base);h=p===1?base:C.fetchHtml(target);
 if(p===1){setPageTitle('高级筛选');tabs(d,'myav_filter_section',s);
   if(s==='normal'){ctrl=C.fullFilterControl(u);g=ctrl.groups;group(d,'分类',g.category,u,key);group(d,'年份',g.years,u,key);group(d,'标签',g.tags,u,key);group(d,'玩法',g.play,u,key);group(d,'资源状态',g.other,u,key);}
   else{g=C.filterGroups(base,u);group(d,'年份',g.years,u,key);group(d,'标签',g.tags,u,key);group(d,'资源状态',g.other,u,key);}
   d.push(sec('筛选结果',C.sectionName(s)+' · '+(s==='normal'?'完整控制区与结果链分离':'原站筛选')));
 }
 it=C.parseMovies(h,s);if(!it.length)d.push(emp('当前筛选暂无结果','地址：'+target));for(i=0;i<it.length;i++)d.push(card(it[i],s));setResult(d);
};
})(MyAvRemoteRuntime,MyAvCore);
