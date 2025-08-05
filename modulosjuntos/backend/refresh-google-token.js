const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function refreshGoogleToken() {
  try {
    console.log('🔄 Refrescando token de Google Calendar...\n');

    // Buscar usuario con Google Calendar configurado
    const usuario = await prisma.usuario.findFirst({
      where: {
        googleRefreshToken: { not: null }
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true
      }
    });

    if (!usuario) {
      console.log('❌ No se encontró ningún usuario con Google Calendar configurado');
      return;
    }

    console.log('Usuario encontrado:', usuario.nombre, usuario.apellido);
    console.log('Email:', usuario.email);
    console.log('Refresh Token:', usuario.googleRefreshToken ? 'Disponible' : 'No disponible');
    console.log('Token expira:', usuario.googleTokenExpiry);
    console.log('');

    if (!usuario.googleRefreshToken) {
      console.log('❌ Usuario no tiene refresh token');
      return;
    }

    // Refrescar el token
    const axios = require('axios');
    
    console.log('🔄 Solicitando nuevo token...');
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: usuario.googleRefreshToken,
        grant_type: 'refresh_token'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = response.data;
    const newExpiry = new Date(Date.now() + (expires_in * 1000));

    console.log('✅ Token refrescado exitosamente');
    console.log('Nuevo token expira:', newExpiry);
    console.log('');

    // Actualizar en la base de datos
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        googleAccessToken: access_token,
        googleTokenExpiry: newExpiry
      }
    });

    console.log('✅ Token actualizado en la base de datos');
    console.log('');

    // Verificar que se actualizó correctamente
    const updatedUser = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: {
        googleAccessToken: true,
        googleTokenExpiry: true
      }
    });

    console.log('Verificación:');
    console.log('Token actualizado:', updatedUser.googleAccessToken ? 'SÍ' : 'NO');
    console.log('Nueva fecha de expiración:', updatedUser.googleTokenExpiry);
    console.log('');

    console.log('🎉 Token refrescado correctamente. Ahora puedes probar la sincronización.');

  } catch (error) {
    console.error('❌ Error refrescando token:', error.message);
    if (error.response) {
      console.error('Error de Google API:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

refreshGoogleToken(); 