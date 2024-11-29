const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const collection = require('./config');
const http = require('http');
const mqtt = require('mqtt');
const socketIo = require('socket.io');
const session = require('express-session');  
const cookieParser = require('cookie-parser'); 
const app = express();
const server = http.createServer(app);
const User = require('./models/userModel');


const io = socketIo(server);
// convert data json
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // false vì không sử dụng HTTPS trong môi trường phát triển
        maxAge: 3600000 // 1 giờ
    }
}));

const port = 3300;
let presentValue = 0;
let mqttClient = null;

// Import routes
const homeRoutes = require('./routes/homeRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');
const loginRoutes = require('./routes/loginRoutes');
// const signupRoutes = require('./routes/signupRoutes');


// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/RealTimeChart', express.static(path.join(__dirname, 'RealTimeChart')));
app.use(express.json());
// Use routes
app.use('/', loginRoutes);
app.use('/home', checkLogin, homeRoutes);
app.use('/interface', checkLogin, interfaceRoutes);


app.use('/signup', async(req,res) => {
    res.render('signup', { title: 'Sign Up' });  // Pass title to the view
});
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate inputs
        if (!username || !password) {
            return res.status(400).send("Username and password are required");
        }

        // Check if username already exists
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save user to database
        const newUser = new User({ name: username, password: hashedPassword });
        await newUser.save();

        res.status(201).send("User registered successfully");
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).send("Internal server error");
    }
});
// app.js hoặc homeController.js (tuỳ vào cách tổ chức code của bạn)
app.get('/home', checkLogin, (req, res) => {
    const user = req.session.user;  // Lấy thông tin người dùng từ session
    res.render('home', { user });  // Truyền thông tin người dùng vào view EJS
});


app.get('/interface', (req, res) => {
    console.log("Session Info:", req.session);
    // Lấy giá trị từ session (nếu có)
    const user = req.session.user;
    const LM35Value = req.session.LM35Value;
    const DHT22Value = req.session.DHT22Value;

    // Render giao diện và truyền dữ liệu vào EJS
    res.render('interface', { LM35Value, DHT22Value, user });
});



function checkLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/'); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    }
    next(); // Nếu đã đăng nhập, tiếp tục với request
}



/// login user
app.post('/login', async (req, res) => {
    try {
        // Tìm người dùng dựa trên username
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.send("User name not found");
        }

        // Kiểm tra mật khẩu
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            // Nếu đúng mật khẩu, điều hướng đến route '/interface' 
            req.session.user = {name : check.name, userId: check._id};
            res.redirect('/home');
        } else {
            // Nếu sai mật khẩu
            res.send("Wrong password");
        }
    } catch (error) {
        // Xử lý lỗi chung
        console.error(error);
        res.send("An error occurred while processing your request.");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error in session destruction");
        }

        // Xóa cookie 'connect.sid' khi đăng xuất
        res.clearCookie('connect.sid', {
            path: '/',        // Đảm bảo path trùng với cookie
            httpOnly: true,   // Đảm bảo httpOnly nếu cookie có thuộc tính này
            secure: false     // Nếu bạn không dùng HTTPS, hãy đặt là false
        });
        // Chuyển hướng về trang đăng nhập
        res.redirect('/');  
    });
});

app.post('/connect', (req, res) => {
    const { brokerUrl } = req.body;

    // Kiểm tra nếu brokerUrl hợp lệ
    if (!brokerUrl) {
        return res.json({ status: 'fail', message: 'Broker URL is required' });
    }

    // Kiểm tra nếu MQTT client đã kết nối trước đó
    if (mqttClient) {
        mqttClient.end();  // Nếu đã có kết nối, đóng kết nối cũ trước khi mở kết nối mới
    }

    // Tạo kết nối MQTT mới
    mqttClient = mqtt.connect(brokerUrl);

    // Sự kiện khi kết nối thành công
    mqttClient.on('connect', () => {
        console.log(`Connected to MQTT broker at ${brokerUrl}`);
        req.session.brokerUrl = brokerUrl; // Lưu thông tin brokerUrl vào session

        // Subscribe các topic cần thiết
        mqttClient.subscribe('Temperature/DHT22-Data', (err) => {
            if (err) {
                console.error('Failed to subscribe to DHT22-Data:', err);
            }
        });
        mqttClient.subscribe('Temperature/LM35-Data', (err) => {
            if (err) {
                console.error('Failed to subscribe to LM35-Data:', err);
            }
        });

        // Gửi phản hồi thành công sau khi kết nối và subscribe thành công
        if (!res.headersSent) {
            res.json({ status: 'success', message: 'Connected and subscribed to topics.' });
        }
    });

    // Sự kiện lỗi khi không thể kết nối
    mqttClient.on('error', (err) => {
        console.error('Error connecting to MQTT broker:', err.message);

        // Gửi phản hồi lỗi chỉ nếu chưa gửi phản hồi nào
        if (!res.headersSent) {
            res.json({ status: 'fail', message: err.message });
        }
    });

    // Sự kiện khi kết nối bị đóng
    mqttClient.on('close', () => {
        console.log('Disconnected from MQTT broker');
    });

    // Fetch data từ các topic MQTT
    mqttClient.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());
        if (data.value !== undefined) {
            const presentValue = data.value;

            // Cập nhật giá trị vào session và phát dữ liệu qua WebSocket
            if (topic === 'Temperature/LM35-Data') {
                req.session.LM35Value = presentValue; // Cập nhật session liên tục
                io.emit('socketLM35', { presentValue }); // Phát dữ liệu qua WebSocket
            } else if (topic === 'Temperature/DHT22-Data') {
                req.session.DHT22Value = presentValue; // Cập nhật session liên tục
                io.emit('socketDHT22', { presentValue }); // Phát dữ liệu qua WebSocket
            }
        }
    });
});



// Start the server
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
