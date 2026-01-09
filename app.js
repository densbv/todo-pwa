// ===== Initialization =====
const form = document.getElementById("ToDoForm");
const listEl = document.getElementById("toDoList");
// Загружаем список из localStorage
let toDoList = JSON.parse(localStorage.getItem("toDoList")) || [];
let editId = null;
let sortMode = 0;
// 0 — по дате
// 1 — по выполненным
// 2 — по тексту
//Показываем при загрузке
renderList();

document.getElementById("sortBtn").addEventListener("click", () => {
    sortMode++;
    if (sortMode > 2) sortMode = 0;
    renderList();
});

// ===== Event: Add item =====
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = form.toDo.value.trim();
    if (!text) return;   // не добавляем пустое
    console.log(text)
    // Добавляем
    toDoList.push({
        id: Date.now(),
        check: 0,
        text
    });

    save();
    renderList();
    form.reset();        // очищаем поле
});

listEl.addEventListener("click", (e) => {

    const itemEl = e.target.closest(".todo-item");

    if (itemEl && !e.target.classList.contains("btn-delete")) {
        const id = Number(itemEl.dataset.id);

        toDoList = toDoList.map(item =>
            item.id === id
                ? { ...item, check: item.check ? 0 : 1 }
                : item
        );
    }
    if (e.target.classList.contains("btn-delete")) {
        const id = Number(e.target.dataset.id);

        toDoList = toDoList.filter(t => t.id !== id);
    }
    if (e.target.classList.contains("btn-edit")) {
        editId = Number(e.target.dataset.id);
        renderList();
        return;
    }

    save();
    renderList();
});

listEl.addEventListener("keydown", (e) => {

    if (e.target.classList.contains("btn-edit")) {
        if (editId !== null) return;
        editId = Number(e.target.dataset.id);
        renderList();
        return;
    }

    if (e.key === "Enter") {
        const id = Number(e.target.dataset.id);
        const newText = e.target.value.trim();
        if (!newText) return;

        toDoList = toDoList.map(item =>
            item.id === id ? { ...item, text: newText } : item
        );

        editId = null;
        save();
        renderList();
    }
});

// ===== Render function =====
function renderList() {
    if (toDoList.length === 0) {
        listEl.innerHTML = `<p class="text-muted">Список пуст...</p>`;
        return;
    }

    let sortedList = [...toDoList];

    if (sortMode === 0) {
        sortedList.sort((a, b) => b.id - a.id);
    }

    if (sortMode === 1) {
        sortedList.sort((a, b) => a.check - b.check);
    }

    if (sortMode === 2) {
        sortedList.sort((a, b) => a.text.localeCompare(b.text));
    }

    listEl.innerHTML = sortedList.map((item) => {
        let checked = '';
        let lineThrough = '';
        let htmlEdit = '';

        if (item.check !== 0) {
            checked = 'checked';
            lineThrough = 'text-decoration-line-through'
        } else {
            checked = '';
            lineThrough = '';
        }
        if (editId !== null && item.id === editId) {
            htmlEdit = `<input type="text" class="form-control edit-input" data-id="${item.id}" value="${item.text}"/>`
        } else {
            htmlEdit = `<span class="col ${lineThrough}">${item.text}</span>`
        }
        return `
        <div class="todo-item m-2 p-2 row border rounded d-flex align-items-center" data-id="${item.id}">
            ${htmlEdit}
            <span class="col-auto">
                <button data-id="${item.id}" class="btn btn-sm btn-delete btn-outline-danger">
                    Delete
                </button>
            </span>
            <span class="col-auto">
                <button data-id="${item.id}" class="btn btn-sm btn-edit btn-outline-success">
                    Edit
                </button>
            </span>
            </div>
        `
    }).join("");
    const input = listEl.querySelector(".edit-input");
    if (input) input.focus();

}

// ===== Save function =====
function save() {
    localStorage.setItem("toDoList", JSON.stringify(toDoList));
}