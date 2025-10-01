// Глобальные переменные
var game = {
    width: 40,
    height: 24,
    map: [],
    hero: { x: 0, y: 0, health: 100, attack: 10 },
    enemies: [],
    swords: [],
    potions: [],
    gameField: null,
    isGameActive: true
};

// Инициализация игры
function initGame() {
    game.gameField = $('#game-field');
    generateMap();
    placeEntities();
    renderMap();
    setupControls();
    startEnemyMovement();
}

// Генерация карты
function generateMap() {
    // Заполняем всю карту стенами
    for (var y = 0; y < game.height; y++) {
        game.map[y] = [];
        for (var x = 0; x < game.width; x++) {
            game.map[y][x] = 'wall';
        }
    }
    
    // Создаем комнаты
    var roomCount = Math.floor(Math.random() * 6) + 5; // 5-10 комнат
    
    for (var i = 0; i < roomCount; i++) {
        var roomWidth = Math.floor(Math.random() * 6) + 3; // 3-8
        var roomHeight = Math.floor(Math.random() * 6) + 3; // 3-8
        
        // Находим случайное место для комнаты
        var startX = Math.floor(Math.random() * (game.width - roomWidth));
        var startY = Math.floor(Math.random() * (game.height - roomHeight));
        
        // Создаем комнату
        for (var y = startY; y < startY + roomHeight; y++) {
            for (var x = startX; x < startX + roomWidth; x++) {
                if (x >= 0 && x < game.width && y >= 0 && y < game.height) {
                    game.map[y][x] = 'floor';
                }
            }
        }
    }
    
    // Создаем проходы
    var verticalCorridors = Math.floor(Math.random() * 3) + 3; // 3-5
    var horizontalCorridors = Math.floor(Math.random() * 3) + 3; // 3-5
    
    // Вертикальные проходы
    for (var i = 0; i < verticalCorridors; i++) {
        var x = Math.floor(Math.random() * game.width);
        for (var y = 0; y < game.height; y++) {
            game.map[y][x] = 'floor';
        }
    }
    
    // Горизонтальные проходы
    for (var i = 0; i < horizontalCorridors; i++) {
        var y = Math.floor(Math.random() * game.height);
        for (var x = 0; x < game.width; x++) {
            game.map[y][x] = 'floor';
        }
    }
}

// Размещение сущностей
function placeEntities() {
    // Находим все пустые клетки
    var emptyCells = [];
    for (var y = 0; y < game.height; y++) {
        for (var x = 0; x < game.width; x++) {
            if (game.map[y][x] === 'floor') {
                emptyCells.push({ x: x, y: y });
            }
        }
    }
    
    // Помещаем героя
    var heroIndex = Math.floor(Math.random() * emptyCells.length);
    game.hero.x = emptyCells[heroIndex].x;
    game.hero.y = emptyCells[heroIndex].y;
    emptyCells.splice(heroIndex, 1);
    
    // Помещаем противников
    for (var i = 0; i < 10; i++) {
        if (emptyCells.length > 0) {
            var enemyIndex = Math.floor(Math.random() * emptyCells.length);
            var enemyPos = emptyCells[enemyIndex];
            game.enemies.push({
                x: enemyPos.x,
                y: enemyPos.y,
                health: 30
            });
            emptyCells.splice(enemyIndex, 1);
        }
    }
    
    // Помещаем мечи
    for (var i = 0; i < 2; i++) {
        if (emptyCells.length > 0) {
            var swordIndex = Math.floor(Math.random() * emptyCells.length);
            var swordPos = emptyCells[swordIndex];
            game.swords.push({
                x: swordPos.x,
                y: swordPos.y
            });
            emptyCells.splice(swordIndex, 1);
        }
    }
    
    // Помещаем зелья
    for (var i = 0; i < 10; i++) {
        if (emptyCells.length > 0) {
            var potionIndex = Math.floor(Math.random() * emptyCells.length);
            var potionPos = emptyCells[potionIndex];
            game.potions.push({
                x: potionPos.x,
                y: potionPos.y
            });
            emptyCells.splice(potionIndex, 1);
        }
    }
}

// Отрисовка карты
function renderMap() {
    game.gameField.empty();
    
    for (var y = 0; y < game.height; y++) {
        for (var x = 0; x < game.width; x++) {
            var tile = $('<div class="tile"></div>');
            
            // Устанавливаем класс тайла
            if (game.map[y][x] === 'wall') {
                tile.addClass('wall');
            } else {
                tile.addClass('floor');
            }
            
            // Добавляем сущности
            if (game.hero.x === x && game.hero.y === y) {
                tile.addClass('hero');
                // Добавляем полосу здоровья
                var healthPercent = game.hero.health;
                var healthBar = $('<div class="health"></div>').css('width', healthPercent + '%');
                tile.append(healthBar);
            }
            
            // Добавляем противников
            for (var i = 0; i < game.enemies.length; i++) {
                if (game.enemies[i].x === x && game.enemies[i].y === y) {
                    tile.addClass('enemy');
                    // Добавляем полосу здоровья
                    var enemyHealthPercent = Math.floor((game.enemies[i].health / 30) * 100);
                    var enemyHealthBar = $('<div class="health"></div>').css('width', enemyHealthPercent + '%');
                    tile.append(enemyHealthBar);
                }
            }
            
            // Добавляем мечи
            for (var i = 0; i < game.swords.length; i++) {
                if (game.swords[i].x === x && game.swords[i].y === y) {
                    tile.addClass('sword');
                }
            }
            
            // Добавляем зелья
            for (var i = 0; i < game.potions.length; i++) {
                if (game.potions[i].x === x && game.potions[i].y === y) {
                    tile.addClass('potion');
                }
            }
            
            game.gameField.append(tile);
        }
    }
    
    // Обновляем статистику
    $('#health-value').text(game.hero.health + '%');
    $('#attack-value').text(game.hero.attack);
    $('#enemies-count').text(game.enemies.length);
}

// Установка управления
function setupControls() {
    $(document).on('keydown', function(e) {
        if (!game.isGameActive) return;
        
        var dx = 0, dy = 0;
        
        switch (e.keyCode) {
            case 87: // W - вверх
                dy = -1;
                break;
            case 83: // S - вниз
                dy = 1;
                break;
            case 65: // A - влево
                dx = -1;
                break;
            case 68: // D - вправо
                dx = 1;
                break;
            case 32: // Пробел - атака
                attackEnemies();
                return;
            default:
                return;
        }
        
        moveHero(dx, dy);
    });
}

// Перемещение героя
function moveHero(dx, dy) {
    var newX = game.hero.x + dx;
    var newY = game.hero.y + dy;
    
    // Проверяем границы и стены
    if (newX < 0 || newX >= game.width || newY < 0 || newY >= game.height) {
        return;
    }
    
    if (game.map[newY][newX] === 'wall') {
        return;
    }
    
    // Проверяем столкновение с противниками
    var enemyIndex = -1;
    for (var i = 0; i < game.enemies.length; i++) {
        if (game.enemies[i].x === newX && game.enemies[i].y === newY) {
            enemyIndex = i;
            break;
        }
    }
    
    if (enemyIndex !== -1) {
        // Нельзя пройти через противника
        return;
    }
    
    // Перемещаем героя
    game.hero.x = newX;
    game.hero.y = newY;
    
    // Проверяем нахождение на мече или зелье
    checkItemInteraction();
    
    // Атака противников, если они рядом
    attackNearbyEnemies();
    
    // Обновляем отображение
    renderMap();
}

// Проверка взаимодействия с предметами
function checkItemInteraction() {
    // Проверка мечей
    for (var i = 0; i < game.swords.length; i++) {
        if (game.swords[i].x === game.hero.x && game.swords[i].y === game.hero.y) {
            game.hero.attack += 5; // Увеличиваем силу удара
            game.swords.splice(i, 1); // Удаляем меч
            break;
        }
    }
    
    // Проверка зелий
    for (var i = 0; i < game.potions.length; i++) {
        if (game.potions[i].x === game.hero.x && game.potions[i].y === game.hero.y) {
            game.hero.health = Math.min(100, game.hero.health + 20); // Восстанавливаем здоровье
            game.potions.splice(i, 1); // Удаляем зелье
            break;
        }
    }
}

// Атака всех противников на соседних клетках
function attackEnemies() {
    var directions = [
        { dx: 0, dy: -1 }, // вверх
        { dx: 1, dy: 0 },  // вправо
        { dx: 0, dy: 1 },  // вниз
        { dx: -1, dy: 0 }  // влево
    ];
    
    for (var i = 0; i < directions.length; i++) {
        var dx = directions[i].dx;
        var dy = directions[i].dy;
        var targetX = game.hero.x + dx;
        var targetY = game.hero.y + dy;
        
        for (var j = 0; j < game.enemies.length; j++) {
            if (game.enemies[j].x === targetX && game.enemies[j].y === targetY) {
                game.enemies[j].health -= game.hero.attack;
                
                if (game.enemies[j].health <= 0) {
                    game.enemies.splice(j, 1);
                    j--; // Корректируем индекс после удаления
                }
            }
        }
    }
    
    renderMap();
    
    // Проверка победы
    if (game.enemies.length === 0) {
        alert("Победа! Вы уничтожили всех противников!");
        game.isGameActive = false;
    }
}

// Атака героем противников, находящихся рядом
function attackNearbyEnemies() {
    var directions = [
        { dx: 0, dy: -1 }, // вверх
        { dx: 1, dy: 0 },  // вправо
        { dx: 0, dy: 1 },  // вниз
        { dx: -1, dy: 0 }  // влево
    ];
    
    for (var i = 0; i < directions.length; i++) {
        var dx = directions[i].dx;
        var dy = directions[i].dy;
        var targetX = game.hero.x + dx;
        var targetY = game.hero.y + dy;
        
        for (var j = 0; j < game.enemies.length; j++) {
            if (game.enemies[j].x === targetX && game.enemies[j].y === targetY) {
                game.enemies[j].health -= game.hero.attack;
                
                if (game.enemies[j].health <= 0) {
                    game.enemies.splice(j, 1);
                    j--; // Корректируем индекс после удаления
                }
            }
        }
    }
    
    renderMap();
    
    // Проверка победы
    if (game.enemies.length === 0) {
        alert("Победа! Вы уничтожили всех противников!");
        game.isGameActive = false;
    }
}

// Движение противников
function moveEnemies() {
    if (!game.isGameActive) return;
    
    for (var i = 0; i < game.enemies.length; i++) {
        var enemy = game.enemies[i];
        
        // Случайное движение (по одной оси)
        var direction = Math.floor(Math.random() * 4); // 0-вверх, 1-вправо, 2-вниз, 3-влево
        var dx = 0, dy = 0;
        
        switch (direction) {
            case 0: dy = -1; break; // вверх
            case 1: dx = 1; break;  // вправо
            case 2: dy = 1; break;  // вниз
            case 3: dx = -1; break; // влево
        }
        
        var newX = enemy.x + dx;
        var newY = enemy.y + dy;
        
        // Проверяем границы и стены
        if (newX < 0 || newX >= game.width || newY < 0 || newY >= game.height) {
            continue;
        }
        
        if (game.map[newY][newX] === 'wall') {
            continue;
        }
        
        // Проверяем столкновение с героем
        if (newX === game.hero.x && newY === game.hero.y) {
            // Атакуем героя
            game.hero.health -= 5;
            if (game.hero.health <= 0) {
                alert("Вы проиграли! Ваш герой погиб.");
                game.isGameActive = false;
                renderMap();
                return;
            }
            continue;
        }
        
        // Проверяем столкновение с другими противниками
        var canMove = true;
        for (var j = 0; j < game.enemies.length; j++) {
            if (i !== j && game.enemies[j].x === newX && game.enemies[j].y === newY) {
                canMove = false;
                break;
            }
        }
        
        if (canMove) {
            enemy.x = newX;
            enemy.y = newY;
        }
    }
    
    renderMap();
}

// Запуск движения противников
function startEnemyMovement() {
    setInterval(moveEnemies, 1000); // Каждую секунду
}

// Запуск игры при загрузке страницы
$(document).ready(function() {
    initGame();
});


// Функция показа экрана завершения
function showGameOverScreen(isWin) {
    game.isGameActive = false;
    
    var message = isWin ? "ПОБЕДА!" : "Попробуй ещё раз";
    var messageClass = isWin ? "win" : "lose";
    
    $('#game-over-message')
        .text(message)
        .removeClass('win lose')
        .addClass(messageClass);
    
    $('#game-over-screen').removeClass('hidden');
}

// Обновим проверку победы/поражения
function checkGameState() {
    if (game.enemies.length === 0) {
        showGameOverScreen(true);
        return;
    }
    
    if (game.hero.health <= 0) {
        showGameOverScreen(false);
        return;
    }
}

// В attackEnemies и moveEnemies заменим alert на вызов checkGameState

// В attackEnemies (вместо alert):
// if (game.enemies.length === 0) {
//     alert("Победа!...");
//     ...
// }
// Заменяем на:
function attackEnemies() {
    var directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
    ];
    
    for (var i = 0; i < directions.length; i++) {
        var dx = directions[i].dx;
        var dy = directions[i].dy;
        var targetX = game.hero.x + dx;
        var targetY = game.hero.y + dy;
        
        for (var j = 0; j < game.enemies.length; j++) {
            if (game.enemies[j].x === targetX && game.enemies[j].y === targetY) {
                game.enemies[j].health -= game.hero.attack;
                
                if (game.enemies[j].health <= 0) {
                    game.enemies.splice(j, 1);
                    j--;
                }
            }
        }
    }
    
    renderMap();
    checkGameState(); // Проверяем состояние игры
}

// В moveEnemies (вместо alert):
// if (game.hero.health <= 0) {
//     alert("Вы проиграли!...");
//     ...
// }
// Заменяем на:
function moveEnemies() {
    if (!game.isGameActive) return;
    
    for (var i = 0; i < game.enemies.length; i++) {
        var enemy = game.enemies[i];
        
        var direction = Math.floor(Math.random() * 4);
        var dx = 0, dy = 0;
        
        switch (direction) {
            case 0: dy = -1; break;
            case 1: dx = 1; break;
            case 2: dy = 1; break;
            case 3: dx = -1; break;
        }
        
        var newX = enemy.x + dx;
        var newY = enemy.y + dy;
        
        if (newX < 0 || newX >= game.width || newY < 0 || newY >= game.height) continue;
        if (game.map[newY][newX] === 'wall') continue;
        
        if (newX === game.hero.x && newY === game.hero.y) {
            game.hero.health -= 5;
            if (game.hero.health <= 0) {
                game.hero.health = 0;
                renderMap();
                checkGameState(); // Проверяем поражение
                return;
            }
            continue;
        }
        
        var canMove = true;
        for (var j = 0; j < game.enemies.length; j++) {
            if (i !== j && game.enemies[j].x === newX && game.enemies[j].y === newY) {
                canMove = false;
                break;
            }
        }
        
        if (canMove) {
            enemy.x = newX;
            enemy.y = newY;
        }
    }
    
    renderMap();
}

// Добавим обработчик кнопки "Начать заново"
$(document).on('click', '#restart-button', function() {
    // Сброс состояния игры
    game.map = [];
    game.enemies = [];
    game.swords = [];
    game.potions = [];
    game.hero = { x: 0, y: 0, health: 100, attack: 10 };
    game.isGameActive = true;
    
    // Скрыть экран
    $('#game-over-screen').addClass('hidden');
    
    // Перезапустить игру
    initGame();
});
