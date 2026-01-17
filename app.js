const app = document.getElementById("app");

// ===== State =====
let lists = JSON.parse(localStorage.getItem("todoLists")) || [];
let currentListId = null;
let view = "lists"; // "lists" | "list"
let itemSortMode = "new"; // "new" | "old"

// ===== Init =====
migrateV1toV2();
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

function formatDateTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString() + " · " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ===== Render =====
function render() {
    if (view === "lists") renderListsScreen();
    if (view === "list") renderListScreen();
}

function renderListsScreen() {
    app.innerHTML = `
    <h4 class="text-center mb-3">Мои списки</h4>

    <button class="btn btn-primary w-100" onclick="createNewList(); render();">
      ➕ Новый список
    </button>

    <div class="list-group mb-3">
      ${lists.map(list => `
        <div class="list-group-item d-flex justify-content-between align-items-center" onclick="openList(${list.id})" style="cursor:pointer">
            <div>
                <div class="fw-bold">${list.title}</div>
                <div class="text-muted small">
                ${formatDateTime(list.createdAt)}
                </div>
            </div>

            <button class="btn btn-sm btn-outline-danger"
                onclick="deleteListFromOverview(${list.id}, event)">
                🗑
            </button>
        </div>
      `).join("")}
    </div>

    

    <div class="text-center text-muted mt-4 small">
      📱 Den · ToDo · PWA
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
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCurrentList()">
            🗑
        </button>
        <button class="btn btn-sm btn-outline-primary" onclick="saveTitle()">
            💾
        </button>
     </div>
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
    <button class="btn btn-sm btn-outline-secondary mb-3"
        onclick="toggleItemSort()">
        🔄 Сортировка: ${itemSortMode === "new" ? "сначала новые" : "сначала старые"}
    </button>
    <div id="items"></div>

    <div class="text-center text-muted mt-4 small">
      📱 Den · ToDo · PWA
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

    const sortedItems = [...list.items].sort((a, b) => {
        return itemSortMode === "new"
            ? b.id - a.id
            : a.id - b.id;
    });

    container.innerHTML = sortedItems.map(item => `
    <div class="todo-item d-flex align-items-center gap-2 p-2 border rounded mb-2" onclick="toggleItem(${item.id})">
      <input type="checkbox"
        ${item.done ? "checked" : ""}
        disabled
        />

      <span class="flex-grow-1 ${item.done ? "text-decoration-line-through text-muted" : ""}">
        ${item.text}
      </span>

      <button class="btn btn-sm btn-outline-danger"
        onclick="event.stopPropagation(); deleteItem(${item.id})">
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

function deleteCurrentList() {
    if (!confirm("Удалить список полностью?")) return;

    lists = lists.filter(l => l.id !== currentListId);
    currentListId = null;
    view = "lists";
    save();
    render();
}

function deleteListFromOverview(id, e) {
    e.stopPropagation(); // важно! чтобы не открывался список

    if (!confirm("Удалить список полностью?")) return;

    lists = lists.filter(l => l.id !== id);
    save();
    render();
}

function toggleItemSort() {
    itemSortMode = itemSortMode === "new" ? "old" : "new";
    render();
}

function migrateV1toV2() {
  const oldData = JSON.parse(localStorage.getItem("toDoList"));
  const newData = JSON.parse(localStorage.getItem("todoLists"));

  if (oldData && Array.isArray(oldData) && !newData) {
    const now = Date.now();

    const migratedList = {
      id: now,
      title: "Мой список",
      createdAt: now,
      items: oldData.map(item => ({
        id: item.id || Date.now(),
        text: item.text,
        done: item.check === 1
      }))
    };

    localStorage.setItem("todoLists", JSON.stringify([migratedList]));
    localStorage.removeItem("toDoList");

    console.log("✅ Данные v1 успешно мигрированы в v2");
  }
}











