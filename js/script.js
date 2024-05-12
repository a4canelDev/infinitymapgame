	const canvas = document.getElementById('gameCanvas');
	const ctx = canvas.getContext('2d');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const oceanSprite = new Image();
	oceanSprite.src = 'maps/map1.png';
	const islandSprite = new Image();
	islandSprite.src = 'maps/map2.png';
	const castleSprite = new Image();
	castleSprite.src = 'maps/map3.png';

	let map = {};

	const tileSize = window.innerWidth < 768 ? 96 : 48;
	const generationRadius = 10;

	function getTile(x, y) {
  if (!map[y]) map[y] = {};
  if (!map[y][x]) {
    if (Math.random() < 0.0002) {
      map[y][x] = 'map3';
    } else {
      map[y][x] = Math.random() > 0.995 ? 'map2' : 'map1';
    }
  }
  return map[y][x];
}



	function generateTilesInView() {
	  const centerX = Math.floor(-offsetX / tileSize) + Math.floor(canvas.width / tileSize / 2);
	  const centerY = Math.floor(-offsetY / tileSize) + Math.floor(canvas.height / tileSize / 2);

	  for (let y = centerY - generationRadius; y <= centerY + generationRadius; y++) {
		for (let x = centerX - generationRadius; x <= centerX + generationRadius; x++) {
		  if ((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY) <= generationRadius * generationRadius) {
			getTile(x, y);
		  }
		}
	  }
	}

	let offsetX = 0;
	let offsetY = 0;

	function preGenerateTiles(startX, startY, endX, endY) {
	  const padding = 1;
	  for (let y = startY - padding; y < endY + padding; y++) {
		for (let x = startX - padding; x < endX + padding; x++) {
		  getTile(x, y);
		}
	  }
	}

	function drawMap() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  generateTilesInView();

	  const startCol = Math.floor((-offsetX - tileSize) / tileSize);
	  const endCol = Math.ceil((-offsetX + canvas.width + tileSize) / tileSize);
	  const startRow = Math.floor((-offsetY - tileSize) / tileSize);
	  const endRow = Math.ceil((-offsetY + canvas.height + tileSize) / tileSize);

	  for (let y = startRow; y < endRow; y++) {
		for (let x = startCol; x < endCol; x++) {
		  const tileType = getTile(x, y);
		  const tileX = x * tileSize + offsetX;
		  const tileY = y * tileSize + offsetY;
		  let sprite;
		  switch(tileType) {
			case 'map1':
			  sprite = oceanSprite;
			  break;
			case 'map2':
			  sprite = islandSprite;
			  break;
			case 'map3':
			  sprite = castleSprite;
			  break;
		  }
		  ctx.drawImage(sprite, tileX, tileY, tileSize, tileSize);
		}
	  }
	}

	castleSprite.onload = drawMap;

	oceanSprite.onload = islandSprite.onload = drawMap;

	let isDragging = false;
	let lastX = 0;
	let lastY = 0;

	canvas.onmousedown = function(e) {
	  isDragging = true;
	  lastX = e.offsetX;
	  lastY = e.offsetY;
	  canvas.style.cursor = 'grabbing';
	};
	canvas.onmouseup = canvas.onmouseleave = function() {
	  isDragging = false;
	  canvas.style.cursor = 'grab';
	};
	canvas.onmousemove = function(e) {
	  if (isDragging) {
		offsetX += e.offsetX - lastX;
		offsetY += e.offsetY - lastY;
		lastX = e.offsetX;
		lastY = e.offsetY;
		drawMap();
	  }
	};

	function showPopup(message, x, y) {
	  let popup = document.getElementById('popup');
	  if (!popup) {
		popup = document.createElement('div');
		popup.id = 'popup';
		document.body.appendChild(popup);
	  }

	  popup.textContent = message;
	  popup.style.position = 'absolute';
	  popup.style.left = `${x}px`;
	  popup.style.top = `${y}px`;
	  popup.style.background = 'white';
	  popup.style.border = '1px solid black';
	  popup.style.padding = '10px';
	  popup.style.fontFamily = 'sans-serif';
	  popup.style.display = 'block';

	  setTimeout(() => {
		popup.style.display = 'none';
	  }, 500);
	}

	const inventory = document.createElement('div');
	inventory.id = 'inventory';
	inventory.style.position = 'absolute';
	inventory.style.top = '0';
	inventory.style.width = '100%';
	inventory.style.height = '50px';
	inventory.style.background = 'grey';
	inventory.style.overflow = 'auto';
	inventory.style.maxHeight = '100px';
	inventory.style.display = 'flex';
	inventory.style.alignItems = 'center';
	inventory.style.justifyContent = 'flex-start';
	inventory.style.paddingLeft = '10px';
	inventory.style.background = 'white';

	document.body.appendChild(inventory);

	const hungerBar = document.createElement('div');
	hungerBar.id = 'hungerBar';
	hungerBar.style.position = 'absolute';
	hungerBar.style.bottom = '0';
	hungerBar.style.left = '0';
	hungerBar.style.width = '100%';
	hungerBar.style.height = '30px';
	hungerBar.style.background = '#4D220E';
	document.body.appendChild(hungerBar);

	const hungerText = document.createElement('span');
	hungerText.textContent = 'Голод';
	hungerText.style.position = 'absolute';
	hungerText.style.width = '100%';
	hungerText.style.textAlign = 'center';
	hungerText.style.lineHeight = '30px';
	hungerText.style.fontFamily = 'sans-serif';
	hungerText.style.color = 'white';
	hungerBar.appendChild(hungerText);

	const hungerFill = document.createElement('div');
	hungerFill.id = 'hungerFill';
	hungerFill.style.width = '100%';
	hungerFill.style.height = '100%';
	hungerFill.style.background = '#734222';
	hungerBar.appendChild(hungerFill);

	let hunger = 100;

	function updateHunger(value) {
  hunger = Math.min(Math.max(hunger + value, 0), 100);
  hungerFill.style.width = hunger + '%';
  if (hunger === 0 && !document.getElementById('gameOverPopup')) {
    showGameOverPopup();
  }
}

	function showGameOverPopup() {
	  const gameOverPopup = document.createElement('div');
	  gameOverPopup.id = 'gameOverPopup';
	  gameOverPopup.style.position = 'fixed';
	  gameOverPopup.style.top = '0';
	  gameOverPopup.style.left = '0';
	  gameOverPopup.style.fontFamily = 'sans-serif';
	  gameOverPopup.style.width = '100%';
	  gameOverPopup.style.height = '100%';
	  gameOverPopup.style.background = 'rgba(0, 0, 0, 0.5)';
	  gameOverPopup.style.display = 'flex';
	  gameOverPopup.style.flexDirection = 'column';
	  gameOverPopup.style.justifyContent = 'center';
	  gameOverPopup.style.alignItems = 'center';
	  gameOverPopup.style.zIndex = '1000';
	  gameOverPopup.innerHTML = `
		<div style="background: white; padding: 20px; border-radius: 10px;">
		  <p>Вы проиграли!</p>
		  <button onclick="restartGame()">Заного</button>
		</div>
	  `;
	  document.body.appendChild(gameOverPopup);
	}
	
	setInterval(() => {
	  updateHunger(-5);
	}, 10000);

	function restartGame() {
	  document.location.reload();
	}

	let activePopup = null;

	function showItemPopup(item, x, y) {
	  if (activePopup) {
		document.body.removeChild(activePopup);
		activePopup = null;
	  }

	  const itemPopup = document.createElement('div');
	  itemPopup.style.position = 'absolute';
	  itemPopup.style.fontFamily = 'sans-serif';
	  itemPopup.style.left = `${x}px`;
	  itemPopup.style.top = `${y}px`;
	  itemPopup.style.background = 'white';
	  itemPopup.style.border = '1px solid black';
	  itemPopup.style.padding = '10px';
	  itemPopup.style.borderRadius = '10px';
	  itemPopup.style.zIndex = '100';
	  itemPopup.innerHTML = `
		<p>${item.name}</p>
		<p>${item.description}</p>
		<button onclick="${item.useFunction}">Использовать</button>
	  `;
	  document.body.appendChild(itemPopup);
	  activePopup = itemPopup;
	}

	document.addEventListener('click', function(e) {
	  if (activePopup && !activePopup.contains(e.target)) {
		document.body.removeChild(activePopup);
		activePopup = null;
	  }
	}, true);

	function eatCarrot() {
	  updateHunger(15);
	  inventory.removeChild(document.querySelector('img[src="img/carrot.png"]'));
	  document.body.removeChild(activePopup);
	  activePopup = null;
	}

	function addItemToInventory(itemSrc, itemName, itemDescription, useFunction) {
	  const item = new Image(32, 32);
	  item.src = itemSrc;
	  item.style.marginRight = '5px';
	  item.onclick = function(e) {
		showItemPopup({ name: itemName, description: itemDescription, useFunction: useFunction }, e.pageX, e.pageY);
	  };
	  inventory.appendChild(item);
	}

	canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor((x - offsetX) / tileSize);
  const row = Math.floor((y - offsetY) / tileSize);
  const tileType = getTile(col, row);

  if (tileType === 'map3') {
    showPopup('Вы нашли остров с замком!', x, y);
    if (Math.random() < 0.05) {
      addItemToInventory('img/stone_sword.png', 'Каменный меч', 'Оружие для защиты', 'alert("Вы использовали меч!")');
    }
    map[row][col] = 'map2';
    addItemToInventory('img/carrot.png', 'Морковка', 'Восполняет 15 единиц голода', 'eatCarrot()');
    drawMap();
  } else if (tileType === 'map2') {
    showPopup('Это обычный остров', x, y);
  }
});

	function getTileTypeByCoords(x, y) {
	  const col = Math.floor((x - offsetX) / tileSize);
	  const row = Math.floor((y - offsetY) / tileSize);
	  return getTile(col, row);
	}

	canvas.addEventListener('touchstart', function(e) {
	  const touch = e.touches[0];
	  isDragging = true;
	  lastX = touch.clientX;
	  lastY = touch.clientY;
	}, false);

	canvas.addEventListener('touchend', function(e) {
	  isDragging = false;
	}, false);

	canvas.addEventListener('touchcancel', function(e) {
	  isDragging = false;
	}, false);

	canvas.addEventListener('touchmove', function(e) {
	  if (isDragging) {
		const touch = e.touches[0];
		offsetX += touch.clientX - lastX;
		offsetY += touch.clientY - lastY;
		lastX = touch.clientX;
		lastY = touch.clientY;
		e.preventDefault();
		drawMap();
	  }
	}, false);

