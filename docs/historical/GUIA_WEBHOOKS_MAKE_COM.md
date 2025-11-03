# GUÍA COMPLETA: CREAR WEBHOOKS EN MAKE.COM PARA ECONEURA

**Fecha:** 27 de Octubre 2025  
**Versión:** 1.0  
**Estado:** FUNCIONAL Y PROBADO

---

## 🎯 INTRODUCCIÓN

Esta guía te enseñará paso a paso cómo crear webhooks en Make.com para conectar con ECONEURA y probar la ejecución de agentes automatizados.

---

## 📋 PREREQUISITOS

- ✅ Cuenta en Make.com (gratuita o de pago)
- ✅ Acceso a ECONEURA funcionando
- ✅ Navegador web actualizado
- ✅ 10-15 minutos de tiempo

---

## 🚀 PASO A PASO: CREAR WEBHOOK EN MAKE.COM

### **PASO 1: ACCEDER A MAKE.COM**

1. **Abrir navegador** y ir a: https://www.make.com
2. **Iniciar sesión** con tu cuenta
3. **Crear nuevo escenario** (botón "Create a new scenario")

### **PASO 2: CONFIGURAR WEBHOOK**

1. **Buscar "Webhooks"** en la barra de búsqueda
2. **Seleccionar "Webhooks > Custom webhook"**
3. **Hacer clic en "Add"** para agregar el módulo

### **PASO 3: CONFIGURAR WEBHOOK RECEIVER**

1. **En el módulo webhook:**
   - **Name:** `ECONEURA Agent Receiver`
   - **Description:** `Webhook para recibir datos de ECONEURA`
   - **Hacer clic en "Save"**

2. **Copiar la URL del webhook:**
   - Se generará una URL como: `https://hook.eu2.make.com/xxxxxxxxxxxxxxxxxxxxxxxx`
   - **¡IMPORTANTE!** Copia esta URL completa

### **PASO 4: CONFIGURAR RESPUESTA**

1. **Agregar módulo de respuesta:**
   - Buscar "Webhooks > Return a response"
   - **Hacer clic en "Add"**

2. **Configurar respuesta:**
   - **Status:** `200`
   - **Response body:** 
   ```json
   {
     "success": true,
     "message": "Agente ejecutado correctamente",
     "timestamp": "{{now}}",
     "data": {
       "agentId": "{{agentId}}",
       "result": "Procesamiento completado"
     }
   }
   ```

### **PASO 5: ACTIVAR ESCENARIO**

1. **Hacer clic en "Run once"** para probar
2. **Verificar que el webhook esté activo**
3. **Copiar la URL final del webhook**

---

## 🔧 CONFIGURAR WEBHOOK EN ECONEURA

### **PASO 6: AGREGAR WEBHOOK A ECONEURA**

1. **Abrir ECONEURA** en el navegador
2. **Ir al Cockpit** (panel principal)
3. **Hacer clic en "Configurar"** en cualquier agente
4. **Seleccionar "Make.com"** como proveedor
5. **Pegar la URL del webhook** en el campo correspondiente
6. **Hacer clic en "Conectar"**

---

## 🧪 PROBAR CONEXIÓN

### **PASO 7: PROBAR AGENTE**

1. **Abrir chat NEURA** (cualquier departamento)
2. **Escribir mensaje:** "Ejecutar agente de prueba"
3. **Hacer clic en enviar**
4. **Verificar en Make.com** que llegó la petición
5. **Verificar respuesta** en ECONEURA

---

## 📊 EJEMPLOS DE WEBHOOKS CREADOS

### **WEBHOOK 1: NEURA CEO**
```
URL: https://hook.eu2.make.com/9fcydc16h26m2ejww5p049x7fa57fmqp
Agente: a-ceo-01
Función: Estrategia ejecutiva
```

### **WEBHOOK 2: NEURA CFO**
```
URL: https://hook.eu2.make.com/xxxxxxxxxxxxxxxxxxxxxxxx
Agente: a-cfo-01
Función: Análisis financiero
```

### **WEBHOOK 3: NEURA CMO**
```
URL: https://hook.eu2.make.com/xxxxxxxxxxxxxxxxxxxxxxxx
Agente: a-cmo-01
Función: Marketing y ventas
```

---

## 🔍 VERIFICAR FUNCIONAMIENTO

### **INDICADORES DE ÉXITO:**

✅ **En Make.com:**
- Escenario ejecutado
- Datos recibidos correctamente
- Respuesta enviada

✅ **En ECONEURA:**
- Agente conectado
- Ejecución exitosa
- Respuesta mostrada

### **INDICADORES DE ERROR:**

❌ **En Make.com:**
- Escenario no ejecutado
- Error en configuración
- Timeout

❌ **En ECONEURA:**
- Error de conexión
- Timeout
- Respuesta vacía

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### **PROBLEMA 1: Webhook no recibe datos**
**Solución:**
1. Verificar que el escenario esté activo
2. Comprobar la URL del webhook
3. Revisar logs en Make.com

### **PROBLEMA 2: Error de conexión en ECONEURA**
**Solución:**
1. Verificar que el backend esté funcionando
2. Comprobar la URL del webhook
3. Revisar logs del navegador

### **PROBLEMA 3: Timeout en la ejecución**
**Solución:**
1. Aumentar timeout en Make.com
2. Simplificar la lógica del webhook
3. Verificar conectividad

---

## 📈 MEJORES PRÁCTICAS

### **CONFIGURACIÓN DEL WEBHOOK:**

1. **Nombre descriptivo:** `ECONEURA-[Departamento]-[Función]`
2. **Descripción clara:** Explicar qué hace el webhook
3. **Logging habilitado:** Para debugging
4. **Timeout adecuado:** 30-60 segundos

### **RESPUESTA DEL WEBHOOK:**

1. **Status 200:** Para éxito
2. **Status 400:** Para errores de datos
3. **Status 500:** Para errores internos
4. **JSON estructurado:** Fácil de procesar

### **SEGURIDAD:**

1. **Validar datos de entrada**
2. **Usar HTTPS** (Make.com lo hace automáticamente)
3. **No exponer información sensible**
4. **Implementar rate limiting**

---

## 🎯 COMANDOS PARA PROBAR

### **COMANDO 1: Probar conexión básica**
```bash
curl -X POST https://hook.eu2.make.com/9fcydc16h26m2ejww5p049x7fa57fmqp \
  -H "Content-Type: application/json" \
  -d '{"test": "conexion", "timestamp": "2025-10-27"}'
```

### **COMANDO 2: Probar desde ECONEURA**
1. Abrir chat NEURA
2. Escribir: "Probar conexión con Make.com"
3. Verificar respuesta

---

## 📋 CHECKLIST DE VERIFICACIÓN

### **ANTES DE CREAR WEBHOOK:**
- [ ] Cuenta Make.com activa
- [ ] ECONEURA funcionando
- [ ] Navegador actualizado

### **DURANTE LA CREACIÓN:**
- [ ] Webhook configurado correctamente
- [ ] URL copiada
- [ ] Respuesta configurada
- [ ] Escenario activado

### **DESPUÉS DE LA CREACIÓN:**
- [ ] Webhook agregado a ECONEURA
- [ ] Conexión probada
- [ ] Datos fluyendo correctamente
- [ ] Respuesta recibida

---

## 🎉 RESULTADO ESPERADO

Al finalizar esta guía tendrás:

✅ **Webhook funcional** en Make.com  
✅ **Agente conectado** en ECONEURA  
✅ **Comunicación bidireccional** establecida  
✅ **Pruebas exitosas** de ejecución  
✅ **Sistema automatizado** funcionando  

---

## 📞 SOPORTE

Si tienes problemas:

1. **Revisar logs** en Make.com y ECONEURA
2. **Verificar configuración** paso a paso
3. **Probar con webhook simple** primero
4. **Contactar soporte** si persiste el problema

---

**¡Con esta guía podrás crear webhooks en Make.com y conectarlos con ECONEURA exitosamente!** 🚀
