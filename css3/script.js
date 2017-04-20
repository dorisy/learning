/**            _           _     _       _
 *   ____     | |         | |   | |     | |
 *  / __ \  __| | ___ _ __| |__ | |_   _| |__
 * / / _` |/ _` |/ _ \ '__| '_ \| | | | | '_ \
 *| | (_| | (_| |  __/ |  | |_) | | |_| | |_) |
 * \ \__,_|\__,_|\___|_|  |_.__/|_|\__,_|_.__/
 *  \____/
 *
 * @derblub on twitter
 */


$(function(){
	var shadowOffset	=	1.08;
	var lightswitch		=	$("#switch");
	var lightbulb		=	$("#light-bulb");
	var lightbulb2		=	$("#light-bulb2");
	var lightCenterX	=	parseInt(lightbulb.width()/2);
	var lightCenterY	=	parseInt(lightbulb.height()/2);
	var logo			=	$("#logo");
	var lightAlogo		=	$("#light-bulb, #logo");
	var logoCenterX		=	parseInt(logo.width()/2);
	var logoCenterY		=	parseInt(logo.height()/2);
	var logoshadow		=	$("#logosh");
	var logoShdwCenterX	=	parseInt(logoshadow.width()/2);
	var logoShdwCenterY	=	parseInt(logoshadow.height()/2);
	var ontxt			=	"Let there be light!";
	var offtxt			=	"Switch off the light!";
	
	logoshadow.fadeTo(0,0);
	lightbulb2.fadeTo(0,0);
	moveShadow();
	
	lightAlogo.draggable({
		drag: function(event, ui){
			moveShadow();
		},
		stop: function(event, ui){
			
		}
	});
	$(window).resize(function(){
		moveShadow();
	});

	lightswitch.click(function(){
		if(lightbulb.hasClass("off")){
			lightbulb.removeClass("off");
			lightswitch.css("backgroundPosition","0 0");
			logoshadow.stop().fadeTo(750,setOpacity(shadowDistance));
			lightbulb2.stop().fadeTo(750,1);
		}else{
			lightbulb.addClass("off");
			lightswitch.css("backgroundPosition","-80px 0");
			logoshadow.stop().fadeTo(750,0);
			lightbulb2.stop().fadeTo(750,0);
		}
	});

	function setOpacity(getDistance){
		if(lightbulb.hasClass("off")){
			return 0;
		}else{
			return (1.2 - getDistance /1000);
		}
	}
	
	function moveShadow(){
		lightX			=	parseInt(lightbulb.offset().left) + lightCenterX;
		lightY			=	parseInt(lightbulb.offset().top) + lightCenterY;
		logoX			=	parseInt(logo.offset().left) + logoCenterX;
		logoY			=	parseInt(logo.offset().top) + logoCenterY;
		distanceX		=	logoX - lightX;
		distanceY		=	logoY - lightY;
		distance		=	Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
		shadowDistance	=	distance * shadowOffset;
		shadowPosLeft	=	(distanceX / distance * shadowDistance + lightX - logoShdwCenterX) + "px";
		shadowPosTop	=	(distanceY / distance * shadowDistance + lightY - logoShdwCenterY) + "px";
		logoshadow.css({ "left": shadowPosLeft, "top": shadowPosTop, "opacity": setOpacity(shadowDistance) });
	}
});
