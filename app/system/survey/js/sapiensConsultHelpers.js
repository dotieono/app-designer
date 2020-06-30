define(['moment'],
function(moment) {
    isGbPhone: function(str) {
        var regex = /^9[5|6]\d{7}$/gm;
        return (str.match(regex)) ? true : false;
    }
});