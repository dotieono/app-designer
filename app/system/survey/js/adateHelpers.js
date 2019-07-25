define(['opendatakit','database','jquery','underscore','moment'],
function(opendatakit,  database,  $,       _, moment) {
return {
    getMoment: function(aDate) {
        if (!aDate || aDate.length<4 || this.yearUnknown(aDate)) {
            return false;
        }
        aDate = aDate.toUpperCase().replace('D:NS','D:15').replace('M:NS','M:5');
        var d = moment(aDate, '\\D:DD,\\M:MM,\\Y:YYYY');
        if (d.isValid()) {
            return d;
        }
        return false;
    },
    hasUncertainty: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('NS')>-1;   
    },
    yearUnknown: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('Y:NS')>-1;
    },
    monthUnkown: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('M:NS')>-1;   
    },
    dayUnkown: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('D:NS')>-1;
    },
    ageIn: function(aDate, strUnit) {
        var a = this.getMoment(aDate);
        if (!a) {
            return -9999;
        }
        return moment().diff(a,strUnit);
    },
    ageInYears: function(aDate) {
        return this.ageIn(aDate, 'years');
    },
    ageInMonths: function(aDate) {
        return this.ageIn(aDate, 'months');
    },
    ageInDays: function(aDate) {
        return this.ageIn(aDate, 'days');
    },
    diffInYears: function(aDateA, aDateB) {
        var a = this.getMoment(aDateA);
        var b = this.getMoment(aDateB);
        if (!a || !b) {
            return -9999;
        }
        return b.diff(a,'years');
    }
}
});