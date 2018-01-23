/**
 * Created by Simen Moen Storvik on 12.01.2018.
 */

//TODO: Vurdere bruken av lokalt lagrede brukere under opplisting av chores og handlelister mtp på autoriseringsproblemer.

function loadDashboard(){
    var house = getCurrentHousehold();
    console.log(house);
    if (house!==undefined) {
        printShoppingListsToDashboard(house);
        printHouseholdChoresToDashboard(house.houseId);
        printNewsToDashboard();
    }

    if (!householdsLoaded) addHouseholdsToList(getCurrentUser().userId);
}

function printHouseholdChoresToDashboard(id){
    ajaxAuth({
        url: "res/household/" + id + "/chores",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            console.log(data);
            if (data !== null && data !==undefined) {
                for (var i = 0; i < data.length; i++) {
                    var current = data[i];
                    console.log(current);
                    if (current.user === undefined || current.user === null) {
                        var name = "None";
                    } else {
                        var name = current.user.name;
                    }
                    var inputString = "<tr onclick='activeChore=["+1+","+i+"];updateCurrentHousehold("+chores+");'>" +
                        "<td>" + current.description + "</td>" +
                        "<td>" + current.time.dayOfMonth + "."+current.time.monthValue+"." + current.time.year  + "</td>" +
                        "<td>" + name + "</td>" +
                        "</tr>";
                    $("#dashboard_chores_table_body").append(inputString);
                }
            }else{
                $("#dashboard_chores_table_body").append("There are no chores for this household.");
            }
        }
    });
}

function printShoppingListsToDashboard(house) {
    if (house.shoppingLists!==null&&house.shoppingLists!==undefined) {
        for (var i = 0; i < house.shoppingLists.length; i++) {
            var current = house.shoppingLists[i];
            var inputSting = "<li onclick='navToShoppingList(" + i + ")' class='list-group-item'>" + current.name + "</li>";
            /*
            var inputString = "<tr>\n" +
                "<td onclick='navToShoppingList(" + i + ")'>" + current.name + "</td>\n" +
                "<td>" + current.items.length + "</td>\n" +
                "<td>" + current.users.length + "</td>\n" +
                "</tr>";
            //TODO: the onClick() navigates to the shoppingList body, but doesn't load the selected shoppingList.
            $("#dashboard_shopping_list_table_body").append(inputString);
            */
            $("#dashboard_shopping_list_unordered_list").append(inputSting);
        }
    }
}

function printNewsToDashboard(){
    getNews(function (data) {
        var html = "";
        var loops = data.length;
        if (loops>6)loops=6;
        for (var i = 0;i<loops;i++) {
            var post = data[i];
            var time = post.time.dayOfMonth+"."+post.time.monthValue+" "+post.time.hour+":"+post.time.minute;
            if (post.message.length<50){
                html += "<div class=\"well well-sm\">\n" +
                    "                            <div class=\"message-heading\">\n" +
                    "                                <b>"+post.user.name+"</b>\n" +
                    "                                <div style=\"float: right\">\n" +
                    "                                    <small>"+time+"</small>\n" +
                    "                                </div>\n" +
                    "                            </div>\n" +
                    "                            <div class=\"message-total\">"+post.message+"</div>\n" +
                    "                        </div>"
            } else {
                html += "<div class=\"well well-sm clickable\" onclick=\"toggleTeaser($(this))\">\n" +
                    "                            <div class=\"message-heading\">\n" +
                    "                                <b>"+post.user.name+"</b>\n" +
                    "                                <div style=\"float: right\">\n" +
                    "                                    <small>"+time+"</small>\n" +
                    "                                </div>\n" +
                    "                            </div>\n" +
                    "                            <div class=\"message-teaser\">"+post.message.substring(0,36)+"...(show more)</div>\n" +
                    "                            <div class=\"message-body\">"+post.message+"</div>\n" +
                    "                        </div>"
            }
        }
        $(".messages-container").html(html);
        $('.message-body').css('display','none');
    });
}