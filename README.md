# Winit App

#### App is hosted on Heroku: <https://winit-app.herokuapp.com>

##### Intstructions: 

###### 1. Clone the Repo: git clone https://github.com/justinhessdev/winit-app.git
###### 2. Install Dependencies: npm install
###### 3. Add .env file to root directory of project and get environment variables from me
###### 4. Run: nodemon
###### 5. Walla, the app is up and running on localhost:3000

### General Layout:
###### A user fills out this form, 

![Alt text](./public/img/winit-form.png?raw=true "Contact Form")

##### On Submission, a POST request is sent to '/contacts' on the server side:

###### index.ejs:

	<form name="sentMessage" action="/contact" method="post" id="contactForm"> 
		...
		...
	</form>

###### app.js --- handling POST request to '/contact':

	app.post('/contact', (req, res) => {
	/*
	  USING NODEMAILER MODULE
	*/
	  const newMessage = new Message(req.body);
	  newMessage.save((err, message) => {
	    if (err) { return console.log(err); }
	    // sign synchronously
	    const
	      genToken = jwt.sign({ messageId: message._id }, 'shhhhh'),
	      genURL = `${process.env.HEROKU_URL}/token/${genToken}`;
	    bitly.shorten(genURL)
	    .then((response) => {
	      const shortUrl = response.data.url;
	      const transporter = nodemailer.createTransport({
	        service: 'Gmail',
	        auth: {
	          user: process.env.NODEMAILER_USER,
	          pass: process.env.NODEMAILER_PASSWORD,
	        },
	      });
	
	      const text = `Congrats! You received the special email. Click this link to see your hidden message: ${shortUrl}`;
	      console.log('created');
	      transporter.sendMail({
	        from: process.env.NODEMAILER_USER,
	        to: req.body.contact,
	        subject: 'Winit Email',
	        html: text,
	      }, (error, info) => {
	        if (error) {
	          return res.json({ failure: error });
	        }
	        return res.json({
	          success: 'Your message was sent',
	          'next steps': 'I will respond to your email shortly',
	          info: info.response,
	        });
	      });
	    });
	  });
	});
	
#### I'll explain this in steps:
	
###### When the request is sent the data gets saved in the Message DB:
###### Message.js
    const
      mongoose = require('mongoose'),
      messageSchema = new mongoose.Schema({
        contact: { type: String }, // email or cell number
        message: { type: String }, // message
      }, { timestamps: true });


    const Message = mongoose.model('Message', messageSchema);

    module.exports = Message;
    
##### Next: I generate a Json Web Token and put the messageId as the payload: npm install jsonwebtoken --save

	// sign synchronously
	    const
	      genToken = jwt.sign({ messageId: message._id }, 'shhhhh'),
	      genURL = `${process.env.HEROKU_URL}/token/${genToken}`;    
	      
###### This generates https://winit-app.herokuapp.com/aaaaaa.bbbbbb.cccccc

##### Then I shorten the URL using Bityl: npm install bitly --save

    bitly.shorten(genURL)
    .then((response) => {
      const shortUrl = response.data.url;
      
##### Next I generate the email using nodemailer: npm install nodemailer --save

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });

      const text = `Congrats! You received the special email. Click this link to see your hidden message: ${shortUrl}`;
      console.log('created');
      transporter.sendMail({
        from: process.env.NODEMAILER_USER,
        to: req.body.contact,
        subject: 'Winit Email',
        html: text,
      }, (error, info) => {
        if (error) {
          return res.json({ failure: error });
        }
        return res.json({
          success: 'Your message was sent',
          'next steps': 'I will respond to your email shortly',
          info: info.response,
        });
      });
      
###### And the email gets sent to the Users email address -- and it contains a link to the content he filled out --- hidden using the Bitly shortURL

