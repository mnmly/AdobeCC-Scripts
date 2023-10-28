#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../.config

var doc = app.activeDocument
var folder = Folder(doc.filePath)
var arenaURLRegExp = /https\:\/\/www\.are\.na\/block\/(\d+)f?/
var arenaChannelRegExp = /https\:\/\/www\.are\.na\/(.*)\/(.*)f?/

var keyShortcutMapping = {
    'c': 'content',
    'd': 'description',
    't': 'title'
};

var arenaAssetFolder = new Folder(doc.filePath + "/arena-assets");  
if (!arenaAssetFolder.exists) {
    arenaAssetFolder.create();
}

// Load previous ID
var configJSONFile = File(folder + "/arena-assets/config.json")
var configData = null

if ( configJSONFile.exists ) {
    configJSONFile.open('r')
    configData = JSON.parse(configJSONFile.read())
    configJSONFile.close()
}

var jsonFile = File.openDialog("Select JSON File", "*.json", false);

// Check if a file was selected
if (jsonFile != null) {
    // Read the contents of the JSON file
    jsonFile.open("r");
    var jsonContents = jsonFile.read();
    jsonFile.close();

    // Parse the JSON contents into a JavaScript object
    var jsonObject = JSON.parse(jsonContents);
    var max = jsonObject.contents.length
    var newPage
    max = Math.min(10, max)
    var addedCount = 0
    for (var i = 0; i < max; i++){
        var c = jsonObject.contents[i]
        var myDocument = app.activeDocument;
        var masterSpread
        var items = []
        function getPageItem(name, masterSpread, p) {
            var masterFrame = masterSpread.pages[0].pageItems.itemByName(name);
            var frame = masterFrame.override(p)
            return frame
        }
        if (c.image) {
            masterSpread = myDocument.masterSpreads.itemByName("IMG-Parent");
            items = ['image', 'title', 'description', 'connected_at']
            if (c.source && c.source.url) {
                items.push('url')
            }
        } else if( c.content ){
            masterSpread = myDocument.masterSpreads.itemByName("TMP-Content");
            items = ['content', 'connected_at']
        } else {
            // alert(JSON.stringify(c))
            continue
        }
        newPage = myDocument.pages.add(LocationOptions.AFTER, myDocument.pages.item(-1), masterSpread.pages[0]);
        newPage.appliedMaster = masterSpread;
        for (var j = 0; j < items.length; j++) {
            var key = items[j]
            if (key == 'connected_at') {
                var itemLeft = getPageItem(key + '_left', masterSpread, newPage)
                var itemRight = getPageItem(key + '_right', masterSpread, newPage)
                var connected_at = c.time_at || c.connected_at
                processPageItem(c, c.id, itemLeft, key)
                processPageItem(c, c.id, itemRight, key)
                itemLeft.contents = convertDateToString(connected_at)
                itemRight.contents = convertDateToString(connected_at)
                if (addedCount % 2 == 0) {
                    itemLeft.contents = ''
                } else {
                    itemRight.contents = ''
                }
            } else {
                var item = getPageItem(items[j], masterSpread, newPage)
                processPageItem(c, c.id, item, key)
            }
        }
        addedCount++
    }
} else {
    // No file was selected
    alert("No JSON file selected.");
}

function getArenaData(_data, id, force) {
    var data
    data = _data
    return data
}

function getArenaImage(data, id, force) {
    var data = data || getArenaData(id)
    var imageFile = File(folder + "/arena-assets/" + data.id + data.image.filename)
    if (!imageFile.exists) {
        var imageURL = data.image.original.url
        var request = { url: imageURL }
        var response = restix.fetchFile(request, imageFile)
    }
    return imageFile
}


function processPageItem(data, id, item, key, force) {
    if (item instanceof Rectangle) {
        if ( key == 'image') {
            item.name = 'arena-' + id
            item.place(getArenaImage(data, id, force))
            item.fit(FitOptions.CONTENT_AWARE_FIT)
        } else if( key == 'url'){
            item.name = 'arena-url-' + id
            item.createHyperlinkQRCode(data['source']['url'])
            item.fit(FitOptions.FILL_PROPORTIONALLY)
        }
    } else if (item instanceof TextFrame) {
        var data = getArenaData(data, id, force)
        var keys = []
        keys.push(key);
        var contents = []
        if (key == 'description') { item.parentStory.justification = Justification.LEFT_ALIGN }
        contents.push(data[key].replace('&gt; ', ''))
        item.name = 'arena.' + keys.join('+') + '-' + id
        item.contents = contents.join('\n')
    }
}

function convertDateToString(inputDateTime) {
    var datePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2}):(\d{2})/;
    var found = datePattern.exec(inputDateTime)
    // Month names
    var monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
    ];

    // Get the month, day, year, and time components
    var month = monthNames[parseInt(found[2], 10)];
    if (month == undefined) {
        month = monthNames[0]
    }
    var day = parseInt(found[3], 10)
    var year = found[1]
    var hours = parseInt(found[4], 10)
    var minutes = parseInt(found[5], 10)

    // Function to add the ordinal suffix to the day (e.g., 1st, 2nd, 3rd, etc.)
    function addOrdinalSuffix(day) {
        if (day >= 11 && day <= 13) {
            return day + "th";
        }
        switch (day % 10) {
            case 1: return day + "st";
            case 2: return day + "nd";
            case 3: return day + "rd";
            default: return day + "th";
        }
    }

    // Format the date and time string
    var formattedDateTime = day + ' ' + month +' ' +  year + " @ " + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
    return formattedDateTime
}