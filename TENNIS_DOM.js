// Устанавливаем размеры поля
let widthAr = 800;
let heightAr = 500;

let area = document.getElementById('area');
area.style.width = `${widthAr}px`;
area.style.height = `${heightAr}px`;

// Событие на кнопку Старт
let buttonStart = document.getElementById('butStart');
buttonStart.onclick = start; /* */ 

// Работа с ракетками
let racketLeft = document.getElementById('lRacket');
let racketRight = document.getElementById('rRacket');

let racketHeight = parseFloat(getComputedStyle(document.getElementById("lRacket")).height);
let racketWidth = parseFloat(getComputedStyle(document.getElementById("lRacket")).width);

// площадь в которой движутся ракетки
let racketArea = {
    width : racketWidth,
    height : heightAr /* ?????*/ 
};

// площадь в которой двигается мяч
let areaH = {
    width: widthAr, /* 800*/
    height: heightAr /* 500*/
}

//Мяч и его начальные позиции
let ball = document.getElementById('ball');

let heightBall = parseFloat(getComputedStyle(document.getElementById("ball")).height);
let widthBall = parseFloat(getComputedStyle(document.getElementById("ball")).width);

// Объект управления положением мяча и его движением
let ballPos ={
    posX: (widthAr - widthBall) / 2,
	posY: (heightAr - heightBall) / 2,
	speedX: 0, 
	speedY: 0, 
	width: widthBall,
	height: heightBall,

    ballStartPos: function (){
        ball.style.left = this.posX + "px";
        ball.style.top = this.posY + "px";
    }
}

// Вызываем функцию, чтобы мяч стал в начальную позицию
ballPos.ballStartPos();


// Устанавливаем начальные позиции ракетов
let racketH = {
    // Левая ракетка, её начальные позиции и скорость
    racketLeftX: 0,
    racketLeftY: (heightAr - racketHeight)/2,
	racketLeftSpeed: 0,

    // Правая ракетка, её начальные позиции и скорость
    racketRightX: (widthAr - racketWidth),
    racketRightY: (heightAr - racketHeight)/2,
	racketRightSpeed: 0,

    racketStartPos: function () {

        racketLeft.style.left = this.racketLeftX + "px";
        racketLeft.style.top = this.racketLeftY + "px";

        racketRight.style.left = this.racketRightX + "px";
        racketRight.style.top = this.racketRightY + "px";
    }

};

// Вызываем функцию, чтобы ракетки стали в начальную позицию
racketH.racketStartPos();

// Счетчик голов
const scoreBoard = document.getElementById('scoreBoard');
    let score1 = 0;
    let score2 = 0;
// Вызываем функцию
scoreBoardInnerHTML();

// Хранит соотвествие между клавишами и скоростью
const controls = {
    "ControlLeft": { player: "racketLeftSpeed", speed: 5 }, // Левая ракетка вниз (Ctrl)
    "ShiftLeft": { player: "racketLeftSpeed", speed: -5 }, // Левая ракетка вверх (Shift)
    "ArrowDown": { player: "racketRightSpeed", speed: 5 }, // Правая ракетка вниз 
    "ArrowUp": { player: "racketRightSpeed", speed: -5 } // Правая ракетка вверх 
}

// При нажатии клавиши
window.addEventListener("keydown", function(eo) {
    if (controls[eo.code]) {  
        eo.preventDefault();
        racketH[controls[eo.code].player] = controls[eo.code].speed;
    }
});

// При отпускании клавиши
window.addEventListener("keyup", function(eo) {
    if (controls[eo.code]) {  
        eo.preventDefault();
        racketH[controls[eo.code].player] = 0;
    }
});

// Функция для счётчика
function scoreBoardInnerHTML() {
    scoreBoard.innerHTML = score1 + ':' + score2;
};


function moveRackets() {
    racketH.racketStartPos();
    racketH.racketLeftY += racketH.racketLeftSpeed;
    racketH.racketRightY += racketH.racketRightSpeed;

    // Ограничения для левой ракетки
    if (racketH.racketLeftY + racketHeight > racketArea.height) {
        racketH.racketLeftY = racketArea.height - racketHeight;
    }
    // вылетела ли левая ракетка выше потолка?
    if (racketH.racketLeftY < 0) {
        racketH.racketLeftY = 0;
    }

    // Ограничения для правой ракетки
    if (racketH.racketRightY + racketHeight > racketArea.height) {
        racketH.racketRightY = racketArea.height - racketHeight;
    }

    // вылетела ли левая ракетка выше потолка?
    if (racketH.racketRightY < 0) {
        racketH.racketRightY = 0;
    }

    // Применение новых позиций к стилям
    racketLeft.style.top = racketH.racketLeftY + "px";
    racketRight.style.top = racketH.racketRightY + "px";

    requestAnimationFrame(moveRackets); // Постоянно обновляем движение ракеток
}

// Запускаем движение ракеток сразу
moveRackets();

let ballStopped = false; // флаг остановки мяча после гола

function moveBall() {
    if (ballStopped) return; // Если мяч остановлен, выходим из функции

    ballPos.posX += ballPos.speedX;
    ballPos.posY += ballPos.speedY;

    // Проверка столкновения с верхней и нижней границей
    if (ballPos.posY <= 0 || ballPos.posY + ballPos.height >= areaH.height) {
        ballPos.speedY = -ballPos.speedY;
    }

    // Проверка столкновения с левой ракеткой
    if (
        ballPos.posX <= racketH.racketLeftX + racketWidth &&
        ballPos.posY + ballPos.height >= racketH.racketLeftY &&
        ballPos.posY <= racketH.racketLeftY + racketHeight
    ) {
        ballPos.speedX = -ballPos.speedX;
        ballPos.posX = racketH.racketLeftX + racketWidth; // фиксируем мяч, чтобы он не застревал
    }

    // Проверка столкновения с правой ракеткой
    if (
        ballPos.posX + ballPos.width >= racketH.racketRightX &&
        ballPos.posY + ballPos.height >= racketH.racketRightY &&
        ballPos.posY <= racketH.racketRightY + racketHeight
    ) {
        ballPos.speedX = -ballPos.speedX;
        ballPos.posX = racketH.racketRightX - ballPos.width; 
    }

    // Проверка на гол (мяч вылетел за границы поля)
    if (ballPos.posX <= 0) {
        score2++; // Правая сторона получает гол
        resetBall();
    } else if (ballPos.posX + ballPos.width >= areaH.width) {
        score1++; // Левая сторона получает гол
        resetBall();
    }

    // Применение новых позиций к мячу
    ball.style.left = ballPos.posX + "px";
    ball.style.top = ballPos.posY + "px";

    requestAnimationFrame(moveBall);
}

// Функция сброса мяча после гола
function resetBall() {
    ballStopped = true; //  флаг, чтобы мяч больше не двигался
    ballPos.speedX = 0;
    ballPos.speedY = 0;

    scoreBoardInnerHTML(); // Обновляем счёт
}




// Функция для запуска игры
function start(){
    ballStopped = false; // Сбрасываем флаг при старте

    // возвращаем мяч в центр
    ballPos.posX = (widthAr - ballPos.width) / 2; 
    ballPos.posY = (heightAr - ballPos.height) / 2;
    ballPos.speedX = 4;
	ballPos.speedY = 2;

    let angle;
    do {
        angle = Math.random() * (Math.PI * 2); 
    } while (Math.abs(Math.cos(angle)) < 0.4); // исключаем слишком вертикальные направления

    let speed = 4; 
    ballPos.speedX = Math.cos(angle) * speed;
    ballPos.speedY = Math.sin(angle) * speed;

    // возвращаем ракетки в начальные позиции
    racketH.racketLeftY = (heightAr - racketHeight) / 2;
    racketH.racketRightY = (heightAr - racketHeight) / 2;
    racketH.racketStartPos(); // применяем новые позиции

    moveBall(); // запускаем движение мяча
}
