let selectedTimeIndices = [];
let canchaConfig = null;

const fallbackSportNames = {
  futbol: 'fútbol',
  microfutbol: 'microfútbol',
  tenis: 'tenis',
  voleibol: 'voleibol',
  patinaje: 'patinaje',
  atletismo: 'atletismo',
  softball: 'softball',
  baloncesto: 'baloncesto'
};

function getCurrentSportKey() {
  return document.body.getAttribute('data-sport') || 'futbol';
}

function getCurrentSportLabel() {
  const sportKey = getCurrentSportKey();
  const configLabel = canchaConfig?.deportes?.[sportKey]?.displayName;
  return configLabel || fallbackSportNames[sportKey] || sportKey;
}

function updateFieldHeader(imageUrl, fieldName) {
  const cover = document.querySelector('.cancha-cover');
  const title = document.querySelector('.header-image-overlay h1');
  const subtitle = document.querySelector('.header-image-overlay p');

  if (cover && imageUrl) {
    cover.src = imageUrl;
  }

  if (title && fieldName) {
    title.textContent = fieldName;
  }

  if (subtitle) {
    subtitle.textContent = `Cancha de ${getCurrentSportLabel()}`;
  }
}

function getSelectedFieldMeta() {
  const activeField = document.querySelector('.field-btn.active');
  if (!activeField) {
    return null;
  }

  return {
    buttonLabel: activeField.textContent?.trim() || 'Cancha no especificada',
    displayName: activeField.getAttribute('data-display-name') || activeField.textContent?.trim() || 'Cancha no especificada',
    scenarioId: activeField.getAttribute('data-scenario-id') || null,
    resourceId: activeField.getAttribute('data-resource-id') || null
  };
}

function buildDateIsoFromSelection(activeDate) {
  const dayNumText = activeDate?.querySelector('.day-num')?.innerText?.trim();
  const dayNumber = Number(dayNumText);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31) {
    return null;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const candidateDate = new Date(currentYear, currentMonth, dayNumber);
  if (candidateDate < new Date(currentYear, currentMonth, now.getDate())) {
    candidateDate.setMonth(candidateDate.getMonth() + 1);
  }

  const isoYear = candidateDate.getFullYear();
  const isoMonth = String(candidateDate.getMonth() + 1).padStart(2, '0');
  const isoDay = String(candidateDate.getDate()).padStart(2, '0');
  return `${isoYear}-${isoMonth}-${isoDay}`;
}

function parseTimeLabelTo24h(timeLabel) {
  const match = /^([0-1]?\d):([0-5]\d)\s*(AM|PM)$/i.exec(timeLabel.trim());
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (period === 'AM') {
    if (hour === 12) {
      hour = 0;
    }
  } else if (hour < 12) {
    hour += 12;
  }

  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function normalizeTimeSelection(activeTimes) {
  if (!Array.isArray(activeTimes) || activeTimes.length === 0) {
    return {
      startSlot: null,
      endSlot: null
    };
  }

  const start24h = parseTimeLabelTo24h(activeTimes[0]);
  const end24h = parseTimeLabelTo24h(activeTimes[activeTimes.length - 1]);

  return {
    startSlot: start24h,
    endSlot: end24h
  };
}

function isValidConfigShape(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (!Array.isArray(config.escenarios) || !config.deportes || typeof config.deportes !== 'object') {
    return false;
  }

  const scenarioIds = new Set(config.escenarios.map(item => item?.id).filter(Boolean));

  return Object.values(config.deportes).every(sport => {
    if (!sport || typeof sport !== 'object' || !Array.isArray(sport.fields)) {
      return false;
    }

    return sport.fields.every(field => {
      return Boolean(field?.scenarioId) && scenarioIds.has(field.scenarioId);
    });
  });
}

// Selecciona una cancha y actualiza la imagen
function selectField(element, imageUrl, name) {
  document.querySelectorAll('.field-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', btn === element ? 'true' : 'false');
  });

  element.classList.add('active');
  element.setAttribute('aria-pressed', 'true');

  updateFieldHeader(imageUrl, name);
}

// Cambia el color de la fecha seleccionada
function selectDate(element) {
  document.querySelectorAll('.date-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
  document.querySelectorAll('.date-item').forEach(item => {
    item.setAttribute('aria-pressed', item === element ? 'true' : 'false');
  });
}

// Cambia el color del horario seleccionado y maneja el rango (1-3 horas máximo)
function selectTime(element) {
  const allTimeBtns = Array.from(document.querySelectorAll('.time-btn'));
  const targetIndex = allTimeBtns.indexOf(element);
  
  let isFreshSelection = false;

  // We are clicking a disabled time button, restart from here.
  if (element.classList.contains('blocked')) {
      selectedTimeIndices = [targetIndex];
      isFreshSelection = true;
  } else {
      if (selectedTimeIndices.length === 0) {
          // If empty, select it
          selectedTimeIndices = [targetIndex];
          isFreshSelection = true;
      } else {
          // If they click the ONLY selected hour, deselect it entirely
          if (selectedTimeIndices.length === 1 && targetIndex === selectedTimeIndices[0]) {
              selectedTimeIndices = [];
          }
          // If they click the LAST selected hour (and there's more than 1), shrink the selection
          else if (targetIndex === selectedTimeIndices[selectedTimeIndices.length - 1] && selectedTimeIndices.length > 1) {
              selectedTimeIndices.pop();
          } 
          // If they click the EXACT FIRST element but there are multiple, reset to just that one
          else if (targetIndex === selectedTimeIndices[0]) {
               selectedTimeIndices = [targetIndex];
          }
          // If it extends the selection contiguously
          else if (targetIndex === selectedTimeIndices[selectedTimeIndices.length - 1] + 1) {
              if (selectedTimeIndices.length < 3) {
                  selectedTimeIndices.push(targetIndex);
              }
          }
          // Otherwise (e.g., clicking far ahead or somewhere in middle), restart selection from target
          else {
              selectedTimeIndices = [targetIndex];
              isFreshSelection = true;
          }
      }
  }

  // By default, try to select up to 2 hours if it's a completely new click
  if (isFreshSelection && selectedTimeIndices.length === 1 && targetIndex + 1 < allTimeBtns.length) {
      selectedTimeIndices.push(targetIndex + 1);
  }

  updateTimeVisuals(allTimeBtns);
}

// Function to update the visual state of buttons based on selectedTimeIndices
function updateTimeVisuals(allTimeBtns) {
    // Reset all
    allTimeBtns.forEach(btn => {
        btn.classList.remove('active', 'blocked');
        btn.setAttribute('aria-pressed', 'false');
    });

    if (selectedTimeIndices.length === 0) return;

    // Set actives
    selectedTimeIndices.forEach(idx => {
        if (allTimeBtns[idx]) {
          allTimeBtns[idx].classList.add('active');
          allTimeBtns[idx].setAttribute('aria-pressed', 'true');
        }
    });

    // Determine bounds for blockings
    const firstIndex = selectedTimeIndices[0];
    
    // Block all buttons BEFORE the first selected (since we only expand rightwards)
    for (let i = 0; i < firstIndex; i++) {
        allTimeBtns[i].classList.add('blocked');
    }

    // Block all buttons that are strictly after firstIndex + 2 (the 3-hour limit)
    for (let i = firstIndex + 3; i < allTimeBtns.length; i++) {
        allTimeBtns[i].classList.add('blocked');
    }
}

// Redirige al login al hacer clic en Agendar
function agendarReserva() {
  // Recopilar todos los datos seleccionados para enviarlos a la base de datos
  const deporte = document.querySelector('input[name="deporte"]')?.value || 'No especificado';
  const selectedField = getSelectedFieldMeta();
  const cancha = selectedField?.buttonLabel || 'Cancha no especificada';
  
  const activeDate = document.querySelector('.date-item.active');
  const fecha = activeDate ? `${activeDate.querySelector('.day-name').innerText} ${activeDate.querySelector('.day-num').innerText}` : 'Sin fecha';

  const activeTimes = Array.from(document.querySelectorAll('.time-btn.active')).map(btn => btn.innerText);
  const hora_inicio = activeTimes[0] || 'Sin hora de inicio';
  const hora_fin = activeTimes.length > 0 ? activeTimes[activeTimes.length - 1] : 'Sin hora de fin';
  const dateIso = buildDateIsoFromSelection(activeDate);
  const timeSlots = normalizeTimeSelection(activeTimes);

  const prestar_equipacion = document.querySelector('input[name="prestar_equipacion"]')?.checked ? 'Sí' : 'No';

  if (!document.querySelector('.field-btn.active')) {
    window.alert('Selecciona una cancha antes de agendar.');
    return;
  }

  if (!activeDate) {
    window.alert('Selecciona una fecha antes de agendar.');
    return;
  }

  if (activeTimes.length === 0) {
    window.alert('Selecciona al menos un horario antes de agendar.');
    return;
  }

  const reserva = {
    deporte,
    cancha,
    cancha_display: selectedField?.displayName || cancha,
    scenario_id: selectedField?.scenarioId,
    resource_id: selectedField?.resourceId,
    fecha,
    fecha_iso: dateIso,
    hora_inicio,
    hora_fin,
    start_slot: timeSlots.startSlot,
    end_slot: timeSlots.endSlot,
    prestar_equipacion
  };

  try {
    window.sessionStorage.setItem('reservaPendiente', JSON.stringify(reserva));
  } catch {
  }

  // Aquí iría la validación de sesión real. Por ahora redirige al login.
  window.location.href = '../login.html';
}

function buildDefaultDateItemsIfNeeded() {
  const dateItems = Array.from(document.querySelectorAll('.date-item'));
  const defaultDays = [
    { name: 'DOM', num: '1' },
    { name: 'LUN', num: '2' },
    { name: 'MAR', num: '3' },
    { name: 'MIÉ', num: '4' },
    { name: 'JUE', num: '5' }
  ];

  dateItems.forEach((item, index) => {
    const hasDayName = item.querySelector('.day-name');
    const hasDayNum = item.querySelector('.day-num');
    const rawText = item.textContent?.trim() || '';

    if (!hasDayName || !hasDayNum || rawText === '$$$') {
      const fallback = defaultDays[index] || { name: 'DÍA', num: `${index + 1}` };
      item.innerHTML = `<span class="day-name">${fallback.name}</span><span class="day-num">${fallback.num}</span>`;
    }
  });
}

function setupDateInteractions() {
  const dateItems = document.querySelectorAll('.date-item');

  dateItems.forEach(item => {
    if (!item.hasAttribute('aria-pressed')) {
      item.setAttribute('aria-pressed', 'false');
    }

    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectDate(item);
      }
    });
  });
}

function setupTimeButtonsAria() {
  const timeButtons = document.querySelectorAll('.time-btn');
  timeButtons.forEach(btn => {
    if (!btn.hasAttribute('aria-pressed')) {
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

function setupExistingFieldButtonsAria() {
  const fieldButtons = document.querySelectorAll('.field-btn');
  fieldButtons.forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
  });
}

async function loadCanchasConfig() {
  try {
    const response = await fetch('../../js/config/canchas.json', { cache: 'no-store' });
    if (!response.ok) {
      console.error('No se pudo cargar js/config/canchas.json. Se usará el HTML de respaldo.');
      return null;
    }

    const data = await response.json();
    if (!isValidConfigShape(data)) {
      console.error('La estructura de canchas.json es inválida. Se usará el HTML de respaldo.');
      return null;
    }

    return data;
  } catch {
    console.error('Error cargando canchas.json. Se usará el HTML de respaldo.');
    return null;
  }
}

function renderFieldsFromConfig() {
  const sportKey = getCurrentSportKey();
  if (!sportKey || !canchaConfig?.deportes?.[sportKey]) {
    console.error(`El deporte '${sportKey || 'desconocido'}' no existe en canchas.json. Se usará el HTML de respaldo.`);
    setupExistingFieldButtonsAria();
    return;
  }

  const sportConfig = canchaConfig?.deportes?.[sportKey];
  const fieldsGrid = document.querySelector('.fields-grid');

  if (!sportConfig || !fieldsGrid || !Array.isArray(sportConfig.fields) || sportConfig.fields.length === 0) {
    setupExistingFieldButtonsAria();
    return;
  }

  const currentCover = document.querySelector('.cancha-cover')?.getAttribute('src') || '';
  const firstFieldName = sportConfig.fields[0].displayName || sportConfig.fields[0].buttonLabel || 'Cancha 1';

  fieldsGrid.innerHTML = '';

  sportConfig.fields.forEach((field, index) => {
    const scenario = canchaConfig.escenarios.find(item => item.id === field.scenarioId);
    const imageUrl = scenario?.imagen || currentCover;
    const button = document.createElement('button');

    button.type = 'button';
    button.className = index === 0 ? 'field-btn active' : 'field-btn';
    button.textContent = field.buttonLabel || `${sportConfig.fieldLabel || 'Cancha'} ${index + 1}`;
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    button.setAttribute('data-scenario-id', field.scenarioId);
    button.setAttribute('data-resource-id', field.resourceId || field.scenarioId);
    button.setAttribute('data-display-name', field.displayName || button.textContent);
    button.addEventListener('click', () => {
      selectField(button, imageUrl, field.displayName || button.textContent);
    });

    fieldsGrid.appendChild(button);
  });

  const firstScenario = canchaConfig.escenarios.find(item => item.id === sportConfig.fields[0].scenarioId);
  const firstImage = firstScenario?.imagen || currentCover;
  updateFieldHeader(firstImage, firstFieldName);
}

document.addEventListener('DOMContentLoaded', () => {
  buildDefaultDateItemsIfNeeded();
  setupDateInteractions();
  setupTimeButtonsAria();
  setupExistingFieldButtonsAria();

  loadCanchasConfig().then(config => {
    if (config) {
      canchaConfig = config;
      renderFieldsFromConfig();
    }
  });
});

window.selectField = selectField;
window.selectDate = selectDate;
window.selectTime = selectTime;
window.agendarReserva = agendarReserva;
