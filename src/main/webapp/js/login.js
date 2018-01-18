/**
 * Created by Camilla Velvin on 11.01.2018.
 */
$(document).ready(function () {
    window.localStorage.setItem("invite",window.location.search);

    $("#submit").click(function () {
        var email = $("#email").val();
        var password = $("#password").val();
        console.log(email + " pass " + password);

        var loginPerson = {"name": "", "email": email, "telephone": "", "password": password};
        console.log(JSON.stringify(loginPerson));
        $.ajax({
            url: "res/user/login",
            type: 'post',
            data: JSON.stringify(loginPerson),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(response) {
                if(response.success === true) {
                    window.localStorage.setItem("sessionToken",response.sessionToken);
                    window.localStorage.setItem("userId",response.userId);
                    inviteCheck();
                }
            },
            error: function(result) {
                showLoadingScreen(false);
                console.log(result);
                alert("Wrong email or password");
            }
        });

    });
});



//Set show to true if you want to show loadingscreen and false if you want to hide it
function showLoadingScreen(show) {
    if (show) {
        $("#coverScreen").css('display', 'block');
    } else {
        $("#coverScreen").css('display', 'none');
    }
}