// TASK: import helper functions from utils
import { 
  getTasks, 
  createNewTask,
  patchTask,
  putTask,
  deleteTask
} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (localStorage.getItem('tasks') === null) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
logo: document.getElementById("logo"),
headerBoardName: document.getElementById("header-board-name"),
addNewTaskBtn: document.getElementById("add-new-task-btn"),
filterDiv: document.getElementById("filterDiv"),
sideBarContainer: document.getElementById("side-bar-div"),
hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
showSideBarBtn: document.getElementById("show-side-bar-btn"),
themeSwitch: document.getElementById("switch"),
createNewTaskBtn: document.getElementById("create-task-btn"),
modalWindow: document.getElementById("new-task-modal-window"),
columnDivs: document.querySelectorAll(".column-div"),
titleInput: document.getElementById("title-input"),
descriptionInput: document.getElementById("desc-input"),
selectStatus: document.getElementById("select-status"),
editTaskTitleInput: document.getElementById("edit-task-title-input"),
editTaskDescInput: document.getElementById("edit-task-desc-input"),
editSelectStatus: document.getElementById("edit-select-status"),
editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
confirmDeleteModal: document.getElementById("confirm-delete-modal"),
confirmDeleteBtn: document.getElementById("confirm-delete-btn"),
cancelDeleteBtn: document.getElementById("cancel-delete-btn")
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();

  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; //🪲fixed syntax error: semi colon to colon

    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener ("click", () => { //🪲 added an event listener (just said boardElement.click)
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); //🪲 syntax error: = to ===

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => { //🪲 syntax error: added event listener
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //🪲 added a class
    }
    else {
      btn.classList.remove('active'); //🪲 remove a class 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); //🪲 changed single quotes to backticks
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal)); //🪲 added event listener. It said cancelEditBtn.click

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false)); //🪲 added event listeners
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true)); //🪲 added event listeners

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; //🪲 changed => to :
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      id: Date.now(),
      title: elements.titleInput.value,
      description: elements.descriptionInput.value,
      status: elements.selectStatus.value,
      board: activeBoard
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  elements.sideBarContainer.style.display = show ? "block" : "none";
  elements.hideSideBarBtn.style.display = show ? "block" : "none";
  elements.showSideBarBtn.style.display = show ? "none" : "block";
  localStorage.setItem("showSideBar", show);
}

function toggleTheme() {
  document.body.classList.toggle("light-theme")
  const lightTheme = document.body.classList.contains("light-theme")
  localStorage.setItem("light-theme", lightTheme ? "enabled" : "disabled")

 elements.logo.src = lightTheme ? "./assets/logo-light.svg" : "./assets/logo-dark.svg";
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn")
  const cancelEditBtn = document.getElementById("cancel-edit-btn")
  const deleteTaskBtn = document.getElementById("delete-task-btn")

  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChangesBtn.onclick = () => saveTaskChanges(task.id)
  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = () => {
    openConfirmDeleteModal(() => {
      deleteTask(task.id)
      toggleModal(false, elements.editTaskModalWindow); //hide the edit task modal
      refreshTasksUI()
    });
  }

  cancelEditBtn.onclick = () => {
    toggleModal(false, elements.editTaskModalWindow);
  }

  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal

}

function saveTaskChanges(taskId) {
  // Get new user inputs
  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value
  }

  // Update task using a helper functoin
  patchTask(taskId, updatedTask)

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
}


function openConfirmDeleteModal(onConfirm) {
  elements.confirmDeleteModal.style.display = "block";

  elements.confirmDeleteBtn.onclick = () => {
    elements.confirmDeleteModal.style.display = "none";
    onConfirm();
  };

  elements.cancelDeleteBtn.onclick = () => {
    elements.confirmDeleteModal.style.display = "none";
  };

}
/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);

  elements.logo.src = isLightTheme ? "./assets/logo-light.svg" : "./assets/logo-dark.svg";

  initializeData();
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}