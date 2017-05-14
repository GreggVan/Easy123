/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//if user setting is not English, process and translate all pages
function processAndTranslate() {
    var list = window.languageData;
    var i;var hashMap=new Array;
    for(i=0;i<list.length;i++) {
        hashMap[list[i][0]]=list[i][1];
        $('#'+list[i][0]).html(list[i][1].split('|')[0]);
    }
    window.languageData=hashMap;
}
//if user setting is english, just store the data in hash map
function processLangData() {
    var list = window.languageData;
    var i;var hashMap=new Array;
    for(i=0;i<list.length;i++) {
        hashMap[list[i][0]]=list[i][1];
    }
    window.languageData=hashMap;
}