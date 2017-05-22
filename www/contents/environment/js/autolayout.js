function checkColTot(){
  coltotal = $('.column').length;
  console.log(coltotal);
  if (coltotal == 1){
    $('.check-columns').removeClass('btn-success').addClass('btn-inverse');
    $('#one-col').removeClass('btn-inverse').addClass('btn-success');
    $('#sortableEdit').hide();
  }
  if (coltotal == 2){
    $('.check-columns').removeClass('btn-success').addClass('btn-inverse');
    $('#two-col').removeClass('btn-inverse').addClass('btn-success');
  }
  if (coltotal == 3){
    $('.check-columns').removeClass('btn-success').addClass('btn-inverse');
    $('#three-col').removeClass('btn-inverse').addClass('btn-success');
  }
  if (coltotal == 4){
    $('.check-columns').removeClass('btn-success').addClass('btn-inverse');
    $('#four-col').removeClass('btn-inverse').addClass('btn-success');
  }
}
checkColTot();

$('#one-col').click(function(){
  coltotal = $('.column').length;
  if(coltotal == 1){
    checkColTot();
    $('#sortableEdit').hide();
  }else if(coltotal == 2){
    var content = $(".row .column:last").children().html();
    $('.row .column:first').append(content);
    $('.row > .column').slice(-1).remove();
    $('.column').removeClass('col-xs-6').addClass('col-xs-12');
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 3){
    var content = $(".row .column:last").children().html();
    $('.row .column:first').append(content);
    $('.row > .column').slice(-1).remove();
    var content2 = $(".row .column:last").children().html();
    $('.row .column:first').append(content2);
    $('.row > .column').slice(-1).remove();
    $('.column').removeClass('col-xs-4').addClass('col-xs-12');
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 4){
    var content1 = $(".row .column:last").children().html();
    $('.row .column:first').append(content1);
    $('.row > .column').slice(-1).remove();
    var content2 = $(".row .column:last").children().html();
    $('.row .column:first').append(content2);
    $('.row > .column').slice(-1).remove();
    var content3 = $(".row .column:last").children().html();
    $('.row .column:first').append(content3);
    $('.row > .column').slice(-1).remove();
    $('.column').removeClass('col-xs-3').addClass('col-xs-12');
    checkColTot();
    $('#sortableEdit').show();
  }
});

$('#two-col').click(function(){
  coltotal = $('.column').length;
  if(coltotal == 1){
    $('.row').append("<div class='column col-xs-6'><br data-mce-bogus='1'></div>");
    $('.column').removeClass('col-xs-12').addClass('col-xs-6');
    $('.column').not(':first').html('<br data-mce-bogus="1">');
    $('#sortableEdit').show();
    checkColTot();
  }else if(coltotal == 2){
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 3){
    var content = $(".row .column:last").children().html();
    $('.row .column:first').append(content);
    $('.row > .column').slice(-1).remove();
    $('.column').removeClass('col-xs-4').addClass('col-xs-6');
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 4){
    var content = $(".row .column:last").children().html();
    $('.row .column:nth-child(2)').append(content);
    $('.row > .column').slice(-1).remove();
    var content = $(".row .column:last").children().html();
    $('.row .column:first').append(content);
    $('.row > .column').slice(-1).remove();
    $('.column').removeClass('col-xs-3').addClass('col-xs-6');
    checkColTot();
    $('#sortableEdit').show();
  }
});

$('#three-col').click(function(){
  coltotal = $('.column').length;
  if(coltotal == 1){
    $('.row').append("<div class='column col-xs-4'><br data-mce-bogus='1'></div>");
    $('.row').append("<div class='column col-xs-4'><br data-mce-bogus='1'></div>");
    $('.column').removeClass('col-xs-12').addClass('col-xs-4');
    $('#sortableEdit').show();
    checkColTot();
  }if(coltotal == 2){
    $('.row').append("<div class='column col-xs-4'><br data-mce-bogus='1'></div>");
    $('.column').removeClass('col-xs-6').addClass('col-xs-4');
    $('#sortableEdit').show();
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 3){
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 4){
    var content = $(".row .column:last").children().html();
    $('.row .column:nth-child(2)').append(content);
    $('.row > .column').slice(-1).remove();
    var content = $(".row .column:last").children().html();
    $('.row .column:nth-child(3)').append(content);
    $('.row > .column').slice(-1).remove();
    $('.column').removeClass('col-xs-3').addClass('col-xs-4');
    checkColTot();
    $('#sortableEdit').show();
  }
});

$('#four-col').click(function(){
  coltotal = $('.column').length;
  if(coltotal == 1){
    $('.row').append("<div class='column col-xs-3'><br data-mce-bogus='1'></div>");
    $('.row').append("<div class='column col-xs-3'><br data-mce-bogus='1'></div>");
    $('.row').append("<div class='column col-xs-3'><br data-mce-bogus='1'></div>");
    $('.column').removeClass('col-xs-12').addClass('col-xs-3');
    $('#sortableEdit').show();
    checkColTot();
  }if(coltotal == 2){
    $('.row').append("<div class='column col-xs-4'><br data-mce-bogus='1'></div>");
    $('.row').append("<div class='column col-xs-4'><br data-mce-bogus='1'></div>");
    $('.column').removeClass('col-xs-6').addClass('col-xs-3');
    $('#sortableEdit').show();
    checkColTot();
    $('#sortableEdit').show();
  }else if(coltotal == 3){
    $('.row').append("<div class='column col-xs-4'><br data-mce-bogus='1'></div>");
    $('.column').removeClass('col-xs-4').addClass('col-xs-3');
    $('#sortableEdit').show();
    checkColTot();
    $('#sortableEdit').show();
  }else{
    checkColTot();
    $('#sortableEdit').show();
  }
});
