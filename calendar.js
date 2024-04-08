$(function() {
	
	$(document).ready(function() {
		fetchEvents();
	});
  $( ".calendar" ).datepicker({
		dateFormat: 'mm/dd/yy',
		firstDay: 0,
		nextText: '>',
        prevText: '<',
		selectOtherMonths: true,
		leadDays: 20,
		onChangeMonthYear: function(year, month, instance) {
          console.log("a");
        }
	});
	
	$(document).on('click', '#dateRange', function(e){
		$(".caltainer").toggleClass('hidden');
		$(".calendar").datepicker("setDate", new Date());
	});
	
	$(document).on('click', '.caltainer-background', function(e) {
		$(".caltainer").toggleClass('hidden');
	});
	
	
	$(".calendar").on("change",function(){
		console.log("change");
		var $me = $(this),
				$selected = $me.val(),
				$parent = $me.parents('.date-picker');
		$parent.find('.result').children('span').html($selected);
		pickDate($me.val());
		$(".caltainer").toggleClass('hidden');
	});

});

