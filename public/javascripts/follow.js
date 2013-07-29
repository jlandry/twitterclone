function followUser (userID) {
  console.log('ajax Follow user: ' + userID);

  $.ajax({
    type: "POST",
    url: '/follow',
    data: { id: userID },
    success: userFollowCallback
  });
}

function userFollowCallback (response) {
  var userElement = $('#user-'+ response);
  userElement.find('a').removeClass('btn-primary').addClass('btn-success').html('<i class="icon-white icon-check"></i>&nbsp; Following');
}