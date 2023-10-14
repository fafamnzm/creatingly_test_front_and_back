function getRandomColor() {
	var letters = "0123456789ABCDEF";
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function getContrastColor(hexcolor) {
	hexcolor = hexcolor.replace("#", "");
	var r = parseInt(hexcolor.substr(0, 2), 16);
	var g = parseInt(hexcolor.substr(2, 2), 16);
	var b = parseInt(hexcolor.substr(4, 2), 16);
	var yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? "black" : "white";
}

//? Mock posts
const posts = [];
const totalPosts = 25;

//? Creating 100 mock posts
for (let i = 0; i < totalPosts; i++) {
	const randomColor = getRandomColor();
	const randomHeight = Math.floor(Math.random() * 400) + 100;
	const post = {
		id: i,
		height: randomHeight,
		backgroundColor: randomColor,
		color: getContrastColor(randomColor),
	};

	posts.push(post);
}

let postContainer = document.getElementById("post-container");
let currentPage = 0;
const postsPerPage = 10;

let timerId; // Declare the interal timeoutId outside the function

//? Gradually add posts to the viewport
//? based on the page and postsPerPage
function addPosts() {
	const start = currentPage * postsPerPage;
	//? we loaded all posts and we are keep scrolling the existing ones
	if (start > posts.length) return clearInterval(timerId);

	//? to cover index out of bounderies of posts in the following for loop
	const end =
		posts.length > start + postsPerPage ? start + postsPerPage : posts.length;

	for (let i = start; i < end; i++) {
		const post = posts[i];
		const WaitTime = post.height * 5;
		const div = document.createElement("div");
		div.className = "post";
		div.style.height = `${post.height}px`;
		div.style.backgroundColor = post.backgroundColor;
		div.style.color = post.color;
		div.textContent = `Post ${post.id}, Height: ${post.height}px, Max Wait time: ${WaitTime} ms`;
		postContainer.insertBefore(div, sentinel);

		// Add the 'invisible' class to the post
		div.classList.add("invisible");

		// Create an Intersection Observer to watch the post
		const observer = new IntersectionObserver(function (entries, observer) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					// Add the 'visible' class to the post when it's in view
					div.classList.remove("invisible");
					div.classList.add("visible");
				} else {
					// Add the 'invisible' class to the post when it's not in view
					div.classList.remove("visible");
					div.classList.add("invisible");
				}
			});
		});

		// Start observing the post
		observer.observe(div);
	}

	currentPage++;
}

//? Automatically Scroll down
function autoScroll() {
	if (timerId) clearInterval(timerId); // clear the previous timer

	let posts = Array.from(postContainer.children);
	let currentPost = posts[0];
	let rect = currentPost.getBoundingClientRect();

	for (let post of posts) {
		rect = post.getBoundingClientRect();

		if (rect.bottom >= 10 && rect.bottom <= rect.height + 40) {
			currentPost = post;
			break;
		}
	}

	if (currentPost) {
		const nextPost = postContainer.children[posts.indexOf(currentPost) + 1];

		//? If we reach to the end of scroll
		const EndOfScroll =
			window.innerHeight + window.scrollY >= document.body.offsetHeight ||
			false;

		const remainingPixels = window.innerHeight - rect.bottom;

		//? Wait 5ms for each px of the top post in viewport or 2 seconds by default
		//? In case of the end of scroll. it will wait 5ms for each remaining pixel or 5 secs in total
		const timeoutAmount = EndOfScroll
			? remainingPixels * 5 || 5000
			: rect?.bottom * 5 || 2000;

		timerId = setTimeout(() => {
			if (EndOfScroll) {
				window.scrollTo({
					top: 0,
					behavior: "smooth",
				});
			} else if (nextPost) {
				rect = currentPost.getBoundingClientRect();
				if (timerId) clearInterval(timerId);

				//? Scroll to 5px above the top post from the viewport
				window.scrollTo({
					top: window.scrollY + rect.bottom - 5,
					behavior: "smooth",
				});
				autoScroll();
			} else {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		}, timeoutAmount); // auto scroll based on the height of the post
	} else {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
}

//? A div that works as an intersection div
let sentinel = document.createElement("div");
sentinel.className = "sentinel";
postContainer.appendChild(sentinel);

let options = {
	root: null,
	rootMargin: "0px",
	threshold: 1.0,
};

let observer = new IntersectionObserver(function (entries, observer) {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			addPosts();
		}
	});
}, options);

observer.observe(sentinel);

//? Initial posts before
addPosts();

//? Stop Autoscroll if user starts scrolling manually
window.addEventListener("scroll", () =>
	timerId ? clearInterval(timerId) : ""
);

//? when scrolling ends whether by the user or autoScroll, the autoScroll is called again
window.addEventListener("scrollend", autoScroll);

//? Start Scrolling automatically even when the user has not scrolled yet
autoScroll();
