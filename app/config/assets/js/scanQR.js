/**
 * Responsible for rendering the list of perons
 */
'use strict';
/* global odkTables, util, odkCommon, odkData, odkSurvey */

function display() {
    odkCommon.registerListener(
    function() {
        console.log("call back called");
        var action = odkCommon.viewFirstQueuedAction();
        if ( action !== null ) {
            alert("ACTION: " + action)
            console.log(action);
            // process action -- be idempotent!
            // if processing fails, the action will still
            // be on the queue.
            odkCommon.removeFirstQueuedAction();
        }
    });

    console.log("Setting up display");

    $("#btnScan").on("click", function() {
        console.log("Before");
        var x = odkSurvey.scanBarcode(null);
        console.log(x);
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
    var sql = 'SELECT _id FROM QPS WHERE id_paciente = "' + strQR + '" COLLATE NOCASE';
    console.log("Querying database for: " + sql);
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
