// Script para debuggear la página de usuarios
console.log('🔍 Debuggeando página de usuarios...');

// Verificar token
const token = localStorage.getItem('token');
console.log('Token encontrado:', token ? 'SÍ' : 'NO');

// Probar petición a usuarios
if (token) {
  console.log('\n🧪 Probando petición a /api/usuarios...');
  
  fetch('http://localhost:3002/api/usuarios', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    console.log('Status usuarios:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Usuarios recibidos:', data);
  })
  .catch(error => {
    console.log('Error en usuarios:', error);
  });

  // Probar petición a consultorios
  console.log('\n🧪 Probando petición a /api/consultorios...');
  
  fetch('http://localhost:3002/api/consultorios', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    console.log('Status consultorios:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Consultorios recibidos:', data);
  })
  .catch(error => {
    console.log('Error en consultorios:', error);
  });
} else {
  console.log('❌ No hay token - no se pueden hacer peticiones');
} 