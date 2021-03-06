/**
 * Created by camhl on 1/11/2018.
 */

var numberOfLists = 0;
var currentItemList;

var SHL;

function readyShoppingList(){
    SHL = getCurrentHousehold().shoppingLists;
    if(SHL!==null&&SHL!==undefined)numberOfLists = SHL.length;
    if(numberOfLists>0){
        insertShoppingLists();
        $("#shoppingList" + activeSHL).addClass("active");
        showList(activeSHL);
    }
}

function insertShoppingLists(){
    var inputString = "";
    if (SHL.name!==null) {
        $.each(SHL, function (i, val) {
            inputString += '<li onclick="showList(' + i + ')" id="shoppingList' + i + '"><a>' + val.name + '</a></li>';
        });
        $("#shoppingSideMenu").html(inputString);
    }
}

function additem() {
    var newItem = $("#shoppingListItemInput").val();
    if(newItem !== "" && newItem != null) {
        $("#emptyListText").addClass("hide");
        $("#newItem").append('<tr id="item' + currentItemList.length+ '"><td><span onclick="check(' + currentItemList.length + ')" id="unchecked' + currentItemList.length + '" class="glyphicon glyphicon-unchecked"></span></td><td>' + newItem + '</td><td id="checkedBy'+currentItemList.length+'"></td><td><span onclick="deleteItem(' + currentItemList.length + ')" class="glyphicon glyphicon-remove"></span></td></tr>');
        $("#shoppingListItemInput").val("");
    }
    ajaxAuth({
        type: 'POST',
        url: 'res/household/' + getCurrentHousehold().houseId + '/shopping_lists/' + SHL[activeSHL].shoppingListId + "/items",
        data: JSON.stringify({'name': newItem, 'checkedBy': null}),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function () {
            navToShoppingList(activeSHL);
        }
    });
}

function check(itemId){
    var user = getCurrentUser();
    ajaxAuth({
        type: 'POST',
        url: 'res/household/'+getCurrentHousehold().houseId+'/shopping_lists/items/'+ itemId +'/user/',
        data: JSON.stringify(user.userId),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function () {
            $("#unchecked" + itemId).replaceWith('<span onclick="unCheck(' + itemId + ')" name="checked" id="checked' + itemId + '" class="glyphicon glyphicon-check"></span>');
            $("#checkedBy" + itemId).html(user.name);
            navToShoppingList(activeSHL);
        }
    });
}

function unCheck(itemId){
    ajaxAuth({
        type: 'POST',
        url: 'res/household/'+getCurrentHousehold().houseId+'/shopping_lists/items/'+ itemId +'/user/',
        data: JSON.stringify(0),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function () {
            $("#checked" + itemId).replaceWith('<span onclick="check(' + itemId + ')" name="unchecked" id="unchecked' + itemId + '" class="glyphicon glyphicon-unchecked"></span>');
            $("#checkedBy" + itemId).html('');
            navToShoppingList(activeSHL);
        }
    });
}

function deleteItem(itemNumber){
    $("#item" + itemNumber).remove();
    /*deleteItems[numberOfDeleteItems] = itemNumber;
    numberOfDeleteItems += 1;*/
    ajaxAuth({
        type: "DELETE",
        url: "res/household/"+getCurrentHousehold().houseId +"/shopping_lists/"+SHL[activeSHL].shoppingListId+"/items/"+itemNumber
    });
    navToShoppingList(activeSHL);
}

function showList(SLIndex){
    $("#newItem").replaceWith('<tbody id="newItem"></tbody>');
    currentItemList = SHL[SLIndex].items;
    if(currentItemList.length===0){
        $("#emptyListText").removeClass("hide");
    }else{
        $("#emptyListText").addClass("hide");
        $.each(currentItemList,function(i,val){
            if (val.itemId !== 0) {
                var checkedBy;
                if (val.checkedBy === null) {
                    checkedBy = "";
                    $("#newItem").append('<tr id="item' + val.itemId + '"><td><span onclick="check(' + val.itemId + ')" id="unchecked' + val.itemId + '" class="glyphicon glyphicon-unchecked"></span></td><td>' + val.name + '</td><td id="checkedBy' + val.itemId + '">' + checkedBy + '</td><td><span onclick="deleteItem(' + val.itemId + ')" class="glyphicon glyphicon-remove"></span></td></tr>');
                } else {
                    checkedBy = val.checkedBy.name;
                    $("#newItem").append('<tr id="item' + val.itemId + '"><td><span onclick="unCheck(' + val.itemId + ')" id="checked' + val.itemId + '" class="glyphicon glyphicon-check"></span></td><td>' + val.name + '</td><td id="checkedBy' + val.itemId + '">' + checkedBy + '</td><td><span onclick="deleteItem(' + val.itemId + ')" class="glyphicon glyphicon-remove"></span></td></tr>');
                }
            }
        });
    }$("#headline").replaceWith('<p id="headline">' + SHL[SLIndex].name + '</p>');
    $("#shoppingListItemInput").focus();
    $("#shoppingList" + activeSHL).removeClass("active");
    $("#shoppingList" + SLIndex).addClass("active");
    activeSHL = SLIndex;
}

function createNewList(name){
    $("#newItem").replaceWith('<tbody id="newItem"></tbody>');
    $("#emptyListText").removeClass("hide");
    $("#headline").addClass("hide");
    $("#headlineInput").removeClass("hide");
    $("#headlineInput").focus();
    $("#addNewShoppingList").removeClass("hide");
    $("#okButton").removeClass("hide");
    $("#privateButton").removeClass("hide");
    $("#edit_shopping_list_btn").addClass("hide");
    //$("#date").replaceWith('<h5 id="date"><span class="glyphicon glyphicon-time"></span> Post by Camilla Larsen' + date + '</h5>');
    $("#" + activeSHL).removeClass("active");
}

function setPrivate() {
    var clicked = $("#privateButton").hasClass("has_been_clicked");
    if (clicked) {
        $("#privateButton").removeClass("has_been_clicked");
    }
    else {
        $("#privateButton").addClass("has_been_clicked");
    }
}

function deleteList(){
    ajaxAuth({
        type: 'DELETE',
        url: 'res/household/' + getCurrentHousehold().houseId + '/shopping_lists/' + SHL[activeSHL].shoppingListId,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function () {
            if(activeSHL!==0)activeSHL--;
            navToShoppingList(activeSHL);
        }
    });
}

function addNewShoppingList(){
    numberOfLists += 1;
    var name = $("#headlineInput").val();
    $("#headlineInput").value = "";
    $("#headline").removeClass("hide");
    $("#edit_shopping_list_btn").removeClass("hide");
    $("#headline").replaceWith('<p id="headline">' + name + '</p>');
    $("#headlineInput").addClass("hide");
    $("#addNewShoppingList").addClass("hide");
    $("#sideMenu").append('<li onclick="showList(' + numberOfLists-1 + ')" id="shoppingList' + numberOfLists-1 + '"><a>' + name + '</a></li>');
    $("#shoppingListItemInput").focus();
    $("#shoppingList" + numberOfLists-1).addClass("active");
    var userIds = [];
    if ($("#privateButton").hasClass("has_been_clicked")) {
        userIds.push(getCurrentUser().userId);
    } else {
        users = getCurrentHousehold().residents;
        for (var i = 0; i<users.length; i++) {
            userIds.push(users[i].userId)
        }
    }
    activeSHL = numberOfLists-1;
    addNewList(name, userIds);
}

function addNewList(name, users){
    ajaxAuth({
        type: 'POST',
        url: 'res/household/' + getCurrentHousehold().houseId + '/shopping_lists/',
        data: name,
        contentType: 'text/plain',
        success: function (data) {
            updateUsersAjax(data, users);
        }
    });
}

function updateUsers() {
    var hh = getCurrentHousehold();
    var usersIds = [];
    var checkedUsers = $(".checked-in-modal");
    for (var i = 0; i<checkedUsers.length; i++) {
        var id = checkedUsers[i].id;
        id = id.replace('uniqueUserId_', '');
        usersIds.push(id);
    }

    ajaxAuth({
        type: 'POST',
        url: 'res/household/' + hh.houseId + '/shopping_list/' + SHL[activeSHL].shoppingListId +'/users',
        data: JSON.stringify(usersIds),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
    });
}

function updateUsersAjax(shoppingListId, users) {
    ajaxAuth({
        type: 'POST',
        url: 'res/household/' + getCurrentHousehold().houseId + '/shopping_list/' + shoppingListId + '/users',
        data: JSON.stringify(users),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function () {
            navToShoppingList(activeSHL);
        }
    });

}

function getUsers() {
    var hh = getCurrentHousehold();
    var allUsers = hh.residents;
    ajaxAuth({
        url: 'res/household/' + hh.houseId + '/shopping_lists/' + SHL[activeSHL].shoppingListId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function(users){
            for (var i = 0; i<allUsers.length; i++) {
                var userId = allUsers[i].userId;
                $("#inList").append('<tr><td id="uniqueUserId_'+ userId +'" onclick="checkUser('+ userId +')" class="glyphicon glyphicon-unchecked"></td><td>' + allUsers[i].name + '</td></tr>');
            }
            for (var i = 0; i<users.length; i++) {
                $("#uniqueUserId_" + users[i].userId).replaceWith('<td id="uniqueUserId_' + users[i].userId +'" onclick="uncheckUser('+ users[i].userId +')" class="glyphicon glyphicon-check checked-in-modal"></td>')
            }
        },
        dataType: "json"
    });
}

function checkUser(userId) {
    $("#uniqueUserId_" + userId).replaceWith('<td id="uniqueUserId_' + userId +'" onclick="uncheckUser('+ userId +')" class="glyphicon glyphicon-check checked-in-modal"></td>')
}

function uncheckUser(userId) {
    $("#uniqueUserId_" + userId).replaceWith('<td id="uniqueUserId_' + userId +'" onclick="checkUser('+ userId +')" class="glyphicon glyphicon-unchecked"></td>')
}

/* Make it so that you can use the 'enter'-key to add items*/
$("#shoppingListItemInput").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#additem").click();
    }
});

$("#headlineInput").keyup(function(event){
    if(event.keyCode == 13){
        $("#addNewShoppingList").click();
    }
});

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}