const request = require('supertest');
const app = require('../index');
const prisma = require('./setup');

describe('API Tests', () => {
  let testPacienteId;
  let testUsuarioId;
  let testConsultorioId;
  let testCobroId;
  let testPrecioConsultorioId;
  let testCobroConceptoId;
  let testHistorialCobroId;
  let testServicioId;

  // Pruebas de Pacientes
  describe('Pacientes', () => {
    it('debería crear un nuevo paciente', async () => {
      const response = await request(app)
        .post('/api/pacientes')
        .send({
          nombre: 'Test Paciente',
          apellido: 'Test Apellido',
          fecha_nacimiento: '1990-01-01',
          genero: 'M',
          direccion: 'Test Dirección',
          telefono: '1234567890',
          email: 'test@test.com',
          documento_identidad: '12345678'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testPacienteId = response.body.id;
    });

    it('debería obtener todos los pacientes', async () => {
      const response = await request(app).get('/api/pacientes');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('debería obtener un paciente por ID', async () => {
      const response = await request(app).get(`/api/pacientes/${testPacienteId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testPacienteId);
    });
  });

  // Pruebas de Usuarios
  describe('Usuarios', () => {
    it('debería crear un nuevo usuario', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .send({
          nombre: 'Test Usuario',
          rol: 'DOCTOR',
          email: 'doctor@test.com',
          telefono: '9876543210'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testUsuarioId = response.body.id;
    });

    it('debería obtener todos los usuarios', async () => {
      const response = await request(app).get('/api/usuarios');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Pruebas de Consultorios
  describe('Consultorios', () => {
    it('debería crear un nuevo consultorio', async () => {
      const response = await request(app)
        .post('/api/consultorios')
        .send({
          nombre: 'Test Consultorio',
          direccion: 'Test Dirección Consultorio'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testConsultorioId = response.body.id;
    });

    it('debería obtener todos los consultorios', async () => {
      const response = await request(app).get('/api/consultorios');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Pruebas de Precios Consultorio
  describe('Precios Consultorio', () => {
    it('debería crear un nuevo precio de consultorio', async () => {
      const response = await request(app)
        .post('/api/precios-consultorio')
        .send({
          consultorio_id: testConsultorioId,
          concepto: 'Consulta Test',
          precio_unitario: 100.00
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testPrecioConsultorioId = response.body.id;
    });

    it('debería obtener todos los precios de consultorio', async () => {
      const response = await request(app).get('/api/precios-consultorio');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Pruebas de Servicios
  describe('Servicios', () => {
    it('debería crear un nuevo servicio', async () => {
      const response = await request(app)
        .post('/api/servicios')
        .send({
          nombre: 'Servicio Test',
          descripcion: 'Servicio de prueba',
          precio_base: 100
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testServicioId = response.body.id;
    });
  });

  // Pruebas de Cobros
  describe('Cobros', () => {
    it('debería crear un nuevo cobro', async () => {
      const response = await request(app)
        .post('/api/cobros')
        .send({
          paciente_id: testPacienteId,
          usuario_id: testUsuarioId,
          fecha_cobro: new Date().toISOString(),
          monto_total: 150.00,
          estado: 'PENDIENTE',
          metodo_pago: 'EFECTIVO',
          notas: 'Test cobro'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testCobroId = response.body.id;
    });

    it('debería obtener todos los cobros', async () => {
      const response = await request(app).get('/api/cobros');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Pruebas de Cobro Conceptos
  describe('Cobro Conceptos', () => {
    it('debería crear un nuevo concepto de cobro', async () => {
      const response = await request(app)
        .post('/api/cobro-conceptos')
        .send({
          cobro_id: testCobroId,
          servicio_id: testServicioId,
          precio_unitario: 50.00,
          cantidad: 1,
          subtotal: 50.00,
          consultorio_id: testConsultorioId
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testCobroConceptoId = response.body.id;
    });

    it('debería obtener todos los conceptos de cobro', async () => {
      const response = await request(app).get('/api/cobro-conceptos');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Pruebas de Historial Cobros
  describe('Historial Cobros', () => {
    it('debería crear un nuevo registro en el historial', async () => {
      const response = await request(app)
        .post('/api/historial-cobros')
        .send({
          cobro_id: testCobroId,
          usuario_id: testUsuarioId,
          tipo_cambio: 'CREACION',
          detalles_antes: {},
          detalles_despues: {
            estado: 'PENDIENTE',
            monto_total: 150.00
          }
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      testHistorialCobroId = response.body.id;
    });

    it('debería obtener todo el historial de cobros', async () => {
      const response = await request(app).get('/api/historial-cobros');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 