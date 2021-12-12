/**
 * Chat-APP
 *
 * @author      Anees Muzzafer
 * @copyright   Anees Muzzafer
 *
 *
 */



const socket = io();

const $form = document.querySelector("#form-message");
const $input = $form.querySelector("input");
const $send = $form.querySelector("button");
const $sendLocation = document.querySelector("#send-location");


const $message = document.querySelector("#message");
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;


const autoScroll = () => {

    const lastMessageElement = $message.lastElementChild;
    const lastMessageStyle = window.getComputedStyle(lastMessageElement);
    const lastMessageMargin = parseInt(lastMessageStyle.marginBottom);

    const lastMessageHeight = lastMessageElement.offsetHeight + lastMessageMargin;

    const visibleHieght = $message.offsetHeight;

    const containerHeight = $message.scrollHeight;

    const scrollOffset = visibleHieght + $message.scrollTop;
    if (containerHeight - lastMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight;
    }

};


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});

socket.on("message", (message) => {

    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $message.insertAdjacentHTML("beforeend", html);

    autoScroll();
    console.log(message);
});

socket.on("locationMessage", (locationMessage) => {
    const html = Mustache.render($locationTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format("h:mm a")
    });
    $message.insertAdjacentHTML("beforeend", html);
    autoScroll();
    console.log(locationMessage);
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, { room, users });
    document.querySelector("#sidebar").innerHTML = html;
});




$form.addEventListener("submit", (e) => {
    e.preventDefault();

    $send.setAttribute("disabled", "disabled");


    const message = $input.value;
    $input.value = "";
    socket.emit("newMessage", message, (error) => {

        $send.removeAttribute("disabled");

        if (error) {
            return console.log(error);
        }
        console.log("Successfully delivered");
    });
})

$sendLocation.addEventListener("click", () => {

    $sendLocation.setAttribute("disabled", "disabled");

    if (!navigator.geolocation) {
        return alert("Your cannot");
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            $sendLocation.removeAttribute("disabled");
            console.log("location delivered");
        });
    });
});
