let peer;
let dataConn;
let mediaConn;
const options = {
    // key: 'app',
    host: '/',
    port: 3000,
    path: 'peer-server',
    // pingInterval: 5000,
    // secure: false,
    // config: { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }], 'sdpSemantics': 'unified-plan' },
    // debug: 3
}

const init = () => {
    log('init...')
    const localId = document.getElementById("local-id-input").value;

    peer = new peerjs.Peer(localId, options);

    peer.on('open', function (id) {
        log('initialized');
        document.getElementById("local-id").textContent = id;
    });

    peer.on('connection', function (conn) {
        log('connection');
        dataConn = conn;

        dataConn.on('error', function (err) {
            log('connection err:' + err.type);
            console.log(err)
        });

        initConnectionObservers();
    });

    peer.on('call', function (conn) {
        log("incoming call")
        if (confirm('Incoming call, Show?')) {
            mediaConn = conn
            initCallObservers()
        } else {
            log("call rejected")
        }

    });

    peer.on('close', function () {
        log('close');
    });

    peer.on('disconnected', function () {
        log('disconnected');
    });

    peer.on('error', function (err) {
        log('err:' + err.type);
        console.log(err);
    });

    refresh();
}

const copy = () => {
    const peerId = document.getElementById("local-id").textContent;
    navigator.clipboard.writeText(peerId).then(() => alert("Copied"));
}

const disconnect = () => {
    log('disconnect...')
    peer.disconnect();
}

const reconnect = () => {
    log('reconnect...')
    peer.reconnect();
}

const destroy = () => {
    log('destroy...');
    peer.destroy();
}

const connect = () => {
    const destId = document.getElementById("dest-id-input").value;
    log('connect... ' + destId);

    const options = {
        label: "chat-connection",
        metadata: {meta: "test"},
        serialization: "binary",
        reliable: true,
    }

    dataConn = peer.connect(destId, options);

    dataConn.on('error', function (err) {
        log('connection err:' + err.type);
        console.log(err);
    });

    dataConn.on('open', function () {
        log('connection opened')
        initConnectionObservers();
    });
}

const close = () => {
    log('close...');
    dataConn.close();
}

const call = () => {
    const destId = document.getElementById("dest-id-input").value;
    log('call... ' + destId);
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        mediaConn = peer.call(destId, stream, {metadata: {meta: "test"}});
        document.getElementById("local-video").srcObject = stream;
        initCallObservers();
    });
}

const refresh = () => {
    fetch(options.host + options.path + '/peerjs/peers').then(res => {
        return res.json();
    }).then(json => {
        document.getElementById("client-list")
            .innerHTML = json.toString().replaceAll(',', '<br>');
    });
}

const send = () => {
    const element = document.getElementById("data")
    const data = element.value;
    element.value = "";
    chat('you: ' + data);
    dataConn.send(data);
}

const answer = () => {
    log('answer...')
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        document.getElementById("local-video").srcObject = stream;
        mediaConn.answer(stream);
    });
}

function initConnectionObservers() {
    document.getElementById("chat-container").style.display = 'block';
    document.getElementById("remote-chat-id").textContent = dataConn.peer;

    dataConn.on('data', function (data) {
        chat(dataConn.peer + ': ' + data);
    });

    dataConn.on('close', function () {
        log('connection close');
    });
}

function initCallObservers() {
    document.getElementById("call-container").style.display = 'block';
    document.getElementById("remote-call-id").textContent = mediaConn.peer;


    mediaConn.on('stream', stream => document.getElementById("remote-video").srcObject = stream);
    mediaConn.on('close', () => log("call closed"));
    mediaConn.on('error', err => {
        log("call err:" + err.type);
        console.log(err);
    });
}

const chat = (text) => {
    const logs = document.getElementById("chats");
    logs.innerHTML = text + '<br>' + logs.innerHTML;
}

const clearChats = () => {
    const logs = document.getElementById("chats");
    logs.innerHTML = "cleared";
}


const log = (text) => {
    const logs = document.getElementById("logs");
    logs.innerHTML = text + '<br>' + logs.innerHTML;
}

const clearLogs = () => {
    const logs = document.getElementById("logs");
    logs.innerHTML = "cleared";
}

// window.onload = init;