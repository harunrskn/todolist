// Load tasks from localStorage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const taskInput = document.getElementById('taskInput');
const taskDateInput = document.getElementById('taskDate');
const taskList = document.getElementById('taskList');
const progressText = document.getElementById('progress-text');
let calendar;  // Calendar instance

// Format date to a more readable format
function formatDate(date) {
    return new Date(date).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update progress bar text
function updateProgress() {
    const completedTasks = tasks.filter(task => task.completed).length;
    progressText.innerText = `${completedTasks}/${tasks.length}`;
}

// Check if the task is due, today, or approaching the deadline
function checkTaskDueDate(taskDate) {
    const today = new Date();
    const dueDate = new Date(taskDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) return "due";
    if (dayDiff === 0) return "today";
    if (dayDiff <= 3) return "warning";
    return "normal";
}

// Initialize the calendar
function initCalendar() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: tasks.map(task => ({
            title: task.text,
            start: task.dateDue,
            color: task.completed ? '#28a745' : checkTaskDueDate(task.dateDue) === 'due' ? '#dc3545' : '#ffc107'
        }))
    });
    calendar.render();
}

// Update calendar events
function updateCalendar() {
    calendar.removeAllEvents();
    tasks.forEach(task => {
        calendar.addEvent({
            title: task.text,
            start: task.dateDue,
            color: task.completed ? '#28a745' : checkTaskDueDate(task.dateDue) === 'due' ? '#dc3545' : '#ffc107'
        });
    });
}

// Add new task to the task list
function addTask() {
    const taskText = taskInput.value.trim();
    const taskDate = taskDateInput.value;

    if (!taskText || !taskDate) {
        alert('Tolong masukan tugas dan masukan tanggal.');
        return;
    }
    if (tasks.some(task => task.text === taskText && task.dateDue === taskDate)) {
        alert('Tugas ini sudah ada!');
        return;
    }
    if (new Date(taskDate) < new Date()) {
        alert("Tanggal jatuh tempo tidak boleh di masa lalu.");
        return;
    }

    tasks.push({
        text: taskText,
        completed: false,
        dateTime: new Date().toISOString(),
        dateDue: taskDate
    });

    taskInput.value = '';
    taskDateInput.value = '';
    taskDateInput.style.display = 'none';
    document.getElementById('showDateBtn').innerText = 'Pilih Tanggal';
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateCalendar();
}

// Render tasks to the UI
function renderTasks() {
    taskList.innerHTML = '';
    tasks.sort((a, b) => new Date(a.dateDue) - new Date(b.dateDue));

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const taskText = document.createElement('div');
        taskText.classList.add('task-text');
        taskText.innerText = task.text;

        const taskDetails = document.createElement('div');
        taskDetails.classList.add('task-details');

        taskDetails.innerHTML = `<span style="color: black;">DEADLINE: ${formatDate(task.dateDue)}</span>
                         <span style="color: black;">CREATED: ${formatDate(task.dateTime)}</span>`;


        const dueStatus = checkTaskDueDate(task.dateDue);
        if (dueStatus === "due") {
            li.style.backgroundColor = '#dc3545';
            taskText.innerHTML += " (Overdue!)";
        } else if (dueStatus === "today") {
            li.style.backgroundColor = '#ff5733';
            taskText.innerHTML += " (Due today!)";
        } else if (dueStatus === "warning") {
            li.style.backgroundColor = '#ffc107';
            taskText.innerHTML += " (DEADLINE MEPET BOSS!!)";
        }

        const taskActions = document.createElement('div');
        taskActions.classList.add('task-actions');

        const editBtn = document.createElement('button');
        editBtn.innerText = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = () => editTask(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = () => deleteTask(index);

        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        li.appendChild(taskText);
        li.appendChild(taskDetails);
        li.appendChild(taskActions);
        taskList.appendChild(li);
    });

    updateProgress();
    applyScrolling();
}

// Delete a task
// Delete a task with confirmation
function deleteTask(index) {
    const confirmation = confirm('tugas sudah selesai?apakah anda akan menghapusnya?');
    if (confirmation) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateCalendar();
    }
}

// Edit a task
function editTask(index) {
    const newTaskText = prompt('Edit your task:', tasks[index].text);
    const newTaskDate = prompt('Edit the due date (yyyy-mm-dd):', tasks[index].dateDue);

    if (newTaskText !== null && newTaskText.trim() !== '' && newTaskDate !== null && newTaskDate !== '') {
        tasks[index].text = newTaskText.trim();
        tasks[index].dateDue = newTaskDate;
        tasks[index].dateTime = new Date().toISOString();
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateCalendar();
    }
}

// Show or hide the date input
function showDateInput() {
    const dateInput = document.getElementById('taskDate');
    const dateBtn = document.getElementById('showDateBtn');

    if (dateInput.style.display === 'none') {
        dateInput.style.display = 'block';
        dateBtn.innerText = 'Tanggal Dipilih';
    } else {
        dateInput.style.display = 'none';
        dateBtn.innerText = 'Pilih Tanggal';
    }
}

// Apply scrolling if tasks exceed a certain amount
function applyScrolling() {
    if (tasks.length > 5) {
        taskList.style.maxHeight = "300px";
        taskList.style.overflowY = "scroll";
    } else {
        taskList.style.overflowY = "auto";
    }
}

// Update clock display
setInterval(updateClock, 1000);

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    document.getElementById('digitalClock').textContent = currentTime;
}

// Load tasks and initialize the calendar when the page is opened
window.onload = function () {
    renderTasks();
    initCalendar();
   
};

// Initialize Flatpickr for date selection
flatpickr("#viewTaskDate", {
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr) {
        viewTasksByDate(dateStr);
    }
});

// View tasks by date
// View tasks by date
// View tasks by date
function viewTasksByDate(selectedDate) {
    taskList.innerHTML = ''; // Clear the task list

    const filteredTasks = tasks.filter(task => task.dateDue === selectedDate);

    // Create the back button
    const backBtn = document.createElement('button');
    backBtn.innerText = 'Kembali ke Daftar Tugas';
    backBtn.onclick = renderTasks; // Go back to task list
    taskList.appendChild(backBtn); // Always append the back button

    if (filteredTasks.length === 0) {
        const noTasksMessage = document.createElement('li');
        noTasksMessage.innerText = `No tasks due on ${formatDate(selectedDate)}`;
        taskList.appendChild(noTasksMessage);
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            const taskText = document.createElement('div');
            taskText.classList.add('task-text');
            taskText.innerText = task.text;

            const taskDetails = document.createElement('div');
            taskDetails.classList.add('task-details');
            taskDetails.innerHTML = `<span>DEADLINE: ${formatDate(task.dateDue)}</span>
                                     <span>CREATED: ${formatDate(task.dateTime)}</span>`;
            li.appendChild(taskText);
            li.appendChild(taskDetails);
            taskList.appendChild(li);
        });
    }
}
