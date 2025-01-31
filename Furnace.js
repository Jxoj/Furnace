ModAPI.meta.title("Furnace");
ModAPI.meta.description("Mod library that downloads mods so you don't have to.");
const furnaceIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAF9JREFUOE9j/L895D8DCLy9CqaIBsLaYKWMYAPurCFaH4pClRAGxv9LNP8zvL/OwJhLmhn/JzMwMAhqYjcALIkFIFtC0ABCLqK9AcPACwMfiAPrAmISNSIhUZyZKMzOAFUyebm4ycV4AAAAAElFTkSuQmCC";
ModAPI.meta.icon(furnaceIcon);
ModAPI.meta.credits("By Jxo");

const mode = confirm("Would you like to use online mode? Click 'Cancel' for offline mode.") ? 'online' : 'offline';
const iconUrl = mode === 'online'
  ? 'https://jfurnace.netlify.app/assets/icons/icon.png'
  : 'assets/icons/icon.png';

alert("Press Ctrl + Shift + F to open the menu");

const menu = document.createElement('div');
menu.id = 'menu';
menu.style.cssText = `
  position: fixed;
  top: 0;
  right: -100%;
  width: 350px;
  height: 100%;
  background-color: #1e1e1e;
  color: #ddd;
  padding: 20px;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);
  transition: right 0.4s ease;
  z-index: 1000;
  overflow-y: auto;
  border-left: 1px solid orange;
`;

const header = document.createElement('div');
header.style.cssText = `
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const icon = document.createElement('img');
icon.src = iconUrl;
icon.alt = "Furnace Icon";
icon.style.cssText = `
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

const title = document.createElement('span');
title.textContent = "Furnace";
title.style.cssText = `
  font-size: 24px;
  font-weight: bold;
  color: orange;
`;

header.appendChild(icon);
header.appendChild(title);
menu.appendChild(header);

const categoryBar = document.createElement('div');
categoryBar.id = 'category-bar';
categoryBar.style.cssText = `
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;
menu.appendChild(categoryBar);

document.body.appendChild(menu);

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';

function generateUniqueHash() {
  let hash;
  do {
    hash = Math.floor(Math.random() * 900000000) + 100000000; // Generates a 9-digit number
  } while (document.querySelector(`[data-hash="${hash}"]`)); // Check if hash already exists in HTML
  return hash;
}

function updateCategoryDropdown(categories, modContainers) {
  const dropdown = document.createElement('select');
  dropdown.style.cssText = `
    width: 100%;
    padding: 10px;
    background-color: #222;
    color: orange;
    border: 1px solid orange;
    border-radius: 5px;
    margin-bottom: 20px;
  `;

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener('change', () => {
    const selectedCategory = dropdown.value;
    modContainers.forEach(container => {
      const modCategory = container.getAttribute('data-category') || "All";
      container.style.display = (selectedCategory === "All" || modCategory === selectedCategory) ? "block" : "none";
    });
  });

  categoryBar.appendChild(dropdown);
}

function loadMods(mods) {
  const categorySet = new Set(["All"]);
  const modContainers = [];

  mods.forEach(mod => {
    if (mod.category) categorySet.add(mod.category);

    const modContainer = document.createElement('div');
    modContainer.style.cssText = `
      margin-bottom: 15px;
      padding: 15px;
      border: 1px solid orange;
      border-radius: 5px;
      background-color: #333;
      text-align: center;
    `;
    modContainer.setAttribute('data-category', mod.category || "All");

    const modIcon = document.createElement('img');
    modIcon.src = mod.image || '';
    modIcon.alt = `${mod.name} Icon`;
    modIcon.style.cssText = `
      width: 40px;
      height: 40px;
      display: block;
      margin: 0 auto 10px;
    `;

    const modName = document.createElement('span');
    modName.textContent = mod.name || 'Unknown Mod';
    modName.style.cssText = `
      font-size: 16px;
      color: orange;
      display: block;
      margin-bottom: 5px;
    `;

    const modDescription = document.createElement('p');
    modDescription.textContent = mod.description || "No description provided.";
    modDescription.style.cssText = `
      font-size: 12px;
      color: #ccc;
      margin-bottom: 10px;
    `;

    const modAuthor = document.createElement('p');
    modAuthor.textContent = `By: ${mod.author || 'Unknown'}`;
    modAuthor.style.cssText = `
      font-size: 12px;
      color: #aaa;
      margin: 5px 0;
    `;

    const modButton = document.createElement('button');
    modButton.textContent = 'Install';
    modButton.style.cssText = `
      padding: 5px 10px;
      background-color: orange;
      color: black;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 14px;
    `;

    modButton.addEventListener('click', () => {
      const modScript = document.createElement('script');
      modScript.src = mod.scriptUrl || '';
      modScript.setAttribute('data-ismod', 'true');
      modScript.setAttribute('data-hash', generateUniqueHash());
      document.head.appendChild(modScript);
      alert(`${mod.name || 'Mod'} installed!`);
    });

    modContainer.appendChild(modIcon);
    modContainer.appendChild(modName);
    modContainer.appendChild(modDescription);
    modContainer.appendChild(modAuthor);
    modContainer.appendChild(modButton);
    menu.appendChild(modContainer);

    modContainers.push(modContainer);
  });

  updateCategoryDropdown([...categorySet], modContainers);
}

if (mode === 'online') {
  const modsUrl = 'https://jfurnace.netlify.app/assets/mods/mods.json';
  fetch(modsUrl)
    .then(response => response.json())
    .then(data => loadMods(data.mods || []))
    .catch(error => alert(`Error loading mods: ${error.message}`));
} else {
  const fileSelectButton = document.createElement('button');
  fileSelectButton.textContent = "Select mods.json file";
  fileSelectButton.style.cssText = `
    padding: 10px;
    background-color: orange;
    color: black;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
  `;

  fileSelectButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        loadMods(data.mods || []);
        fileSelectButton.style.display = 'none';
      };
      reader.readAsText(file);
    }
  });

  menu.appendChild(fileSelectButton);
}

let menuOpen = false;
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
    menuOpen = !menuOpen;
    menu.style.right = menuOpen ? '0' : '-100%';
  }
});
