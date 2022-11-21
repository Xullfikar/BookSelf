let books = [];
const STORAGE_KEY = "BOOK_APPS";
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "add-book";
const COMPLATED_EVENT = 'complated-book';
const UNDO_EVENT = 'undo-book';
const CLEAR_EVENT = 'clear-book';
let chk = 0;

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert('Browser kamu tidak mendukung web storage');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function(){
    const submitBook = document.getElementById('bookSubmit');
    submitBook.addEventListener('click', function(event){
        event.preventDefault();
        addBook();
    })

    const cariBook = document.getElementById('searchSubmit');
    cariBook.addEventListener('click', function (event){
        event.preventDefault();
        searchBook();
    })

    const reloadBook = document.getElementById('reload');
    reloadBook.addEventListener('click', function (event){
        event.preventDefault();
        loadDataFromStorage();
    })

    if(!cariBook.onclick){
        if(isStorageExist()){
            loadDataFromStorage();
        }
    }
})

function addBook() {
    const judulBuku = document.getElementById('inputBookTitle').value;
    const penulisBuku = document.getElementById('inputBookAuthor').value;
    const tahunBuku = document.getElementById('inputBookYear').value;
    const selesaiDibaca = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateTodoObject(generatedID, judulBuku, penulisBuku, tahunBuku, selesaiDibaca);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function generateId() {
    return +new Date();
}

function generateTodoObject(id, judul, penulis, tahun, selesai) {
    return {
        id,
        judul,
        penulis,
        tahun,
        selesai
    }
}

document.addEventListener(RENDER_EVENT, function(){
    const uncomplatedBook = document.getElementById('incompleteBookshelfList');
    uncomplatedBook.innerText = '';

    const complatedBook = document.getElementById('completeBookshelfList');
    complatedBook.innerText = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(!bookItem.selesai){
            uncomplatedBook.append(bookElement);
        } else {
            complatedBook.append(bookElement);
        }
    }
})

function makeBook(bookObject){
    const judulBuku = document.createElement('h3');
    judulBuku.innerText = bookObject.judul;

    const penulisBuku = document.createElement('p');
    penulisBuku.innerText = "Penulis : " + bookObject.penulis;

    const tahunBuku = document.createElement('p');
    tahunBuku.innerText = "Tahun : " + bookObject.tahun;

    const bookContainer = document.createElement('article');
    bookContainer.classList.add('book_item');
    bookContainer.append(judulBuku, penulisBuku, tahunBuku);
    bookContainer.setAttribute('id', `book-${bookObject.id}`);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const trushButton = document.createElement('button');
    trushButton.innerText = "Hapus buku";
    trushButton.classList.add('red');
    trushButton.addEventListener('click', function(){
        removeBookFromComplated(bookObject.id);
    })

    if(bookObject.selesai){
        const undoButton = document.createElement('button');
        undoButton.innerText = "Belum selesai di Baca";
        undoButton.classList.add('green');
        undoButton.addEventListener('click', function(){
            undoBookFromComplated(bookObject.id);
        })

        buttonContainer.append(undoButton, trushButton);
        bookContainer.append(buttonContainer);
    } else {
        const selesaiButton = document.createElement('button');
        selesaiButton.innerText = "Selesai dibaca";
        selesaiButton.classList.add('green');
        selesaiButton.addEventListener('click', function(){
            addBookToComplated(bookObject.id);
        })

        buttonContainer.append(selesaiButton, trushButton);
        bookContainer.append(buttonContainer);
    }

    return bookContainer;
}

function searchBook(){
    const bookSearch = localStorage.getItem(STORAGE_KEY);
    let dataBuku =  JSON.parse(bookSearch);

    const search = document.getElementById('searchBookTitle').value.toLowerCase();
    for(let buku of dataBuku){
        if(buku.judul.toLowerCase().includes(search)) {
            books = [];
            books.push(buku);   
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBookToComplated(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null ) return;

    bookTarget.selesai = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook("complated");
}

function findBook(bookId){
    for(const bookItem of books) {
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

function removeBookFromComplated(bookId){
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook("remove");
}

function undoBookFromComplated(bookId){
    const bookTarget = findBook(bookId);
    
    if(bookTarget == null) return;

    bookTarget.selesai = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook("undo");
}

function findBookIndex(bookId){
    for (const index in books){
        if(books[index].id === bookId){
            return index;
        }
    }

    return -1;
}

function saveBook(pesan){
    if(isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);

        if (pesan == "complated"){
            document.dispatchEvent(new Event(COMPLATED_EVENT));
        } else if (pesan == "remove"){
            document.dispatchEvent(new Event(CLEAR_EVENT));
        }else if(pesan == "undo"){
            document.dispatchEvent(new Event(UNDO_EVENT));
        }else{
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }
}

document.addEventListener(SAVED_EVENT, function(){
    alert('Buku Anda Berhasil Di Simpan!!');
})
document.addEventListener(COMPLATED_EVENT, function(){
    alert('Selamat :) , Anda Telah Selesai Membaca Buku ini!!');
})
document.addEventListener(UNDO_EVENT, function(){
    alert('Yaah :( , Ternyata Anda Belum Selesai Membaca Buku ini!!!');
})
document.addEventListener(CLEAR_EVENT, function(){
    alert('Buku Anda Berhasil Di Hapus!!!');
})

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

        if (data !== null) {
            books = [];
            for (let book of data){
                books.push(book);
            }
        }

    document.dispatchEvent(new Event(RENDER_EVENT));
}