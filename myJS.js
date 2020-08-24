//Trigger animations by scrolling
new WOW().init();


//Close Hamburger Menu on click
$(function () {
    var navMain = $(".navbar-collapse"); // avoid dependency on #id

    navMain.on("click", "a:not([data-toggle])", null, function () {
        navMain.collapse('hide');

    });
});


/* animate hamburger */
$(document).ready(function () {
    $('.navbar-collapse, #nav-icon1').click(function () {
        $('#nav-icon1').toggleClass('open');

    });
});


//Scroll-down stop-repeater animation
function doAnimation(id, animName, duration, delay) {
    var el = document.getElementById(id);
    var timer;

    function addClass() {
        el.classList.add(animName);
    }

    function removeClass() {
        el.classList.remove(animName);
    }

    setInterval(function () {
        clearTimeout(timer);
        addClass();
        timer = setTimeout(removeClass, duration);
    }, duration + delay);
}

doAnimation('scroll-down', 'rubberBand', 1000, 1500);








