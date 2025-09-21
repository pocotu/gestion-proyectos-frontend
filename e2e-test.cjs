const axios = require('axios');

/**
 * Pruebas End-to-End Frontend-Backend
 * Verifica la integración completa entre ambos servicios
 */

const BACKEND_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

async function runE2ETests() {
  console.log('🚀 Iniciando pruebas End-to-End Frontend-Backend...\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Test 1: Verificar que el backend esté funcionando
    console.log('📡 Test 1: Verificando conectividad del backend...');
    try {
      const backendTest = await axios.get(`${BACKEND_URL}/auth/profile`, {
        validateStatus: () => true // Aceptar cualquier status code
      });
      console.log('✅ Backend respondiendo correctamente');
      testsPassed++;
    } catch (error) {
      console.log('❌ Backend no responde:', error.message);
      testsFailed++;
    }
    
    // Test 2: Verificar que el frontend esté funcionando
    console.log('\n🌐 Test 2: Verificando conectividad del frontend...');
    try {
      const frontendTest = await axios.get(FRONTEND_URL, {
        validateStatus: () => true
      });
      console.log('✅ Frontend respondiendo correctamente');
      testsPassed++;
    } catch (error) {
      console.log('❌ Frontend no responde:', error.message);
      testsFailed++;
    }
    
    // Test 3: Registro de usuario
    console.log('\n📝 Test 3: Registro de usuario...');
    try {
      const registerData = {
        nombre: 'Usuario E2E Test',
        email: `e2e-${Date.now()}@test.com`,
        contraseña: 'test123456'
      };
      
      const registerResponse = await axios.post(`${BACKEND_URL}/auth/register`, registerData);
      
      if (registerResponse.data.success) {
        console.log('✅ Registro de usuario exitoso');
        testsPassed++;
      } else {
        console.log('❌ Registro falló:', registerResponse.data.message);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Error en registro:', error.response?.data?.message || error.message);
      testsFailed++;
    }
    
    // Test 4: Login de usuario
    console.log('\n🔐 Test 4: Login de usuario...');
    try {
      const loginData = {
        email: `e2e-${Date.now()}@test.com`,
        contraseña: 'test123456'
      };
      
      // Primero registrar el usuario
      await axios.post(`${BACKEND_URL}/auth/register`, {
        nombre: 'Usuario Login Test',
        ...loginData
      });
      
      // Luego hacer login
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, loginData);
      
      if (loginResponse.data.success && loginResponse.data.data.token) {
        console.log('✅ Login exitoso con token generado');
        testsPassed++;
        
        // Test 5: Acceso a perfil autenticado
        console.log('\n👤 Test 5: Acceso a perfil autenticado...');
        try {
          const token = loginResponse.data.data.token;
          const profileResponse = await axios.get(`${BACKEND_URL}/auth/profile`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (profileResponse.data.success) {
            console.log('✅ Acceso a perfil autenticado exitoso');
            testsPassed++;
          } else {
            console.log('❌ Error al acceder al perfil:', profileResponse.data.message);
            testsFailed++;
          }
        } catch (error) {
          console.log('❌ Error en acceso a perfil:', error.response?.data?.message || error.message);
          testsFailed++;
        }
        
      } else {
        console.log('❌ Login falló:', loginResponse.data.message);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Error en login:', error.response?.data?.message || error.message);
      testsFailed++;
    }
    
    // Test 6: Verificar datos poblados en la base de datos
    console.log('\n🗄️ Test 6: Verificando datos poblados (seeders)...');
    try {
      // Intentar hacer login con un usuario del seeder
      const seederLoginData = {
        email: 'admin@gestion-proyectos.com', // Usuario del seeder
        contraseña: 'admin123'
      };
      
      const seederLoginResponse = await axios.post(`${BACKEND_URL}/auth/login`, seederLoginData);
      
      if (seederLoginResponse.data.success) {
        console.log('✅ Datos de seeders funcionando correctamente');
        testsPassed++;
      } else {
        console.log('❌ No se pudo acceder con datos de seeders');
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Error verificando seeders:', error.response?.data?.message || error.message);
      testsFailed++;
    }
    
  } catch (error) {
    console.error('❌ Error general en pruebas E2E:', error.message);
    testsFailed++;
  }
  
  // Resumen de resultados
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS END-TO-END');
  console.log('='.repeat(50));
  console.log(`✅ Pruebas exitosas: ${testsPassed}`);
  console.log(`❌ Pruebas fallidas: ${testsFailed}`);
  console.log(`📈 Total de pruebas: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ¡Todas las pruebas end-to-end pasaron exitosamente!');
    console.log('🔗 La integración Frontend-Backend está funcionando correctamente');
    console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    console.log(`📡 Backend: ${BACKEND_URL}`);
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar la configuración.');
  }
  
  return testsFailed === 0;
}

// Ejecutar las pruebas
if (require.main === module) {
  runE2ETests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { runE2ETests };