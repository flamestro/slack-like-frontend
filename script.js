let actualUsername = "";
let actualChannelId = 0;
let actualMsgs = "";
let totalCnls = 1000;
let lastTimestamp = ""
let actualMsgIDs = []

//called when page is loaded
$(document).ready(function () {
// show Channels when Page is loaded
    getChannels()
// update channels every 10 secs
    setInterval(getChannels, 10000);
// update Users every 1.2 secs
    setInterval(getUsers, 1200);
// update Msgs every 1 sec
    setInterval(getMsgs, 1000);
});

//-------------------------------create Channels-------------------------------

//onClick method for addChannelBtn calls postChannel
//with inputs of CNameInput,CTopicInput as params
function addChannel() {
    let cName = $('#CNameInput').val()
    let cTopic = $('#CTopicInput').val()
    postChannel(cName, cTopic)
}

//Function to add a new Channel, calls getChannels on Success to keep UX high
function postChannel(name, topic) {
    postData = '{ "name" : "' + name + '","topic" : "' + topic + '"}'
    $.ajax({
        url: "http://localhost:8080/channels",
        type: 'POST',
        data: postData,
        success: getChannelsOnPost,
        statusCode: {409: errorPostChannel},
        contentType: "application/json",
        headers: {'X-Token': 'someToken'}
    });
}

//Error function if channel exists
function errorPostChannel() {
    alert("Channel name already exists")
}

//Increment ChannelCount and getChannels
function getChannelsOnPost() {
    totalCnls += 1
    getChannels()
}

//------------------------------------------------------------------------------

//-------------------------------show Channels----------------------------------

//Get request which calls handleData on success
function getChannels() {
    $.ajax({
        url: "http://localhost:8080/channels",
        type: 'GET',
        contentType: "application/json",
        success: handleData,
        data: {size: totalCnls},
        headers: {'X-Token': 'someToken'}
    });
}

//gets json data and shows them in the channelList innerhtml
function handleData(data) {
    let jsonAsObj = JSON.parse((JSON.stringify(data)))
    let text = ""
    let id = ""
    let name = ""
    let topic = ""
    totalCnls = jsonAsObj.page.totalElements
    if (jsonAsObj._embedded != null) {
        for (i = 0; i < jsonAsObj._embedded.channelList.length; i++) {
            id = jsonAsObj._embedded.channelList[i].id
            name = jsonAsObj._embedded.channelList[i].name
            topic = jsonAsObj._embedded.channelList[i].topic
            if (name !== null) {
                name = name.replace(/<\/?[^>]+(>|$)/g, "")
            }
            if (topic !== null) {
                topic = topic.replace(/<\/?[^>]+(>|$)/g, "")
            }

            text += '<li onclick="joinChannel(' + id + ')" class="list-group-item"><b>Channel ID </b>: ' + id
                + '<br><b>name</b>  : ' + name
                + '<br><b>topic</b> : ' + topic
                + '</li>'
        }
    }
    $('#channelList').html(text)
}

//------------------------------------------------------------------------------

//-------------------------------join Channels----------------------------------
//-------------------------and show actual Channel data-------------------------

//onClick method for list elements of channels to handle requests
function joinChannel(id) {
    if (actualChannelId == id) {
        actualChannelId = 0
        actualMsgs = ""
        actualMsgIDs = []
        $('#channelData').html("")
    } else {
        if ($('#userNameInput').val() !== "") {
            actualUsername = $('#userNameInput').val()
            actualChannelId = id;
            actualMsgs = ""
            actualMsgIDs = []
            getChannel(id)
        } else {
            alert("Enter a username")
        }
    }
}

//Get request for a specific Channel calls handleActualChannelInformation on success
function getChannel(id) {

    $.ajax({
        url: "http://localhost:8080/channels/" + id,
        type: 'GET',
        contentType: "application/json",
        success: handleActualChannelInformation,
        headers: {'X-Token': 'someToken'}
    });
}

//Shows channel data of actual channel in (#channelData)
function handleActualChannelInformation(data) {
    let jsonAsObj = JSON.parse((JSON.stringify(data)))
    id = jsonAsObj.id
    name = jsonAsObj.name
    topic = jsonAsObj.topic
    if (name !== null) {
        name = name.replace(/<\/?[^>]+(>|$)/g, "")
    }
    if (topic !== null) {
        topic = topic.replace(/<\/?[^>]+(>|$)/g, "")
    }
    $('#channelData').html('<div  id="badge">Actual Channel: <b>id</b> = ' + id
        + " <b> Name </b>= " + name + " <b> Topic </b>=" + topic + "</div>")
}

//------------------------------------------------------------------------------

//-------------------------------show messages----------------------------------

//Get request to get last 10 msg of channel calling handleMsgs with response body
function getMsgs() {

    if (actualChannelId > 0 && actualMsgs === "") {
        $.ajax({
            url: "http://localhost/channels/" + actualChannelId + "/messages",
            type: 'GET',
            success: handleMsgs,
            contentType: "application/json",
            headers: {'X-Token': 'someToken'}
        });

    } else if (actualChannelId > 0 && !(actualMsgs === "")) {
        $.ajax({
            url: "http://localhost:8080/channels/" + actualChannelId + "/messages",
            type: 'GET',
            data: {lastSeenTimestamp: encodeURI(lastTimestamp)},
            success: handleNewMsgs,
            contentType: "application/json",
            headers: {'X-Token': 'someToken'}
        });
    } else {
        $('#msgFeed').html("")
    }
}

//Showing last 10 Msg in MessageFeed
function handleMsgs(data) {
    let jsonAsObj = JSON.parse((JSON.stringify(data)))
    let id = ""
    let timestamp = ""
    let content = ""
    let creator = ""
    let text = ""
    if (jsonAsObj._embedded != null) {
        for (i = 0; i < jsonAsObj._embedded.messageList.length; i++) {
            if (!(actualMsgIDs.includes(jsonAsObj._embedded.messageList[i].id))) {
                id = jsonAsObj._embedded.messageList[i].id
                timestamp = jsonAsObj._embedded.messageList[i].timestamp
                creator = jsonAsObj._embedded.messageList[i].creator
                content = jsonAsObj._embedded.messageList[i].content
                actualMsgIDs.push(id)
                if (i === 0) {
                    lastTimestamp = timestamp
                }
                corstamp = (new Date(timestamp))
                if (creator !== null) {
                    creator = creator.replace(/<\/?[^>]+(>|$)/g, "")
                } else {
                    creator = "null"
                }
                if (content !== null) {
                    content = content.replace(/<\/?[^>]+(>|$)/g, "")
                } else {
                    content = "null"
                }
                text += '<li  class="list-group-item"><b>creator</b>    : ' + creator
                    + '<br><b>content</b>   : ' + content
                    + '<br><b>timestamp</b> : ' + corstamp.toString().split('.')[0]
                    + '<b> ID </b>          : ' + id
                    + '</li>'
            }
        }
    }

    actualMsgs = text
    $('#msgFeed').html(actualMsgs)
}

function handleNewMsgs(data) {
    let jsonAsObj = JSON.parse((JSON.stringify(data)))
    let id = ""
    let timestamp = ""
    let content = ""
    let creator = ""
    let text = ""
    if (jsonAsObj._embedded != null) {
        let length = jsonAsObj._embedded.messageList.length
        for (i = 0; i < length; i++) {
            if (!(actualMsgIDs.includes(jsonAsObj._embedded.messageList[i].id))) {
                id = jsonAsObj._embedded.messageList[i].id
                timestamp = jsonAsObj._embedded.messageList[i].timestamp
                creator = jsonAsObj._embedded.messageList[i].creator
                content = jsonAsObj._embedded.messageList[i].content
                actualMsgIDs.push(id)
                corstamp = (new Date(timestamp))
                if (creator !== null) {
                    creator = creator.replace(/<\/?[^>]+(>|$)/g, "")
                } else {
                    creator = "null"
                }
                if (content !== null) {
                    content = content.replace(/<\/?[^>]+(>|$)/g, "")
                } else {
                    content = "null"
                }
                text += '<li  class="list-group-item"><b>creator</b>    : ' + creator
                    + '<br><b>content</b>   : ' + content
                    + '<br><b>timestamp</b> : ' + corstamp.toString().split('.')[0]
                    + '<b> ID </b>          : ' + id
                    + '</li>'
            }
        }
    }
    actualMsgs = text + actualMsgs;
    $('#msgFeed').html(actualMsgs)
}

//------------------------------------------------------------------------------


//-------------------------------send messages----------------------------------
//posts msg to backend
function postMsg() {
    postData = '{ "creator" : "' + actualUsername + '","content" : "' + $('#msgInput').val() + '"}'
    $.ajax({
        url: "http://localhost:8080/channels/" + actualChannelId + "/messages",
        type: 'POST',
        data: postData,
        success: getMsgs,
        contentType: "application/json",
        headers: {'X-Token': 'someToken'}
    });
}

//------------------------------------------------------------------------------


//----------------------------show Users----------------------------------------

//get request to backend asking for User Names on actual
//Channel calling handleUsers with response body
function getUsers() {
    if (actualChannelId > 0) {
        $.ajax({
            url: "http://localhost:8080/channels/" + actualChannelId + "/users",
            type: 'GET',
            success: handleUsers,
            contentType: "application/json",
            headers: {'X-Token': 'someToken'}
        });
    } else {
        $('#userList').html("")
    }
}

//showing Users of actual Channel
function handleUsers(data) {
    let jsonAsObj = JSON.parse((JSON.stringify(data)))
    let name = ""
    let text = '<p id="activeUserTag">Active Users: </p>'
    for (i = 0; i < jsonAsObj.length; i++) {
        name = jsonAsObj[i].replace(/<\/?[^>]+(>|$)/g, "")
        text += '<li  class="list-group-item"><b>name </b>: ' + name + '</li>'
    }
    $('#userList').html(text)
}

//------------------------------------------------------------------------------
