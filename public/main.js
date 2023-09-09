const socket = io()

let UserName = '';
let UserList = [];

let LoginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextImput');

loginPage.style.display = 'flex'
chatPage.style.display = 'none'

function renderUserList() {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';
    UserList.forEach(i => {
        ul.innerHTML += '<li>' + i + '</li>';
    })
}

function addMensager(type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
            break
        case 'msg':
            if (UserName == user) {
                ul.innerHTML += '<li class="m-txt"><span class="me">' + user + '</span> ' + msg + ' </li>'
                break
            } else {
                ul.innerHTML += '<li class="m-txt"><span>' + user + '</span> ' + msg + ' </li>'
                break
            }
    }

    if (ul) {
        ul.scrollTop = ul.scrollHeight;
    } else {
        console.error('Elemento ul não encontrado.');
    }
}

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = loginInput.value.trim()
        if (name != '') {
            UserName = name
            document.title = 'Chat (' + UserName + ')';
            socket.emit('join-request', UserName);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if (txt != '') {
            addMensager('msg', UserName, txt)
            socket.emit('send-msg', txt);
        }
    }
})

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none'
    chatPage.style.display = 'flex'
    textInput.focus()

    addMensager('status', null, 'conectado')

    UserList = list;
    renderUserList()
});

socket.on('list-update', (data) => {
    if (data.joined) {
        addMensager('status', null, data.joined + ' Entrou no chat.')
    }
    if (data.left) {
        addMensager('status', null, data.left + ' Saiu do chat.')
    }


    UserList = data.list
    renderUserList();
})

socket.on('showmsg', (data) => {
    addMensager('msg', data.username, data.message);
})

socket.on('disconnect', () => {
    addMensager('status', null, 'você foi desconectado!')
    UserList = []
    renderUserList();
})

socket.on('reconnect_error', () => {
    addMensager('status', null, 'tentando reconectar...')
})

socket.on('reconnect', () => {
    addMensager('status', null, 'Reconectado');

    if (UserName != '') {
        socket.emit('join-request', UserName)
    }
})