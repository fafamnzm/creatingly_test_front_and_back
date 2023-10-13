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

const posts = [];

for (let i = 0; i < 100; i++) {
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

function addPosts() {
	let start = currentPage * postsPerPage;
	let end = start + postsPerPage;

	for (let i = start; i < end; i++) {
		const post = posts[i];
		const WaitTime = post.height * 10;
		let div = document.createElement("div");
		div.className = "post";
		div.style.height = `${post.height}px`;
		div.style.backgroundColor = post.backgroundColor;
		div.style.color = post.color;
		div.textContent = `Post ${post.id}, Height: ${post.height}px, Max Wait time: ${WaitTime} ms`;
		postContainer.insertBefore(div, sentinel);

		// Add the 'invisible' class to the post
		div.classList.add("invisible");

		// Create an Intersection Observer to watch the post
		let observer = new IntersectionObserver(function (entries, observer) {
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

function autoScroll() {
	if (timerId) clearInterval(timerId); // clear the previous timer

	let posts = Array.from(postContainer.children);
	let currentPost = posts[0];
	let rect = currentPost.getBoundingClientRect();

	for (let post of posts) {
		rect = post.getBoundingClientRect();

		if (rect.bottom >= 10 && rect.bottom <= rect.height + 40) {
			currentPost = post;
			console.log(post.innerHTML, { top: rect.top, bottom: rect.bottom });
			break;
		}
	}

	if (currentPost) {
		const nextPost = postContainer.children[posts.indexOf(currentPost) + 1];

		const timeoutAmount = rect?.bottom * 5 || 2000;

		console.log({ rectBottom: rect?.bottom });
		console.log({ timeoutAmount });

		timerId = setTimeout(() => {
			console.log("in interval");
			if (nextPost) {
				rect = currentPost.getBoundingClientRect();
				if (timerId) clearInterval(timerId);
				window.scrollTo({
					top: window.scrollY + rect.bottom - 5,
					behavior: "smooth",
				});
				autoScroll();
			} else autoScroll(); //window.scrollTo(0, 0);
		}, timeoutAmount); // auto scroll based on the height of the post
	} else window.scrollTo(0, 0);
}

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

addPosts(); // Initial posts before

window.addEventListener("scroll", () =>
	timerId ? clearInterval(timerId) : ""
);
window.addEventListener("scrollend", autoScroll);
autoScroll();
