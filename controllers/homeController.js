exports.getHomePage = (req, res) => {
    const user = req.session.user;  // Lấy thông tin người dùng từ session
    const data = { 
        title: 'Home Page', 
        message: 'Welcome to the Homepage!',
        user: user  // Thêm thông tin người dùng vào data
    };
    res.render('home', data);  // Truyền data vào view
};
