// Script para debuggear el token en localStorage
console.log('🔍 Debuggeando token en localStorage...');

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token encontrado:', token ? 'SÍ' : 'NO');
console.log('Token (primeros 50 chars):', token ? token.substring(0, 50) + '...' : 'NO HAY TOKEN');

console.log('User encontrado:', user ? 'SÍ' : 'NO');
if (user) {
  try {
    const userObj = JSON.parse(user);
    console.log('User data:', userObj);
  } catch (e) {
    console.log('Error parsing user:', e);
  }
}

// Verificar si el token está expirado
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    
    console.log('Token expira en:', new Date(exp * 1000).toLocaleString());
    console.log('Ahora es:', new Date(now * 1000).toLocaleString());
    console.log('¿Token expirado?', now > exp ? 'SÍ' : 'NO');
    
  } catch (e) {
    console.log('Error parsing token:', e);
  }
}

// Probar una petición con el token
if (token) {
  console.log('\n🧪 Probando petición con token...');
  
  fetch('http://localhost:3002/api/usuarios', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.log('Error en petición:', error);
  });
} 