document.addEventListener("DOMContentLoaded", function () {
    const titleElement = document.getElementById("portalTitle");
    const text = titleElement.innerText;
    let index = 0;

    function animateTitle() {
        if (index < text.length) {
            let coloredText =
                '<span style="color: lightgreen;">' +
                text.slice(0, index + 1) +
                "</span>" +
                text.slice(index + 1);

            titleElement.innerHTML = coloredText;
            index++;
            setTimeout(animateTitle, 200);
        }
    }

    animateTitle();
});