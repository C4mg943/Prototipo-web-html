// Selecciona una cancha y actualiza la imagen
function selectField(element, imageUrl, name) {
  document.querySelectorAll('.field-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  
  // Obtener el nombre del deporte desde el data attribute del body
  const sportName = document.body.getAttribute('data-sport') || 'futbol';
  const sportNames = {
    'futbol': 'fútbol',
    'microfutbol': 'microfutbol',
    'tenis': 'tenis',
    'voleibol': 'voleibol',
    'patinaje': 'patinaje',
    'atletismo': 'atletismo',
    'softball': 'softball',
    'baloncesto': 'baloncesto'
  };
  const sportLabel = sportNames[sportName] || sportName;
  
  // Actualizar imagen y nombre de la cancha
  const cover = document.querySelector('.cancha-cover');
  const title = document.querySelector('.header-image-overlay h1');
  const subtitle = document.querySelector('.header-image-overlay p');
  
  if (cover) cover.src = imageUrl;
  if (title) title.textContent = name;
  if (subtitle) subtitle.innerHTML = `<i class="ph-fill ph-map-pin"></i> Cancha de ${sportLabel}`;
}

// Cambia el color de la fecha seleccionada
function selectDate(element) {
  document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

// State array to hold the currently selected indices
let selectedTimeIndices = [];

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
    });

    if (selectedTimeIndices.length === 0) return;

    // Set actives
    selectedTimeIndices.forEach(idx => {
        if(allTimeBtns[idx]) allTimeBtns[idx].classList.add('active');
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
  const cancha = document.querySelector('.field-item.active p')?.closest('button')?.innerText || document.querySelector('.field-btn.active')?.innerText || 'Cancha no especificada';
  
  const activeDate = document.querySelector('.date-item.active');
  const fecha = activeDate ? `${activeDate.querySelector('.day-name').innerText} ${activeDate.querySelector('.day-num').innerText}` : 'Sin fecha';

  const activeTimes = Array.from(document.querySelectorAll('.time-btn.active')).map(btn => btn.innerText);
  const hora_inicio = activeTimes[0] || 'Sin hora de inicio';
  const hora_fin = activeTimes.length > 0 ? activeTimes[activeTimes.length - 1] : 'Sin hora de fin';

  const prestar_equipacion = document.querySelector('input[name="prestar_equipacion"]')?.checked ? 'Sí' : 'No';

  // Aquí iría la lógica para enviar los datos (deporte, cancha, fecha, hora_inicio, hora_fin, prestar_equipacion) a la Base de Datos...

  // Aquí iría la validación de sesión real. Por ahora redirige al login.
  window.location.href = '../login.html';
}
