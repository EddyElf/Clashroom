document.addEventListener("DOMContentLoaded", function () {
    // Load sounds
    const sounds = {
        intro: new Audio("intro.mp3"), 
        trumpets: new Audio("trumpets.mp3"), // provided by kebp888 on freesound.org
        alert: new Audio("alert.mp3"), // provided by breviceps on freesound.org
        explosion: new Audio("explosion.mp3"), // provided by cgeffex on freesound.org
        drumcrash: new Audio("drumcrash.mp3") // provided by collinb1000 and sorinious_genious on freesound.org
    };

    // Attempt to play intro.mp3
    sounds.intro.play().catch(error => {
        console.log("Autoplay blocked. Waiting for user interaction.");
    });

    let isResetting = false; // Flag to disable drumcrash sound during reset
    let isInitializing = true; // Flag to prevent drumcrash during setup

    document.querySelectorAll(".grid-item").forEach((item) => {
        for (let i = 0; i < 6; i++) {
            createCap(item);
        }
        updateCounters(item); // Ensure the initial counter is set
    });

    setTimeout(() => {
        isInitializing = false; // Allow normal sound behavior after setup
    }, 100);

    let draggedItem = null;
    let sourceContainer = null;

    function createCap(container) {
        const cap = document.createElement("span");
        cap.textContent = "🎓";
        cap.classList.add("draggable");
        cap.setAttribute("draggable", "true");

        cap.addEventListener("dragstart", function (event) {
            draggedItem = event.target;
            sourceContainer = event.target.parentElement;
            event.target.style.opacity = "0.5";
        });

        cap.addEventListener("dragend", function () {
            if (draggedItem) {
                draggedItem.style.opacity = "1";
                draggedItem = null;
            }
        });

        container.appendChild(cap);
        updateCounters(container);
    }

    function updateCounters(container) {
        const counter = container.querySelector(".counter");
        if (counter) {
            const prevCount = parseInt(counter.textContent) || 0;
            const caps = container.querySelectorAll(".draggable").length;
            counter.textContent = caps;

            if (!isResetting && !isInitializing && caps > prevCount) {
                sounds.drumcrash.play(); // Play drumcrash sound only after initialization
            }
        }
    }

    document.querySelectorAll(".grid-item").forEach((item) => {
        item.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        item.addEventListener("drop", function (event) {
            event.preventDefault();
            if (draggedItem) {
                item.appendChild(draggedItem);
                if (sourceContainer) {
                    updateCounters(sourceContainer);
                }
                updateCounters(item);
            }
        });
    });

    document.getElementById("new-game").addEventListener("click", function () {
        const newCap = document.createElement("span");
        newCap.textContent = "🎓";
        newCap.classList.add("draggable");
        newCap.setAttribute("draggable", "true");

        newCap.addEventListener("dragstart", function (event) {
            draggedItem = event.target;
            sourceContainer = event.target.parentElement;
            event.target.style.opacity = "0.5";
        });

        newCap.addEventListener("dragend", function () {
            if (draggedItem) {
                draggedItem.style.opacity = "1";
                draggedItem = null;
            }
        });

        document.getElementById("new-cap-container").appendChild(newCap);
        sounds.trumpets.play(); // Play trumpets sound when new is clicked
    });

    document.getElementById("delete").addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    document.getElementById("delete").addEventListener("drop", function (event) {
        event.preventDefault();
        if (draggedItem) {
            let parentContainer = draggedItem.parentElement;
            draggedItem.remove();
            sounds.explosion.play(); // Play explosion sound when deleted
            if (parentContainer && parentContainer.classList.contains("grid-item")) {
                updateCounters(parentContainer);
            }
        }
    });

    document.getElementById("reset").addEventListener("click", function () {
        sounds.alert.play(); // Play alert sound immediately

        setTimeout(() => {
            const confirmReset = confirm("Are you sure you want to reset the gameboard?");
            if (!confirmReset) return;

            isResetting = true; // Disable drumcrash sound during reset

            document.querySelectorAll(".grid-item").forEach((item) => {
                while (item.firstChild) {
                    item.removeChild(item.firstChild);
                }
                const counter = document.createElement("span");
                counter.classList.add("counter");
                counter.textContent = "6";
                item.appendChild(counter);
                sounds.explosion.play();
                for (let i = 0; i < 6; i++) {
                    createCap(item);
                }
            });

            document.getElementById("new-cap-container").innerHTML = "";

            setTimeout(() => {
                isResetting = false; // Re-enable drumcrash sound after reset
            }, 100);
        }, 100);
    });
});
