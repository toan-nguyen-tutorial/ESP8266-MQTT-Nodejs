exports.getLoginPage= (req, res) => {
    const data = { title: 'Login Page', message: 'Welcome to the Homepage!' };
    res.render('login', data);
};
