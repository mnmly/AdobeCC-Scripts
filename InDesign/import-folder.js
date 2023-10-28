#include ../data.jsx
#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../libs/shim.jsx
#include ../.config

function findMenuItem(menus, name) {
    for (var i = 0; i < menus.length; i++) {
        if (menus[i].name == name) {
            return menus[i]
        }
    }
}

function executeMenuCommand(){
    var submenues = app.menus.item("$ID/Main").submenus.everyItem().getElements();
    var item
    for (var i = 0; i < arguments.length - 1; i++ ){
        item = findMenuItem(submenues, arguments[i])
        submenues = item.submenus.everyItem().getElements()
    }
    item = findMenuItem(item.menuItems, arguments[arguments.length - 1])
    item.select();
}

function getRectangle(pageItem) {
    var x = pageItem.geometricBounds[1]
    var y = pageItem.geometricBounds[0]
    var w = pageItem.geometricBounds[3] - x
    var h = pageItem.geometricBounds[2] - y
    return {
        x: x,
        y: y,
        w: w,
        h: h
    }
}
function run() {

    var doc = app.activeDocument
    var files = File.openDialog("Select Images", "*", true)
    var fileCount = files.length
    var masterSpread = doc.masterSpreads.itemByName("A-Parent");
    for(var j = 0; j < fileCount; j += 24) {
        var newSpread = doc.spreads.add()
        newSpread.pages[0].appliedMaster = masterSpread
        var templatePage = newSpread.pages[0]
        for (var i = 0; i < 24; i++) {
            var pageItem = getPageItemAtIndex(i, masterSpread, templatePage)
            if (j + i < fileCount) {
                placeImage(pageItem, files[j + i])
            } else {
                break
            }
        }
    }
    // var maxY = 0
    // var activePage = null
    // var groupMaxY = 0
    // // Check if a file was selected
    // if (jsonFile != null) {
    //     // Read the contents of the JSON file
    //     // jsonFile.open("r");
    //     // var jsonContents = arenaData //jsonFile.read();
    //     // jsonFile.close();

    //     // assuming we have a reference to the document
    //     // get the layer you want to move the item to, replace 'LayerName' with your target layer's name
    //     var layerName = 'Block__RENDERED';
    //     var renderLayer = doc.layers.item(layerName);
    //     // Check if the layer exists, if not create a new one
    //     if (!renderLayer.isValid) {
    //         renderLayer = doc.layers.add({name: layerName});
    //     }

    //     // Parse the JSON contents into a JavaScript object
    //     var jsonObject = arenaData // JSON.parse(jsonContents);
    //     // jsonObject.contents = jsonObject.contents.filter(filterFn)
    //     var max = jsonObject.contents.length
    //     // max = Math.min(10, max)
    //     var addedCount = 0
    //     var activePageAssigned = false
    //     var activePageIndex = -1
    //     var keepTemplateSpread = false
    //     var masterName = 'IMG-Parent';
    //     var pagesWithMaster = [];
    //     var pageSide = PageSideOptions.LEFT_HAND
    //     var templatePageIndex = pageSide == PageSideOptions.RIGHT_HAND ? 1 : 0
    //     // iterate over all pages
    //     alert('JSON LOADED')
    //     for (var k = 0; k < doc.pages.length; k++) {
    //         var page = doc.pages[k];
    //         if (page.side == pageSide && page.appliedMaster !== null && page.appliedMaster.name === masterName) {
    //             pagesWithMaster.push(page);
    //         }
    //     }
    //     alert('pageCollectged')
    //     for (var i = 0; i < max; i++){
    //         var c = jsonObject.contents[i]
    //         var masterSpread
    //         var items = []
    //         // if (i % 20 == 0) {
    //         //     alert('i = ' + i)
    //         // }
            function getSpreadItemByName(name, spread) {
                for(var k = 0; k < spread.pages.length; k++) {
                    var item = spread.pages[k].pageItems.itemByName(name)
                    if (item) return item
                }
                return null
            }
            function getSpreadItemByIndex(i, spread) {
                for(var k = 0; k < spread.pages.length; k++) {
                    var item = spread.pages[k].pageItems[i]
                    if (item) return item
                }
                return null
            }

            function getSpreadItemsPrefix(prefix, spread) {
                var filtered = []
                for(var k = 0; k < spread.pages.length; k++) {
                    var items = spread.pages[k].allPageItems
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].name.indexOf(prefix) > -1) {
                            filtered.push(items[i])
                        }
                    }
                }
                return filtered
            }

            function filterPageItemByPrefix(prefix, masterSpread, p) {
                var masterFrames = getSpreadItemsPrefix(prefix, masterSpread)
                var frames = []
                if(masterFrames.length > 0) {
                    for (var i = 0; i < masterFrames.length;i++) {
                        frames.push(masterFrames[i].duplicate(p))
                    }
                }
                return frames

            }
            function getPageItem(name, masterSpread, p) {
                var masterFrame = getSpreadItemByName(name.split(':')[0], masterSpread);
                var frame
                if(masterFrame) {
                    frame = masterFrame.duplicate(p)
                }
                return frame
            }

            function getPageItemAtIndex(i, masterSpread, p) {
                var masterFrame = getSpreadItemByIndex(i, masterSpread);
                var frame
                if(masterFrame) {
                    frame = masterFrame.duplicate(p)
                }
                return frame
            }

    //         if (c.image) {
    //             masterSpread = doc.masterSpreads.itemByName("IMG-Parent");
    //             items = ['line', 'image', 'title', 'description', 'connected_at']
    //             if (c.source && c.source.url) {
    //                 items.splice(2, 0, 'url');
    //             }
    //         } else if( c.content ){
    //             masterSpread = doc.masterSpreads.itemByName("TMP-Content");
    //             var url = c.content.match(/(http|https):\/\/[^\s]+/);
    //             if (url && url[0]) {
    //                 c.source = {'url': url[0]}
    //                 items = ['line', 'url', 'content:title', 'description', 'connected_at']
    //             } else {
    //                 items = ['line', 'content', 'connected_at']
    //             }
    //         } else {
    //             // alert(JSON.stringify(c))
    //             continue
    //         }

    //         // var newSpread = doc.spreads.add()
    //         var templatePage
    //         // for (var k = 0; k < newSpread.pages.length; k++) {
    //         //     newSpread.pages[k].appliedMaster = masterSpread
    //         // }
    //         templatePage = masterSpread.pages[templatePageIndex]
    //         if (activePageIndex == -1) {
    //             activePage = pagesWithMaster[0]
    //             activePageIndex = 0
    //             activePageAssigned = true
    //         }
    //         var pageItems = []
    //         var margin = 1.5
    //         var marginSeparationMargin = 5.0
    //         var marginTop = activePage.marginPreferences.top;
    //         var marginLeft = activePage.marginPreferences.left;
    //         var marginBottom = activePage.marginPreferences.top;
    //         c.connected_at = convertDateToString(c.time_at || c.connected_at) 
    //         for (var j = 0; j < items.length; j++) {
    //             var keyComponent = items[j].split(':')
    //             var key = keyComponent.length == 1 ? keyComponent[0] : keyComponent[1]
    //             var pageItem = getPageItem(items[j], masterSpread, templatePage)
    //             if ('line' !== key) {
    //                 pageItem = processPageItem(c, c.id, pageItem, key)
    //             }
    //             // if ('connected_at' == key) {
    //             //     var connected_at = c.time_at || c.connected_at
    //             //     pageItem.contents = convertDateToString(connected_at)
    //             // }
    //             var rect = getRectangle(pageItem)
    //             var topItems = ['image', 'content', 'connected_at', 'line']
    //             if (topItems.indexOf(key) > -1) {
    //                 var offsetY = marginTop - rect.y
    //                 if ('line' == key) {
    //                     offsetY -= marginSeparationMargin * 0.5
    //                 }
    //                 if ('connected_at' == key) {
    //                     offsetY -= rect.h
    //                 }
    //                 if ('content' == key) {
    //                     offsetY += 1.0
    //                 }
    //                 var delta = marginLeft - rect.x
    //                 pageItem.move(undefined, [delta, offsetY])
    //                 // pageItem.move(undefined, [0, offsetY])
    //                 if ('connected_at' != key ) {
    //                     maxY = rect.h + marginTop
    //                 }
    //             } else {
    //                 // $.writeln('---------')
    //                 // $.writeln(JSON.stringify(rect))
    //                 if (pageItem instanceof TextFrame) {
    //                     if (pageItem.contents.trim().length == 0) {
    //                         pageItem.remove()
    //                         isDeleted = true
    //                         continue;
    //                     }
    //                 }

    //                 doc.select(pageItem, SelectionOptions.replaceWith);
    //                 var rect = getRectangle(pageItem)
    //                 var newYPos = (maxY + margin)
    //                 var offsetY = newYPos - rect.y
    //                 var delta = marginLeft - rect.x
    //                 if ( 'url' == key) {
    //                     offsetY -= 0.705
    //                     delta = 0
    //                 }
    //                 pageItem.move(undefined, [delta, offsetY])
    //                 if ( 'url' != key) {
    //                     maxY = newYPos + getRectangle(pageItem).h
    //                 }
    //             }
    //             pageItems.push(pageItem)
    //         }
    //         for(var k = 0; k < pageItems.length; k++) {
    //             pageItems[k].itemLayer = renderLayer
    //         }
    //         // $.writeln('GROUP')
    //         var group = doc.groups.add(pageItems)
    //         placeGroupToActivePage(group)
    //         function placeGroupToActivePage(g) {
    //             var groupOffsetY = groupMaxY + marginSeparationMargin * 0.5
    //             var rect = getRectangle(g)
    //             g.move(activePage) // Move to page
    //             var rectOnActivePage = getRectangle(g)
    //             if ( activePageAssigned ) {
    //                 groupMaxY = 0;
    //                 groupOffsetY = marginTop - 3.0;
    //             }
    //             g.move(undefined, [rect.x - rectOnActivePage.x, groupOffsetY])
    //             rectOnActivePage = getRectangle(g)
    //             groupMaxY = rectOnActivePage.y + rectOnActivePage.h
    //         }

    //         if ( groupMaxY > (doc.documentPreferences.pageHeight - marginBottom) ) {
    //             activePageIndex = pagesWithMaster.indexOf(activePage) + 1
    //             activePage = pagesWithMaster[activePageIndex]
    //             if ( !activePage ) {
    //                 // alert('i = ' + i + ' max:' + max)
    //                 break;
    //                 activePage = newSpread.pages[1]
    //                 pagesWithMaster.push(activePage)
    //                 keepTemplateSpread = true
    //             }
    //             activePageAssigned = true
    //             placeGroupToActivePage(group)
    //         }

    //         $.writeln('Page No', Array.from(doc.pages).indexOf(activePage))
    //         $.writeln(c.title || c.content)
    //         $.writeln(JSON.stringify(getRectangle(group)))
    //         activePageAssigned = false
    //         addedCount++

    //         // if (!keepTemplateSpread) {
    //         //     for(var k = 0; k < newSpread.pages.length; k++) {
    //         //         newSpread.pages[k].remove()
    //         //     }
    //         // }


    //     }
    //     app.select(pagesWithMaster[0])

    //     // for(var i = doc.pages.length - 1; i > activePageIndex; i--) {
    //     //     doc.pages[i].remove()
    //     // }
    // } else {
    //     // No file was selected
    //     alert("No JSON file selected.");
    // }
    

    // function getArenaData(_data, id, force) {
    //     var data
    //     data = _data
    //     return data
    // }

    // function getArenaImage(data, id, force) {
    //     var data = data || getArenaData(id)
    //     var imageFile = File(folder + "/arena-assets/" + data.id + data.image.filename)
    //     if (!imageFile.exists) {
    //         var imageURL = data.image.original.url
    //         var request = { url: imageURL }
    //         var response = restix.fetchFile(request, imageFile)
    //     }
    //     return imageFile
    // }

    
    function placeImage(item, path) {
                item.place(path)
                item.fit(FitOptions.PROPORTIONALLY)
        return item
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
        return item
    }

    // function convertDateToString(inputDateTime) {
    //     var datePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2}):(\d{2})/;
    //     var found = datePattern.exec(inputDateTime)
    //     // Month names
    //     var monthNames = [
    //     "January", "February", "March", "April", "May", "June", 
    //     "July", "August", "September", "October", "November", "December"
    //     ];

    //     // Get the month, day, year, and time components
    //     var month = monthNames[parseInt(found[2], 10)];
    //     if (month == undefined) {
    //         month = monthNames[0]
    //     }
    //     var day = parseInt(found[3], 10)
    //     var year = found[1]
    //     var hours = parseInt(found[4], 10)
    //     var minutes = parseInt(found[5], 10)

    //     // Function to add the ordinal suffix to the day (e.g., 1st, 2nd, 3rd, etc.)
    //     function addOrdinalSuffix(day) {
    //         if (day >= 11 && day <= 13) {
    //             return day + "th";
    //         }
    //         switch (day % 10) {
    //             case 1: return day + "st";
    //             case 2: return day + "nd";
    //             case 3: return day + "rd";
    //             default: return day + "th";
    //         }
    //     }

    //     // Format the date and time string
    //     var formattedDateTime = day + ' ' + month +' ' +  year + " @ " + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
    //     return formattedDateTime
    // }
}

run()