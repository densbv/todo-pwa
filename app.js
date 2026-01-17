const app = document.getElementById("app");

// ===== State =====
let lists = JSON.parse(localStorage.getItem("todoLists")) || [];
let currentListId = null;
let view = "lists"; // "lists" | "list"

// ===== Init =====
init();

function init() {
  if (lists.length === 0) {
    createNewList();
  } else {
    view = "lists";
  }
  render();
}

// ===== Helpers =====
function save() {
  localStorage.setItem("todoLists", JSON.stringify(lists));
}

function createNewList() {
  const now = Date.now();
  const newList = {
    id: now,
    title: new Date().toLocaleDateString(),
    createdAt: now,
    items: []
  };
  lists.push(newList);
  currentListId = newList.id;
  view = "list";
  save();
}

// ===== Render =====
function render() {
  if (view === "lists") renderListsScreen();
  if (view === "list") renderListScreen();
}

function renderListsScreen() {
  app.innerHTML = `
    <h4 class="text-center mb-3">Мои списки</h4>

    <div class="list-group mb-3">
      ${lists.map(list => `
        <button class="list-group-item list-group-item-action"
          onclick="openList(${list.id})">
          <div class="fw-bold">${list.title}</div>
          <div class="text-muted small">
            ${new Date(list.createdAt).toLocaleDateString()}
          </div>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-primary w-100" onclick="createNewList()">
      ➕ Новый список
    </button>

    <div class="text-center text-muted mt-4 small">
      📱 Made by Denis · PWA
    </div>
  `;
}

function openList(id) {
  currentListId = id;
  view = "list";
  render();
}

function getCurrentList() {
  return lists.find(l => l.id === currentListId);
}

function renderListScreen() {
  const list = getCurrentList();
  if (!list) return;

  app.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <button class="btn btn-sm btn-outline-secondary" onclick="goToLists()">
        ← Списки
      </button>
      <button class="btn btn-sm btn-outline-primary" onclick="saveTitle()">
        💾
      </button>
    </div>

    <input
      id="listTitle"
      class="form-control mb-3"
      value="${list.title}"
      placeholder="Название списка"
    />

    <form id="todoForm" class="d-flex gap-2 mb-3">
      <input
        class="form-control"
        placeholder="Что нужно сделать?"
        name="text"
      />
      <button class="btn btn-primary">+</button>
    </form>

    <div id="items"></div>

    <div class="text-center text-muted mt-4 small">
      📱 Made by Denis · PWA
    </div>
  `;

  renderItems(list);
  bindForm(list);
}

function goToLists() {
  view = "lists";
  render();
}

function saveTitle() {
  const input = document.getElementById("listTitle");
  const list = getCurrentList();
  list.title = input.value.trim() || new Date().toLocaleDateString();
  save();
}

function renderItems(list) {
  const container = document.getElementById("items");

  if (list.items.length === 0) {
    container.innerHTML = `<p class="text-muted">Пока задач нет</p>`;
    return;
  }

  container.innerHTML = list.items.map(item => `
    <div class="todo-item d-flex align-items-center gap-2 p-2 border rounded mb-2">
      <input type="checkbox"
        ${item.done ? "checked" : ""}
        onchange="toggleItem(${item.id})"
      />

      <span class="flex-grow-1 ${item.done ? "text-decoration-line-through text-muted" : ""}">
        ${item.text}
      </span>

      <button class="btn btn-sm btn-outline-danger"
        onclick="deleteItem(${item.id})">
        🗑
      </button>
    </div>
  `).join("");
}

function bindForm(list) {
  const form = document.getElementById("todoForm");

  form.addEventListener("submit", e => {
    e.preventDefault();

    const text = form.text.value.trim();
    if (!text) return;

    list.items.push({
      id: Date.now(),
      text,
      done: false
    });

    save();
    render();
  });
}

function toggleItem(id) {
  const list = getCurrentList();
  const item = list.items.find(i => i.id === id);
  item.done = !item.done;
  save();
  render();
}

function deleteItem(id) {
  const list = getCurrentList();
  list.items = list.items.filter(i => i.id !== id);
  save();
  render();
}








