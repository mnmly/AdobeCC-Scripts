#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../.config

var doc = app.activeDocument
var folder = Folder(doc.filePath)
var arenaURLRegExp = /https\:\/\/www\.are\.na\/block\/(\d+)f?/

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
var url = prompt('Paste are.na URL\nTo clear the cache, append `f` at the end of URL.', defaultURL)

if ( url ) {
    var id = null
    var idMatches = url.match(arenaURLRegExp)
    if (idMatches.length > 0) { id = idMatches[1]; }
    if (id) {
        processPageItem(id, /f$/.test(url))
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
            var requestedKeys = prompt('Which property to import? Available Keys are\n- ' + keys.join('\n- '), 'title')
            if (requestedKeys) {
                requestedKeys = requestedKeys.split('+')
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