/**
 * Responsible for rendering the list of perons
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */


function display() {
    console.log("Hello");


    var region = odkCommon.getSessionVariable("selected_region");
    var sector = odkCommon.getSessionVariable("selected_sector");
    var tabanca = odkCommon.getSessionVariable("selected_tabanca");

    var theList = $("#theList");
    theList.text("Region = " + region + ", Sector = " + sector + ", Tabanca = " + tabanca);

}