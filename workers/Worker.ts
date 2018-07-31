const ctx: Worker = self as any;

ctx.onmessage = (e) => {
    console.log('Message received from main thread');
    ctx.postMessage(e.data + ' back');
};
