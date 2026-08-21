/** ACFun 0.6.0-alpha4 / Build 155 - comments for video, comics, fiction and community. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldComments=ac.comments;
ac.build='2026.08.21-v0.6.0-alpha4';
var A='#FF4D4F',M='#8A8A8A';
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function sel(t,on){return on?'““””<b><font color="'+A+'">'+E(t)+'</font></b>':E(t)}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function collect(root){var out=[],seen={},count=0;function walk(v,depth){if(v===undefined||v===null||depth>10||count>10000)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],depth+1);return}if(typeof v!=='object')return;count++;var id=S(ac.pick(v,['commentId','id','commentID'],'')||''),body=S(ac.pick(v,['commentContent','content','text','replyContent'],'')||'');if(body){var k=id||body.slice(0,80);if(!seen[k]){seen[k]=1;out.push(v)}}for(var x in v)if(v[x]&&typeof v[x]==='object')walk(v[x],depth+1)}walk(root,0);return out}
function label(kind){return({comic:'漫画评论',fiction:'小说评论',dynamic:'动态评论'})[kind]||'评论'}

ac.comments=function(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video');if(kind==='video'&&typeof oldComments==='function')return oldComments.call(ac);
    var id=S(p.content_id||param('content_id')||p.comics_id||p.fiction_id||p.dynamic_id||''),ct=S(p.content_title||param('content_title')||label(kind)),d=[];setPageTitle(label(kind)+' · '+ct);
    if(!id){d.push({title:'无法加载评论',desc:'页面缺少内容 ID，请从详情页重新进入。',col_type:'long_text',url:'hiker://empty'});setResult(d);return}
    var sort=S(getMyVar('acfun_comment_sort_'+kind,'hot')||'hot');if(Number(MY_PAGE||1)===1){d.push({title:rich(label(kind),ct),col_type:'rich_text',extra:{textSize:17,lineVisible:false}});[['最热','hot'],['最新','new']].forEach(function(x){d.push({title:sel(x[0],sort===x[1]),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(k,v){putMyVar('acfun_comment_sort_'+k,v);refreshPage(false);return'hiker://empty'},kind,x[1]),extra:{lineVisible:false}})});d.push({col_type:'line'})}
    var page=Number(MY_PAGE||1),params={page:page,pageNum:page,pageSize:30,limit:30,sortType:sort},path='';if(kind==='comic'){path='comics/comment/commentList';params.comicsId=N(id)}else if(kind==='fiction'){path='fiction/commentList';params.fictionId=N(id)}else{path='community/dynamic/commentList';params.dynamicId=N(id)}
    var list=[];try{list=collect(ac.__v043Api(path,params,{timeout:1300,maxAttempts:2}))}catch(e){try{setItem('acfun_v060_a4_comment_error',path+': '+S(e.message||e))}catch(e0){}}
    for(var i=0;i<list.length;i++){var x=list[i],u=x.user||x.userInfo||x.blogger||{},name=S(ac.pick(u,['nickname','nickName','name','userName'],ac.pick(x,['userName','nickname','nickName'],'匿名'))||'匿名'),body=S(ac.pick(x,['commentContent','content','text','replyContent'],'')||''),tm=S(ac.pick(x,['createTime','time','createdAt','publishTime'],'')||''),like=ac.pick(x,['likeNum','likes','likeCount','praiseNum'],'');var text='<b>'+E(name)+'</b>'+(like!==''?'　<font color="'+M+'">♥ '+E(ac.fmtNum(like))+'</font>':'')+'<br>'+E(body).replace(/\r?\n/g,'<br>')+(tm?'<br><font color="'+M+'">'+E(tm)+'</font>':'');d.push({title:text,col_type:'rich_text',url:'hiker://empty',extra:{textSize:13,lineVisible:false}})}
    if(!list.length&&page===1)d.push({title:'暂时没有评论',desc:'当前内容没有公开评论，或评论接口暂时没有返回数据。',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
try{setItem('acfun_test_runtime','0.6.0-alpha4 typed comments')}catch(e){}
})();
