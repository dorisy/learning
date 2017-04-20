function formatDate(date){
	return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}
onmessage = function (oEvent) {//对主线程回传回来的消息进行处理
  postMessage( {
  		time:formatDate(new Date()),
  		msg:oEvent.data+"[自动回复] "
  	});
};