const express = require("express"); // yarn add express
const session = require("express-session"); // yarn add express-session
const helmet = require("helmet"); // yarn add helmet //? for security
const Joi = require("joi"); // yarn add Joi //? For validation

// Initialize express app
const app = express();

// Use helmet for security
app.use(helmet());

// Configure session
app.use(
	session({
		secret: "your secret key",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true },
	})
);

// Define validation schema
const schema = Joi.object({
	username: Joi.string().alphanum().min(3).max(30).required(),
	password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

// Define route with validation
app.post("/login", (req, res) => {
	const { error } = schema.validate(req.body);
	if (error) {
		res.status(400).send(error.details[0].message);
	} else {
		// proceed with your logic
	}
});

// Define session handling route
app.get("/", function (req, res, next) {
	if (req.session.views) {
		req.session.views++;
		res.setHeader("Content-Type", "text/html");
		res.write("<p>views: " + req.session.views + "</p>");
		res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
		res.end();
	} else {
		req.session.views = 1;
		res.end("welcome to the session demo. refresh!");
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

// Start the server
app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
