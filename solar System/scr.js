// класс для мигающих звёзд с рандомными параметрами
class Star {
  constructor(width, height, baseScale) {
    this.x = Math.random() * width; // координаты звёзд на canvas
    this.y = Math.random() * height;
    
    // Уменьшаем радиус на мобильных устройствах
    this.radius = Math.random() * (1.5 / baseScale) + 0.5; // базовый радиус
    this.baseAlpha = Math.random() * 0.5 + 0.3; // базовая прозрачность
    this.alpha = this.baseAlpha; // текущая прозрачность(будет изменяться для мигания)
    this.twinkleSpeed = Math.random() * 0.02 + 0.005; // скорость мерцания
    this.twinkleDirection = Math.random() < 0.5 ? -1 : 1; // направление мерцания

    const starColors = ["#ffffff", "#ffe9c4", "#d4fbff", "#ffd1dc", "#c4dfff"];
    this.color = starColors[Math.floor(Math.random() * starColors.length)];
  }

  // мерцание звёзд(изменение прозрачности alpha)
  update() {
    this.alpha += this.twinkleSpeed * this.twinkleDirection;
    if (this.alpha >= 1) {
      this.alpha = 1;
      this.twinkleDirection = -1;
    }
    if (this.alpha <= this.baseAlpha) {
      this.alpha = this.baseAlpha;
      this.twinkleDirection = 1;
    }
  }

  // отрисовка звёзд на canvas
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10; // размытость тени
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // рисуем круг
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

let stars = [];

class Planet {
  constructor({ name, imageSrc, size, distance, speed, satellites = [] }) {
    this.name = name;
    this.image = new Image();
    this.image.src = imageSrc;
    this.size = size;
    this.distance = distance;
    this.speed = speed;
    this.angle = Math.random() * Math.PI * 2;
    this.satellites = satellites.map((s) => new Planet(s)); // для спутника луны
    this.hover = false;

    // для пульсации Солнца
    this.pulseTime = 0;
  }

  //замедление или ускорение анимации времени
  update(timeMultiplier) {
    this.angle += this.speed * timeMultiplier;
    if (this.name === "Sun") {
      this.pulseTime += 0.01; // скорость пульсации
    }
    for (const s of this.satellites) s.update(timeMultiplier);
  }

  //координаты планеты на орбите
  getPosition(centerX, centerY, scale) {
    const orbit = this.distance * scale; //радиус орбиты на экране
    return {
      x: centerX + Math.cos(this.angle) * orbit, //
      y: centerY + Math.sin(this.angle) * orbit,
    };
  }

  draw(ctx, centerX, centerY, scale) {
    const orbit = this.distance * scale; //радиус орбиты на экране
    const size = this.size * scale; //размер планеты на экране

    const { x, y } = this.getPosition(centerX, centerY, scale);

    //если это Солнце, рисуем свечение
    if (this.name === "Sun") {
      const pulse = Math.sin(this.pulseTime) * 0.3 + 1; // от 0.7 до 1.3
      const glowSize = size * 2.5 * pulse;

      const gradient = ctx.createRadialGradient(
        x,
        y,
        size * 0.5,
        x,
        y,
        glowSize
      );
      gradient.addColorStop(0, "rgba(255, 255, 0, 0.9)");
      gradient.addColorStop(0.5, "rgba(255, 165, 0, 0.5)");
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    //рисуем орбиту (если не Солнце)
    if (this.distance > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
      ctx.arc(centerX, centerY, orbit, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.drawImage(this.image, x - size, y - size, size * 2, size * 2);

    //спутники
    for (const s of this.satellites) {
      s.draw(ctx, x, y, scale * 0.5);
    }

    //обводка при наведении
    if (this.hover) {
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.arc(x, y, size + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  //наведена ли мышка на планету. CenterX, CenterY - центр солнечной системы
  isHovered(mouseX, mouseY, centerX, centerY, scale) {
    const size = this.size * scale; // Визуальный радиус планеты с учетом масштаба
    const { x, y } = this.getPosition(centerX, centerY, scale); // Координаты планеты на холсте
    const dx = mouseX - x; // Расстояние от мыши до центра планеты
    const dy = mouseY - y;
    return dx * dx + dy * dy <= size * size;
  }
  
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("solar-canvas");
  const ctx = canvas.getContext("2d"); //метод, который запрашивает у элемента <canvas> объект контекста рисования
  const tooltip = document.getElementById("tooltip");
  const infoBox = document.getElementById("planet-info");
  const timeSlider = document.getElementById("time-slider");

  let centerX,
    centerY,
    scale = 1,
    baseScale = 1,
    offsetX = 0,
    offsetY = 0;
  let planets = [];
  let timeMultiplier = 1;
  let focusedPlanet = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2; 
    centerY = canvas.height / 2;
  
    // Масштабируем звезды в зависимости от разрешения
    const minSize = Math.min(canvas.width, canvas.height);
    baseScale = minSize / 1200; // Масштаб сцены на основе экрана
  
    // создаем звезды
    stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push(new Star(canvas.width, canvas.height, baseScale)); // передаем масштаб
    }
  }




  // function resizeCanvas() {
  //   canvas.width = window.innerWidth; //устанавливает ширину канваса равной ширине окна браузера
  //   canvas.height = window.innerHeight;
  //   centerX = canvas.width / 2; //вычисляем центр экрана(это будет место Солнца)
  //   centerY = canvas.height / 2;


  //   // baseScale = canvas.width / 1000; //масштаб сцены на основе ширины экрана

  //   // Масштаб — функция от минимального размера экрана, чтобы планеты влезали
  //   const minSize = Math.min(canvas.width, canvas.height);
  //   baseScale = minSize / 1200;

  //   //создаем звёздочкти
  //   stars = [];
  //   for (let i = 0; i < 200; i++) {
  //     stars.push(new Star(canvas.width, canvas.height));
  //   }
  // }

  const planetData = [
    { name: "Sun", imageSrc: "img/sun.png", size: 15, distance: 0, speed: 0 },
    {
      name: "Mercury",
      imageSrc: "img/mercury.png",
      size: 2,
      distance: 20,
      speed: 0.035,
    },
    {
      name: "Venus",
      imageSrc: "img/venus.png",
      size: 3.6,
      distance: 30,
      speed: 0.028,
    },
    {
      name: "Earth",
      imageSrc: "img/earth.png",
      size: 4,
      distance: 50,
      speed: 0.025,
      satellites: [
        {
          name: "Moon",
          imageSrc: "img/moon.png",
          size: 1,
          distance: 5,
          speed: 0.1,
        },
      ],
    },
    {
      name: "Mars",
      imageSrc: "img/mars.png",
      size: 3,
      distance: 70,
      speed: 0.018,
    },
    {
      name: "Jupiter",
      imageSrc: "img/jupiter.png",
      size: 10,
      distance: 80,
      speed: 0.015,
    },
    {
      name: "Saturn",
      imageSrc: "img/saturn.png",
      size: 9,
      distance: 105,
      speed: 0.012,
    },
    {
      name: "Uranus",
      imageSrc: "img/uranus.png",
      size: 7,
      distance: 125,
      speed: 0.009,
    },
    {
      name: "Neptune",
      imageSrc: "img/neptune.png",
      size: 6.6,
      distance: 145,
      speed: 0.007,
    },
  ];

  // let planetData = [];

  // function loadPlanetsFromServer() {
  //   const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
  //   const stringName = "TADZHYEWA_SOLARSYSTEM";

  //   fetch(ajaxHandlerScript + "?f=READ&n=" + encodeURIComponent(stringName))
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log("Ответ с сервера:", data.result);  // добавьте это

  //       if (data && data.result) {
  //         try {
  //           if (typeof data.result === "string") {
  //             planetData = JSON.parse(data.result);
  //         } else {
  //             planetData = data.result;
  //         }

  //         } catch (e) {
  //           console.error("Ошибка при разборе JSON:", e, data.result);
  //           return;
  //         }
  //         initPlanets();  // создаём объекты Planet на основе полученных данных
  //         resizeCanvas();
  //         animate();
  //       } else {
  //         console.error("данные не получены.");
  //       }
  //     })

  //превращаем планеты в экземпляры класса Planet
  function initPlanets() {
    planets = planetData.map((p) => new Planet(p));
  }

  // function initPlanets() {
  //   planets = planetData.map(p => new Planet(p));
  // }

  function draw() {
    // очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // рисуем чёрный фон
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // рисуем звезды (звезды не изменяют масштаб)
    for (const star of stars) {
      star.update();
      star.draw(ctx);  // Звезды рисуются независимо от масштаба
    }
  
    // центр с учётом смещения
    const cx = centerX + offsetX;
    const cy = centerY + offsetY;
    
    // Рисуем планеты с учетом масштаба
    const actualScale = baseScale; // Здесь применяем масштаб только к планетам и орбитам
    
    for (const p of planets) {
      p.update(timeMultiplier);
    }
  
    // рисуем планеты
    for (const p of planets) {
      p.draw(ctx, cx, cy, actualScale);
    }
  }
  

  canvas.addEventListener("mousemove", (e) => {
    let hovered = false; // флаг: есть ли хотя бы одна планета, над которой сейчас находится курсор
    for (const p of planets) {
      // Здесь учитываем смещение и масштаб
      const scaleAdjusted = baseScale; // Применяем масштаб
      const isMouseOverPlanet = p.isHovered(
        e.offsetX,
        e.offsetY,
        centerX + offsetX,
        centerY + offsetY,
        scaleAdjusted
      );
  
      if (isMouseOverPlanet) {
        p.hover = true;
        hovered = true;
        tooltip.style.left = e.pageX + 10 + "px"; // Позиционируем подсказку с названием планеты
        tooltip.style.top = e.pageY + "px";
        tooltip.innerText = p.name;
        tooltip.style.display = "block";
        canvas.style.cursor = "pointer";
      } else {
        p.hover = false; // Если курсор не над планетой - снимаем флаг
      }
    }
  
    if (!hovered) {
      // Если ни одна планета не была под курсором, скрываем подсказку и восстанавливаем обычный курсор
      tooltip.style.display = "none";
      canvas.style.cursor = "default";
    }
  });
  

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    baseScale *= e.deltaY < 0 ? 1.1 : 0.9;
  });

  window.addEventListener("keydown", (e) => {
    const step = 20;
    if (e.key === "ArrowUp") offsetY += step;
    if (e.key === "ArrowDown") offsetY -= step;
    if (e.key === "ArrowLeft") offsetX += step;
    if (e.key === "ArrowRight") offsetX -= step;
  });

  let actualTimeMultiplier = 0.5;
  let isAnimationRunning = true; //флаг - идёт ли сейчас анимация

  //событие изменение ползунка
  timeSlider.addEventListener("input", () => {
    //   timeMultiplier = parseFloat(timeSlider.value);
    actualTimeMultiplier = parseFloat(timeSlider.value);
    if (isAnimationRunning) {
      //если анимация активна, то
      timeMultiplier = actualTimeMultiplier;
    }
  });

  function animate() {
    draw();
    requestAnimationFrame(animate);
  }

  document.getElementById("start-button").addEventListener("click", () => {
    const startScreen = document.getElementById("start-screen");
    startScreen.classList.add("hidden");

    setTimeout(() => {
      canvas.classList.add("visible");
      canvas.style.display = "block";
      initPlanets();
      resizeCanvas();
      animate();
    }, 1000); // время должно совпадать с transition в CSS
  });

  window.addEventListener("resize", resizeCanvas);

  document.getElementById("btn-start").addEventListener("click", () => {
    isAnimationRunning = true;
    timeMultiplier = actualTimeMultiplier;
  });

  document.getElementById("btn-stop").addEventListener("click", () => {
    isAnimationRunning = false;
    timeMultiplier = 0;
  });

  const closeInfo = document.getElementById("close-info");

  //див с информацией о планете
  canvas.addEventListener("click", (e) => {
    let clicked = false;
    for (const p of planets) {
      if (
        p.isHovered(
          e.offsetX,
          e.offsetY,
          centerX + offsetX,
          centerY + offsetY,
          baseScale

        )
      ) {
        focusedPlanet = p;  // Устанавливаем планету как активную
  
        // Виброотклик
        if ("vibrate" in navigator) {
          switch (p.name) {
            case "Sun":
              navigator.vibrate(100);
              break;
            case "Earth":
              navigator.vibrate([50, 100, 50]);
              break;
            default:
              navigator.vibrate(50);
          }
        }
  
        playClickSound(); // Щелчок при клике
  
        // Обновляем информацию о планете в infoBox
        infoBox.innerHTML = `
          <button id="close-info">&times;</button>
          <h2>${p.name}</h2>
          <p><strong>Скорость вращения:</strong> ${p.speed.toFixed(3)}</p>
          <p><strong>Орбита:</strong> ${p.distance} млн. км</p>
          <p><strong>Размер:</strong> ${p.size} (отн. масштаба)</p>
        `;
        infoBox.classList.remove("hidden");
        infoBox.classList.add("visible");
        attachCloseHandler();
        clicked = true;
      }
    }
  
    if (!clicked) {
      hideInfoBox(); // Если клик не по планете, скрываем информацию
    }
  });
  
  function hideInfoBox() {
    infoBox.classList.remove("visible");
    setTimeout(() => {
      infoBox.classList.add("hidden");
    }, 400); // Подождем завершения анимации исчезновения
  }
  
  function attachCloseHandler() {
    const btn = document.getElementById("close-info");
    if (btn) {
      btn.addEventListener("click", hideInfoBox);
    }
  }
  
  // Звуки
  const clickSound = new Audio("click.mp3"); // файл щелчка
  const backgroundMusic = new Audio("background-music.mp3"); // фоновая музыка
  backgroundMusic.loop = true; // музыка будет зациклена

  // Функция для воспроизведения щелчка
  function playClickSound() {
    clickSound.play();
  }

  // Функция для воспроизведения фоновой музыки
  function playBackgroundMusic() {
    backgroundMusic.play();
  }

  // Слушаем кнопку "Начать"
  document.getElementById("start-button").addEventListener("click", () => {
    playClickSound(); // Воспроизводим звук щелчка

    const startScreen = document.getElementById("start-screen");
    startScreen.classList.add("hidden"); // Скрываем стартовый экран

    setTimeout(() => {
      // Включаем видимость и эффект масштабирования для канваса и миникарты
      canvas.classList.add("visible");
      // minimap.classList.add("visible");

      // Показать canvas и минимапу
      canvas.style.display = "block";
      // minimap.style.display = "block";
      initPlanets();
      resizeCanvas();
      animate();

      playBackgroundMusic(); // Воспроизводим фоновую музыку
    }, 1000); // Ждем завершения анимации исчезновения стартового экрана
  });

  // Обработка жестов для увеличения/уменьшения масштаба и перетаскивания
// 

// let startDistance = 0; // Начальное расстояние между пальцами
// let startOffsetX = offsetX; // Начальное смещение по оси X
// let startOffsetY = offsetY; // Начальное смещение по оси Y
// let isDragging = false; // Флаг для отслеживания перетаскивания

// canvas.addEventListener("touchstart", (e) => {
//   if (e.touches.length === 1) {
//     // Если одно касание (начало перетаскивания)
//     isDragging = true;
//     startOffsetX = offsetX;
//     startOffsetY = offsetY;
//   } else if (e.touches.length === 2) {
//     // Если два касания (начало зума)
//     const dx = e.touches[1].clientX - e.touches[0].clientX;
//     const dy = e.touches[1].clientY - e.touches[0].clientY;
//     startDistance = Math.sqrt(dx * dx + dy * dy);
//   }
// });

// canvas.addEventListener("touchmove", (e) => {
//   if (e.touches.length === 1 && isDragging) {
//     // Перетаскивание
//     const deltaX = e.touches[0].clientX - canvas.offsetLeft;
//     const deltaY = e.touches[0].clientY - canvas.offsetTop;
//     offsetX = startOffsetX + deltaX;
//     offsetY = startOffsetY + deltaY;
//   } else if (e.touches.length === 2) {
//     // Масштабирование
//     const dx = e.touches[1].clientX - e.touches[0].clientX;
//     const dy = e.touches[1].clientY - e.touches[0].clientY;
//     const newDistance = Math.sqrt(dx * dx + dy * dy);
    
//     if (startDistance !== 0) {
//       const scaleRatio = newDistance / startDistance;
//       baseScale *= scaleRatio; // Изменяем масштаб
//     }
//     startDistance = newDistance; // Обновляем начальное расстояние для следующего движения
//   }
// });

// canvas.addEventListener("touchend", (e) => {
//   if (e.touches.length < 2) {
//     startDistance = 0; // сбросить расстояние после отпускания пальцев
//   }

//   if (e.touches.length === 0) {
//     // Если все касания закончены, завершить перетаскивание
//     isDragging = false;
//   }
// });

let isTouchDragging = false;
let touchStartX = 0;
let touchStartY = 0;
let initialOffsetX = 0;
let initialOffsetY = 0;

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    isTouchDragging = true;

    // сохраняем начальную позицию касания и текущие смещения
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    initialOffsetX = offsetX;
    initialOffsetY = offsetY;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (isTouchDragging && e.touches.length === 1) {
    const touch = e.touches[0];

    // смещение пальца от начальной точки касания
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // задаем новое смещение канваса
    offsetX = initialOffsetX + dx;
    offsetY = initialOffsetY + dy;

    e.preventDefault(); // предотвращаем скролл страницы
  }
});

canvas.addEventListener("touchend", (e) => {
  isTouchDragging = false;
});

canvas.addEventListener("touchcancel", () => {
  isTouchDragging = false;
});





});
