var g = app.selection[0].graphics[0];
var num = prompt("Page number", 0)
var attr = /.pdf/.test( g.itemLink.filePath ) ? 'pdfPlacePreferences' : 'importedPageAttributes'
app[attr].pageNumber = parseInt(num, 10);
g.place(g.itemLink.filePath);