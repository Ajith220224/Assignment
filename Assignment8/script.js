// ===== LOAD TASKS =====
document.addEventListener("DOMContentLoaded", loadTasks);

// ===== ADD TASK =====
function addTask() {
    let input = document.getElementById("taskInput");
    let taskText = input.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    createTaskElement(taskText);
    saveTasks();

    input.value = "";
}

// ===== CREATE TASK ELEMENT =====
function createTaskElement(taskText) {
    let li = document.createElement("li");

    // Task text
    let span = document.createElement("span");
    span.textContent = taskText;

    // Toggle complete
    span.onclick = function () {
        span.classList.toggle("completed");
        saveTasks();
    };

    // Delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "delete-btn";

    deleteBtn.onclick = function () {
        li.remove();
        saveTasks();
    };

    li.appendChild(span);
    li.appendChild(deleteBtn);

    document.getElementById("taskList").appendChild(li);
}

// ===== SAVE TASKS =====
function saveTasks() {
    let taskList = document.getElementById("taskList").innerHTML;
    localStorage.setItem("tasks", taskList);
}

// ===== LOAD TASKS =====
function loadTasks() {
    let tasks = localStorage.getItem("tasks");
    if (tasks) {
        document.getElementById("taskList").innerHTML = tasks;

        // Reattach events after loading
        let items = document.querySelectorAll("#taskList li");

        items.forEach(function(li) {
            let span = li.querySelector("span");
            let deleteBtn = li.querySelector("button");

            span.onclick = function () {
                span.classList.toggle("completed");
                saveTasks();
            };

            deleteBtn.onclick = function () {
                li.remove();
                saveTasks();
            };
        });
    }
}