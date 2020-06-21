define(['database','opendatakit','controller','backbone','moment','formulaFunctions','handlebars','promptTypes','jquery','underscore','d3','handlebarsHelpers','combodate'],
function(database,  opendatakit,  controller,  Backbone,  moment,  formulaFunctions,  Handlebars,  promptTypes,  $,       _,           d3,   _hh) {
// custom functions are placed under 'window' to be visible in calculates...
// note that you need to be careful about naming -- should probably go somewhere else?
window.is_finalized = function() {
    return ('COMPLETE' === database.getInstanceMetaDataValue('_savepoint_type'));
};

function elog(str) {
    //var prefix = "**EMIL**";
    //console.error(prefix, str);
    return;
}

var adate = promptTypes.input_type.extend({
    type: "adate",
    asDate: null,
    unknownDay: false,
    unknownMonth: false,
    unknownYear: false,
    templatePath: '../config/tables/inclusao/forms/inclusao/templates/adate.handlebars',
    
    events: {
        "change select": "modification",
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation",
        "focusout .input-container": "loseFocus",
        "focusin .input-container": "gainFocus"        
    },

    configureRenderContext: function(ctxt) {
        var that = this;
        var renderContext = that.renderContext;
        var startYear = 1900;
        var endYear = new Date().getYear()+1900;
        var dontknowLabel = "NS";
        renderContext.dayLabel = "dia";
        renderContext.monthLabel = "mes";
        renderContext.yearLabel = "ano"
        
        var days = Array.apply(null, {length: 32}).map(Number.call, Number).slice(1);
        days.unshift(dontknowLabel);
        days.unshift("");
        renderContext.days = days;
        
        var months = Array.apply(null, {length: 13}).map(Number.call, Number).slice(1);
        months.unshift(dontknowLabel);
        months.unshift("");
        renderContext.months = months;
        
        var years = [];
        for (var i = endYear; i >= startYear; i--) { years.push(i); }
        years.unshift(dontknowLabel);
        years.unshift("");
        renderContext.years = years;
        
        ctxt.success();
      
    },
    sameValue: function(ref, value) {
        return ref.valueOf() == value.valueOf();
    },
    validateValue: function() {
        elog("validateValue called upon");
        return true; //TODO
    },
    afterRender: function() {
        elog("After render called upon");
        var that = this;
        var thatValue = that.getValue();
        if (thatValue) {
            that.setSelects(thatValue);
        }
    },
    beforeMove: function() {
        var that = this;
        return null;
        // var input = !that.validateValue()
        // // check validity with html form data validation to block screen move
        // var isInvalid = (input.validity && !input.validity.valid) || that.setValueAndValidate(input.value);
        // if ( isInvalid ) {
        //     return { message: that.display.invalid_value_message };
        // } else {
        //     return null;
        // }
    },
    // generateSaveValue: function(jsonFormSerialization) {
    //     elog("generateSaveValue called upon");
    //     var that = this;
    //     if(jsonFormSerialization){
    //         return "habba";
    //     }
    //     return null;
    // },
    // parseSaveValue: function(savedValue) {
    //     elog("parseSaveValue called upon");
    // },
    updateDateProps: function(d,m,y) {
        
        that = this;
        if (d=="" || m=="" || y=="") {
            that.asDate = null;
            that.$('.adate-ageInYears').text("")
            that.unknownDay = true;
            that.unknownMonth = true;
            that.unknownYear = true;
        } else {
            that.asDate = new Date(y=="NS"?1900:y,m=="NS"?5:m-1,d=="NS"?15:d);            
            that.unknownDay = d == "NS";
            that.unknownMonth = m == "NS";
            that.unknownYear = y == "NS";
            
            var d = moment(that.asDate);
            if (!d.isValid() || that.unknownYear) {
                that.$('.adate-ageInYears').text()
                return;
            }
            
            // also update help text
            var yD = moment().diff(d,"years");
            d.add(yD,"years");
            var mD = moment().diff(d,"months");
            d.add(mD,"months");
            var dD = moment().diff(d,"days");
            var txt = "";
            
            if (yD!=0) {
                if (that.unknownMonth || that.unknownDay) {
                    txt += "~";
                }
                txt += yD + " anos, ";
            }  
            if (yD!=0 || mD!=0) {
                txt += mD + " meses e ";
            }
            if (yD!=0 || mD!=0 || dD!=0) {
                txt += dD + " dias.";
            }            
            that.$('.adate-ageInYears').text(txt)
        }
    },
    setSelects : function(strValue) {
        var that = this;
        // Updates the select boxes
        var d = "";
        var m = "";
        var y = "";
        if (strValue) {
            var dmy = strValue.split(",");
            elog(dmy);
            if (dmy.length === 3) {
                d = dmy[0].split(":")[1];
                m = dmy[1].split(":")[1];
                y = dmy[2].split(":")[1];
                that.updateDateProps(d,m,y);
            }
        } 
        elog("DAY:");
        elog(that.$('.adate-dayselect').length);
        elog($("#daypicker--isurvey0").find("option").length);
        that.$('.adate-dayselect').val(d);
        that.$('.adate-monthselect').val(m);
        that.$('.adate-yearselect').val(y);
    },
    modification: function(evt) {
        elog("MODIFICATION TRIGGERED!");
        var that = this;
        odkCommon.log('D',"prompts." + that.type + ".modification px: " + that.promptIdx);
        
        var newValue = null;
        var d = that.$('.adate-dayselect').val();
        var m = that.$('.adate-monthselect').val();
        var y = that.$('.adate-yearselect').val();
        newValue = "D:"+d+",M:"+m+",Y:"+y;
        that.updateDateProps(d,m,y);        
        elog(newValue);
        
        
        var ctxt = that.controller.newContext(evt, that.type + ".modification");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            odkCommon.log('D',"prompts." + that.type + ".modification: determine if reRendering ", "px: " + that.promptIdx);
            var ref = that.getValue();
            elog("Getvalue ref:");
            elog(ref);
            if ( ref === null || ref === undefined ) {
                rerender = ( newValue !== null && newValue !== undefined );
            } else if ( newValue === null || newValue === undefined ) {
                rerender = ( ref !== null && ref !== undefined );
            } else {
                rerender = !(that.sameValue(ref, newValue));
            }

            var renderContext = that.renderContext;
            if ( newValue === undefined || newValue === null ) {
                renderContext.value = '';
            } else {
                renderContext.value = newValue;
            }

            // track original value
            var originalValue = ref;
            elog("Setting value to: " + newValue);
            //that.setValueDeferredChange(newValue);
            that.setValueAndValidate(newValue);
            renderContext.invalid = !that.validateValue();
            if ( renderContext.invalid ) {
                newValue = originalValue;
                //that.setValueDeferredChange(originalValue);
                that.setValueAndValidate(originalValue);
            }

            // We are now done with this
            ctxt.success();
        },
        failure:function(m) {
            ctxt.log('D',"prompts." + that.type + ".modification -- prior event terminated with an error -- aborting!", "px: " + that.promptIdx);
            ctxt.failure(m);
        }}));
        
    },
    getValue: function() {
        if (!this.name) {
            console.error("prompts.adate.getValue: Cannot get value of prompt with no name. px: " + this.promptIdx);
            throw new Error("Cannot get value of prompt with no name.");
        }
        var value = database.getDataValue(this.name);
        elog("DBVALUE:");
        elog(value);
        if (value === null || value === undefined) {
          return null;
        }
        
        return value;
    }
});

return {
    "adate" : adate,
}

});
