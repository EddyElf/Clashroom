document.addEventListener("DOMContentLoaded", function () {
    // Load sounds
    const sounds = {
        intro: new Audio("intro.mp3"), 
        trumpets: new Audio("trumpets.mp3"), 
        alert: new Audio("alert.mp3"), 
        explosion: new Audio("explosion.mp3"), 
        drumcrash: new Audio("drumcrash.mp3") 
    };

    const teamButtonsContainer = document.getElementById("team-buttons");
    const welcomeScreen = document.getElementById("welcome-screen");
    const gameInterface = document.getElementById("game-interface");
    const gameGrid = document.getElementById("game-grid");

    let isResetting = false; 
    let isInitializing = true; 
    let draggedItem = null;
    let sourceContainer = null;
    let chosenTeamCount = 3; 

    // EXACT COLOR MAPS EXTRACTED FROM YOUR HTML FILES
    const colorConfigs = {
        3: ["purple", "green", "yellow"],
        4: ["purple", "green", "rgb(18, 18, 162)", "rgb(255, 0, 0, 0.891)"],
        5: ["purple", "green", "yellow", "rgba(255, 166, 1, 0.925)", "rgb(91, 49, 7)"],
        6: ["purple", "green", "yellow", "rgba(255, 166, 1, 0.925)", "rgb(18, 18, 162)", "rgb(255, 0, 0, 0.891)"],
        7: ["purple", "green", "yellow", "rgba(255, 166, 1, 0.925)", "rgb(91, 49, 7)", "rgb(18, 18, 162)", "rgb(255, 0, 0, 0.891)"],
        8: ["purple", "green", "yellow", "rgba(255, 166, 1, 0.925)", "rgb(91, 49, 7)", "rgb(18, 18, 162)", "rgb(255, 0, 0, 0.891)", "grey"],
        9: ["purple", "green", "yellow", "rgba(255, 166, 1, 0.925)", "rgb(91, 49, 7)", "rgb(18, 18, 162)", "rgb(255, 0, 0, 0.891)", "grey", "rgb(255, 167, 218)"]
    };

    // GENERATE MENU BUTTONS
    for (let i = 3; i <= 9; i++) {
        let button = document.createElement("button");
        button.textContent = `${i} Teams`;
        button.addEventListener("click", function() {
            chosenTeamCount = i;
            startGame(i);
        });
        teamButtonsContainer.appendChild(button);
    }

    // TRANSITION FROM MENU TO GAMEBOARD
    function startGame(teamCount) {
        sounds.intro.play().catch(error => console.log("Audio block error:", error));
        document.getElementById("theme-stylesheet").href = `styles${teamCount}.css`;
        welcomeScreen.style.display = "none";
        gameInterface.style.display = "block";
        buildGameBoard(teamCount);
    }

    // DYNAMICALLY BUILD THE GRID ITEMS
    function buildGameBoard(teamCount) {
        gameGrid.innerHTML = ""; 
        isInitializing = true;

        const activeColors = colorConfigs[teamCount];

        for (let i = 0; i < teamCount; i++) {
            const item = document.createElement("div");
            item.classList.add("grid-item");
            item.style.backgroundColor = activeColors[i];

            const counter = document.createElement("span");
            counter.classList.add("counter");
            counter.textContent = "6";
            item.appendChild(counter);

            gameGrid.appendChild(item);
            setupGridDropListeners(item);

            for (let j = 0; j < 6; j++) {
                createCap(item);
            }
            updateCounters(item); 
        }

        setTimeout(() => {
            isInitializing = false; 
        }, 100);
    }

    // NEW HELPER: Binds both Mouse Drag AND Touchscreen listeners to any Cap
    function bindCapEvents(cap) {
        // --- MOUSE DRAG EVENTS (Desktop) ---
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

        // --- TOUCH SCREEN EVENTS (iPad / ViewSonic / Smart Board) ---
        cap.addEventListener("touchstart", function (event) {
            draggedItem = event.target;
            sourceContainer = event.target.parentElement;
            draggedItem.style.opacity = "0.5";
            
            // Switch item to fixed positioning so it can float over elements smoothly
            draggedItem.style.position = "fixed";
            draggedItem.style.zIndex = "1000";
            
            let touch = event.touches[0];
            // Center the cap emoji under the user's finger point (~15px offset assumes a standard size)
            draggedItem.style.left = (touch.clientX - 15) + "px";
            draggedItem.style.top = (touch.clientY - 15) + "px";
        });

        cap.addEventListener("touchmove", function (event) {
            // CRITICAL: Stops the touchscreen from scrolling or bouncing while moving a cap
            event.preventDefault(); 
            if (!draggedItem) return;
            
            let touch = event.touches[0];
            draggedItem.style.left = (touch.clientX - 15) + "px";
            draggedItem.style.top = (touch.clientY - 15) + "px";
        }, { passive: false });

        cap.addEventListener("touchend", function (event) {
            if (!draggedItem) return;

            // Clear temporary styling so the element can snap cleanly into standard HTML layout containers
            draggedItem.style.position = "";
            draggedItem.style.zIndex = "";
            draggedItem.style.left = "";
            draggedItem.style.top = "";

            let touch = event.changedTouches[0];

            // Temporarily ignore the cap's own collision layer so we can see what container lies directly underneath it
            draggedItem.style.pointerEvents = "none";
            let elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
            draggedItem.style.pointerEvents = "";

            // Trace upward from the collision point to find valid drop zones
            let dropTarget = null;
            if (elementAtPoint) {
                dropTarget = elementAtPoint.closest(".grid-item") || elementAtPoint.closest("#delete");
            }

            // Perform matching actions based on the touch targets detected
            if (dropTarget) {
                if (dropTarget.id === "delete") {
                    let parentContainer = draggedItem.parentElement;
                    draggedItem.remove();
                    sounds.explosion.play();
                    if (parentContainer && parentContainer.classList.contains("grid-item")) {
                        updateCounters(parentContainer);
                    }
                } else if (dropTarget.classList.contains("grid-item")) {
                    dropTarget.appendChild(draggedItem);
                    if (sourceContainer) {
                        updateCounters(sourceContainer);
                    }
                    updateCounters(dropTarget);
                }
            }

            // Reset drag tracking variables cleanly
            draggedItem.style.opacity = "1";
            draggedItem = null;
        });
    }

    function createCap(container) {
        const cap = document.createElement("span");
        cap.textContent = "🎓";
        cap.classList.add("draggable");
        cap.setAttribute("draggable", "true");

        // Pass cap through our input processor hook
        bindCapEvents(cap);

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
                sounds.drumcrash.play(); 
            }
        }
    }

    function setupGridDropListeners(item) {
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
    }

    // CONTROL PANEL ACTIONS
    document.getElementById("new-game").addEventListener("click", function () {
        const newCap = document.createElement("span");
        newCap.textContent = "🎓";
        newCap.classList.add("draggable");
        newCap.setAttribute("draggable", "true");

        // Fixed: Ensure new caps generated mid-game also get touch behaviors attached!
        bindCapEvents(newCap);

        document.getElementById("new-cap-container").appendChild(newCap);
        sounds.trumpets.play(); 
    });

    document.getElementById("delete").addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    document.getElementById("delete").addEventListener("drop", function (event) {
        event.preventDefault();
        if (draggedItem) {
            let parentContainer = draggedItem.parentElement;
            draggedItem.remove();
            sounds.explosion.play(); 
            if (parentContainer && parentContainer.classList.contains("grid-item")) {
                updateCounters(parentContainer);
            }
        }
    });

    document.getElementById("reset").addEventListener("click", function () {
        sounds.alert.play(); 

        setTimeout(() => {
            const confirmReset = confirm("Are you sure you want to reset the gameboard?");
            if (!confirmReset) return;

            isResetting = true; 
            sounds.intro.play(); 

            buildGameBoard(chosenTeamCount);
            document.getElementById("new-cap-container").innerHTML = "";

            setTimeout(() => {
                isResetting = false; 
            }, 100);
        }, 100);
    });
});
