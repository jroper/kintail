$(document).foundation();

function contactUsSubmit(token) {
  console.log("Submitted with token: " + token);
  $("#contact-us-form").submit();
}
