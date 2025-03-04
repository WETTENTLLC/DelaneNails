const ARPreview = {
    async initialize() {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.tracker = new HandTracker();
        await this.tracker.load();
    },

    async tryColor(colorCode) {
        const video = document.createElement('video');
        video.srcObject = this.mediaStream;
        await this.tracker.detect(video);
        return this.applyColorOverlay(video, colorCode);
    }
};
