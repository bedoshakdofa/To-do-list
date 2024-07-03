const nodemailer = require("nodemailer");
const pug = require("pug");
const HtmlToText = require("html-to-text");
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.name = user.name;
        this.url = url;
    }
    Transporter() {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "abdullahshakdofa@gmail.com",
                pass: "dmxllbfzdthcsvbw",
            },
        });
    }
    async Send(subject, template) {
        const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
            name: this.name,
            subject,
            url: this.url,
        });
        const mailoption = {
            from: "abdullah shakdofa <abdullahshakdoufa@gmail.com>",
            to: this.to,
            subject,
            html,
            text: HtmlToText.htmlToText(html),
        };
        await this.Transporter().sendMail(mailoption);
    }
};
