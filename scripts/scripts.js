let option = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

// Ajout fil d'ariane
let breadcrumb = document.getElementById("breadcrumb");

let bookList = new Array();
let authorsList = new Array();
let categoriesList = new Array();

let listAuthors = document.getElementById("listAuthors");
let listCategories = document.getElementById("listCategories");
let listBooks = document.getElementById("booksList");

listAuthors.addEventListener('change', chargeByAuthor);
listCategories.addEventListener("change", chargeByCategory);

// On créé l'écouteur d'evenements sur le load de notre page
window.addEventListener("DOMContentLoaded", jsonOnLoad);

// Fonction qui appele le chargement  du json
function jsonOnLoad() {
    fetch("json/books.json")
        .then((response) => {
            return response.json(); //On covertit la reponse en json
        })
        .then((data) => {
            console.log(data);
            createBooks(data);
        })
}

// Fonction qui affiche les livres et qui crée les listes détoulantes
function createBooks(_books) {
    // On boucle sur l'ensemble des livres
    for (let book of _books) {
        bookList.push(book);

        // Ajout des auteurs à la liste
        for (let author of book.authors) {
            if (!authorsList.includes(author)) {
                authorsList.push(author);
            }
        }

        // Ajout des catégories à la liste
        for (let category of book.categories) {
            if (!categoriesList.includes(category)) {
                categoriesList.push(category);
            }
        }
    }

    // Tri des listes
    authorsList.sort();
    categoriesList.sort();
    bookList.sort();

    // Remplissage des listes déroulantes
    listederoulante(listAuthors, authorsList);
    listederoulante(listCategories, categoriesList);

    // Affiche tous les livres initialement
    showBooks(bookList);
}

function listederoulante(dropdown, items) {
    let defaultOption = document.createElement("option");
    defaultOption.innerText = "-- Sélectionnez une option --";  // Option par défaut
    dropdown.appendChild(defaultOption);

    // Ajoute chaque élément dans la liste déroulante
    for (let item of items) {
        let option = document.createElement("option");
        option.value = item;
        option.innerText = item;
        dropdown.appendChild(option);
    }
}

function showBooks(_books) {
    listBooks.innerHTML = ""; // Vide la liste actuelle

    if (_books.length === 0) {
        // Affiche un message si aucun livre n'est trouvé
        listBooks.innerHTML = "<p>Aucun livre trouvé.</p>";
        return;
    }

    // Création d'une carte pour chaque livre
    for (let book of _books) {
        let card = document.createElement("div");
        card.setAttribute("class", "card");

        // Récupère l'image de couverture ou utilise une image par défaut
        let thumbnailUrl = book.thumbnailUrl || "https://p1.storage.canalblog.com/14/48/1145642/91330992_o.png";

        // Récupère la description courte ou un message par défaut
        let shortDescription = book.shortDescription || "Pas de description disponible";

        // Récupère la description long ou un message par défaut
        let longDescription = book.longDescription || "Pas de description longue disponible";

        // Date mis en format fr + gestion erreur
        let datepublication;
        try {
            datepublication = new Date(book.publishedDate.dt_txt).toLocaleDateString("fr-FR", option);
        } catch (error) {
            datepublication = "Pas de date de publication";
        }

        // Gestion des titres longs pour ajouter une infobulle
        let title = book.title.length > 20 ? `${book.title.substring(0, 20)}...` : book.title;
        let titre = book.title.length > 20 ? `title="${book.title}"` : "";

        // Gestion des descriptions longues ou absentes pour les infobulles
        let description = shortDescription === "Pas de description disponible" || !shortDescription
            ? `title="${longDescription}"`
            : `title="${longDescription}"`;

        // Implémentation du contenu des cartes dans le html
        card.innerHTML = `
            <img src="${thumbnailUrl}" class="card-img-top" alt="${book.title}">
            <div class="card-body">
                <h5 class="card-title" ${titre}>${title}</h5>
                <p class="card-text">ISBN: ${book.isbn}</p>
                <p class="card-text">Publié le : ${datepublication}</p>
                ${book.pageCount > 0 ? `<p class="card-text">${book.pageCount} pages</p>` : ""}
                <p class="card-text" ${description}>${shortDescription}</p>
            </div>`;

        listBooks.appendChild(card); // Ajoute la carte à la liste
    }
}

// Fonction pour mettre à jour le fil d'Ariane
function updateBreadcrumb(type, value) {
    // Supprime tous les éléments sauf le premier ("Accueil")
    while (breadcrumb.children.length > 1) {
        breadcrumb.removeChild(breadcrumb.lastChild);
    }

    if (type && value) {
        let li = document.createElement("li");
        li.className = "breadcrumb-item active";

        if (type === "author") {
            li.textContent = `Auteur : ${value}`;
        } else if (type === "category") {
            li.textContent = `Catégorie : ${value}`;
        }

        breadcrumb.appendChild(li);
    }
}

// Fonction pour réinitialiser les filtres (retour à "Accueil")
function resetFilters() {
    listAuthors.value = "";
    listCategories.value = "";
    showBooks(bookList); // Affiche tous les livres
    updateBreadcrumb(); // Réinitialise le fil d'Ariane
}

// Fonction appelée lors du chargement d'auteur dans la liste déroulante
function chargeByAuthor() {
    let selectedAuthor = listAuthors.value;

    // Réinitialise la liste des catégories si un auteur est sélectionné
    if (selectedAuthor) {
        listCategories.value = ""; // Réinitialise la valeur de la liste déroulante des categories
        let filteredBooks = bookList.filter((book) => book.authors.includes(selectedAuthor));
        showBooks(filteredBooks);
        // Mise à jour du fil d'Ariane avec l'auteur sélectionné
        updateBreadcrumb("author", selectedAuthor);
    } else {
        showBooks(bookList); // Affiche tous les livres si aucun auteur sélectionné

        updateBreadcrumb();
    }
}

// Fonction appelée lors du chargement de catégorie dans la liste déroulante
function chargeByCategory() {
    let selectedCategory = listCategories.value;

    // Réinitialise la liste des auteurs si une catégorie est sélectionnée
    if (selectedCategory) {
        listAuthors.value = ""; // Réinitialise la valeur de la liste déroulante des auteurs
        let filteredBooks = bookList.filter((book) => book.categories.includes(selectedCategory));
        showBooks(filteredBooks);
        // Mise à jour du fil d'Ariane avec la catégorie sélectionnée
        updateBreadcrumb("category", selectedCategory);

    } else {
        showBooks(bookList); // Affiche tous les livres si aucune catégorie sélectionnée
        // Mise à jour du fil d'Ariane
        updateBreadcrumb();
    }
}

let searchbtn = document.getElementById("searchButton");

searchbtn.addEventListener("click", searchByDescription);

function searchByDescription() {
    let searchterm = document.getElementById("searchDescription").value.toLowerCase();

    if (searchterm.trim() === "") {
        alert("Veuillez saisir une valeur");
        return;
    }

    let filterbook = bookList.filter((book) =>{
        let shortDescription = book.shortDescription ? book.shortDescription.toLowerCase() : "";
        let longDescription = book.longDescription ? book.longDescription.toLowerCase() : "";
        return shortDescription.includes(searchterm) || longDescription.includes(searchterm);
    })

    showBooks(filterbook);
    console.log(filterbook);
}

// Get the button:
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}