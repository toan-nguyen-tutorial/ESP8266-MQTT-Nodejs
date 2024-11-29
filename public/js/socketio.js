const socket = io();

       // Lắng nghe dữ liệu từ Socket.io
socket.on('socketLM35', (data) => {
    const { presentValue } = data;
    document.getElementById('value1').setAttribute('data-value', presentValue);
});

socket.on('socketDHT22', (data) => {
    const { presentValue } = data;
    document.getElementById('value2').setAttribute('data-value', presentValue);
});
