var currentUser;
var currentHousehold;

$(document).ready(function() {
    setCurrentUser(1);
    inviteCheck();
    swapContent("dashboard.html")
});

var sessionToken = "validforever";
var dashboard = "dashboard.html";
var household = "HouseholdOverview.html";
var shoppinglists = "shoppinglist.html";
var shoppingtrips = "shoppingtrip.html";
var todo = "dashboard.html";
var statistics = "dashboard.html";
var news = "dashboard.html";
var profile = "profile.html";

function ajaxAuth(attr){
    attr.headers = {
        Authorization: "Bearer "+sessionToken
    };
    attr.error = function (jqXHR, exception) {
        var msg = '';
        if (jqXHR.status == 401) {
            window.location.replace("login.html")
        } else {
            $("html").html(jqXHR.responseText);
        }
    };
    return $.ajax(attr);
}

function setCurrentUser(id) {
    ajaxAuth({
        url: "res/user/"+id,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            currentUser = data;
            setCurrentHousehold();
        },
        dataType: "json"
    });
}

function setCurrentHousehold() {
    ajaxAuth({
        url: "res/user/"+currentUser.userId+"/hh",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            currentHousehold = data[0];
        },
        dataType: "json"
    });
}

function inviteCheck() {
    var urlParams = window.location.search;
    var token = urlParams.split("invite=")[1];
    if (token!==undefined){

    }
}

function callModal(modalContent) {
    $("#modal").load(modalContent)
}

function swapContent(bodyContent) {
    $(".page-wrapper").load(bodyContent);
}