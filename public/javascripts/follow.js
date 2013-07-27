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
  console.log(response);
}