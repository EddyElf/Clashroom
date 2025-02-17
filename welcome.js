document.addEventListener("DOMContentLoaded", function() {
    const teamButtonsContainer = document.getElementById("team-buttons");

    for (let i = 3; i <= 9; i++) {
        let button = document.createElement("button");
        button.textContent = `${i} Teams`;
        button.addEventListener("click", function() {
            window.location.href = `index${i}.html`;
        });
        teamButtonsContainer.appendChild(button);
    }
});
