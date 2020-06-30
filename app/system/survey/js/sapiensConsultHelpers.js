define(['moment'],
function(moment) {
    return {
        isGbPhone: function(str) {
            var regex = /^9[5|6]\d{7}$/gm;
            return (str.toString(10).match(regex)) ? true : false;
        }
    }
});