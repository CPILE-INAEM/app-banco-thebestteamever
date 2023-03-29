"use strict";

// BANKIST APP
// Data
const account1 = {
  owner: "Juan Sánchez",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "María Portazgo",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Estefanía Pueyo",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Javier Rodríguez",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

// FUNCION PARA GENERAR MOVIMIENTOS ALEATORIOS
function generateMovements(length, startDate, endDate) {
  return Array.from({ length }, () => {
    const date = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    ).toISOString();
    const value = Math.floor(Math.random() * (5000 - -2000 + 1)) + -2000;
    return { date, value };
  });
}

const accounts = [account1, account2, account3, account4];
accounts.forEach((account) => {
  const movements = generateMovements(10, new Date(2020, 1, 1), new Date());
  account.movements = movements.map(({ date, value }) => ({ date, value }));
});

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//init data
const createUsernames = () => {
  accounts.forEach((account) => {
    account.username = account.owner
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toLowerCase();
  });
};

createUsernames();
let activeAccount = {};
btnLogin.addEventListener("click", (e) => {
  // Prevent form from submitting (Impedir que se envíe el formulario)
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);

  console.log(`Login con el usuario ${username} y el pin ${pin}`);

  //recorrer todos los accounts y buscar el que coincida con el username y luego comparar con el pin

  const currentAccount = accounts.find(
    (account) => account.username === username
  );

  //Puede ser null si el usuario no existe

  console.log(`Current account: ${currentAccount}`);

  // "currentAccount && currentAccount.pin" es lo mismo que poner "currentAccount?.pin" (esta ultima version es la reducida )

  if (currentAccount?.pin === pin) {
    console.log("Login correcto");
    labelWelcome.textContent = `Bienvenido ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    activeAccount = currentAccount;
    //mostrar datos
    updateUI(currentAccount);
    const { movements } = currentAccount;
    const balance = movements.reduce((acc, movement) => {
      return acc + movement.value;
    }, 0);
    labelBalance.textContent = `${balance.toFixed(2)}€`;
    // Llama a startTimer al hacer login para iniciar el contador
    startTimer();
  }
});
const updateUI = (currentAccount) => {
  //obtener movimientos
  //Convertir la fecha del movimiento a un objeto Moment.js
  activeAccount.movements.forEach(function (movement) {
    var fechaActual = moment();
    var fecha = moment(movement.date).fromNow(fechaActual);
    movement.formattedDate = fecha;
  });
  const { movements } = currentAccount;

  displayMovements(currentAccount.movements);
  //limpiar movimientos antiguos:
  //document.querySelector(".movements").innerHTML = "";
  //insertarlos con insert
  //mostrar el balance
  calcAndDisplayBalance(currentAccount.movements);
  //mostrar el resumen
  calcAndDisplaySummary(currentAccount);
};
const displayMovements = (movements) => {
  containerMovements.innerHTML = "";
  movements.forEach((mov, i) => {
    const type = mov.value > 0 ? "deposit" : "withdrawal";
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${mov.formattedDate}</div>
        <div class="movements__value">${mov.value.toFixed(2)}€</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcAndDisplayBalance = (movements) => {
  const balance = movements.reduce((acc, mov) => acc + mov.value, 0);
  labelBalance.textContent = `${balance.toFixed(2)}€`;
};
const calcAndDisplaySummary = (currentAccount) => {
  const { movements } = currentAccount;

  const income = movements
    .filter((mov) => mov.value > 0)
    .reduce((acc, mov) => acc + mov.value, 0);
  labelSumIn.textContent = `${income.toFixed(2)}€`;

  const out = movements
    .filter((mov) => mov.value < 0)
    .reduce((acc, mov) => acc + mov.value, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  //calculo de interes
  //Teniendo en cuenta solo ingresos superiores a 100€
  //y que el interes es de cada usuario
  // de al menos 2€
  const interest = movements
    .filter((mov) => mov.value > 100)
    .map((mov) => (mov.value * currentAccount.interestRate) / 100)
    .filter((int) => int >= 2)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

// FUNCION TRANSFERENCIAS
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();

  const transferTo = inputTransferTo.value;
  const transferAmount = Number(inputTransferAmount.value);

  const recipient = accounts.find((account) => account.owner === transferTo);
  const balance = activeAccount.movements.reduce(
    (acc, mov) => acc + mov.value,
    0
  );

  if (!recipient) return swal("El usuario destino no existe.", "", "error");
  if (transferAmount <= 0)
    return swal("Ingrese una cantidad válida para transferir.", "", "error");
  if (transferAmount > balance)
    return swal("No tienes suficiente dinero en tu cuenta.", "", "error");

  recipient.movements.push({
    date: new Date().toISOString(),
    value: transferAmount,
  });
  activeAccount.movements.push({
    date: new Date().toISOString(),
    value: -transferAmount,
  });
  inputTransferTo.value = inputTransferAmount.value = "";
  swal({
    title: `Transferencia de ${transferAmount} €`,
    text: `a ${transferTo} realizada con exito`,
    icon: "success",
  });
  updateUI(activeAccount);
});

// FUNCIÓN PRÉSTAMOS
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();

  // importe préstamo
  const loan = Number(inputLoanAmount.value);

  if (loan <= 0) {
    swal({
      title: `Prestamo de: ${loan} €`,
      text: "No ha ingresado un valor válido",
      icon: "success",
    });
    return;
  }
  activeAccount.movements.push({
    date: new Date().toISOString(),
    value: loan,
  });

  inputLoanAmount.value = "";
  swal({
    title: `Prestamo de: ${loan} €`,
    text: "solicitado con éxito",
    icon: "success",
  });
  updateUI(activeAccount);
});

//FUNCIÓN SORT
let sortAsc = false;

// Función auxiliar para convertir fechas a objetos Date
const toDate = (dateStr) => new Date(dateStr);

// Función de ordenar
const fnSort = () => {
  const { movements } = activeAccount;
  sortAsc = !sortAsc; // Cambiar orden de clasificación
  movements.sort((a, b) =>
    sortAsc ? toDate(a.date) - toDate(b.date) : toDate(b.date) - toDate(a.date)
  );
  displayMovements(movements);
};

// Listener para el botón de ordenar
btnSort.addEventListener("click", (e) => {
  e.preventDefault();
  fnSort();
});

//FUNCION LOGOUT
// Define la variable para el tiempo restante
let timer = 5 * 60; // 5 minutos en segundos
// Función para actualizar el contador cada segundo
function startTimer() {
  if (timer > 0) {
    // Calcula los minutos y segundos restantes
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    // Actualiza el texto del elemento
    labelTimer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    // Resta 1 segundo del tiempo restante
    timer--;
    // Llama a la función de nuevo después de 1 segundo
    setTimeout(startTimer, 1000);
  } else {
    // Si el tiempo ha expirado, llama a la función de logout
    logout();
  }
}
// Función para hacer logout
function logout() {
  activeAccount = {};
  inputLoginUsername.value = inputLoginPin.value = "";
  containerApp.style.opacity = 0;
  labelWelcome.textContent = "Log in to get started";
  location.reload();
}
// Detiene el contador si el usuario hace logout manualmente antes de que expire el tiempo
function stopTimer() {
  clearTimeout();
}
//Boton logout
btnClose.addEventListener("click", (e) => {
  e.preventDefault();
  swal("Sesión terminada, gracias por usar nuestros servicios").then(() => {
    logout();
    // location.reload();
  });
  console.log("Cerrar sesión");
});

//FECHA ACTUAL
const currentDate = new Date();
labelDate.textContent = currentDate.toLocaleDateString();
