const frequencyMath = require('./../customModules/audioModules/frequencyMath.js'),
      audioHandler = require('./../customModules/audioModules/audioHandler'),
      soundStorage = require('./helpers/soundStorage'),
      audioTest = require('./audioHandleTest');

window.onload = function() {
    let mic; //Placeholder for audioHandler instance

    const soundData = new soundStorage(); // soundData instance
    const freqMath = new frequencyMath(); // frequencyMath instance

    function dataProcess(time) { // callback passed to audioHandler receiving audio data
        let volume = mic.getVolume();
        test.updateVolume(volume);

        const ac = mic.correlate();

        if (ac > -1) { // Add data to object as long as the correlation and signal are good
            soundData.add(ac);
        } else {
            if (soundData.selfCheck()) // if soundData not empty
                test.updatePitch(freqMath.getSoundInfo(soundData.determine())); // send data to controller and udpate displayed note

            soundData.emptyData(); // Empty the whole data storage object
        }
    }

    // audioHandleTest - updates data in window
    let test = new audioTest();

    // callback passed to audioHandler initialization for device change purposes
    function devChange(arr, currentInput, currentOutput) {
        console.log("Updating device list");
        test.emptyDevices();

        arr.forEach((entry) => test.devChange(entry, mic));
    }

    async function startMic() {
        mic = new audioHandler({
            deviceChange: devChange
        }, dataProcess);
    }

    function enableMic() {
        mic ? mic.resume() : startMic().then(() => mic.setupStream());
        console.log("Mic enabled");
        mic.deviceHandler.updateDeviceList();
    }

    async function pauseMic() {
        await mic.pause();
        console.log("Mic disabled");

        test.clearData();
    }

    // callback passed to audioHandleTest to pause/resume audioHandlers AudioContext when mic button is clicked
    const micSwitch = async (state) => {
        if (state)
            enableMic();
        else
            pauseMic();
    }

    // adding callback after creating an instance handling switching mic on and off
    test.addCallback(micSwitch);
}
