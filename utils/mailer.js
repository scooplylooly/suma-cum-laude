const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tyt3106xd@gmail.com',
        pass: 'xsqv noqa kiig dsdd'  
    }
});

exports.sendOTP = async (toEmail, otp) => {
    await transporter.sendMail({
        from: 'your_email@gmail.com',
        to: toEmail,
        subject: 'Password Reset OTP',
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`
    });
};