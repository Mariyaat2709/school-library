// ============================================
// 1. РАБОТА С ХРАНИЛИЩЕМ
// ============================================

function loadFromStorage(key, initialData) {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadBooks() {
    const initialBooks = [
        { id: 1, title: 'Война и мир', author: 'Л. Толстой', year: 1869, status: 'В наличии' },
        { id: 2, title: 'Преступление и наказание', author: 'Ф. Достоевский', year: 1866, status: 'В наличии' },
        { id: 3, title: 'Мастер и Маргарита', author: 'М. Булгаков', year: 1967, status: 'В наличии' },
        { id: 4, title: 'Евгений Онегин', author: 'А. Пушкин', year: 1833, status: 'В наличии' }
    ];
    return loadFromStorage('books', initialBooks);
}

function loadReaders() {
    const initialReaders = [
        { name: 'Иванов Петр Сергеевич', class: '9А' },
        { name: 'Смирнова Анна Дмитриевна', class: '10Б' },
        { name: 'Кузнецов Дмитрий Александрович', class: '8В' },
        { name: 'Петрова Мария Ивановна', class: '11А' },
        { name: 'Соколов Алексей Петрович', class: '7Б' },
        { name: 'Новикова Елена Сергеевна', class: '9Б' },
        { name: 'Морозов Иван Викторович', class: '10А' },
        { name: 'Васильева Ольга Николаевна', class: '8А' }
    ];
    return loadFromStorage('readers', initialReaders);
}

function saveBooks(books) { saveToStorage('books', books); }
function saveReaders(readers) { saveToStorage('readers', readers); }

// ============================================
// 2. АВТОРИЗАЦИЯ
// ============================================

function isAdminLoggedIn() {
    return localStorage.getItem('isAdmin') === 'true';
}

function updateAdminUI() {
    const loggedIn = isAdminLoggedIn();
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = loggedIn ? 'inline-block' : 'none';
    });

    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        if (loggedIn) {
            loginLink.textContent = 'Выйти';
            loginLink.href = '#';
            loginLink.onclick = (e) => { e.preventDefault(); logout(); };
        } else {
            loginLink.textContent = 'Вход';
            loginLink.href = 'login.html';
            loginLink.onclick = null;
        }
    }
}

function logout() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'index.html';
}

// ============================================
// 3. СТАТИСТИКА
// ============================================

function updateStats() {
    const books = loadBooks();
    const readers = loadReaders();
    const issuedCount = books.filter(b => b.status === 'Выдана').length;
    document.getElementById('totalBooks') && (document.getElementById('totalBooks').textContent = books.length);
    document.getElementById('issuedBooks') && (document.getElementById('issuedBooks').textContent = issuedCount);
    document.getElementById('totalReaders') && (document.getElementById('totalReaders').textContent = readers.length);
}

// ============================================
// 4. КНИГИ
// ============================================

function renderBooksTable(filteredBooks = null) {
    const tableBody = document.getElementById('booksTableBody');
    if (!tableBody) return;

    const books = filteredBooks || loadBooks();
    const isAdmin = isAdminLoggedIn();

    tableBody.innerHTML = books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.year}</td>
            <td><span class="${book.status === 'В наличии' ? 'status-available' : 'status-issued'}">${book.status}</span></td>
            <td>${isAdmin ? `
                <button class="action-btn" onclick="editBook(${book.id})">✎</button>
                <button class="action-btn" onclick="deleteBook(${book.id})" style="background-color: #fee2e2; color: #b91c1c; margin-left: 5px;">🗑️</button>
            ` : ''}</td>
        </tr>
    `).join('');

    document.getElementById('bookCount') && (document.getElementById('bookCount').textContent = books.length);
}

function editBook(id) {
    const books = loadBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;

    const newTitle = prompt('Новое название:', book.title);
    if (newTitle?.trim()) book.title = newTitle.trim();

    const newAuthor = prompt('Новый автор:', book.author);
    if (newAuthor?.trim()) book.author = newAuthor.trim();

    const newYear = prompt('Новый год:', book.year);
    if (newYear && !isNaN(parseInt(newYear))) book.year = parseInt(newYear);

    saveBooks(books);
    renderBooksTable();
    updateStats();
}

function deleteBook(id) {
    if (confirm('Вы уверены, что хотите удалить книгу?')) {
        const books = loadBooks();
        const filteredBooks = books.filter(book => book.id !== id);
        saveBooks(filteredBooks);
        renderBooksTable();
        updateStats();
        alert('Книга удалена');
    }
}

function setupAddBook() {
    const btn = document.getElementById('addBookBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const title = prompt('Название книги:');
        if (!title?.trim()) return;
        const author = prompt('Автор:');
        if (!author?.trim()) return;
        const year = prompt('Год издания:');
        if (!year || isNaN(parseInt(year))) return;

        const books = loadBooks();
        const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ id: newId, title: title.trim(), author: author.trim(), year: parseInt(year), status: 'В наличии' });
        saveBooks(books);
        renderBooksTable();
        updateStats();
    });
}

// ============================================
// 5. ЧИТАТЕЛИ
// ============================================

function renderReadersTable(filteredReaders = null) {
    const tableBody = document.getElementById('readersTableBody');
    if (!tableBody) return;

    const readers = filteredReaders || loadReaders();
    tableBody.innerHTML = readers.map((reader, index) => `
        <tr>
            <td>${reader.name}</td>
            <td>${reader.class}</td>
            <td>
                <button class="action-btn" onclick="editReader(${index})">✎</button>
                <button class="action-btn" onclick="deleteReader(${index})" style="background-color:#fee2e2; color:#b91c1c;">🗑️</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('readerCount') && (document.getElementById('readerCount').textContent = readers.length);
}

function editReader(index) {
    const readers = loadReaders();
    const reader = readers[index];
    if (!reader) return;

    const newName = prompt('Изменить ФИО:', reader.name);
    if (newName?.trim()) reader.name = newName.trim();

    const newClass = prompt('Изменить класс:', reader.class);
    if (newClass?.trim()) reader.class = newClass.trim();

    saveReaders(readers);
    renderReadersTable();
    updateStats();
}

function deleteReader(index) {
    if (confirm('Вы уверены, что хотите удалить читателя?')) {
        const readers = loadReaders();
        readers.splice(index, 1);
        saveReaders(readers);
        renderReadersTable();
        updateStats();
    }
}

function setupAddReader() {
    const btn = document.getElementById('addReaderBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const name = prompt('ФИО читателя:');
        if (!name?.trim()) return;
        const className = prompt('Класс:');
        if (!className?.trim()) return;

        const readers = loadReaders();
        if (readers.some(r => r.name === name.trim() && r.class === className.trim())) {
            alert('Такой читатель уже существует!');
            return;
        }

        readers.push({ name: name.trim(), class: className.trim() });
        saveReaders(readers);
        renderReadersTable();
        updateStats();
    });
}

function setupReaderSearch() {
    const searchBtn = document.getElementById('searchReaderBtn');
    const searchInput = document.getElementById('searchReaderInput');
    if (!searchBtn || !searchInput) return;

    const search = () => {
        const query = searchInput.value.trim().toLowerCase();
        const readers = loadReaders();
        renderReadersTable(query ? readers.filter(r => r.name.toLowerCase().includes(query)) : readers);
    };

    searchBtn.addEventListener('click', search);
    searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') search(); });
}

// ============================================
// 6. ПОИСК КНИГ
// ============================================

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (!searchBtn || !searchInput) return;

    const search = () => {
        const query = searchInput.value.trim().toLowerCase();
        const books = loadBooks();
        renderBooksTable(query ? books.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query) || 
            b.year.toString().includes(query)
        ) : books);
    };

    searchBtn.addEventListener('click', search);
    searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') search(); });
}

// ============================================
// 7. ВЫДАЧА И ВОЗВРАТ
// ============================================

function setupIssueReturn() {
    const issueBtn = document.getElementById('issueBtn');
    const returnBtn = document.getElementById('returnBtn');
    const issueBookSelect = document.getElementById('issueBookSelect');
    const returnBookSelect = document.getElementById('returnBookSelect');
    const readerSelect = document.getElementById('issueReaderSelect');
    if (!issueBtn && !returnBtn) return;

    const refreshSelects = () => {
        const books = loadBooks();
        const readers = loadReaders();

        if (issueBookSelect) {
            issueBookSelect.innerHTML = '<option value="">-- Выберите книгу --</option>' + 
                books.filter(b => b.status === 'В наличии').map(b => `<option value="${b.id}">${b.title} (${b.author})</option>`).join('');
        }

        if (returnBookSelect) {
            returnBookSelect.innerHTML = '<option value="">-- Выберите книгу --</option>' + 
                books.filter(b => b.status === 'Выдана').map(b => `<option value="${b.id}">${b.title} (${b.author})</option>`).join('');
        }

        if (readerSelect) {
            readerSelect.innerHTML = '<option value="">-- Выберите читателя --</option>' + 
                readers.map(r => `<option value="${r.name}">${r.name} (${r.class})</option>`).join('');
        }
    };

    refreshSelects();

    issueBtn?.addEventListener('click', () => {
        const bookId = issueBookSelect.value;
        const readerName = readerSelect.value;
        if (!bookId || !readerName) return alert('Выберите книгу и читателя');

        const books = loadBooks();
        const book = books.find(b => b.id == bookId);
        if (book) {
            book.status = 'Выдана';
            book.issuedTo = readerName;
            book.issueDate = new Date().toLocaleDateString();
            saveBooks(books);
            alert(`Книга "${book.title}" выдана читателю ${readerName}`);
            refreshSelects();
            renderBooksTable();
            updateStats();
        }
    });

    returnBtn?.addEventListener('click', () => {
        const bookId = returnBookSelect.value;
        if (!bookId) return alert('Выберите книгу');

        const books = loadBooks();
        const book = books.find(b => b.id == bookId);
        if (book) {
            book.status = 'В наличии';
            delete book.issuedTo;
            delete book.issueDate;
            saveBooks(books);
            alert(`Книга "${book.title}" возвращена`);
            refreshSelects();
            renderBooksTable();
            updateStats();
        }
    });
}

// ============================================
// 8. ИСТОРИЯ ВЫДАЧ
// ============================================

function renderHistoryTable(filteredIssues = null) {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;

    const issues = loadBooks().filter(b => b.status === 'Выдана' && b.issuedTo).map(b => ({
        readerName: b.issuedTo,
        bookTitle: b.title,
        bookAuthor: b.author,
        issueDate: b.issueDate || 'Дата не указана'
    }));

    const displayIssues = filteredIssues || issues;

    if (displayIssues.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-muted">Нет выданных книг</td></tr>';
        return;
    }

    tableBody.innerHTML = displayIssues.map(issue => `
        <tr>
            <td>${issue.readerName}</td>
            <td>${issue.bookTitle}</td>
            <td>${issue.bookAuthor}</td>
            <td>${issue.issueDate}</td>
        </tr>
    `).join('');
}

function setupHistorySearch() {
    const searchBtn = document.getElementById('historySearchBtn');
    const searchInput = document.getElementById('historySearchInput');
    if (!searchBtn || !searchInput) return;

    const search = () => {
        const query = searchInput.value.trim().toLowerCase();
        const issues = loadBooks().filter(b => b.status === 'Выдана' && b.issuedTo).map(b => ({
            readerName: b.issuedTo,
            bookTitle: b.title,
            bookAuthor: b.author,
            issueDate: b.issueDate || 'Дата не указана'
        }));
        renderHistoryTable(query ? issues.filter(i => i.readerName.toLowerCase().includes(query) || i.bookTitle.toLowerCase().includes(query)) : issues);
    };

    searchBtn.addEventListener('click', search);
    searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') search(); });
}

// ============================================
// 9. ВХОД
// ============================================

function setupLogin() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('isAdmin', 'true');
            window.location.href = 'index.html';
        } else {
            alert('Неверный логин или пароль');
        }
    });
}

// ============================================
// 10. ЭКСПОРТ/ИМПОРТ ДАННЫХ (внизу страницы)
// ============================================

function exportData() {
    const data = {
        books: loadBooks(),
        readers: loadReaders(),
        exportDate: new Date().toLocaleString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library_backup_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Данные экспортированы! Файл сохранен на компьютер.');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            let importCount = 0;
            
            if (data.books) {
                saveBooks(data.books);
                importCount += data.books.length;
                alert(`📚 Импортировано книг: ${data.books.length}`);
            }
            if (data.readers) {
                saveReaders(data.readers);
                alert(`👥 Импортировано читателей: ${data.readers.length}`);
            }
            
            alert(`✅ Данные успешно импортированы! Всего записей: ${importCount}\nСтраница будет обновлена.`);
            location.reload();
        } catch (err) {
            alert('❌ Ошибка при импорте: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function addBackupSection() {
    const mainContainer = document.querySelector('main.container');
    if (!mainContainer || document.getElementById('backupSection')) return;
    
    const backupSection = document.createElement('div');
    backupSection.id = 'backupSection';
    backupSection.className = 'backup-section';
    backupSection.innerHTML = `
        <div class="backup-title">
            💾 Резервное копирование данных
        </div>
        <div class="backup-buttons">
            <button id="exportDataBtn">📤 Экспорт (скачать backup)</button>
            <button id="importDataBtn">📥 Импорт (восстановить из файла)</button>
        </div>
        <p class="text-muted" style="margin-top: 10px; font-size: 0.8rem;">
            🔒 Данные хранятся только в вашем браузере. Рекомендуется периодически делать резервные копии.
        </p>
    `;
    
    mainContainer.appendChild(backupSection);
    
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            if (e.target.files[0]) importData(e.target.files[0]);
        };
        input.click();
    });
}

// ============================================
// 11. ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateAdminUI();

    const path = window.location.pathname;

    if (path.includes('login.html')) setupLogin();
    if (path.includes('index.html') || path.endsWith('/')) updateStats();
    if (path.includes('books.html')) {
        renderBooksTable();
        setupSearch();
        setupAddBook();
        addBackupSection();
    }
    if (path.includes('readers.html')) {
        renderReadersTable();
        setupAddReader();
        setupReaderSearch();
        addBackupSection();
    }
    if (path.includes('issue.html')) setupIssueReturn();
    if (path.includes('history.html')) {
        renderHistoryTable();
        setupHistorySearch();
        addBackupSection();
    }
});