// HTML elementen
// SETUP
const SETUP = document.querySelector(".setup-container");
const SHOP_SELECT = document.querySelector("#shop_select");
const FIRSTNAME = document.querySelector("#firstname");
const BTN_START = document.querySelector("#btn_start");
const LOGO = document.querySelector("#shop_logo");
const REMEMBER = document.querySelector("#remember");
// APP
const APP = document.querySelector(".app-container");
const PRODUCT_NAME = document.querySelector("#product_name");
const PRODUCT_AMOUNT = document.querySelector("#product_amount");
const BTN_ADD = document.querySelector("#btn_add");
const LIST = document.querySelector(".list-container");
const WELCOME_NAME = document.querySelector("#welcome_name");
const WELCOME_DATE = document.querySelector("#welcome_date");
const APP_LOGO = document.querySelector("#shop_logo_app");

// SOUNDS
const SOUND_ADD = new Audio("assets/audio/sound_add.mp3");
const SOUND_DELETE = new Audio("assets/audio/sound_delete.mp3");
const SOUND_SCRATCH = new Audio("assets/audio/sound_scratch.mp3");

// DATA INITIALISEREN
let products = [];

// HULPFUNCTIES
function setShopTheme(shop, logoElement) {
    switch (shop) {
        case "aldi":
            logoElement.src = "assets/img/logo_aldi.png";
            document.body.style.backgroundColor = "blue";
            break;
        case "colruyt":
            logoElement.src = "assets/img/logo_colruyt.png";
            document.body.style.backgroundColor = "orange";
            break;
        case "delhaize":
            logoElement.src = "assets/img/logo_delhaize.png";
            document.body.style.backgroundColor = "red";
        break;
    }
}

function getCookie(name) {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const cookieParts = cookie.trim().split("=");
        const key = cookieParts[0];
        const value = cookieParts[1];
        if (key === name) {
            return value;
        }
    }
    return "";
}

function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; max-age=${maxAge}`;
}

function formatDate(date) {
    const days = [
        "Zondag",
        "Maandag",
        "Dinsdag",
        "Woensdag",
        "Donderdag",
        "Vrijdag",
        "Zaterdag"
    ];
    
    const months = [
        "januari",
        "februari",
        "maart",
        "april",
        "mei",
        "juni",
        "juli",
        "augustus",
        "september",
        "oktober",
        "november",
        "december"
    ];

  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function capitalize(str) {
    const capitalized = str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
    return capitalized;
}

// PRODUCT CLASS
class Product {
    constructor(name, amount) { 
        this.name = name; 
        this.amount = amount; 
        this.done = false; 
    }

    increase() { 
        const number = parseFloat(this.amount); 
        const unit = this.amount.replace(number, "").trim();
        if (unit) {
            this.amount = `${number + 1} ${unit}`;
        } else {
            this.amount = `${number + 1}`;
        }
    }

    decrease() {
        const number = parseFloat(this.amount);
        if (number > 1) {
            const unit = this.amount.replace(number, "").trim();
            if (unit) {
                this.amount = `${number - 1} ${unit}`;
            } else {
                this.amount = `${number - 1}`;
            }
        }
    }

    scratch() {
        this.done = !this.done;
    }

    remove(list, index) {
        list.splice(index, 1);
    }
}

// EVENT LISTENERS
SHOP_SELECT.addEventListener("change", function () {
    setShopTheme(SHOP_SELECT.value, LOGO);
});

FIRSTNAME.addEventListener("input", function() {
    BTN_START.disabled = FIRSTNAME.value.trim().length < 2;
});

BTN_START.addEventListener("click", function() {
    const name = capitalize(FIRSTNAME.value.trim());
    const shop = SHOP_SELECT.value;

    if (REMEMBER.checked) {
        setCookie("name", name, 5);
        setCookie("shop", shop, 5);
    }

    WELCOME_NAME.innerHTML = `<b>${name}</b>`;
    WELCOME_DATE.innerHTML = formatDate(new Date());
    setShopTheme(shop, APP_LOGO);

    SETUP.style.display = "none";
    APP.style.display = "block";
});

BTN_ADD.addEventListener("click", function() {
    const name = capitalize(PRODUCT_NAME.value.trim());
    const amount = PRODUCT_AMOUNT.value.trim();

    if (name === "" || amount === "") {
        alert("Gelieve beide velden in te vullen");
        return;
    }

    if (name.length < 2) {
        alert("Productnaam ongeldig, min. 2 karakters vereist");
        return;
    }

    const number = parseFloat(amount);
    if (isNaN(number)) {
        alert("Gelieve een geldig getal in te vullen bij 'hoeveelheid'");
        return;
    }

    const unit = amount.replace(number.toString(), "").trim();
    const validUnits = ["gr", "kg", "ml", "dl", "l", "mm", "cm", "m"];
    if (unit && !validUnits.includes(unit)) {
        alert("Ongeldige eenheid (gr/kg/ml/dl/l/mm/cm/m)");
        return;
    }

    const product = new Product(name, amount);
    products.push(product);
    SOUND_ADD.play();
    showList();

    PRODUCT_NAME.value = "";
    PRODUCT_AMOUNT.value = "";
});

// FUNCTIE LIJST TONEN
function showList() {
    LIST.innerHTML = "";

    products.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const row = document.createElement("div");
        row.classList.add("product-row");

        const text = document.createElement("span");
        text.innerHTML = `${product.amount} ${product.name}`;
        if (product.done) {
          text.classList.add("done");
        }

        const actions = document.createElement("div");
        actions.classList.add("product-actions");

        const btnPlus = document.createElement("button");
        btnPlus.textContent = "+";
        btnPlus.addEventListener("click", function () {
            product.increase();
            showList();
        });

        const btnMin = document.createElement("button");
        btnMin.textContent = "-";
        btnMin.addEventListener("click", function () {
            product.decrease();
            showList();
        });

        const btnDone = document.createElement("button");
        btnDone.textContent = "Schrap";
        btnDone.addEventListener("click", function () {
            product.scratch();
            SOUND_SCRATCH.play();
            showList();
        });

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Verwijder";
        btnDelete.addEventListener("click", function() {
            if (confirm("Ben je zeker dat je dit item wil verwijderen?")) {
                product.remove(products, i);
                SOUND_DELETE.play();
                showList();
            }
        });

        actions.append(btnPlus, btnMin, btnDone, btnDelete);
        row.append(text, actions);
        LIST.appendChild(row);
    }
}

// KEYBOARD SHORTCUT
document.addEventListener("keydown", function(e) {
    if (e.altKey && e.ctrlKey && e.key.toLowerCase() === "n") {
        if (confirm("Reset lijst?")) {
            products = [];
            showList();
        }
    }
});

// COOKIE LADEN BIJ START
const savedName = getCookie("name");
const savedShop = getCookie("shop");
if (savedName && savedShop) {
    FIRSTNAME.value = savedName;
    SHOP_SELECT.value = savedShop;
    BTN_START.disabled = false;
    setShopTheme(savedShop, LOGO);
}
