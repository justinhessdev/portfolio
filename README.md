# Winit App

#### App is hosted on Heroku: <https://winit-app.herokuapp.com>

##### Instructions: 

###### 1. Clone the Repo: git clone https://github.com/justinhessdev/winit-app.git
###### 2. Install Dependencies: npm install
###### 3. Add .env file to root directory of project and get environment variables from me
###### 4. Run: nodemon
###### 5. Walla, the app is up and running on localhost:3000

### Rundown:
###### A user fills out this form:

![Alt text](./public/img/winit-form.png?raw=true "Contact Form")

###### index.ejs

	  <!-- Contact Section -->
	  <section id="contact">
	      <div class="container">
	          <div class="row">
	              <div class="col-lg-12 text-center">
	                  <h2>Contact Me</h2>
	                  <hr class="star-primary">
	              </div>
	          </div>
	          <div class="row">
	              <div class="col-lg-8 col-lg-offset-2">
	                  <!-- To configure the contact form email address, go to mail/contact_me.php and update the email address in the PHP file on line 19. -->
	                  <!-- The form should work on most web servers, but if the form is not working you may need to configure your web server differently. -->
	                  <form name="sentMessage" action="/contact" method="post" id="contactForm">
	                      <div class="row control-group">
	                          <div class="form-group col-xs-12 floating-label-form-group controls">
	                              <label for="contact">Contact</label>
	                              <input name="contact" type="email" class="form-control" placeholder="Email" id="email" required>
	                              <p class="help-block text-danger"></p>
	                          </div>
	                      </div>
	                      <div class="row control-group">
	                          <div class="form-group col-xs-12 floating-label-form-group controls">
	                              <label for="message">Message</label>
	                              <textarea name="message" rows="5" class="form-control" placeholder="Message" id="message" required data-validation-required-message="Please enter a message."></textarea>
	                              <p class="help-block text-danger"></p>
	                          </div>
	                      </div>
	                      <br>
	                      <div id="success"></div>
	                      <div class="row">
	                          <div class="form-group col-xs-12">
	                              <button id="submit" type="submit" class="btn btn-success btn-lg">Send</button>
	                          </div>
	                      </div>
	                  </form>
	              </div>
	          </div>
	      </div>
	  </section>

##### On Submission, a POST request is sent to '/contacts' on the server side:

###### index.ejs:

	<form name="sentMessage" action="/contact" method="post" id="contactForm"> 
		...
		...
	</form>

###### app.js --- handling POST request to '/contact':

	app.post('/contact', (req, res) => {
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

	app.post('/contact', (req, res) => {
	  const newMessage = new Message(req.body);
	  newMessage.save((err, message) => {...}
      ....
      ....
    }
##### Next: I generate a Json Web Token and put the messageId as the payload: npm install jsonwebtoken --save

	// sign synchronously
	    const
	      genToken = jwt.sign({ messageId: message._id }, 'shhhhh'),
	      genURL = `${process.env.HEROKU_URL}/token/${genToken}`;    
	      
##### URL: `https://winit-app.herokuapp.com/token/aaaaaa.bbbbbb.cccccc`

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

![Alt text](./public/img/winit-gmail.png?raw=true "Email message")

##### Now: When the user clicks on the Bitly link it generates the longUrl: `https://winit-app.herokuapp.com/token/aaaaaa.bbbbbb.cccccc` which in turn hits my API:

	app.get('/token/:id', (req, res) => {
	    // verify a token symmetric - synchronous
	  const decoded = jwt.verify(req.params.id, 'shhhhh');
	  Message.findById(decoded.messageId, (err, message) => {
	    if (err) { return res.json({ error: '401' }); }
	    return res.redirect(`/messages/${message._id}`);
	  });
	});
	
##### Then the API decodes the id: `aaaaaa.bbbbbb.cccccc` and we grab the message id that was in the Payload. We validate the message id against our DB. If it's there we Redirect to `/messages/messageId` which hits our route:


###### routes/messages.js:

	messageRouter.route('/:id')
	  .get((req, res) => {
	    Message.findById(req.params.id, (err, message) => {
	      if (req.xhr) {
	        res.json(message);
	      } else {
	        res.render('message', { message });
	      }
	    });
	  })

##### And then message.ejs is rendered and we pass in the message object returned from the DB

###### views/message.ejs

	<div class="row control-group">
	    <div class="form-group col-xs-12 floating-label-form-group controls">
	      <h3>Congrats! You viewed the message</span></h3>
	    </div>
	</div>
	<br>
	<br>
	<div class="row control-group">
	    <div class="form-group col-xs-12 floating-label-form-group controls">
	      <h3>Contact Info: <span class="label label-default"><%- message.contact %></span></h3>
	    </div>
	</div>
	<div class="row control-group">
	    <div class="form-group col-xs-12 floating-label-form-group controls">
	      <h3>Message: <span class="label label-default"><%- message.message %></span></h3>
	    </div>
	</div>
	<br>
	<br>
	<div class="row control-group">
	    <div class="form-group col-xs-12 floating-label-form-group controls">
	      <h3>Time to Celebrate!</span></h3>
	    </div>
	</div>

##### In the end I am taken to a page back on the server which shows the message I provided for that link

##### And when you actually click on the link in the email:

![Alt text](./public/img/winit-open-link.png?raw=true "Contact Form")

###### And Notice how the URL was redirected from the API: `/token/:id` to `messages/:id`

###### Side Notes: 

###### 1. I use EJS-Layout for my views.

###### views/layout.ejs

	<!DOCTYPE html>
	<html lang="en">
		<head>
		    <meta charset="utf-8">
		    <meta http-equiv="X-UA-Compatible" content="IE=edge">
		    <meta name="viewport" content="width=device-width, initial-scale=1">
		    <meta name="description" content="">
		    <meta name="author" content="">
		
		    <title>Winit App</title>
		
		    <!-- Bootstrap Core CSS -->
		    <link href="/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		    <link ...>
		
		    <!-- Bootstrap Core JavaScript -->
		    <script src="/vendor/bootstrap/js/bootstrap.min.js"></script>
		    <script ...></script>
		</head>
		<body>
		
		  <div class="container">
		      <%- body %>
		  </div>
		
		</body>
	</html>

###### This is the main view and all other views are rendered in <%- body %> This is great because we only need to declare our scripts and links one time.

###### 2. I used a linter: eslint --init
   
###### .eslintrc.yml:
   
	extends: airbnb-base
	plugins:
		- import

###### 3. TODO: 
	1. Better field validation
	2. Phone number option
	3. Improve URL encoding
	4. Throw better errors
	5. Enhance frontend
