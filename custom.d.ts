declare module 'worker-loader?inline=true&name=worker.js!*' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
