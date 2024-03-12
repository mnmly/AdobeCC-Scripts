#include ../libs/shim.jsx

var doc = app.activeDocument
for (var i = 0; i < doc.selectedPageItems.length; i++){
    var item = doc.selectedPageItems[i]
    if (item.pdfs.length == 1) {

        var pdf = item.pdfs[0]
        var previousPageNumber = app.pdfPlacePreferences.pageNumber
        app.pdfPlacePreferences.transparentBackground = true;
        var filePath = item.pdfs[0].itemLink.filePath
        var result = createDialog(pdf.itemLink.linkResourceURI.split('/').pop(), pdf.pdfAttributes.pageNumber)
        if (result) {
            app.pdfPlacePreferences.pageNumber = result.pageNumber;
            item.place(File(filePath))
        }
        app.pdfPlacePreferences.pageNumber = previousPageNumber
    }
    // doc.selectedPageItems[i].pdfs[0].itemLink
}


function createDialog(defaultURL, currentPageNumber) {

    var dialog = new Window("dialog"); 
        dialog.text = "Change PDF page number"; 
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
    statictext1.text = "PDF File"; 

    var url = group1.add("statictext", );
    url.preferredSize.width = 300;
    url.text = defaultURL;
    
    var group2 = dialog.add("group", undefined, {name: "group2"}); 
        group2.orientation = "row"; 
        group2.alignChildren = ["left","center"]; 
        group2.spacing = 10; 
        group2.margins = 0; 
    
    var url = group2.add("statictext", );
    url.preferredSize.width = 255;
    url.text = "Current Page Number";
       
    var pageNumberUI = group2.add("edittext", );
    pageNumberUI.preferredSize.width = 100;
    pageNumberUI.text = currentPageNumber;
    
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
            'pageNumber': parseInt(pageNumberUI.text, 10)
        }
    }
}