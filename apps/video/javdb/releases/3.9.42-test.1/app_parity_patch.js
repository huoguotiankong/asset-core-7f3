/* JavDB v3 3.9.42-test.1 APP taxonomy / UX patch */
(function(J){
  if(!J) throw new Error('JDB core unavailable');
  J.version='20260822-v3.9.42-test.1';

  function selectedTitle(name,on){
    return on?'““””<b><font color=#FFFFFF>'+name+'</font></b>':name;
  }
  function actorCard(d,a,rankNo){
    a=a||{};
    var title=J.mask(a.name||a.name_zht||a.other_name||'未命名演员');
    var img=J.img(a.avatar_url||'');
    var desc=[];
    if(a.videos_count!==undefined&&a.videos_count!==null)desc.push('作品 '+a.videos_count);
    if(a.other_name)desc.push(J.mask(a.other_name));
    d.push({
      title:(rankNo?('TOP '+rankNo+' · '):'')+title,
      desc:desc.join(' · '),
      pic_url:img,img:img,
      url:'hiker://page/javdb3Entity?page=fypage&rule=&simple=true',
      col_type:J.coverLayout('actor','movie_3'),
      extra:{lineVisible:false,jdb3_entity_type:'actor',jdb3_entity_id:String(a.id||''),pageTitle:title}
    });
  }
  function todayLabel(){
    try{var d=new Date();return (d.getMonth()+1)+'月'+d.getDate()+'日更新';}catch(e){return '近期更新';}
  }

  J.category=function(d,page){
    var types=[['有​码','0'],['无​码','1'],['欧美','2'],['FC2','3'],['动漫','4']];
    var type=getMyVar('jdb3_cat42_type','0');
    var main=getMyVar('jdb3_cat42_main','');
    var extra=getMyVar('jdb3_cat42_extra','');
    var year=getMyVar('jdb3_cat42_year','');
    var dur=getMyVar('jdb3_cat42_duration','');
    var month=getMyVar('jdb3_cat42_month','');
    var sort=getMyVar('jdb3_cat42_sort','release desc');

    if(page===1){
      d.push(this.section('类别','JavDB App 分类'));
      types.forEach(function(x){
        d.push(J.chip(x[0],type===x[1],$('#noLoading#').lazyRule(function(v){
          putMyVar('jdb3_cat42_type',v);
          clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');
          refreshPage(false);return 'hiker://empty';
        },x[1])));
      });
      d.push({col_type:'blank_block'});

      d.push(this.section('基本',''));
      [['全部',''],['可播放','p'],['可下载','m'],['含字幕','c'],['单体影片','s'],['含预览图','i'],['含预览视频','v']].forEach(function(x){
        d.push(J.chip(x[0],main===x[1],$('#noLoading#').lazyRule(function(v){
          putMyVar('jdb3_cat42_main',v);refreshPage(false);return 'hiker://empty';
        },x[1])));
      });

      var active=(extra?extra.split(',').filter(Boolean).length:0)+(year?1:0)+(dur?1:0)+(month?1:0);
      var adv=getMyVar('jdb3_cat42_adv','0')==='1';
      d.push({col_type:'blank_block'});
      d.push({
        title:adv?'收起筛选':'更多筛选',
        desc:active?('已选 '+active+' 项 · 标签可多选'):'年份 / 月份 / 时长 / 标签',
        url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_cat42_adv',getMyVar('jdb3_cat42_adv','0')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';}),
        col_type:'text_2',extra:{lineVisible:false}
      });

      if(adv){
        var tr=this.apiSafe('/api/v2/tags',{type:type});
        if(!tr.ok){
          d.push({title:'筛选项加载失败',desc:tr.error,url:'hiker://empty',col_type:'text_center_1'});
        }else{
          var groups=tr.data.tags||[];
          var selected=extra.split(',').filter(Boolean);
          groups.forEach(function(g){
            var cid=String(g.category_id||'');
            if(cid==='main')return;
            var tags=(g.tags||[]).slice(0,80);
            if(!tags.length)return;
            var special=cid==='year'||cid==='duration'||cid==='month';
            d.push(J.section(J.mask(g.category||cid),special?'单选':'可多选'));
            tags.forEach(function(t){
              var id=String(t.id||'');if(!id)return;
              var name=J.mask(t.name||id);
              var on=cid==='year'?year===id:cid==='duration'?dur===id:cid==='month'?month===id:selected.indexOf(id)>=0;
              d.push({title:selectedTitle(name,on),url:$('#noLoading#').lazyRule(function(cid,id){
                if(cid==='year')putMyVar('jdb3_cat42_year',getMyVar('jdb3_cat42_year','')===id?'':id);
                else if(cid==='duration')putMyVar('jdb3_cat42_duration',getMyVar('jdb3_cat42_duration','')===id?'':id);
                else if(cid==='month')putMyVar('jdb3_cat42_month',getMyVar('jdb3_cat42_month','')===id?'':id);
                else{
                  var a=getMyVar('jdb3_cat42_extra','').split(',').filter(Boolean),i=a.indexOf(id);
                  if(i>=0)a.splice(i,1);else a.push(id);
                  putMyVar('jdb3_cat42_extra',a.join(','));
                }
                refreshPage(false);return 'hiker://empty';
              },cid,id),col_type:'scroll_button',extra:{backgroundColor:on?'#3BB273':'#08777785',lineVisible:false}});
            });
          });
          d.push({title:'清空更多筛选',url:$('#noLoading#').lazyRule(function(){
            clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return 'toast://筛选已清空';
          }),col_type:'text_center_1',extra:{lineVisible:false}});
        }
      }

      var sortNames={'release desc':'发布日期倒序','release asc':'发布日期正序','update desc':'更新时间','score desc':'评分','hit desc':'热度','want_watch_count desc':'想看人数','watched_count desc':'看过人数'};
      d.push({
        title:'排序',desc:sortNames[sort]||'发布日期倒序',
        url:$('#noLoading#').lazyRule(function(){
          var names=['发布日期倒序','发布日期正序','更新时间','评分','热度','想看人数','看过人数'];
          var vals=['release desc','release asc','update desc','score desc','hit desc','want_watch_count desc','watched_count desc'];
          return $(names,1,'排序').select(function(names,vals){var i=names.indexOf(input);putMyVar('jdb3_cat42_sort',vals[i<0?0:i]);refreshPage(false);return 'hiker://empty';},names,vals);
        }),col_type:'text_2',extra:{lineVisible:false}
      });
      d.push({title:'重置筛选',desc:'恢复“全部 + 发布日期倒序”',url:$('#noLoading#').lazyRule(function(){
        putMyVar('jdb3_cat42_main','');putMyVar('jdb3_cat42_sort','release desc');clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return 'toast://已重置';
      }),col_type:'text_2',extra:{lineVisible:false}});
      d.push({col_type:'blank_block'});
    }

    type=getMyVar('jdb3_cat42_type','0');main=getMyVar('jdb3_cat42_main','');extra=getMyVar('jdb3_cat42_extra','');year=getMyVar('jdb3_cat42_year','');dur=getMyVar('jdb3_cat42_duration','');month=getMyVar('jdb3_cat42_month','');sort=getMyVar('jdb3_cat42_sort','release desc');
    var filter=type+':t:'+main+':'+extra+':'+year+':'+dur+':'+month;
    var sp=sort.split(' ');
    var r=this.apiSafe('/api/v1/movies/tags',{filter_by:filter,sort_by:sp[0],order_by:sp[1]||'desc',page:page,limit:48});
    if(!r.ok){if(page===1)d.push({title:'分类加载失败',desc:r.error,url:'hiker://page/javdb3Status?rule=&simple=true',col_type:'text_center_1'});return;}
    var list=r.data.movies||[];
    if(page===1)d.push(this.section('影片',list.length+' 条'));
    var layout=this.coverLayout('category','movie_3');
    list.forEach(function(x){d.push(J.movieCard(x,layout));});
    if(!list.length&&page===1)d.push({title:'当前筛选暂无结果',url:'hiker://empty',col_type:'text_center_1'});

    if(page===1){
      d.push({col_type:'blank_block'});
      d.push(this.section('资料库','系列 / 片商 / 导演'));
      [['系列','series'],['片商','maker'],['导演','director']].forEach(function(x){d.push({title:x[0],url:'hiker://page/javdb3EntityHub?page=fypage&rule=&simple=true',col_type:'text_3',extra:{jdb3_hub_kind:x[1],pageTitle:x[0],lineVisible:false}});});
    }
  };

  J.rank=function(d,page){
    var tab=getMyVar('jdb3_rank42_tab','0');
    var period=getMyVar('jdb3_rank42_period','daily');
    if(page===1){
      d.push(this.section('排行榜','JavDB App 榜单'));
      [['TOP250','top250'],['看热播','playback'],['有​码','0'],['无​码','1'],['欧美','2'],['FC2','3']].forEach(function(x){
        d.push(J.chip(x[0],tab===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank42_tab',v);refreshPage(false);return 'hiker://empty';},x[1])));
      });
      d.push({col_type:'blank_block'});
    }

    tab=getMyVar('jdb3_rank42_tab','0');period=getMyVar('jdb3_rank42_period','daily');
    if(tab==='top250'){
      if(!getItem('jdb3_token','')){if(page===1)d.push({title:'TOP250 需要登录',desc:'登录 JavDB 账号后查看完整榜单',url:'hiker://page/javdb3Account?rule=&simple=true',col_type:'text_center_1'});return;}
      if(page>5)return;
      var start=String((page-1)*50+1);
      var tr=this.apiAuthSafe('/api/v1/movies/top',{start_rank:start,type:'all',type_value:'',ignore_watched:'false',page:1,limit:50});
      if(!tr.ok){if(page===1)d.push({title:'TOP250 加载失败',desc:tr.error,url:'hiker://page/javdb3Account?rule=&simple=true',col_type:'text_center_1'});return;}
      var tl=tr.data.movies||[];
      if(page===1)d.push(this.section('TOP250',tl.length+' 条'));
      tl.forEach(function(x,i){var c=J.movieCard(x,J.coverLayout('rank','movie_3'));var rn=x.ranking!==undefined&&x.ranking!==null?x.ranking:(Number(start)+i);c.title='TOP '+rn+' · '+c.title;d.push(c);});
      return;
    }

    if(tab==='playback'){
      if(page>1)return;
      var pf=getMyVar('jdb3_rank42_playback_filter','all');
      if(page===1){
        [['全部','all'],['高评分','high_score']].forEach(function(x){d.push(J.chip(x[0],pf===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank42_playback_filter',v);refreshPage(false);return 'hiker://empty';},x[1])));});
        d.push({col_type:'blank_block'});
        [['日榜','daily'],['周榜','weekly'],['月榜','monthly']].forEach(function(x){d.push(J.chip(x[0],period===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank42_period',v);refreshPage(false);return 'hiker://empty';},x[1])));});
        d.push({col_type:'blank_block'});
      }
      var pr=this.apiSafe('/api/v1/rankings/playback',{filter_by:pf,period:period});
      if(!pr.ok){d.push({title:'热播榜加载失败',desc:pr.error,url:'hiker://empty',col_type:'text_center_1'});return;}
      var pl=pr.data.movies||[];d.push(this.section('看热播',pl.length+' 条'));
      pl.forEach(function(x,i){var c=J.movieCard(x,J.coverLayout('rank','movie_3'));if(i<10)c.title='TOP '+(i+1)+' · '+c.title;d.push(c);});return;
    }

    var actorMonth=getMyVar('jdb3_rank42_actor_month','0')==='1';
    if(page===1){
      [['日榜','daily'],['周榜','weekly'],['月榜','monthly']].forEach(function(x){d.push(J.chip(x[0],!actorMonth&&period===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank42_actor_month','0');putMyVar('jdb3_rank42_period',v);refreshPage(false);return 'hiker://empty';},x[1])));});
      d.push(J.chip('演员月榜',actorMonth,$('#noLoading#').lazyRule(function(){putMyVar('jdb3_rank42_actor_month','1');refreshPage(false);return 'hiker://empty';})));
      d.push({col_type:'blank_block'});
    }
    if(actorMonth){
      if(page>1)return;
      var ar=this.apiSafe('/api/v1/rankings/actors',{type:tab,filter_by:'monthly'});
      if(!ar.ok){d.push({title:'演员月榜加载失败',desc:ar.error,url:'hiker://empty',col_type:'text_center_1'});return;}
      var al=(ar.data&&ar.data.actors)||[];d.push(this.section('演员月榜',al.length+' 位'));
      al.forEach(function(a,i){actorCard(d,a,i<10?i+1:0);});return;
    }
    var rr=this.apiSafe('/api/v1/rankings',{type:tab,period:period,page:page});
    if(!rr.ok){if(page===1)d.push({title:'排行榜加载失败',desc:rr.error,url:'hiker://empty',col_type:'text_center_1'});return;}
    var rl=rr.data.movies||[];
    if(page===1)d.push(this.section(period==='daily'?'日榜':period==='weekly'?'周榜':'月榜',rl.length+' 条'));
    rl.forEach(function(x,i){var c=J.movieCard(x,J.coverLayout('rank','movie_3'));if(page===1&&i<10)c.title='TOP '+(i+1)+' · '+c.title;d.push(c);});
  };

  J.actorHub=function(d,page){
    var tab=getMyVar('jdb3_actor42_tab','recommend');
    var tabs=[['推荐','recommend'],['有​码(女)','0'],['有​码(男)','1'],['无​码','2'],['欧美(女)','3'],['欧美(男)','4']];
    if(page===1){
      d.push(this.section('演员',''));
      tabs.forEach(function(x){d.push({title:selectedTitle(x[0],tab===x[1]),url:$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_actor42_tab',v);refreshPage(false);return 'hiker://empty';},x[1]),col_type:'scroll_button',extra:{backgroundColor:tab===x[1]?'#3BB273':'#08777785',lineVisible:false}});});
      d.push({title:'搜索演员',desc:'按姓名搜索',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_search_type','actor');return 'hiker://page/javdb3Search?page=fypage&rule=&simple=true';}),col_type:'text_1',extra:{lineVisible:false}});
      d.push({col_type:'blank_block'});
    }
    tab=getMyVar('jdb3_actor42_tab','recommend');
    if(tab==='recommend'){
      if(page>1)return;
      var r=this.apiSafe('/api/v1/actors/recommend',{});
      if(!r.ok){d.push({title:'演员推荐加载失败',desc:r.error,url:'hiker://empty',col_type:'text_center_1'});return;}
      var data=r.data||{},newer=data.new_actors||[],monthly=data.monthly_actors||[],rec=data.recommend_actors||[],label=todayLabel();
      if(newer.length){d.push(this.section('新人',label));newer.forEach(function(a){actorCard(d,a,0);});}
      if(monthly.length){d.push(this.section('月排名',''));d.push({title:'全部 >',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','排行');putMyVar('jdb3_rank42_tab','0');putMyVar('jdb3_rank42_actor_month','1');refreshPage(false);return 'hiker://empty';}),col_type:'text_3',extra:{lineVisible:false}});monthly.forEach(function(a){actorCard(d,a,0);});}
      if(rec.length){d.push(this.section('Fanza(DMM)推荐',label));rec.forEach(function(a){actorCard(d,a,0);});}
      if(!newer.length&&!monthly.length&&!rec.length)d.push({title:'暂无推荐演员',url:'hiker://empty',col_type:'text_center_1'});
      return;
    }
    var lr=this.apiSafe('/api/v1/actors',{type:tab,page:page});
    if(!lr.ok){if(page===1)d.push({title:'演员列表加载失败',desc:lr.error,url:'hiker://empty',col_type:'text_center_1'});return;}
    var list=(lr.data&&lr.data.actors)||[];
    if(page===1){var nm='';for(var ti=0;ti<tabs.length;ti++)if(tabs[ti][1]===tab)nm=tabs[ti][0];d.push(this.section(nm,'本页 '+list.length+' 位'));}
    list.forEach(function(a){actorCard(d,a,0);});
    if(!list.length&&page===1)d.push({title:'当前分类暂无演员',desc:'该演员分类的 API 映射仍在实机验证中',url:'hiker://empty',col_type:'text_center_1'});
  };
})(JDB);
