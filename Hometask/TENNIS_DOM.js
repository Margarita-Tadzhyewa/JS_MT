// Устанавливаем размеры поля
let widthAr = '800px';
let heightAr = '500px';

let area = document.getElementById('area');
area.style.width = widthAr;
area.style.height = heightAr;

// Событие на кнопку Старт
let buttonStart = document.getElementById('butStart');
butStart.onclick = start;

// Работа с ракетками
let racketLeft = document.getElementById('lRacket');
let racketRight = document.getElementById('rRacket');
let height = parseFloat(getComputedStyle(document.getElementById("lRacket")).height);
let width = parseFloat(getComputedStyle(document.getElementById("lRacket")).width);

// площадь в которой движутся ракетки
let racketArea = {
    widthRacketArea : width,
    height : area.getBoundingClientRect().height
};

//Мяч и его начальные позиции
let ball = document.getElementById('ball');

let heightBall = parseFloat(getComputedStyle(document.getElementById("ball")).height);
let widthBall = parseFloat(getComputedStyle(document.getElementById("ball")).width);

// Объект управления положением мяча и его движением
let ballPos ={
    posX: area.getBoundingClientRect().left + area.getBoundingClientRect().width/2 - ball.getBoundingClientRect().width/2,
	posY: area.getBoundingClientRect().top + area.getBoundingClientRect().height/2 - ball.getBoundingClientRect().height/2,
	speedX: 0, //ballH.speedX = 4
	speedY: 0, //ballH.speedY = 2
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
    racketLeftX: area.getBoundingClientRect().left,
    racketLeftY: area.getBoundingClientRect().top + area.getBoundingClientRect().height/2 - racketLeft.getBoundingClientRect().height/2,
	racketLeftSpeed: 0,

    // Правая ракетка, её начальные позиции и скорость
    racketRightX: area.getBoundingClientRect().left + area.getBoundingClientRect().width - racketRight.getBoundingClientRect().width,
    racketRightY: area.getBoundingClientRect().top + area.getBoundingClientRect().height/2 - racketRight.getBoundingClientRect().height/2,
	racketRightSpeed: 0,

    racketStartPos: function () {
        let self = this;

        racketLeft.style.left = this.racketLeftX + "px";
        racketLeft.style.top = this.racketLeftY + "px";

        racketRight.style.left = this.racketRightX + "px";
        racketRight.style.top = this.racketRightY + "px";
    }

};

// Вызываем функцию, чтобы ракетки стали в начальную позицию
racketH.racketStartPos();

// Хранит соотвествие между клавишами и скоростью
const controls = {
    "ControlLeft": { player: "racketLeftSpeed", speed: 5 }, // Левая ракетка вниз (Ctrl)
    "ShiftLeft": { player: "racketLeftSpeed", speed: -5 }, // Левая ракетка вверх (Shift)
    "ArrowDown": { player: "racketRightSpeed", speed: 5 }, // Правая ракетка вниз 
    "ArrowUp": { player: "racketRightSpeed", speed: -5 } // Правая ракетка вверх 
}

// При нажатии клавиши
window.addEventListener("keydown", function(event) {
    if (controls[event.code]) {  // Используем event.code вместо event.key
        event.preventDefault();
        racketH[controls[event.code].player] = controls[event.code].speed;
    }
});

// При отпускании клавиши
window.addEventListener("keyup", function(event) {
    if (controls[event.code]) {  // Используем event.code вместо event.key
        event.preventDefault();
        racketH[controls[event.code].player] = 0;
    }
});


function moveRackets() {
    racketH.racketLeftY += racketH.racketLeftSpeed;
    racketH.racketRightY += racketH.racketRightSpeed;

    // Ограничения для левой ракетки
    if (racketH.racketLeftY < area.getBoundingClientRect().top) {
        racketH.racketLeftY = area.getBoundingClientRect().top;
    }
    if (racketH.racketLeftY + height > area.getBoundingClientRect().top + racketArea.height) {
        racketH.racketLeftY = area.getBoundingClientRect().top + racketArea.height - height;
    }

    // Ограничения для правой ракетки
    if (racketH.racketRightY < area.getBoundingClientRect().top) {
        racketH.racketRightY = area.getBoundingClientRect().top;
    }
    if (racketH.racketRightY + height > area.getBoundingClientRect().top + racketArea.height) {
        racketH.racketRightY = area.getBoundingClientRect().top + racketArea.height - height;
    }

    // Применение новых позиций к стилям
    racketLeft.style.top = racketH.racketLeftY + "px";
    racketRight.style.top = racketH.racketRightY + "px";

    requestAnimationFrame(moveRackets); // Постоянно обновляем движение ракеток
}

// Запускаем движение ракеток сразу
moveRackets();

function moveBall() {
    ballPos.posX += ballPos.speedX;
    ballPos.posY += ballPos.speedY;

    if (ballPos.posY <= area.getBoundingClientRect().top || ballPos.posY + ballPos.height >= area.getBoundingClientRect().top + racketArea.height) {
        ballPos.speedY = -ballPos.speedY;
    }

    if (
        (ballPos.posX <= racketH.racketLeftX + width && ballPos.posY + ballPos.height >= racketH.racketLeftY && ballPos.posY <= racketH.racketLeftY + height) ||
        (ballPos.posX + ballPos.width >= racketH.racketRightX && ballPos.posY + ballPos.height >= racketH.racketRightY && ballPos.posY <= racketH.racketRightY + height)
    ) {
        ballPos.speedX = -ballPos.speedX;
    }

    ball.style.left = ballPos.posX + "px";
    ball.style.top = ballPos.posY + "px";

    requestAnimationFrame(moveBall);
}

// function moveBall() {
//     // Движение мяча
//     ballPos.posX -= ballPos.speedX;
//     ballPos.posY -= ballPos.speedY;

//     // Проверка на столкновение с левой границей (пропущенный гол)
//     if ((ballPos.posY + ballPos.height < racketH.racketLeftY || ballPos.posY > (racketH.racketLeftY + height)) && ballPos.posX <= area.getBoundingClientRect().left) {
//         ballPos.speedX = 0;
//         ballPos.speedY = 0;
//         ballPos.posX = area.getBoundingClientRect().left + 1;
//     } else if (!(ballPos.posY + ballPos.height < racketH.racketLeftY || ballPos.posY > (racketH.racketLeftY + height)) && ballPos.posX < (racketH.racketLeftX + width)) {
//         ballPos.speedX = -ballPos.speedX;
//         ballPos.posX = area.getBoundingClientRect().left + width;
//     }

//     // Проверка на столкновение с правой границей (пропущенный гол)
//     if ((ballPos.posY + ballPos.height < racketH.racketRightY || ballPos.posY > (racketH.racketRightY + height)) && ballPos.posX + ballPos.width >= area.getBoundingClientRect().left + area.getBoundingClientRect().width) {
//         ballPos.speedX = 0;
//         ballPos.speedY = 0;
//         ballPos.posX = area.getBoundingClientRect().left + area.getBoundingClientRect().width - ballPos.width - 1;
//     } else if (!(ballPos.posY + ballPos.height < racketH.racketRightY || ballPos.posY > (racketH.racketRightY + height)) && ballPos.posX + ballPos.width > racketH.racketRightX) {
//         ballPos.speedX = -ballPos.speedX;
//         ballPos.posX = area.getBoundingClientRect().left + area.getBoundingClientRect().width - width - ballPos.width;
//     }

//     // Проверка столкновения с полом
//     if (ballPos.posY + ballPos.height > area.getBoundingClientRect().top + racketArea.height) {
//         ballPos.speedY = -ballPos.speedY;
//         ballPos.posY = area.getBoundingClientRect().top + racketArea.height - ballPos.height;
//     }

//     // Проверка столкновения с потолком
//     if (ballPos.posY < area.getBoundingClientRect().top) {
//         ballPos.speedY = -ballPos.speedY;
//         ballPos.posY = area.getBoundingClientRect().top;
//     }
// }



// Функция для запуска игры
function start(){
    ballPos.speedX = 4;//4
	ballPos.speedY = 2;

    moveBall(); // Запускаем движение мяча
}
