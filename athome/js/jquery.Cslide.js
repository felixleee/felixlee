	var inter;

	jQuery.fn.Cslide = function(options) {
		var settings = jQuery.extend({
			slide_count: 1,
			size:0,
			list:'ul.trip_slider_list',
			prev:'div.btn_prev',
			next:'div.btn_next',
			blind_class:'gray_layer',
			max_width:1000,
			blind:false,
			unbind:false,
			offset:0,
			margin:0,
			autoroll:false,
			autotime:4000,
			navi:false,
			navi_class:'.album-txt-wrap'
		}, options);

		//var inter;//인터벌
		var autoroll = settings.autoroll;//오토롤링사용여부
		var autotime = settings.autotime;//오토지연시간
		var naviview = settings.navi;

		
		//각종 변수 셋팅
		var next_count=settings.slide_count;//다음
		var size=settings.size;//크기
		var offset=settings.offset;//가운데위치

		var margin = settings.margin;

		offset = offset+(margin+margin/2);

		var $list = this.find(settings.list);
		var $prev = this.find(settings.prev);
		var $next = this.find(settings.next);


		//var cnt =  $list.children().length;
		//var cnt =  settings.slide_count;//다음
		var cnt = $list.children().length;
		var max_count =  $list.children().length;//총개수

		if(max_count*(size+margin)>settings.max_width){
			$list.css('width',max_count*(size+margin)*3);
		}else{
			$list.css('width',max_count*(size+margin)*3);
			//$list.css('width','100%');
			//$list.parent().css('width',1000);
		}

		//시작지점 셋팅

		$list.css('left',offset-(cnt*(size+margin))+'px');


		//네비게이션 사용 추가
		if(naviview){

			var $navi = this.find(settings.navi_class);
			$navi.find('li:eq(0) a span').addClass('on');


			$navi.find('li').each(function(){
				var num = $(this).index();
				$(this).children('a').click(function(){
					go_number(num);
					return false;
				});
			});
		}

		
		//뒤로 반복되는 것처럼 보이게 동일한 내용을 뒤로 2개 더 만들어준다.
		var clone=$list.html();
		$list.children('li').last().after(clone).after(clone);

		//블라인드 옵션을 사용한다면 블라인드 처리를 해준다.
		if(settings.blind){
			setBlind();
		}

		//기존 이벤트를 없애고 재설정하는 거라면
		if(settings.unbind){
			$next.unbind('click');
			$prev.unbind('click');
		}

		function go_number(num){
			cnt = num;

			//navi_on(cnt);

			$list.animate({'left': offset-((max_count+num)*(size+margin))+'px'}, 'normal','',function(){
				reset();
			});
		}

		function navi_on(cnt){

			var navi_num = cnt-max_count;
			
			if(!$navi.find('li').eq(navi_num).children('a').children('span').hasClass('on')){
				$navi.find('li').eq(navi_num).children('a').children('span').addClass('on');
				$navi.find('li').eq(navi_num).siblings('li').children('a').children('span').removeClass('on');
			}
		}

		function move_next(){
			if($list.is(":animated")){
				return false;
			}
			cnt+=next_count;

			if(settings.blind){

				for (var i=0;i<next_count;i++)
				{
					$list.children().eq(cnt+i).find('div.'+settings.blind_class).hide();
				}
				for (var i=1;i<=next_count;i++)
				{
					$list.children().eq(cnt-i).find('div.'+settings.blind_class).show();
				}
			}

			$list.animate({'left': offset-(cnt*(size+margin))+'px'}, 'normal','',function(){
				reset();
			});


		}

		function move_prev(){
			if($list.is(":animated")){
				return false;
			}
			cnt-=next_count;
			
			if(settings.blind){

				for (var i=0;i<next_count;i++)
				{
					$list.children().eq(cnt+i).find('div').hide();
				}
				for (var i=next_count;i<next_count*2;i++)
				{
					$list.children().eq(cnt+i).find('div').show();
				}
			}
				

			$list.animate({'left': offset-(cnt*(size+margin))+'px'}, 'normal','',function(){
				reset();
			});

			
		}

		$next.on('click', function(){
			move_next();
		});

		$prev.on('click', function(){
			move_prev();
		});

		jQuery(window).resize(function(){
			offset = (settings.offset>0)?$(".center_align").offset().left:0 ;
			offset = offset+(margin+margin/2);
			//var offset=(jQuery(window).width()-1000)/2;
			//var offset=(jQuery(window).width()/2)-500;
			$list.css('left',offset-(cnt*(size+margin))+'px');
		});
		
		//초기 위치로 셋업 및 초기화
		function reset(){

			if(cnt >= max_count*2 ) {

				if(settings.blind){
					for (var i=0;i<next_count;i++)
					{
						$list.children().eq(cnt+i).find('div').show();
					}
				}
				cnt-=max_count;

				if(settings.blind){
					for (var i=0;i<next_count;i++)
					{
						$list.children().eq(cnt+i).find('div').hide();
					}
				}

				$list.css('left',offset-(cnt*(size+margin))+'px');
			}

			if( cnt <= max_count-1) {
				if(settings.blind){
					for (var i=0;i<next_count;i++)
					{
						$list.children().eq(cnt+i).find('div').show();
					}
				}
				cnt+=max_count;

				if(settings.blind){
					for (var i=0;i<next_count;i++)
					{
						$list.children().eq(cnt+i).find('div').hide();
					}
				}

				$list.css('left',offset-(cnt*(size+margin))+'px');
			}

			if(naviview) navi_on(cnt);
		}


		function setBlind(){
			//각각의 img 에 반투명 레이어를 씌워준다.
			$list.children('li').find('img').each(function(){
				$(this).before('<div class="'+settings.blind_class+'" style="width:'+(size+0)+'px"></div>');
			 });

			for (var i=0;i<next_count;i++)
			{
				$list.children().eq(cnt+i).find('div.'+settings.blind_class).hide();
			}
		}

		if(autoroll){
			setMoveBanner();

			$list.hover(function(){
				clearInterval(inter);

			}
			,function(){
				setMoveBanner();
			});

			if(naviview){
				$navi.hover(function(){
					clearInterval(inter);
					
				}
				,function(){
					setMoveBanner();
				});
			}
		}

		function setMoveBanner(){
			inter = setInterval(function(){
			move_next();},autotime);
		}
		

		return this;
	}
