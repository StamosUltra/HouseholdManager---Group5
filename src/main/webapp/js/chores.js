/**
 * Created by Simen Moen Storvik on 19.01.2018.
 */
var selectedUserForNewChore = null;
var userChoreList;
var householdChoreList;
var selectedChore;
var usersChore = true;
var userHHsForChores;
var newlyPostedChoreId;


function readyChores(){
    switchChoresContent(0);
    setUpChoreListeners();
    $("#houseHoldChoresTabHeader").text("Chores for "+getCurrentHousehold().name);

    getUserHouseholdsForChores();

}

function getUserHouseholdsForChores(){
    getAllHouseholdsForUser(getCurrentUser().userId, function(data){
        userHHsForChores = data;
        listUserChores();
    })
}

function listUserChores(){
    getChoresForUser(getCurrentUser().userId,function(data){
        userChoreList = sortByDate(data);

        var today = new Date();
        $("#choresLeftUpperTableBody").empty();
        $("#choresLeftUpperTableBody_completed").empty();
        var first = true;
        var id = 0;
        $.each(data,function(i,val){
            var leftUpperTableBodyHTML = "";
            if(today>toJSDate(val.time)&&!val.done){
                if(first) {
                    id = data[i];
                    first = false;
                }
                leftUpperTableBodyHTML+="<tr class='clickableChore overdueChoreListElement'";
            }else if(today>toJSDate(val.time)&&val.done){
                leftUpperTableBodyHTML += "<tr class='hide'";
            }else if(today<toJSDate(val.time)&&val.done){
                if(first) {
                    id = data[i];
                    first = false;
                }
                leftUpperTableBodyHTML+="<tr class='clickableChore checkedChoreListElement'";
            }else{
                if(first) {
                    id = data[i];
                    first = false;
                }
                leftUpperTableBodyHTML += "<tr class='clickableChore'";
            }
            leftUpperTableBodyHTML += " id='choreTab"+val.choreId+"' onclick='getSelectedChoreFromUpdatedTotal("+val.choreId+")'>" +
                "<td>"+val.title+"</td>" +
                "<td id='userChoreListElhh"+i+"'></td>" +
                "<td>"+val.time.dayOfMonth + "."+val.time.monthValue+"." + val.time.year+"</td></tr>";

            if (val.done) $("#choresLeftUpperTableBody_completed").append(leftUpperTableBodyHTML);
            else $("#choresLeftUpperTableBody").append(leftUpperTableBodyHTML);
            $.each(userHHsForChores, function(j,HHval){
                if(val.houseId===HHval.houseId){
                    $("#userChoreListElhh"+i).text(HHval.name);

                }
            })
        });
        if(!first) {
            showChoreInfo(id);
        }
        listHouseholdChores();
    });
}

function toJSDate(ltd) {
    var y = ltd.year;
    var mon = ltd.monthValue-1;
    var d = ltd.dayOfMonth;
    var h = ltd.hour;
    var min = ltd.minute;
    return new Date(y,mon,d,h,min);
}

function sortByDate(array){
    array.sort(function (a,b) {
        return toJSDate(a.time) - toJSDate(b.time);
    });
    return array;
}

function listHouseholdChores() {
    getChoresForHousehold(getCurrentHousehold().houseId, function(data){
        data = sortByDate(data);
        householdChoreList = [];
        var hhChoreCounter = 0;
        var today = new Date;
        $.each(data,function(i,val){
            var leftLowerTableBodyHTML = "";
            if(val.userId!==getCurrentUser().userId){
                householdChoreList[hhChoreCounter] = val;
                hhChoreCounter++;
                if(today>toJSDate(val.time)&&!val.done){
                    leftLowerTableBodyHTML+="<tr class='clickableChore overdueChoreListElement'";
                }else if(today>toJSDate(val.time)&&val.done){
                    leftLowerTableBodyHTML += "<tr class='hide'";
                }else if(today<toJSDate(val.time)&&val.done){
                    leftLowerTableBodyHTML+="<tr class='clickableChore checkedChoreListElement'";
                }else{
                    leftLowerTableBodyHTML += "<tr class='clickableChore'";
                }
                leftLowerTableBodyHTML += " id='choreTab"+val.choreId+"' onclick='getSelectedChoreFromUpdatedTotal("+val.choreId+")'>" +
                    "<td>"+val.title+"</td>";
                if(val.user==null){
                    leftLowerTableBodyHTML += "<td>No User</td>"
                } else {
                    leftLowerTableBodyHTML += "<td>"+val.user.name+"</td>"
                }
                leftLowerTableBodyHTML +=
                    "<td>"+val.time.dayOfMonth + "."+val.time.monthValue+"." + val.time.year+"</td></tr>";
            }
            if (val.done) $("#choresLeftLowerTableBody_completed").append(leftLowerTableBodyHTML);
            else $("#choresLeftLowerTableBody").append(leftLowerTableBodyHTML);
        });
        if(selectedChore!==undefined){
            getSelectedChoreFromUpdatedTotal(selectedChore.choreId);
        }else if(newlyPostedChoreId!==undefined){
            getSelectedChoreFromUpdatedTotal(newlyPostedChoreId);
            newlyPostedChoreId = undefined;
        }
    });
}
function getSelectedChoreFromUpdatedTotal(id){
    var choreSent = false;
    $.each(userChoreList,function(i,val){
        if(val.choreId===id){
            selectedChore = val;
            usersChore = true;
            $(".text-muted").removeClass("text-muted");
            $("#choreTab"+id).addClass("text-muted");
            showChoreInfo(val);
            choreSent = true;
        }
    });
    if(!choreSent){
        $.each(householdChoreList,function(i,val){
            if(val.choreId===id){
                usersChore = false;
                selectedChore = val;
                $(".text-muted").removeClass("text-muted");
                $("#choreTab"+id).addClass("text-muted");
                showChoreInfo(val);
            }
        });
    }
}
function checkSelectedChore(chore){
    if(chore.userId===getCurrentUser().userId){
        chore.done = !chore.done;
        checkChore(chore);
    }else{
        $("#choresDetailsCheckedWarning").text("You can not check other users' chores.");
    }
}

function deleteSelectedChore(id){
    ajaxAuth({
        url: "res/household/"+getCurrentHousehold().houseId+"/chores/"+id,
        type: "DELETE",
        success: function(){
            selectedChore = undefined;
            readyChores();
            switchChoresContent(0);
        }
    })
}
function cleanChoreSlate(){
    $("#choresRightUpperPanelHeading").html("");
    $("#choresDetailsDescriptionContent").html("");
    $("#choresDetailsDateTimeContent").html("");
    $("#choresDetailsUserNameContent").html("");
    $("#choresDetailsCheckedContent").html("");
}

function selectChoreInfo(from, choreId){
    if (from===0){
        selectedChore = userChoreList[choreId];
    } else {
        selectedChore = householdChoreList[choreId];
    }
    showChoreInfo(selectedChore);
}
function showChoreInfo(chore){
    if(chore!==undefined){
        selectedChore = chore;
        switchChoresContent(0);
        $("#choresRightUpperPanelHeading").html(chore.title + "<a id='addTodoGlyphicon' onclick='editChore(selectedChore)' class='btn btn-md pull-right'>" +
            "                        <span class='glyphicon glyphicon-edit'></span>\n" +
            "                    </a>");
        $("#choresDetailsDescriptionContent").html(chore.description);
        $("#choresDetailsDateTimeContent").html(chore.time.dayOfMonth + "."+chore.time.monthValue+"." + chore.time.year + " " + pad(chore.time.hour) + ":" + pad(chore.time.minute));
        getHouseholdFromId((chore.houseId),function (data) {$("#choresDetailsHouseholdContent").html(data.name);});
        $("#choresDetailsUserNameContent").html(chore.user==null?"No user":chore.user.name);
        if(chore.done){
            $("#choresDetailsCheckedContent").html("<p class='glyphicon glyphicon-check' onclick='checkSelectedChore(selectedChore)'></p>");
        }else{
            $("#choresDetailsCheckedContent").html("<p class='glyphicon glyphicon-unchecked' onclick='checkSelectedChore(selectedChore)'></p>");
        }
        $("#choresDetailsCheckedContainer").append("<h4 id='choresDetailsCheckedWarning' style='color: red;'></h4>");
        if(chore.user!==null&&chore.user!==undefined){
            chore.userId = chore.user.userId;
        }
    }
}

function switchChoresContent(num) {

    if(num===0){
        if(selectedChore!==undefined){
            if(!usersChore) {
                document.getElementById("checkSelectedChoreButton").disabled = true;
            } else {
                document.getElementById("checkSelectedChoreButton").disabled = false;
            }
        }else{
            cleanChoreSlate();
        }
        $("#choresRightPanelSecondWindow").addClass("hide");
        $("#choresRightPanelThirdWindow").addClass("hide");
        $("#choresRightPanelFirstWindow").removeClass("hide");


        $("#deleteSelectedChoreButton").confirmation({
            rootSelector: "#deleteSelectedChoreButton",
            popout: true,
            singleton: true,
            title: "Delete this chore?",
            btnOkClass: "btn-sm btn-danger",
            btnOkIcon: "glyphicon glyphicon-trash",
            btnCancelClass: "btn-sm btn-default",
            onConfirm: function () {
                deleteSelectedChore(selectedChore.choreId);
            }
        });

    }else if(num===1){
        $("#choresRightPanelFirstWindow").addClass("hide");
        $("#choresRightPanelThirdWindow").addClass("hide");
        $("#choresRightPanelSecondWindow").removeClass("hide");
        $(".newChoreInput").val("");
        $("#newChoreTitleInput").focus();
        $("#newChoreDropdownButton").html('No user <span class="caret"></span>');
        selectedUserForNewChore = null;
        var newChoreDropdownHTML = "";
        $.each(getCurrentHousehold().residents, function(i,val){
            newChoreDropdownHTML+="<li id='newChoreDropdownElement"+i+"' onclick='setNewChorePersonFromDropdown("+i+")'><a href='#'>"+val.name+"</a></li>";
        });
        $("#newChoreDropdownMenu").html(newChoreDropdownHTML);
        var currentTime = new Date;
        document.getElementById("newChoreLocalTimeInput").value = (currentTime.getFullYear()+"-"+pad(currentTime.getMonth()+1)+"-"+pad(currentTime.getDate()+1)+"T"+pad(currentTime.getHours())+":"+pad(currentTime.getMinutes()));
    }else if(num===2){
        $("#choresRightPanelFirstWindow").addClass("hide");
        $("#choresRightPanelSecondWindow").addClass("hide");
        $("#choresRightPanelThirdWindow").removeClass("hide");
        var newChoreDropdownHTML = "";
        $.each(getCurrentHousehold().residents, function(i,val){
            newChoreDropdownHTML+="<li id='editChoreDropdownElement"+i+"' onclick='setNewChorePersonFromDropdown("+i+")'><a href='#'>"+val.name+"</a></li>";
        });
        $("#editChoreDropdownMenu").html(newChoreDropdownHTML);
    }else if(num===3){
        $("#choresRightPanelFirstWindow").addClass("hide");
        $("#choresRightPanelSecondWindow").addClass("hide");
        $("#choresRightPanelThirdWindow").addClass("hide");
    }
}

function newChoreButtonPressed(){

    //input formatting:
    var newChoreTitle = $("#newChoreTitleInput").val();
    var newChoreDescription = $("#newChoreDescriptionInput").val();
    var newChoreDate = $("#newChoreLocalTimeInput").val();
    var newChoreUserId;
    if(selectedUserForNewChore!==null){
        newChoreUserId = getCurrentHousehold().residents[selectedUserForNewChore].userId;
    }else{
        newChoreUserId = 0;
    }
    var newHouseId = getCurrentHousehold().houseId;
    var checked = false;
    var newChore = {houseId:newHouseId,title:newChoreTitle, description:newChoreDescription, time: newChoreDate, userId: newChoreUserId, done:checked};
    if(verifyChoreInput(0)){
        verifyChoreInput(2);
        selectedUserForNewChore = null;
        postNewChore(newChore);
    }
}
function verifyChoreInput(inputType){//Inputtype - 0 for new, 1 for edit, 2 for remove missingInput-classes
    var allGoodInTheHood = true;
    if(inputType === 0){

        if($("#newChoreTitleInput").val().length<1){
            $("#newChoreTitleInput").effect("highlight", {color: '#d9534f'}, 250);
            $("#newChoreTitleInput").focus();
            allGoodInTheHood = false;
        }
        if(!verifyTimeString($("#newChoreLocalTimeInput").val())){
            $("#newChoreLocalTimeInput").effect("highlight", {color: '#d9534f'}, 250);
            allGoodInTheHood = false;
        }
        return allGoodInTheHood;
    }else if(inputType === 1){
        if($("#editChoreTitleInput").val().length<1){
            $("#editChoreTitleInput").effect("highlight", {color: '#d9534f'}, 250);
            $("#editChoreTitleInput").focus();
            allGoodInTheHood = false;
        }
        if(!verifyTimeString($("#editChoreLocalTimeInput").val())){
            $("#editChoreLocalTimeInput").effect("highlight", {color: '#d9534f'}, 250);
            allGoodInTheHood = false;
        }
        return allGoodInTheHood;
    }
}
function verifyTimeString(timeString){
    var verifiableYear = timeString.substring(0,4);
    var verifiableMonth = timeString.substring(5,7);
    var verifiableDay = timeString.substring(8,10);
    var verifiableHour = timeString.substring(11, 13);
    var verifiableMinute = timeString.substring(14,16);
    if(timeString.length!==16){
        return false;
    }else{
        return true;
    }
}

function setNewChorePersonFromDropdown(index){
    $("#newChoreDropdownButton").html(getCurrentHousehold().residents[index].name + ' <span class="caret"></span>');
    $("#editChoreDropdownButton").html(getCurrentHousehold().residents[index].name + ' <span class="caret"></span>');
    selectedUserForNewChore = index;
}

function editChore(chore){
    switchChoresContent(2);
    $("#editChoreTitleInput").val(he.unescape(chore.title));
    $("#editChoreDescriptionInput").val(he.unescape(chore.description));
    $("#editChoreDescriptionControl").text("(" + $("#editChoreDescriptionInput").val().length + "/240)");    $("#editChoreDropdownButton").html(chore.user==null?"No user <span class=\"caret\"></span>":chore.user.name + ' <span class="caret"></span>');
    $("#editChoreLocalTimeInput").value = (chore.time.year+"-"+pad(chore.time.monthValue)+"-"+chore.time.dayOfMonth+"T"+pad(chore.time.hour)+":"+pad(chore.time.minute));
}
function editChoreButtonPressed(){
    var editedChoreTitle = $("#editChoreTitleInput").val();
    var editedChoreDescription = $("#editChoreDescriptionInput").val();
    var editedChoreDate = $("#editChoreLocalTimeInput").val();
    var editedChoreUserId;
    if(selectedUserForNewChore!==null){
        editedChoreUserId = getCurrentHousehold().residents[selectedUserForNewChore].userId;
        selectedUserForNewChore = null;
    }else{
        editedChoreUserId = selectedChore.userId;
    }
    var editedChoreDone = selectedChore.done;
    var editedChore = {choreId:selectedChore.choreId, title:editedChoreTitle, description:editedChoreDescription, time: editedChoreDate, userId: editedChoreUserId, done:editedChoreDone};
    if(verifyChoreInput(1)) {
        verifyChoreInput(2);
        selectedUserForNewChore = null;
        updateChore(editedChore);
    }
}
function pad(n){
    return ((""+n).length<2)?("0"+n):(""+n);
}

function getChoresForUser(id, handleData){
    ajaxAuth({
        url: "res/user/"+id+"/chores",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function(data){
            handleData(data);
        }
    })
}

function getChoresForHousehold(id, handleData){
    ajaxAuth({
        url: "res/household/"+id+"/chores",
        type: "GET",
        contentType:"application/json; charset=utf-8",
        success: function(data){
            handleData(data);
        }
    });
}

function postNewChore(chore){
    ajaxAuth({
        url: "res/household/"+getCurrentHousehold().houseId+"/chores",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(chore),
        success: function (data) {
            if(getCurrentUser().userId!==chore.userId){
                addNotification(chore.userId, getCurrentHousehold().houseId, "You have been added to the chore \"" + chore.title + "\", by " + getCurrentUser().name);
            }
            selectedChore = undefined;
            newlyPostedChoreId = data;
            readyChores();
        }
    });
}

function updateChore(chore){
    ajaxAuth({
        url: "res/household/"+getCurrentHousehold().houseId+"/chores",
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(chore),
        success: function(data){
            if(getCurrentUser().userId!==chore.userId)addNotification(chore.userId, getCurrentHousehold().houseId, ""+getCurrentUser.name+" has edited your chore \"" + chore.title + "\"");
            readyChores();
        }
    });
}

function checkChore(chore){
    var currentTime = new Date(); //Generates a valid date so as not to screw with the Chore DTO i backend. This date is not stored in the database
    chore.time = "" + currentTime.getFullYear()+"-"+pad(currentTime.getMonth()+1)+"-"+pad(currentTime.getDate()+1)+"T"+pad(currentTime.getHours())+":"+pad(currentTime.getMinutes());
    ajaxAuth({
        url: "res/household/"+getCurrentHousehold().houseId+"/chores/check",
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(chore),
        success: function(data){
            readyChores();
        }
    });
}

function setUpChoreListeners(){
    $("#newChoreTitleInput").keyup(function(){
        if($("#newChoreTitleInput").val().length>60){
            $("#newChoreTitleInput").val($("#newChoreTitleInput").val().substring(0,60));
        }
    });
    $("#editChoreTitleInput").keyup(function(){
        if($("#editChoreTitleInput").val().length>60){
            $("#editChoreTitleInput").val($("#editChoreTitleInput").val().substring(0,60));
        }
    });
    $("#newChoreDescriptionInput").keyup(function(){
        if($("#newChoreDescriptionInput").val().length>240){
            $("#newChoreDescriptionInput").val($("#newChoreDescriptionInput").val().substring(0,240));
        }
        $("#newChoreDescriptionControl").text("(" + $("#newChoreDescriptionInput").val().length + "/240)");
    });
    $("#editChoreDescriptionInput").keyup(function(){
        if($("#editChoreDescriptionInput").val().length>240){
            $("#editChoreDescriptionInput").val($("#editChoreDescriptionInput").val().substring(0,240));
        }
        $("#editChoreDescriptionControl").text("(" + $("#editChoreDescriptionInput").val().length + "/240)");
    });
}

function toggleYourCompletedList() {
    if ($("#yourChoresTab_completed").hasClass("hide")) {
        $("#yourChoresTab_completed").removeClass("hide");
        $("#completed_personal_chores_box").html("Press to hide completed list");
    } else {
        $("#yourChoresTab_completed").addClass("hide");
        $("#completed_personal_chores_box").html("Press to show completed list");
    }
}

function toggleHouseholdCompletedList() {
    if ($("#householdChoresTab_completed").hasClass("hide")) {
        $("#householdChoresTab_completed").removeClass("hide");
        $("#completed_household_chores_box").html("Press to hide completed list");
    } else {
        $("#householdChoresTab_completed").addClass("hide");
        $("#completed_household_chores_box").html("Press to show completed list");
    }
}