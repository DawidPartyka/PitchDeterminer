class Device {
    constructor(id, label, dir) {
        if (typeof id === 'object' && id !== null) {
            this.constructorForDeviceObject(id, label);
        }
        else {
            this.id = id;
            this.label = label;
            this.dir = dir;
        }
    }

    constructorForDeviceObject(dev, dir) {
        this.id = dev.deviceId;
        this.label = dev.label;
        this.dir = dir;
    }
}

class deviceHandler {
    currentInput = null;
    currentOutput = null;
    deviceChangeCallback = () => {};

    // callback -> deviceChangeCallback
    constructor(callback) {
        if (callback)
            this.deviceChangeCallback = callback;

        navigator.mediaDevices.ondevicechange = this.deviceChangeEvent();
    }

    async deviceChangeEvent() {
        console.log("Change of device occurred");

        this.deviceChangeCallback(await this.getDeviceList(), this.currentInput, this.currentOutput);
    }

    async getDeviceList() {
        const idArr = [];

        await navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                devices.forEach(function(dev) {
                    const [kind, type, direction] = dev.kind.match(/(\w+)(input|output)/i);

                    if (type === "audio") // Checks only audio input. No use for video
                        idArr.push(new Device(dev, direction));
                });
            });

        return idArr;
    }

    // Returns currently set i/o devices or first matching device from device list
    async getCurrentOrFirst() {
        const devices = await this.getDeviceList();

        return {
            in: this.currentInput ?? devices.find(x => x.dir = 'input'),
            out: this.currentOutput ?? devices.find(x => x.dir = 'output')
        }
    }

    async changeInput(e) {
        let inDevice;
        const devList = await this.getDeviceList();

        if (!e) // If no parameter passed device will be changed to first in the list
            inDevice = devList.find(x => x.dir === 'input');               // first input device
        else
            inDevice = devList.find(x => x.id === e && x.dir === 'input'); // first input device with given id

        this.currentInput = inDevice;

        this.deviceChangeCallback(await this.getDeviceList(), this.currentInput, this.currentOutput);
    }

    async changeOutput(e) {
        let outDevice = e;
        const devList = await this.getDeviceList();

        if (!e) // If no parameter passed device will be changed to first in the list
            outDevice = devList.find(x => x.dir === 'output');               // first output device
        else
            outDevice = devList.find(x => x.id === e && x.dir === 'output'); // first output device with given id

        this.currentOutput = outDevice;

        this.deviceChangeCallback(await this.getDeviceList(), this.currentInput, this.currentOutput);
    }

    // Returns bool. True - there's at least 1 input device available
    async checkForInput() {
        const devList = await this.getDeviceList();

        return devList.some(x => x.dir === "input");
    }

    // Return constrain for setting up the stream
    async navigatorInput() {
        const device = await this.getCurrentOrFirst();

        return device.in ? {
            exact: device.in.id
        } : undefined;
    }
}

module.exports = deviceHandler;