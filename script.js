// ============================================
// 1. РАБОТА С ХРАНИЛИЩЕМ (localStorage)
// ============================================

function loadBooks() {
    const books = localStorage.getItem('books');
    if (books) {
        return JSON.parse(books);
    } else {
        const initialBooks = [
            { id: 1, title: 'Война и мир', author: 'Л. Толстой', year: 1869, status: 'В наличии' },
            { id: 2, title: 'Преступление и наказание', author: 'Ф. Достоевский', year: 1866, status: 'В наличии' },
            { id: 3, title: 'Мастер и Маргарита', author: 'М. Булгаков', year: 1967, status: 'В наличии' },
            { id: 4, title: 'Евгений Онегин', author: 'А. Пушкин', year: 1833, status: 'В наличии' }
        ];
        localStorage.setItem('books', JSON.stringify(initialBooks));
        return initialBooks;
    }
}

function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books));
}

function loadReaders() {
    const readers = localStorage.getItem('readers');
    if (readers) {
        return JSON.parse(readers);
    } else {
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
        localStorage.setItem('readers', JSON.stringify(initialReaders));
        return initialReaders;
    }
}

function saveReaders(readers) {
    localStorage.setItem('readers', JSON.stringify(readers));
}

// ============================================
// 2. АВТОРИЗАЦИЯ
// ============================================

function isAdminLoggedIn() {
    return localStorage.getItem('isAdmin') === 'true';
}

function updateAdminUI() {
    const loggedIn = isAdminLoggedIn();
    const adminElements = document.querySelectorAll('.admin-only');
    const loginLink = document.getElementById('login-link');

    adminElements.forEach(el => {
        el.style.display = loggedIn ? 'inline-block' : 'none';
    });

    if (loginLink) {
        if (loggedIn) {
            loginLink.textContent = 'Выйти';
            loginLink.href = '#';
            loginLink.onclick = function(e) {
                e.preventDefault();
                logout();
            };
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
    const totalBooksSpan = document.getElementById('totalBooks');
    const issuedBooksSpan = document.getElementById('issuedBooks');
    const totalReadersSpan = document.getElementById('totalReaders');
    const issuedCount = books.filter(b => b.status === 'Выдана').length;

    if (totalBooksSpan) totalBooksSpan.textContent = books.length;
    if (issuedBooksSpan) issuedBooksSpan.textContent = issuedCount;
    if (totalReadersSpan) totalReadersSpan.textContent = readers.length;
}

// ============================================
// 4. КНИГИ
// ============================================

function renderBooksTable(filteredBooks = null) {
    const tableBody = document.getElementById('booksTableBody');
    if (!tableBody) return;

    const books = filteredBooks || loadBooks();
    const bookCountSpan = document.getElementById('bookCount');
    const isAdmin = isAdminLoggedIn();

    tableBody.innerHTML = '';
    books.forEach(book => {
        const row = document.createElement('tr');
        const statusClass = book.status === 'В наличии' ? 'status-available' : 'status-issued';

        let actionsHtml = '';
        if (isAdmin) {
            actionsHtml = `<td><button class="action-btn" onclick="editBook(${book.id})">✎</button>`;
        } else {
            actionsHtml = '演';
        }

        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.year}</td>
            <td><span class="${statusClass}">${book.status}</span></td>
            ${actionsHtml}
        `;
        tableBody.appendChild(row);
    });

    if (bookCountSpan) bookCountSpan.textContent = books.length;
}

function editBook(id) {
    const books = loadBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;

    const newTitle = prompt('Новое название:', book.title);
    if (newTitle && newTitle.trim() !== '') book.title = newTitle.trim();

    const newAuthor = prompt('Новый автор:', book.author);
    if (newAuthor && newAuthor.trim() !== '') book.author = newAuthor.trim();

    const newYear = prompt('Новый год:', book.year);
    if (newYear && !isNaN(parseInt(newYear))) book.year = parseInt(newYear);

    saveBooks(books);
    renderBooksTable();
}

function setupAddBook() {
    const btn = document.getElementById('addBookBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const title = prompt('Название книги:');
        if (!title || title.trim() === '') return;

        const author = prompt('Автор:');
        if (!author || author.trim() === '') return;

        const year = prompt('Год издания:');
        if (!year || isNaN(parseInt(year))) return;

        const books = loadBooks();
        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;

        books.push({
            id: newId,
            title: title.trim(),
            author: author.trim(),
            year: parseInt(year),
            status: 'В наличии'
        });

        saveBooks(books);
        renderBooksTable();
    });
}

// ============================================
// 5. ЧИТАТЕЛИ
// ============================================

function renderReadersTable() {
    const tableBody = document.getElementById('readersTableBody');
    if (!tableBody) return;

    const readers = loadReaders();
    const readerCountSpan = document.getElementById('readerCount');

    tableBody.innerHTML = '';
    readers.forEach((reader, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reader.name}</td>
            <td>${reader.class}</td>
            <td>
                <button class="action-btn" onclick="editReader(${index})">✎</button>
                <button class="action-btn" onclick="deleteReader(${index})" style="background-color: #fee2e2; color: #b91c1c; margin-left: 5px;">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (readerCountSpan) readerCountSpan.textContent = readers.length;
}

function editReader(index) {
    const readers = loadReaders();
    const reader = readers[index];
    if (!reader) return;

    const newName = prompt('Изменить ФИО:', reader.name);
    if (newName && newName.trim() !== '') reader.name = newName.trim();

    const newClass = prompt('Изменить класс:', reader.class);
    if (newClass && newClass.trim() !== '') reader.class = newClass.trim();

    saveReaders(readers);
    renderReadersTable();
}

function deleteReader(index) {
    if (confirm('Вы уверены, что хотите удалить читателя?')) {
        const readers = loadReaders();
        readers.splice(index, 1);
        saveReaders(readers);
        renderReadersTable();
    }
}

function setupAddReader() {
    const btn = document.getElementById('addReaderBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const name = prompt('ФИО читателя:');
        if (!name || name.trim() === '') return;

        const className = prompt('Класс:');
        if (!className || className.trim() === '') return;

        const readers = loadReaders();
        readers.push({ name: name.trim(), class: className.trim() });
        saveReaders(readers);
        renderReadersTable();
    });
}

// ============================================
// 6. ПОИСК
// ============================================

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchInput) return;

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const allBooks = loadBooks();

        if (query === '') {
            renderBooksTable(allBooks);
            return;
        }

        const filtered = allBooks.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.year.toString().includes(query)
        );

        renderBooksTable(filtered);
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
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

    const books = loadBooks();
    const readers = loadReaders();

    if (issueBookSelect) {
        issueBookSelect.innerHTML = '<option value="">-- Выберите книгу --</option>';
        books.filter(b => b.status === 'В наличии').forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} (${book.author})`;
            issueBookSelect.appendChild(option);
        });
    }

    if (returnBookSelect) {
        returnBookSelect.innerHTML = '<option value="">-- Выберите книгу --</option>';
        books.filter(b => b.status === 'Выдана').forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} (${book.author})`;
            returnBookSelect.appendChild(option);
        });
    }

    if (readerSelect) {
        readerSelect.innerHTML = '<option value="">-- Выберите читателя --</option>';
        readers.forEach(reader => {
            const option = document.createElement('option');
            option.value = reader.name;
            option.textContent = `${reader.name} (${reader.class})`;
            readerSelect.appendChild(option);
        });
    }

    if (issueBtn) {
        issueBtn.addEventListener('click', () => {
            const bookId = issueBookSelect.value;
            const readerName = readerSelect.value;

            if (!bookId || !readerName) {
                alert('Выберите книгу и читателя');
                return;
            }

            const books = loadBooks();
            const book = books.find(b => b.id == bookId);
            if (book) {
                book.status = 'Выдана';
                saveBooks(books);
                alert(`Книга "${book.title}" выдана читателю ${readerName}`);
                location.reload();
            }
        });
    }

    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            const bookId = returnBookSelect.value;

            if (!bookId) {
                alert('Выберите книгу');
                return;
            }

            const books = loadBooks();
            const book = books.find(b => b.id == bookId);
            if (book) {
                book.status = 'В наличии';
                saveBooks(books);
                alert(`Книга "${book.title}" возвращена`);
                location.reload();
            }
        });
    }
}

// ============================================
// 8. ВХОД
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
// 9. ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    updateAdminUI();

    const path = window.location.pathname;

    if (path.includes('login.html')) setupLogin();
    if (path.includes('index.html') || path.endsWith('/')) updateStats();
    if (path.includes('books.html')) {
        renderBooksTable();
        setupSearch();
        setupAddBook();
    }
    if (path.includes('readers.html')) {
        renderReadersTable();
        setupAddReader();
    }
    if (path.includes('issue.html')) setupIssueReturn();
});