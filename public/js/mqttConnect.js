document.getElementById('connectBtn').addEventListener('click', async function() {
    const ip = document.getElementById('ip').value;
    const port = document.getElementById('port').value;

    // Kiểm tra xem IP và Port có được nhập đầy đủ hay không
    if (!ip || !port) {
        document.getElementById('error').textContent = 'Please enter both IP address and Port.';
        return;
    }

    // Lưu trữ thông tin vào localStorage
    localStorage.setItem('ip', ip);
    localStorage.setItem('port', port);

    // Cập nhật trạng thái kết nối
    document.getElementById('status').textContent = 'CONNECTING...';
    document.getElementById('error').textContent = '';  // Reset lỗi trước khi gửi yêu cầu

    const brokerUrl = `mqtt://${ip}:${port}`;

    try {
        // Gửi yêu cầu kết nối đến server
        const response = await fetch('/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brokerUrl })
        });

        // Kiểm tra phản hồi từ server
        if (!response.ok) {
            throw new Error('Failed to connect to server');
        }

        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('status').textContent = 'CONNECTED';
            document.getElementById('status').classList.add('connected');  // Thêm class khi kết nối thành công
            localStorage.setItem('connectionStatus', 'connected');  // Lưu trạng thái kết nối thành công vào localStorage
            window.location.href = '/interface';  // Điều hướng đến trang interface
        } else {
            // Nếu không kết nối thành công, cập nhật trạng thái "DISCONNECTED" ngay lập tức
            document.getElementById('status').textContent = 'DISCONNECTED';
            document.getElementById('status').classList.add('disconnected');  // Loại bỏ class nếu không kết nối thành công
            document.getElementById('error').textContent = data.message || 'Connection failed';
            localStorage.setItem('connectionStatus', 'disconnected');  // Lưu trạng thái kết nối thất bại vào localStorage
        }
    } catch (error) {
        // Trong trường hợp có lỗi kết nối (ECONNREFUSED, v.v.), cập nhật trạng thái "DISCONNECTED"
        document.getElementById('status').textContent = 'DISCONNECTED';
        document.getElementById('status').classList.add('disconnected');  // Loại bỏ class khi có lỗi
        document.getElementById('error').textContent = 'Error: ' + error.message;
        localStorage.setItem('connectionStatus', 'disconnected');  // Lưu trạng thái kết nối thất bại vào localStorage
    }
});

// Lấy dữ liệu IP và Port từ localStorage khi trang được tải lại
window.onload = function() {
    const savedIp = localStorage.getItem('ip');
    const savedPort = localStorage.getItem('port');
    const connectionStatus = localStorage.getItem('connectionStatus');

    // Khôi phục IP và Port
    if (savedIp && savedPort) {
        document.getElementById('ip').value = savedIp;
        document.getElementById('port').value = savedPort;
    }

    // Khôi phục trạng thái kết nối
    if (connectionStatus === 'connected') {
        document.getElementById('status').textContent = 'CONNECTED';
        document.getElementById('status').classList.add('connected');  // Thêm class khi đã kết nối
    } else if (connectionStatus === 'disconnected') {
        document.getElementById('status').textContent = 'DISCONNECTED';
        document.getElementById('status').classList.remove('connected');  // Loại bỏ class khi chưa kết nối
    }
};
