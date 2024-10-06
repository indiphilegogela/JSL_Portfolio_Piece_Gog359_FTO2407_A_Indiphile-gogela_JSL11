// TASK: import helper functions from utils
import {getTasks, createNewTask, patchTask, putTask, deleteTask} from "./utils/taskFunctions.js"
// TASK: import initialData
import {initialData} from "./initialData.js"

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true');
    localStorage.setItem('light-theme', 'false');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.querySelector('#header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'), // querySeletorAll() used to iterate of status columns
  filterDiv: document.querySelector('#filterDiv'),
  hideSideBarBtn: document.querySelector('#hide-side-bar-btn'),
  showSideBarBtn: document.querySelector('#show-side-bar-btn'),
  themeSwitch: document.querySelector('#switch'),
  createNewTaskBtn: document.querySelector('#add-new-task-btn'),
  modalWindow: document.querySelector('#new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'), // no id, selscted using class
  sidebar: document.querySelector('#side-bar-div'),
  editTaskTitle: document.querySelector('#edit-task-title-input'),
  editTaskDesc: document.querySelector('#edit-task-desc-input'),
  editTaskStatus: document.querySelector('#edit-select-status')
}


let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
   toggleSidebar(JSON.parse(localStorage.getItem('showSideBar')));
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard ;  boards[0]; 
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
    boardElement.click()  { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    };
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard (boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board = boardName);

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

    filteredTasks.filter(task => task.status = status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.click() => { 
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
  document.querySelectorAll('.board-btn').foreach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.add('active') 
    }
    else {
      btn.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
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
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.modalWindow);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false, elements.modalWindow);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click') => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click') => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.modalWindow);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      "title": document.querySelector('#title-input').value,
      "description": document.querySelector('#desc-input').value,
      "status": document.querySelector('#select-status').value,
      "board": activeBoard
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
 elements.sidebar.style.display = show ? 'flex':'none'; // Toggle sidebar
 elements.showSideBarBtn.style.display = show ? 'none':'flex'; // Toggle show button visibility
 localStorage.setItem('showSideBar', JSON.stringify(show)); //Assign current status to local storage
}

function toggleTheme() {
  const lightTheme = JSON.parse(localStorage.getItem('light-theme')); // Get previous them
  localStorage.setItem('light-theme', JSON.stringify(!lightTheme)); // Set new them
  document.documentElement.classList.toggle("light-theme"); // Toggle light-them css class on root element
  const logo = !lightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg'; //Toggle light/dark mode logo
  document.querySelector('#logo').setAttribute('src', logo); //Display logo
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitle.value = task.title;
  elements.editTaskDesc.value = task.description;
  elements.editTaskStatus.value = task.status;

  // Get button elements from the task modal
  const saveBtn = document.querySelector('#save-task-changes-btn');
  const deleteBtn = document.querySelector('#delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
 saveBtn.addEventListener('click', () => saveTaskChanges(task.id));

  // Delete task using a helper function and close the task modal
    deleteBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const newTitle = elements.editTaskTitle.value;
  const newDesc = elements.editTaskDesc.value;
  const newStatus = elements.editTaskStatus.value;

  // Create an object with the updated task details
     const updatedTask = {
    "id": taskId,
    "title": newTitle,
    "description": newDesc,
    "status": newStatus,
    "board": activeBoard
  };

  // Update task using a hlper functoin
   putTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = JSON.parse(localStorage.getItem('light-theme'));
  if (isLightTheme) {
    document.documentElement.classList.toggle("light-theme");
    elements.themeSwitch.setAttribute('checked', isLightTheme); // Set them selector switch to correct position for light mode
    document.querySelector('#logo').setAttribute('src', './assets/logo-light.svg');
  }
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
