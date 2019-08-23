/**
 * Responsible for rendering the list of perons
 */
'use strict';
/* global odkTables, util, odkCommon, odkData, odkSurvey */

function display() {
    console.log("Setting up display");

    $("#btnScan").on("click", function() {
        console.log("Before");
        var x = odkSurvey.scanBarcode(null);
        console.log("After");
    })

    $("#btnSearch").on("click", function() {
        doSearch($("#txtCodigo").val())
        return false;
    });
}

function openPersonForm(rowId) {
    var tableId = "QPS";
    var rowId = rowId;
    var formId = "QPS"; 
    odkTables.editRowWithSurvey(null, tableId, rowId, formId, null, null);
}

function showNotFound() {
    alert("Computer says no!");
}

function doSearch(strQR) {
    console.log("Querying database...");
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " persons");
        if (result.getCount() != 1) {
            return showNotFound();        
        } else {
            var id = result.getData(0,"_id");
            return openPersonForm(id);
        }
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get person from database: ' + errorMsg);
    }
    var sql = 'SELECT _id FROM QPS WHERE id_paciente = "' + strQR + '" COLLATE NOCASE';
    odkData.arbitraryQuery('QPS', sql, null, null, null, successFn, failureFn);
}
