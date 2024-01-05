#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../libs/shim.jsx
#include ../.config

function run() {

    var dialog = new Window('dialog')
    dialog.text = "Place multiple images"
    dialog.orientation = 'column';
    dialog.alignChildren = ['center', 'top']
    dialog.spacing = 10
    dialog.margins = 16

    var group1 = dialog.add("group", undefined, {name: "group1"}); 
        group1.orientation = "row"; 
        group1.alignChildren = ["left","center"]; 
        group1.spacing = 10; 
        group1.margins = 0; 
    

    var items = []
    var fitOptions = []
    for (var k in FitOptions) {
        fitOptions.push(FitOptions[k])
        items.push(titleCase(k.toLowerCase().replace(/_/g, ' ')))
    }
    
    var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
    statictext1.text = "Fitting Option:"; 

    var keySelection = group1.add("dropdownlist", undefined, undefined, {name: "keys", items: items}); 
    keySelection.selection = items[items.indexOf('Fill Proportionally')]
    keySelection.preferredSize.width = 200; 
        
    var group3 = dialog.add("group", undefined, {name: "group3"}); 
        group3.orientation = "row"; 
        group3.alignChildren = ["left","top"]; 
        group3.spacing = 10; 
        group3.margins = 0;
        group3.add('button', undefined, 'Cancel', {name: 'cancel'}); 
        group3.add('button', undefined, 'Select Images', {name: 'ok'}); 

    var result = dialog.show()
    if (result == 0) return
    var selectedFittingOption = fitOptions[items.indexOf(keySelection.selection.text)]
    var doc = app.activeDocument
    var files = File.openDialog("Select Images", "*", true)
    if (!files) return
    var fileCount = files.length
    var masterSpread = doc.masterSpreads.itemByName("A-Parent");
    var numPages = masterSpread.pages.count()
    var itemsPerPage = []
    var totalFrameItemsPerSpread = 0
    for (var i = 0; i < numPages; i++ ) {
        var page = masterSpread.pages[i]
        var count = page.pageItems.count()
        itemsPerPage.push(count)
        totalFrameItemsPerSpread += count
    }

    var currentSpread
    for(var j = 0; j < fileCount; j++) {
        if ( j % totalFrameItemsPerSpread == 0) {
            currentSpread = doc.spreads.add()
            for (var k = 0; k < numPages; k++) {
                var templatePage = currentSpread.pages[k]
                templatePage.appliedMaster = masterSpread
            }
        }
        var pageItem = getSpreadItemAtIndex(j % totalFrameItemsPerSpread, currentSpread)
        placeImage(pageItem, files[j], selectedFittingOption)
    }
}

function getSpreadItemByIndex(i, spread) {
    var allPageItems = []
    for(var k = 0; k < spread.pages.count(); k++) {
        var page = spread.pages[k]
        for ( var j = 0; j < page.appliedMaster.pageItems.count(); j++ ) {
            var item = page.appliedMaster.pageItems[j]
            allPageItems.push(item)
        }
    }
    var foundItem = allPageItems[i]
    var pageIndex = -1
    for(var k = 0; k < spread.pages.length; k++) {
        var page = spread.pages[k]
        for ( var j = 0; j < page.appliedMaster.pageItems.count(); j++ ) {
            var item = page.appliedMaster.pageItems[j]
            if (foundItem == item) {
                pageIndex = k
                break;
            }
        }
    }
    return { item: foundItem, page: spread.pages[pageIndex] }
}

function getSpreadItemAtIndex(i, masterSpread) {
    var result = getSpreadItemByIndex(i, masterSpread);
    var frame = result.item.duplicate(result.page)
    return frame
}

function placeImage(item, path, fitOption) {
    item.place(path)
    item.fit(fitOption)
    return item
}

run()