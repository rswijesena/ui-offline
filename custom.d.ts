declare module 'worker-loader?name=worker.js!*' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
