declare module 'worker-loader?publicPath=build/js/&name=worker.js!*' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
