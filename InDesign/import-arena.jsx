#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../.config

var doc = app.activeDocument
var folder = Folder(doc.filePath)
var arenaURLRegExp = /https\:\/\/www\.are\.na\/block\/(\d+)/

// Load previous ID
var configJSONFile = File(folder + "/arena-assets/config.json")
var configData = null

if ( configJSONFile.exists ) {
    configJSONFile.open('r')
    configData = JSON.parse(configJSONFile.read())
    configJSONFile.close()
}

var defaultURL = 'https://www.are.na/block/' + (configData ? configData.previousID : '')
var url = prompt('Paste are.na url', defaultURL)

if ( url ) {
    var id = null
    var idMatches = url.match(arenaURLRegExp)
    if (idMatches.length > 0) { id = idMatches[1]; }
    if (id) {
        processPageItem(id)
        // Save ID
        configJSONFile.encoding = 'UTF-8';
        configJSONFile.open('w');
        configJSONFile.write('{"previousID": ' + id + '}');
        configJSONFile.close();
    }
}


function getArenaData(id) {
    var jsonFile = File(folder + "/arena-assets/" + id + '.json')
    var data
    if ( jsonFile.exists ) {
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

function getArenaImage(id) {
    var data = getArenaData(id)
    var imageFile = File(folder + "/arena-assets/" + data.id + data.image.filename)
    if (!imageFile.exists) {
        var imageURL = data.image.original.url
        var request = { url: imageURL }
        var response = restix.fetchFile(request, imageFile)
    }
    return imageFile
}


function processPageItem(id) {

    for (var i = 0; i < doc.selectedPageItems.length; i++){
        var item = doc.selectedPageItems[i];
        if (item instanceof Rectangle) {
            item.name = 'arena-' + id
            item.place(getArenaImage(id))
        } else if (item instanceof TextFrame) {
            var data = getArenaData(id)
            var keys = []
            for (var key in data) {
                keys.push(key);
            }
            var key = prompt('Which property to import? Available Keys are\n- ' + keys.join('\n- '), 'title')
            if (key) {
                item.name = 'arena.' + key + '-' + id
                item.contents = data[key]
            }
        }
    }
}