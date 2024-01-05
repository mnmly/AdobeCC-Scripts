#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../libs/shim.jsx
#include ../libs/load-config.jsx

var doc = app.activeDocument
var folder = Folder(doc.filePath)
var arenaAssetFolder = new Folder(doc.filePath + "/arena-assets");  
if (!arenaAssetFolder.exists) { arenaAssetFolder.create(); }
var blockTypes = [ 'Image', 'Text', 'Attachment' ]

main()

function main() {

    var result = createJSONFileDialog()

    if ( !result || result.jsonFilePath == '' ) { return }

    var jsonFilePath = result.jsonFilePath
    var jsonObject = loadJSON(jsonFilePath)
    var blockCount = jsonObject.contents.length
    var templateSelections = result.templateSelections
    var fittingSelection = result.fittingSelection

    for (var i = 0; i < blockCount; i++) {
        var c = jsonObject.contents[i]
        placeBlock(jsonObject.contents[i], templateSelections, fittingSelection)
    }
}

function placeBlock(block, templateSelections, fittingSelection) {

    var klass = block['class']
    var masterSpreadIndex = templateSelections[blockTypes.indexOf(klass)]
    if (masterSpreadIndex == -1) { return alert("type: " + klass + " is not implemented")}
    var masterSpread = doc.masterSpreads[masterSpreadIndex]
    var newPage = doc.pages.add(LocationOptions.AFTER, doc.pages.item(-1), masterSpread.pages[0]);
    newPage.appliedMaster = masterSpread;
    
    Object.keys(block).forEach( function(key) {
        if (!block[key]) return
        var item = getPageItem(key, newPage)
        if ( item ) {
            processPageItem(block.id, item, key)
            if (klass == 'Image') { item.fit(fittingSelection) }
        }
    })
}

function createJSONFileDialog() {
    var dialog = new Window("dialog"); 
        dialog.text = "Import are.na Channel"; 
        dialog.orientation = "column"; 
        dialog.alignChildren = ["center","top"]; 
        dialog.spacing = 10; 
        dialog.margins = 16; 

    var group1 = dialog.add("group", undefined, {name: "group1"}); 
        group1.orientation = "row"; 
        group1.alignChildren = ["left","center"]; 
        group1.spacing = 10; 
        group1.margins = 0; 

    var url = group1.add("edittext", );
    url.preferredSize.width = 220;
    url.text = "";

    var jsonFilePath = null
    var fileSelectionButton = group1.add("button", undefined, undefined, {name: "fileSelction", "label": "Select JSON"}); 
    fileSelectionButton.text = "Select JSON"
    fileSelectionButton.onClick = function() {
        jsonFilePath = File.openDialog("Select JSON File", "*.json", false);
        url.text = jsonFilePath;
    }

    var masterSpreadNames = []
    for(var j = 0; j < doc.masterSpreads.length; j++ ) {
        masterSpreadNames.push(doc.masterSpreads[j].name)
    }


    var panel = dialog.add("panel", undefined, "Master Templates", { borderStyle: "etched" }); 
    panel.orientation = "column"; 
    panel.alignChildren = ["left","center"]; 
    panel.spacing = 10; 
    panel.margins = 16; 

    // var groupTemplateSelection = dialog.add("group", undefined, {name: "group4"}); 
    var templateSelections = []
    for (var i = 0; i < blockTypes.length; i++) {
        var blockType = blockTypes[i]
        var tempGroup = panel.add("group", undefined, {name: 'panel_' + i}); 
        tempGroup.orientation = "row"; 
        tempGroup.alignChildren = ["left","top"]; 
        tempGroup.spacing = 10; 
        tempGroup.margins = 0;

        var statictext = tempGroup.add("statictext", undefined, undefined, {name: "statictext_" + i}); 
        statictext.text = blockType
        statictext.preferredSize.width = 100;

        var keySelection = tempGroup.add("dropdownlist", undefined, undefined, {name: "keys" + i, items: masterSpreadNames});
        var possibleSpreadNames = masterSpreadNames.filter( function( d ) {
            return d.indexOf(blockType) > -1
        })
        keySelection.selection = possibleSpreadNames.length > 0 ? masterSpreadNames.indexOf(possibleSpreadNames[0]) : masterSpreadNames[0]
        keySelection.preferredSize.width = 200; 
        templateSelections.push(keySelection)
    }

    var fitOptions = []
    var fitOptionsItems = []
    var fittingSelectionDropdown
    addFittingUI()
        
    function addFittingUI() {

        var g = dialog.add("group", undefined, {name: "group-fitting"}); 
        g.orientation = "row"; 
        g.alignChildren = ["left","center"]; 
        g.spacing = 10; 
        g.margins = 0; 

        for (var k in FitOptions) {
            fitOptions.push(FitOptions[k])
            fitOptionsItems.push(titleCase(k.toLowerCase().replace(/_/g, ' ')))
        }

        var statictext1 = g.add("statictext", undefined, undefined, {name: "statictext1"}); 
        statictext1.text = "Fitting Option"
        statictext1.preferredSize.width = 100;

        fittingSelectionDropdown = g.add("dropdownlist", undefined, undefined, {name: "keys", items: fitOptionsItems}); 
        fittingSelectionDropdown.selection = fitOptionsItems.indexOf('Fill Proportionally')
        fittingSelectionDropdown.preferredSize.width = 200;
        
        function titleCase(str) {
            str = str.toLowerCase().split(' ');
            for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
            }
            return str.join(' ');
        }
    }

    var groupCTA = dialog.add("group", undefined, {name: "group3"}); 
        groupCTA.orientation = "row"; 
        groupCTA.alignChildren = ["left","top"]; 
        groupCTA.spacing = 10; 
        groupCTA.margins = 0;
        groupCTA.add('button', undefined, 'Cancel', {name: 'cancel'}); 
        groupCTA.add('button', undefined, 'OK', {name: 'ok'}); 

    var result = dialog.show();
    if (result == 1) {
        return {
            jsonFilePath: url.text,
            templateSelections: templateSelections.map(function(item){
                return masterSpreadNames.indexOf(item.selection.text)
            }),
            fittingSelection: fitOptions[fitOptionsItems.indexOf(fittingSelectionDropdown.selection.text)]
        }
    }
}

function loadJSON(path) {
    var jsonContents;
    var jsonFile = File(path);
    jsonFile.open("r");
    jsonContents = jsonFile.read();
    jsonFile.close();
    return JSON.parse(jsonContents);
}

function getPageItem(name, page) {
    var sourceMasterPage
    var pages = page.appliedMaster.pages
    for (var i = 0; i < pages.length; i++) {
        if (pages[i].side == page.side) { sourceMasterPage = pages[i] }
    }
    var pageItem = sourceMasterPage.pageItems.itemByName(name);
    if ( pageItem.isValid ) {
        return pageItem.override(page)
    }
    return null
}

function getArenaData(id, force) {
    var jsonFile = File(folder + "/arena-assets/" + id + '.json')
    var data
    if ( !force && jsonFile.exists ) {
        jsonFile.open('r')
        data = JSON.parse(jsonFile.read())
        jsonFile.close()
    } else {
        var url = "https://api.are.na/v2/blocks/" + id + "?access_token=" + CONFIG['are.na'].accessToken
        var request = { "url": url }
        var response = restix.fetch(request)
        data = JSON.parse(response.body)
        jsonFile.encoding = 'UTF-8';
        jsonFile.open('w');
        jsonFile.write(response.body);
        jsonFile.close();
    }
    return data
}

function getArenaImage(id, force) {
    var data = getArenaData(id)
    var imageFile = File(folder + "/arena-assets/" + data.id + data.image.filename)
    if (!imageFile.exists) {
        var imageURL = data.image.original.url
        var request = { url: imageURL }
        var response = restix.fetchFile(request, imageFile)
    }
    return imageFile
}


function processPageItem(id, item, key, force) {
    var data = getArenaData(id, force)
    if (item instanceof Rectangle && data.image) {
        item.name = 'arena-' + id
        item.place(getArenaImage(id, force))
    } else if (item instanceof TextFrame) {
        item.name = 'arena.' + key + '-' + id
        var contents = data[key].replace(/\&gt;\s?/g, '')
        if (key == 'connected_at' || key == 'updated_at' || key == 'created_at') {
            contents = convertDateToString(contents)
        }
        item.contents = contents
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
