exports.getInterfacePage = (req, res) => {
    // Kiểm tra nếu không có người dùng trong session
    if (!req.session.user) {
        return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu không có người dùng
    }

    // Dữ liệu trang
    const user = req.session.user;  // Lấy thông tin người dùng từ session
    const data = { title: 'Interface Page', message: 'This is the Interface Page!' };
    
    // Dữ liệu nhiệt độ từ session
    const LM35Value = req.session.LM35Value;
    const DHT22Value = req.session.DHT22Value;

    // Kết hợp các dữ liệu lại vào một đối tượng duy nhất
    const pageData = {
        ...data,  // Mở rộng các thuộc tính từ 'data' vào 'pageData'
        user,     // Thêm thông tin người dùng vào đối tượng 'pageData'
        LM35Value,  // Thêm LM35Value vào đối tượng 'pageData'
        DHT22Value  // Thêm DHT22Value vào đối tượng 'pageData'
    };

    // Truyền đối tượng 'pageData' vào render
    res.render('interface', pageData);
};
