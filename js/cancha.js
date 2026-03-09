// Cambia el color de la fecha seleccionada
function selectDate(element) {
  document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

// Cambia el color del horario seleccionado
function selectTime(element) {
  document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
}
