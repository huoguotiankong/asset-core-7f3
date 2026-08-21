/** ACFun 0.6.0-alpha3 / Build 154 - resilient comments page */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha3';
var A='#FF4D4F',M='#8A8A8A';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function sel(t,on){return on?'““””<b><font color="'+A+'">'+E(t)+'</font></b>':E(t)}
ac.comments=function(){
    var d=[],id=S(MY_PARAMS.video_id||getParam('video_id','')||getParam('id','')),title=S(MY_PARAMS.video_title||getParam('video_title','')||'视频评论');
    setPageTitle('评论 · '+title);
    if(!id){d.push({title:'无法加载评论',desc:'当前页面缺少 videoId，请从视频详情重新进入。',col_type:'long_text',url:'hiker://empty'});setResult(d);return}
    if(Number(MY_PAGE||1)===1){d.push({title:rich('评论',title),col_type:'rich_text',extra:{textSize:17,lineVisible:false}});var cur=getMyVar('acfun_comment_sort','hot');[['最热','hot'],['最新','new']].forEach(function(x){d.push({title:sel(x[0],cur===x[1]),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_comment_sort',v);refreshPage(false);return'hiker://empty'},x[1]),extra:{lineVisible:false}})});d.push({col_type:'line'})}
    var p={videoId:id,pageNum:Number(MY_PAGE||1),page:Number(MY_PAGE||1),pageSize:30,sortType:getMyVar('acfun_comment_sort','hot')},list=[];
    try{list=ac.arr(ac.api('video/commentList',p,{timeout:900,maxAttempts:4}))}catch(e){try{setItem('acfun_last_comment_error',S(e.message||e))}catch(e0){}}
    list.forEach(function(x){var u=x.user||x.userInfo||{},name=ac.pick(u,['nickname','name','userName'],ac.pick(x,['userName','nickname'],'匿名')),text=ac.pick(x,['content','commentContent','comment_content','text'],''),tm=ac.pick(x,['createTime','time','createdAt'],''),lk=ac.pick(x,['likeNum','likes','likeCount'],'');var body='<b>'+E(name)+'</b>'+(lk?'　<font color="'+M+'">♥ '+E(ac.fmtNum(lk))+'</font>':'')+'<br>'+E(text).replace(/\n/g,'<br>')+(tm?'<br><font color="'+M+'">'+E(tm)+'</font>':'');d.push({title:body,col_type:'rich_text',url:'hiker://empty',extra:{textSize:13,lineVisible:false}})});
    if(!list.length&&Number(MY_PAGE||1)===1)d.push({title:'暂时没有评论',desc:'可能是当前视频没有评论，也可能是评论接口暂时不可用。',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
};
})();
