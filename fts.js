// states: disabled, nudge, enabled, idle
const webring = document.getElementById("webring");
const button = webring.querySelector("button");

setTimeout(() => {
	webring.className = "nudge";
}, 1000);

button.addEventListener("pointerdown", () => {
	console.log("clicked")
	switch (webring.className) {
		case "disabled":
		case "nudge":
		case "idle":
			webring.className = "enabled";
			break;
		case "enabled":
			webring.className = "idle";
			break;
		default:
			break;
	}
});

