document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'UNIDEPORTES_RESERVAS';
  const MIN_DATE = '2026-03-15';
  
  // DOM Elements
  const grid = document.getElementById('reservasGrid');
  const modal = document.getElementById('editModal');
  const modalForm = document.getElementById('editForm');
  const btnClose = document.getElementById('closeModal');
  const btnCancelReserva = document.getElementById('cancelReserva');
  const currentEditingIdInput = document.getElementById('currentEditingId');

  // Initialize Data
  let reservations = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (reservations.length === 0) {
    seedDemoData();
  }

  const sportLabels = {
    futbol: 'Fútbol',
    tenis: 'Tenis',
    baloncesto: 'Baloncesto',
    voleibol: 'Voleibol',
    microfutbol: 'Microfútbol',
    atletismo: 'Atletismo',
    softball: 'Softball',
    patinaje: 'Patinaje'
  };

  function seedDemoData() {
    reservations = [
      {
        id: 'res-001',
        deporte: 'futbol',
        cancha: 'Cancha Principal',
        fecha: '2026-03-20',
        horaInicio: '08:00',
        horaFin: '10:00',
        implementos: true,
        estado: 'confirmada'
      },
      {
        id: 'res-002',
        deporte: 'baloncesto',
        cancha: 'Cancha 2',
        fecha: '2026-03-22',
        horaInicio: '16:30',
        horaFin: '18:30',
        implementos: false,
        estado: 'confirmada'
      }
    ];
    saveData();
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    renderReservations();
  }

  // Render
  function renderReservations() {
    grid.innerHTML = '';
    
    if (reservations.length === 0) {
      grid.innerHTML = '<div class="empty-state">No tienes reservas activas.</div>';
      return;
    }

    reservations.forEach(res => {
      const card = document.createElement('div');
      card.className = `reserva-card ${res.estado}`;
      
      const isEditing = modal.classList.contains('active') && currentEditingIdInput.value === res.id;
      const displayStatus = isEditing ? 'pendiente' : res.estado;

      const implementosText = res.implementos ? 'Sí' : 'No';

      card.innerHTML = `
        <div class="reserva-header">
          <span class="deporte-badge">${sportLabels[res.deporte] || res.deporte}</span>
          <span class="estado-badge estado-${displayStatus}">${capitalize(displayStatus)}</span>
        </div>
        <div class="reserva-info">
          <h3>${res.cancha}</h3>
          <p class="reserva-date">
            <i class="ph ph-calendar-blank"></i> ${formatDate(res.fecha)}
          </p>
          <p class="reserva-time">
            <i class="ph ph-clock"></i> ${res.horaInicio} - ${res.horaFin}
          </p>
        </div>
        <div class="reserva-details">
          <div class="detail-item">
            <span class="detail-label">Duración</span>
            <span class="detail-value">${calculateDuration(res.horaInicio, res.horaFin)}h</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Implementos</span>
            <span class="detail-value">${implementosText}</span>
          </div>
        </div>
        ${res.estado !== 'cancelada' ? `<button class="btn-editar" data-id="${res.id}">Editar Reserva</button>` : ''}
      `;
      
      grid.appendChild(card);
    });

    // Attach events
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => openEditModal(e.target.dataset.id));
    });
  }

  // Modal Logic
  function openEditModal(id) {
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    currentEditingIdInput.value = res.id;
    
    // Populate form
    document.getElementById('deporte').value = res.deporte;
    document.getElementById('cancha').value = res.cancha; // Simplified for demo
    document.getElementById('fecha').value = res.fecha;
    document.getElementById('horaInicio').value = res.horaInicio;
    document.getElementById('horaFin').value = res.horaFin;
    
    // Reset checkboxes
    document.getElementById('implementos').checked = Boolean(res.implementos);

    modal.classList.add('active');
    modal.querySelector('.modal-content').style.opacity = '1';
    renderReservations(); // To show 'pendiente' status
  }

  function closeEditModal() {
    modal.classList.remove('active');
    currentEditingIdInput.value = '';
    renderReservations(); // Revert 'pendiente' status
  }

  // Handlers
  btnClose.addEventListener('click', closeEditModal);

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = currentEditingIdInput.value;
    const resIndex = reservations.findIndex(r => r.id === id);
    
    if (resIndex === -1) return;

    const fecha = document.getElementById('fecha').value;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    const deporte = document.getElementById('deporte').value;
    const cancha = document.getElementById('cancha').value;
    
    const implementos = document.getElementById('implementos').checked;

    // Validation
    if (fecha < MIN_DATE) {
      alert(`La fecha debe ser posterior a ${MIN_DATE}`);
      return;
    }

    if (horaFin <= horaInicio) {
      alert('La hora de fin debe ser mayor a la de inicio');
      return;
    }

    const start = new Date(`2000-01-01T${horaInicio}`);
    const end = new Date(`2000-01-01T${horaFin}`);
    const durationHrs = (end - start) / 1000 / 60 / 60;

    if (durationHrs > 3) {
      alert('La duración máxima es de 3 horas');
      return;
    }

    // Update
    reservations[resIndex] = {
      ...reservations[resIndex],
      fecha,
      horaInicio,
      horaFin,
      deporte,
      cancha,
      implementos,
      estado: 'confirmada'
    };

    saveData();
    closeEditModal();
  });

  btnCancelReserva.addEventListener('click', () => {
    const id = currentEditingIdInput.value;
    const resIndex = reservations.findIndex(r => r.id === id);
    
    if (resIndex !== -1 && confirm('¿Estás seguro de cancelar esta reserva?')) {
      reservations[resIndex].estado = 'cancelada';
      saveData();
      closeEditModal();
    }
  });

  // Helpers
  function calculateDuration(start, end) {
    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);
    return ((e - s) / 1000 / 60 / 60).toFixed(1);
  }

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  function capitalize(value) {
    if (!value) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Initial Render
  renderReservations();
});
