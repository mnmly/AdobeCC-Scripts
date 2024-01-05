#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../libs/shim.jsx

// Load previous ID
var pathComponents = app.activeScript.toString().split('/')
pathComponents.pop()
var arenaAuthFile = File(pathComponents.join('/') + "/../.config")
if (arenaAuthFile.exists) {
    arenaAuthFile.open('r')
    var txt = arenaAuthFile.read().replace('CONFIG =', '')
    CONFIG = JSON.parse(txt)
} else {
    alert('.config not found. Private blocks will fail to load.\nPlease refer to https://github.com/mnmly/AdobeCC-Scripts#setting-up-access-token-for-arena and create .config file.')
    CONFIG = {
        "are.na": {
            "accessToken": ""
        }
    }
}

var configData = null

var doc = app.activeDocument
var folder = Folder(doc.filePath)
var arenaURLRegExp = /https\:\/\/www\.are\.na\/block\/(\d+)f?/

if (!folder.exists) {
    folder.create()
}

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

var defaultURL = 'https://www.are.na/block/' + (configData ? configData.previousID : '')
var result = createDialog(defaultURL)
var url
var refresh = false
if ( result ) {
    url = result.url
    refresh = result.refresh
}

if ( url ) {
    var id = null
    var idMatches = url.match(arenaURLRegExp)
    if (idMatches && idMatches.length > 0) { id = idMatches[1]; }
    if (id) {
        processPageItem(id, refresh)
        // Save ID
        configJSONFile.encoding = 'UTF-8';
        configJSONFile.open('w');
        configJSONFile.write('{"previousID": ' + id + '}');
        configJSONFile.close();
    }
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


function processPageItem(id, force) {
    for (var i = 0; i < doc.selectedPageItems.length; i++){
        var item = doc.selectedPageItems[i];
        if (item instanceof Rectangle) {
            item.name = 'arena-' + id
            item.place(getArenaImage(id, force))
        } else if (item instanceof TextFrame) {
            var data = getArenaData(id, force)
            var keys = []
            for (var key in data) {
                keys.push(key);
            }
            keys.sort()
            var result = createTextTypeDialog(keys, data)
            if (result && result.property) {
                requestedKeys = [result.property]
                var contents = []
                var keys = []
                for (var j = 0; j < requestedKeys.length; j++) {
                    var key = requestedKeys[j];
                    if (keyShortcutMapping[key]) {
                        key = keyShortcutMapping[key]
                    }
                    keys.push(key)
                    contents.push(data[key].replace('&gt; ', ''))
                }
                item.name = 'arena.' + keys.join('+') + '-' + id
                item.contents = contents.join('\n')
            }
        }
    }
}

function createTextTypeDialog(keys, data) {
    var dialog = new Window("dialog"); 
        dialog.text = "Import are.na block"; 
        dialog.orientation = "column"; 
        dialog.alignChildren = ["center","top"]; 
        dialog.spacing = 10; 
        dialog.margins = 16; 

    var group1 = dialog.add("group", undefined, {name: "group1"}); 
        group1.orientation = "row"; 
        group1.alignChildren = ["left","center"]; 
        group1.spacing = 10; 
        group1.margins = 0; 
    
    var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
    statictext1.text = "Property to insert"; 

    var keySelection = group1.add("dropdownlist", undefined, undefined, {name: "keys", items: keys}); 
    keySelection.selection = keys.indexOf('title')
    keySelection.preferredSize.width = 88; 
    
    var group2 = dialog.add("panel", undefined, "Preview", { borderStyle: "etched" }); 
        group2.orientation = "column"; 
        group2.alignChildren = ["left","center"]; 
        group2.spacing = 10; 
        group2.margins = 16; 
    
    var statictext2 = group2.add("statictext", undefined, undefined, {name: "statictext2", multiline: true}); 
    statictext2.text = data[keySelection.selection.text]
    statictext2.preferredSize.width = 200; 

    keySelection.onChange = function() {
        statictext2.text = data[keySelection.selection.text]
    }
    

    var group3 = dialog.add("group", undefined, {name: "group3"}); 
        group3.orientation = "row"; 
        group3.alignChildren = ["left","top"]; 
        group3.spacing = 10; 
        group3.margins = 0;
        group3.add('button', undefined, 'Cancel', {name: 'cancel'}); 
        group3.add('button', undefined, 'OK', {name: 'ok'}); 


    var result = dialog.show()
    if ( result == 1 ) {
        return {
            property: keySelection.selection.text
        }
    }
}


function createDialog(defaultURL) {
    var dialog = new Window("dialog"); 
        dialog.text = "Import are.na block"; 
        dialog.orientation = "column"; 
        dialog.alignChildren = ["center","top"]; 
        dialog.spacing = 10; 
        dialog.margins = 16; 

    var group1 = dialog.add("group", undefined, {name: "group1"}); 
        group1.orientation = "row"; 
        group1.alignChildren = ["left","center"]; 
        group1.spacing = 10; 
        group1.margins = 0; 

    var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
    statictext1.text = "URL"; 

    var url = group1.add("edittext", );
    url.preferredSize.width = 255;
    url.text = defaultURL;
        
    var statictext2 = group1.add("statictext", undefined, undefined, {name: "statictext2"}); 
    statictext2.text = "Reload"; 

    var clearCache = group1.add("checkbox");

    var group3 = dialog.add("group", undefined, {name: "group3"}); 
        group3.orientation = "row"; 
        group3.alignChildren = ["left","top"]; 
        group3.spacing = 10; 
        group3.margins = 0;
        group3.add('button', undefined, 'Cancel', {name: 'cancel'}); 
        group3.add('button', undefined, 'OK', {name: 'ok'}); 

    var result = dialog.show();
    if (result == 1) {
        return {
            'url': url.text,
            'refresh': clearCache.value
        }
    }
}