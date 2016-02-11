/**
 * The odkCommonIf injected interface will be used in conjunction with this class to 
 * create closures for callback functions to be invoked once a response is available
 * from the Java side.
 */
'use strict';
/* jshint unused: vars */
window.odkCommon = {
    _listener: null,
    /**
     * The Java side can asynchronously inform the JS side of state
     * changing actions. The two actions currently supported are:
     *  (1) results of a doAction() request.
     *
     *  (2) Java-initiated actions (as #-prefixed strings).
     *
     * Because these can occur at any time, the JS code should 
     * register a listener that will be invoked when an action is 
     * available. i.e., the Java code can direct a change in 
     * the JS code without it being initiated by the JS side.
     *
     * Actions are queued and resilient to failure.
     * they are fetched via 
     *      odkCommon.viewFirstQueuedAction().
     * And they are removed from the queue via
     *      odkCommon.removeFirstQueuedAction();
     *
     *
     * Users of odkCommon should register their own handler by 
     * calling:
     *
     * odkCommon.registerListener(
     *            function() { 
     *               var action = odkCommon.viewFirstQueuedAction();
     *               if ( action !== null ) {
     *                   // process action -- be idempotent!
     *                   // if processing fails, the action will still
     *                   // be on the queue.
     *                   odkCommon.removeFirstQueuedAction();
     *               }
     *            });
     */
    registerListener: function(listener) {
        var that = this;
        that._listener = listener;
        // whenever a listener is registered, we queue to fire a trigger.
        // This ensures that the listener will process any queued up actions.
        setTimeout(function() { that.signalQueuedActionAvailable(); }, 0);
    },
    /**
     * callback from Java side to notify of data available.
     */
    signalQueuedActionAvailable: function() {
        // forward for now...
        if ( this._listener !== null && this._listener !== undefined ) {
            // invoke the handler
            (this._listener)();
        }
    },
    /**
     * Return the platform info as a stringified json object. This is an object
     * containing the keys: container, version, appName, baseUri, logLevel.
     *
     * @return a stringified json object with the above keys
     */
    getPlatformInfo: function() {
      return odkCommonIf.getPlatformInfo();
    },

    /**
     * Take the path of a file relative to the app folder and return a url by
     * which it can be accessed.
     *
     * @param relativePath
     * @return an absolute URI to the file
     */
    getFileAsUrl: function(relativePath) {
      return odkCommonIf.getFileAsUrl(relativePath);
    },

   /**
    * Convert the rowpath value for a media attachment (e.g., uriFragment) field
    * into a url by which it can be accessed.
    *
    * @param tableId
    * @param rowId
    * @param rowPathUri
    * @return
    */
   getRowFileAsUrl: function(tableId, rowId, rowPathUri) {
      return odkCommonIf.getRowFileAsUrl(tableId, rowId, rowPathUri);
   },
   
    /**
     * Convert an ODK Timestamp string to a Javascript Date() 
     * object. The ODK Timestamp string is used to represent
     * dateTime and date values. It is an iso8601-style UTC date
     * extended to nanosecond precision:
     *     yyyy-mm-ddTHH:MM:SS.sssssssss
     * This value is assumed to be UTC.
     * And the value is assumed to be in the AD calendar (no BC dates please!).
     * 'date' types use T00:00:00.000000000 for the time portion of the timestamp.
     *
     * NOTE: this discards the nano fields...
     */
    toDateFromOdkTimeStamp:function(timestamp) {
        if ( timestamp === undefined || timestamp === null ) {
            return null;
        }
        timestamp = timestamp.substring(0,timestamp.length-6);
        // convert from a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
        // yyyy-mm-ddTHH:MM:SS.sssssssss
        // 01234567890123456789012345678
        // to a Date object...
        var yyyy,mm,dd,hh,min,sec,msec;
        // NOTE: we toss out the nanoseconds field
        yyyy = Number(timestamp.substr(0,4));
        mm = Number(timestamp.substr(5,2))-1;// months are 0-11
        dd = Number(timestamp.substr(8,2));
        hh = Number(timestamp.substr(11,2));
        min = Number(timestamp.substr(14,2));
        sec = Number(timestamp.substr(17,2));
        msec = Number(timestamp.substr(20,3));
        var value = new Date(Date.UTC(yyyy,mm,dd,hh,min,sec,msec));
        return value;
    },
    /**
     * Time intervals are padded with leading zeros and 
     * are of the form:
     * 
     * 
     *  HHHHHHHH:MM:SS.sssssssss
     *  HHHHHHHH:MM:SS.sssssssss-
     *
     * i.e., the negative sign, if present, is at the far right end. 
     * 
     * This conversion takes an incoming 'refJsDate' Date() object, 
     * retrieves the UTC year, month, date from that object,
     * then CONSTRUCTS A NEW DATE OBJECT beginning with that
     * UTC date and applying the +/- time interval
     * to that object and returns the adjusted Date() object.
     *
     * If the 'revJsDate' and 00:00:00.0000 for the time portion,
     * if a timeInterval is positive, this produces a Date()
     * with the time-of-day of the time interval.  I.e., 
     * this works correctly for the 'time' data type.
     *
     * The padded precision of the hour allows representation 
     * of the full 9999 year AD calendar range of time intervals.
     */
    toDateFromOdkTimeInterval:function(refJsDate, timeinterval) {
        if ( refJsDate === undefined || refJsDate === null ) {
            return null;
        }
        // convert from a nanosecond-extended iso8601-style UTC time HH:MM:SS.sssssssss
        // this does not preserve the nanosecond field...
        if ( timeInterval === undefined || timeInterval === null ) {
            return null;
        }
        var hh,min,sec,msec;
        var sign = timeInterval.substring(timeInterval.length-1,1);
        var idx = timeInterval.indexOf(':');
        hh = Number(timeInterval.substring(0,idx).trim());
        min = Number(timeInterval.substr(idx+1,2));
        sec = Number(timeInterval.substr(idx+4,2));
        msec = Number(timeInterval.substr(idx+7,3));
        
        var msecOffset;
        msecOffset = ((hh * 60 + min) * 60 + sec) * 60 + msec;
        if ( sign === '-' ) {
            msecOffset = - msecOffset;
        }
        
        var dateMilliseconds = refJsDate.valueOf();
        dateMilliseconds += days*8640000;
        var newJsDate = new Date(dateMilliseconds);
        return newJsDate;
    },
    /**
     * pad the indicated integer value with 
     * leading zeros so that the string 
     * representation ends up with at least 'places'
     * number of characters (more if the value has 
     * more significant digits than that).
     *
     * returns a string.
     * e.g., 
     * padWithLeadingZeros(45, 4) => '0045'
     * padWithLeadingZeros(-45, 4) => '-0045'
     */
    padWithLeadingZeros: function( value, places ) {
        if ( value === null || value === undefined ) {
            // bad form...
            return null;
        }
        if ( places === null || places === undefined ) {
            // but this is catastrophic...
            throw new Error("padWithLeadingZeros: places must be specified!");
        }
        
        var digits = [];
        var d, i, s;
        var sign = (value >= 0);
        value = Math.abs(value);
        while ( value !== 0 ) {
            d = (value % 10);
            digits.push(d);
            value = Math.floor(value/10);
        }
        while ( digits.length < places ) {
            digits.push(0);
        }
        digits.reverse();
        s = '';
        for ( i = 0 ; i < digits.length ; ++i ) {
            d = digits[i];
            s += d;
        }
        return (sign ? '' : '-') + s;
    },
    /**
     * pad the indicated integer value with 
     * leading spaces so that the string 
     * representation ends up with at least 'places'
     * number of characters (more if the value has 
     * more significant digits than that).
     *
     * Note the treatment of negative values!
     *
     * returns a string.
     * e.g., 
     * padWithLeadingSpaces(0, 4) => '   0'
     * padWithLeadingSpaces(45, 4) => '  45'
     * padWithLeadingSpaces(-45, 4) => '-  45'
     */
    padWithLeadingSpaces: function( value, places ) {
        var that = this;
        var zeroPad = that.padWithLeadingZeros(value, places);
        if ( zeroPad === undefined || zeroPad === null ) {
            return zeroPad;
        }
        
        var isNegative = (zeroPad.charAt(0) === '-');
        if ( isNegative ) {
            zeroPad = zeroPad.substr(1);
        }

        // If somebody specifies one as the # of places
        // then exit fast...
        if ( zeroPad.length === 1 ) {
            if ( isNegative ) {
                return '-' + zeroPad;
            } else {
                return zeroPad;
            }
        }
        
        var i;
        for ( i = 0 ; i < zeroPad.length - 1; ++i ) {
            if ( zeroPad.charAt(i) !== '0' ) {
                break;
            }
        }
        // i is now the position we want to replace 
        // all zeros to the left of with spaces.
        //
        // If the zeroPad is all zeros, then 
        // i will be zeroPad.length-1 upon failing
        // the loop predicate. So we will end up 
        // with '    0'.
        var firstPart = zeroPad.substring(0, i);
        var remainingPart = zeroPad.substr(i);
        
        // reconstruct...
        zeroPad = firstPart.replace(/0/g, ' ') + remainingPart;
        if ( isNegative ) {
            return '-' + zeroPad;
        } else {
            return zeroPad;
        }
    },
    /**
     * Converts a Javascript Date to an ODK Timestamp.
     * see toDateFromOdkTimeStamp() for the format of a 
     * timestamp. This zero-fills to extend the accuracy
     * of the Javascript Date object to nanosecond accuracy.
     *
     * The UTC values of the supplied Javascript dateTime 
     * object are used.
     *
     * This value is assumed to be UTC.
     * And the value is assumed to be in the AD calendar (no BC dates please!).
     * values destined for 'date' types should set the UTC time to all-zeros
     * for the time portion of the timestamp.  Or adjust this after-the-fact
     * in their own code.
     */
    toOdkTimeStampFromDate: function(jsDate) {
        var that = this;
        // convert to a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
        // yyyy-mm-ddTHH:MM:SS.sssssssss
        // 01234567890123456789012345678
        if ( jsDate === undefined || jsDate === null ) {
            return null;
        }
        var yyyy,mm,dd,hh,min,sec,msec;
        yyyy = jsDate.getUTCFullYear();
        mm = jsDate.getUTCMonth() + 1; // months are 0-11
        dd = jsDate.getUTCDate();
        hh = jsDate.getUTCHours();
        min = jsDate.getUTCMinutes();
        sec = jsDate.getUTCSeconds();
        msec = jsDate.getUTCMilliseconds();
        var value;
        value = that.padWithLeadingZeros(yyyy,4) + '-' +
                that.padWithLeadingZeros(mm,2) + '-' +
                that.padWithLeadingZeros(dd,2) + 'T' +
                that.padWithLeadingZeros(hh,2) + ':' +
                that.padWithLeadingZeros(min,2) + ':' +
                that.padWithLeadingZeros(sec,2) + '.' +
                that.padWithLeadingZeros(msec,3) + '000000';
        return value;
    },
    /**
     * Calculates the interval of time between two 
     * Javascript Date objects and returns an OdkTimeInterval.
     *
     * Time intervals are padded with leading zeros and 
     * are of the form:
     * 
     *  HHHHHHHH:MM:SS.sssssssss
     *  HHHHHHHH:MM:SS.sssssssss-
     *
     * i.e., the negative sign, if present, is at the far right end. 
     * 
     * This conversion computes (newJsDate - refJsDate).
     *
     * The padded precision of the hour allows representation 
     * of the full 9999 year AD calendar range of time intervals.
     */
    toOdkTimeIntervalFromDate:function(refJsDate, newJsDate) {
        if ( refJsDate === undefined || refJsDate === null ) {
            return null;
        }
        if ( newJsDate === undefined || newJsDate === null ) {
            return null;
        }
        var refMilliseconds = refJsDate.valueOf();
        var newMilliseconds = newJsDate.valueOf();
        
        var diffMilliseconds = newMilliseconds - refMilliseconds;
        var sign = '';
        if ( diffMilliseconds < 0 ) {
            sign = '-';
            diffMilliseconds = - diffMilliseconds;
        }
        
        var hh,min,sec,msec;
        
        var diffSeconds = Math.floor(diffMilliseconds / 1000);
        msec = diffMilliseconds - (diffSeconds * 1000);
        var diffMinutes = Math.floor(diffSeconds / 60);
        sec = diffSeconds - (diffMinutes * 60);
        hh = Math.floor(diffMinutes / 60);
        min = diffMinutes - (hh * 60);
        
        value = that.padWithLeadingSpaces(hh,8) + ':' +
                that.padWithLeadingZeros(min,2) + ':' +
                that.padWithLeadingZeros(sec,2) + '.' +
                that.padWithLeadingZeros(msec,3) + '000000' + sign;
        return value;
    },

   /**
    * Log messages using WebLogger.
    *
    *
    * @param level - levels are A, D, E, I, S, V, W
    * @param loggingString - actual message to log
    * @return
    */
   log: function(level, loggingString) {
      odkCommonIf.log(level, loggingString);
   },

   /**
    * Get active user
    *
    * @return
    */
   getActiveUser: function() {
      return odkCommonIf.getActiveUser();
   },

   /**
    * Get device properties
    *
    * @param propertyId
    * @return
    */
   getProperty: function(propertyId) {
      return odkCommonIf.getProperty(propertyId);
   },

   /**
    * Get the base url
    *
    * @return
    */
   getBaseUrl: function() {
      return odkCommonIf.getBaseUrl();
   },

   /**
    * Store a persistent key-value. This lasts for the duration of this screen and is
    * retained under screen rotations. Useful if browser cookies don't work.
    *
    * @param elementPath
    * @param jsonValue
    */
   setSessionVariable: function(elementPath, jsonValue) {
      odkCommonIf.setSessionVariable(elementPath, jsonValue);
   },

   /**
    * Retrieve a persistent key-value. This lasts for the duration of this screen and is
    * retained under screen rotations. Useful if browser cookies don't work.
    *
    * @param elementPath
    */
   getSessionVariable: function(elementPath) {
      return odkCommonIf.getSessionVariable(elementPath);
   },

   /**
    * Execute an action (intent call).
    *
    * @param dispatchString  Can be anything -- holds reconstructive state for JS
    *
    * @param action    The intent. e.g.,
    *                   org.opendatakit.survey.android.activities.MediaCaptureImageActivity
    *
    * @param jsonMap  JSON.stringify of Map of the following structure:
    *                   {
    *                         "uri" : intent.setData(value)
    *                         "data" : intent.setData(value)  (preferred over "uri")
    *                         "package" : intent.setPackage(value)
    *                         "type" : intent.setType(value)
    *                         "extras" : { key-value map describing extras bundle }
    *                   }
    *
    *                  Within the extras, if a value is of the form:
    *                     opendatakit-macro(name)
    *                  then substitute this with the result of getProperty(name)
    *
    *                  If the action begins with "org.opendatakit." then we also
    *                  add an "appName" property into the intent extras if it was
    *                  not specified.
    *
    * @return one of:
    *          "IGNORE"                -- there is already a pending action
    *          "JSONException: " + ex.toString()
    *          "OK"                    -- request issued
    *          "Application not found" -- could not find app to handle intent
    *
    * If the request has been issued, the javascript will be notified of the availability
    * of a result via the
    */
   doAction: function(dispatchString, action, jsonMap) {
      return odkCommonIf.doAction(dispatchString, action, jsonMap);
   },

   /**
    * @return the oldest queued action outcome.
    *   or Url change. Return null if there are none.
    *   The action remains queued until removeFirstQueuedAction
    *   is called.
    *
    *   The return value is either a JSON serialization of:
    *
    *   {  dispatchString: dispatchString,
    *      action: refAction,
    *      jsonValue: {
    *        status: resultCodeOfAction, // 0 === success
    *        result: JSON representation of Extras bundle from result intent
    *      }
    *   }
    *
    *   or, a JSON serialized string value beginning with #
    *
    *   "#urlhash"   // if the Java code wants the Javascript to take some action without a reload
    */
   viewFirstQueuedAction: function() {
      return odkCommonIf.viewFirstQueuedAction();
   },
   /**
    * Remove the first queued action.
    */
   removeFirstQueuedAction: function() {
      return odkCommonIf.removeFirstQueuedAction();
   }
};

if ( window.odkCommonIf === undefined || window.odkCommonIf === null ) {
    window.odkCommonIf = {
        _sessionVariables: {},
        _queuedActions: [],
        _logLevel: 'D',
        getPlatformInfo : function() {
            var that = this;
            // 9000 b/c that's what grunt is running on. Perhaps should configure
            // this
            var platformInfo = {
                container: 'Chrome',
                version: '31.0.1650.63',
                appName: 'testing',
                baseUri: that._computeBaseUri(),
                formsUri: "content://org.opendatakit.common.android.provider.forms/",
                activeUser: 'username:badger',
                logLevel: this._logLevel
            };
            // Because the phone returns a String, we too are going to return a
            // string here.
            var result = JSON.stringify(platformInfo);
            return result;
        },

        getFileAsUrl: function(relativePath) {
            var that = this;
            // strip off backslashes
            var cleanedStr = relativePath.replace(/\\/g, '');
            var baseUri = that._computeBaseUri();
            var result = baseUri + cleanedStr;
            return result;
        },
        getRowFileAsUrl: function(tableId, rowId, relativePath) {
            var that = this;
            if ( tableId === null || tableId === undefined ) {return null;}
            if ( rowId === null || rowId === undefined ) {return null;}
            if ( relativePath === null || relativePath === undefined ) {return null;}

            if ( relativePath.charAt(0) === '/' ) {
                relativePath = relativePath.substring(1);
            }
            var baseUri = that._computeBaseUri();

            var result = null;

            if ( !window.XRegExp ) {
                throw new Error('XRegExp has not been loaded prior to first call to getRowFileAsUrl()');
            }
            
            if ( that._forbiddenInstanceDirCharsPattern === null ||
                 that._forbiddenInstanceDirCharsPattern === undefined ) {
                // defer loading this until we try to use it
                that._forbiddenInstanceDirCharsPattern = window.XRegExp('(\\p{P}|\\p{Z})', 'A');
            }

            var iDirName = window.XRegExp.replace(rowId, 
                            that._forbiddenInstanceDirCharsPattern, '_', 'all');

            var prefix = 'tables/' + tableId + '/instances/' + iDirName + '/';
            if ( relativePath.length > prefix.length && relativePath.substring(0,prefix.length) === prefix ) {
                console.error('getRowFileAsUrl - detected filepath in rowpath data');
                result = baseUri + relativePath;
            } else {
                result = baseUri + prefix + relativePath;
            }
            
            return result;
        },
        log: function(severity, msg) {
            var logIt = false;
            var ll = this._logLevel;
            switch(severity) {
            default:
            case 'S':
            case 'F':
            case 'E':
                logIt = true;
                break;
            case 'W':
                if ( ll !== 'E' ) {
                    logIt = true;
                }
                break;
            case 'I':
                if ( ll !== 'E' && ll !== 'W' ) {
                    logIt = true;
                }
                break;
            case 'D':
                if ( ll !== 'E' && ll !== 'W' && ll !== 'I' ) {
                    logIt = true;
                }
                break;
            case 'T':
                if ( ll !== 'E' && ll !== 'W' && ll !== 'I' && ll !== 'D' ) {
                    logIt = true;
                }
                break;
            }

            if ( logIt ) {
                if ( severity === 'E' || severity === 'W' ) {
                    console.error(severity + '/' + msg);
                } else {
                    console.log(severity + '/' + msg);
                }
            }
            console.log();
        },

        getActiveUser: function() {
            this.log('D','odkCommon: DO: getProperty(activeUser)');
            return 'active-user-property(mailto:eaddr or username:uname)';
        },
        
        getProperty: function(propertyId) {
            this.log('D','odkCommon: DO: getProperty(' + propertyId + ')');
            return 'property-of(' + propertyId + ')';
        },

        getBaseUrl: function() {
            return '../system';
        },
        setSessionVariable: function(elementPath, value) {
            var that = this;
            var parts = elementPath.split('.');
            var i;
            var pterm = that._sessionVariables;
            var term = that._sessionVariables;
            for ( i = 0 ; i < parts.length ; ++i ) {
                if ( parts[i] in term ) {
                    pterm = term;
                    term = term[parts[i]];
                } else {
                    pterm = term;
                    term[parts[i]] = {};
                    term = term[parts[i]];
                }
            }
            pterm[parts[parts.length-1]] = value;
        },
        getSessionVariable: function(elementPath) {
            var that = this;
            var parts = elementPath.split('.');
            var i;
            var term = that._sessionVariables;
            for ( i = 0 ; i < parts.length ; ++i ) {
                if ( parts[i] in term ) {
                    term = term[parts[i]];
                } else {
                    return null;
                }
            }
            return term;
        },
        doAction: function(dispatchString, action, jsonObj ) {
            var that = this;
            var lat, lng, alt, acc;

            var value;
            that.log("D","odkCommon: DO: doAction(" + dispatchString + ", " + action + ", ...)");
            if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/venice.jpg", 
                                                       contentType: "image/jpg" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/bali.3gp", 
                                                       contentType: "video/3gp" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/raven.wav",
                                                       contentType: "audio/wav" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaChooseImageActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/venice.jpg",
                                                       contentType: "image/jpg" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/bali.3gp",
                                                       contentType: "video/3gp" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/raven.wav",
                                                       contentType: "audio/wav" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.sensors.PULSEOX' ) {
                var oxValue = prompt("Enter ox:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { pulse: 100,
                                                       ox: oxValue } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'change.uw.android.BREATHCOUNT' ) {
                var breathCount = prompt("Enter breath count:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: {  value: breathCount } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'com.google.zxing.client.android.SCAN' ) {
                var barcode = prompt("Enter barcode:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: {  SCAN_RESULT: barcode } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.GeoPointMapActivity' ) {
                lat = prompt("Enter latitude:");
                lng = prompt("Enter longitude:");
                alt = prompt("Enter altitude:");
                acc = prompt("Enter accuracy:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { latitude: lat,
                                                       longitude: lng,
                                                       altitude: alt,
                                                       accuracy: acc } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.GeoPointActivity' ) {
                lat = prompt("Enter latitude:");
                lng = prompt("Enter longitude:");
                alt = prompt("Enter altitude:");
                acc = prompt("Enter accuracy:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { latitude: lat,
                                                       longitude: lng,
                                                       altitude: alt,
                                                       accuracy: acc } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MainMenuActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1 } }));
                value = JSON.parse(jsonObj);
                if ( window.parent === window ) {
                    // naked
                    window.open(value.extras.url,'_blank', null, false);
                } else {
                    // inside tab1
                    window.parent.pushPageAndOpen(value.extras.url);
                }
                setTimeout(function() {
                    that.log("D","Opened new browser window for Survey content. Close to continue");
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.SplashScreenActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1 } }));
                value = JSON.parse(jsonObj);
                if ( window.parent === window ) {
                    // naked
                    window.open(value.extras.url,'_blank', null, false);
                } else {
                    // inside tab1
                    window.parent.pushPageAndOpen(value.extras.url);
                }
                setTimeout(function() {
                    that.log("D","Opened new browser window for link to another ODK Survey page. Close to continue");
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'android.content.Intent.ACTION_VIEW' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1 } }));
                value = JSON.parse(jsonObj);
                if ( window.parent === window ) {
                    // naked
                    window.open(value.extras.url,'_blank', null, false);
                } else {
                    // inside tab1
                    window.parent.pushPageAndOpen(value.extras.url);
                }
                setTimeout(function() {
                    that.log("D","Opened new browser window for 3rd party content. Close to continue");
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
        },
        /**
         * Return the first queued action without removing it.
         */
        viewFirstQueuedAction: function() {
            if ( this._queuedActions.length !== 0 ) {
                var result = this._queuedActions[0];
                return result;
            }
            return null;
        },
        /**
         * Remove the first queued action.
         */
        removeFirstQueuedAction: function() {
            if ( this._queuedActions.length !== 0 ) {
                this._queuedActions.shift();
            }
        },
        /**
         * Return the location of the currently executing file.
         */
        _getCurrentFileLocation: function () {
          // We need to get the location of the currently
          // executing file. This is not readily exposed, and it is not as simple as
          // finding the current script tag, since callers might be loading the file
          // using RequireJS or some other loading library. We're going to instead
          // pull the file location out of a stack trace.
          var error = new Error();
          var stack = error.stack;
          
          // We expect the stack to look something like:
          // TypeError: undefined is not a function
          //     at Object.window.odkCommon.getPlatformInfo
          //     (http://homes.cs.washington.edu/~sudars/odk/survey-js-adaptr/app/system/js/odkCommon.js:45:29)
          //     blah blah blah
          // So now we'll extract the file location. We'll do this by assuming that
          // the location occurs in the first parentheses.
          var openParen = stack.indexOf('(');
          var closedParen = stack.indexOf(')');

          var fileLocation = stack.substring(openParen + 1, closedParen);

          return fileLocation;
        },
        /**
         * Compute and return the base URI for this machine. This will allow the code
         * to function independently of the host name.
         * 
         * Returns a string representing the base uri in the format:
         * http://DOMAIN/DIRS/. Note the trailing slash.
         */
        _computeBaseUri: function () {
          // To compute this we are going to rely on the location of the containing
          // file relative to the location we are serving as are root. If this is
          // changed, this file must be updated appropriately.
          // Since we are expecting this file to live in app/system/tables/js/, we
          // can look for the first occurrence and take everything before it.

          var expectedFileLocation = 'system/js/odkCommon.js';

          var fileLocation = this._getCurrentFileLocation();

          var indexToFile = fileLocation.indexOf(expectedFileLocation);

          var result = fileLocation.substring(0, indexToFile);

          return result;

        }
    };
}

