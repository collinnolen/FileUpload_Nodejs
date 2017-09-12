var file_id = "no-id";

$(document).ready(function(){


// Creates the prompting box that allows users to download or delete the selected file.
$('.click').click(function(e){
  if($('#dl-delete').hasClass('hidden')){
    $('#dl-delete').removeClass('hidden');

    var data = $(e.target).attr('data').split('?');

    $('#dl-delete .file-contents #name').html(data[1]);
    $('#dl-delete .file-contents #size').html(data[2] + " bytes");
    $('#dl-delete .file-contents #date').html(data[3].split(/\s+/).slice(0,4).join(" "));
    $('#dl-delete').fadeIn("medium", function() {
    });
    $('body').children(':not(div#dl-delete)').fadeTo( "medium" , 0.5, function() {
      // Animation complete.
    });

    file_id = $(e.target).attr('data');
  }
});

//cancel button animations
$('#cancel').click(function(){
  $('#dl-delete').fadeOut("medium", function() {
    $('#dl-delete').addClass('hidden');
  });
  $('body').children(':not(div#dl-delete)').fadeTo( "medium" , 1, function() {
  });

  file_id = 'no-id';
});


$('#delete-btn').click(function(){
  if(file_id != 'no-id'){
    $.ajax({
    type: "DELETE",
    url: "/fileupload/" +file_id,
    success: function(msg){
        hide_option_box();
        location.reload();
    }
  });
  }
});

$('#download-btn').click(function(){
  if(file_id != 'no-id'){

    url = "/fileupload/download/" + file_id

    //Below code was used from: https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (this.status === 200) {
            var filename = "";
            var disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }
            var type = xhr.getResponseHeader('Content-Type');

            var blob = new Blob([this.response], { type: type });
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                window.navigator.msSaveBlob(blob, filename);
            } else {
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);
                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    var a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {

                    window.location = downloadUrl;
                }

                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
            }
        }
    };
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
    //end borrowed code

    hide_option_box();
  }
});

function hide_option_box(){
  $('#dl-delete').fadeOut("medium", function() {
    $('#dl-delete').addClass('hidden');
  });
  $('body').children(':not(div#dl-delete)').fadeTo( "medium" , 1, function() {
  });
}

});
