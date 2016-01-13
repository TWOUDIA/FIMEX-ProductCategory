cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/ionic-plugin-keyboard/src/windows/KeyboardProxy.js",
        "id": "ionic-plugin-keyboard.KeyboardProxy",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/src/windows/DeviceProxy.js",
        "id": "org.apache.cordova.device.DeviceProxy",
        "merges": [
            ""
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "ionic-plugin-keyboard": "1.0.8",
    "org.apache.cordova.device": "0.3.0"
}
// BOTTOM OF METADATA
});