# 💰 Vibe Finance

<div align="center">
  <img src="./public/screenshot.png" alt="Vibe Finance Dashboard" width="100%" />
</div>

<p align="center">
  <a href="https://vibe-finance-psi.vercel.app">
    <img src="https://img.shields.io/badge/🚀%20Demo%20en%20Vivo-Ver%20App-6366f1?style=for-the-badge" alt="Demo en Vivo" />
  </a>
  <a href="https://github.com/VictorR29/vibe-finance">
    <img src="https://img.shields.io/github/stars/VictorR29/vibe-finance?style=for-the-badge&color=6366f1" alt="GitHub Stars" />
  </a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## 🎯 Gestiona tus finanzas personales de forma inteligente

**Vibe Finance** es una aplicación web progresiva (PWA) diseñada para ayudarte a controlar tus gastos, ingresos, presupuestos y metas de ahorro de manera sencilla y visual.

### ✨ Características Principales

- 📊 **Dashboard Intuitivo**: Visualiza tu patrimonio total y finanzas con gráficos claros
- 💳 **Gestión Multi-Cuenta**: Crea múltiples cuentas (efectivo, banco, ahorros) con transferencias entre ellas
- 🎯 **Metas de Ahorro Inteligentes**: Establece objetivos y contribuye desde cualquier cuenta
- 💵 **Presupuestos Mensuales**: Administra tus límites de gasto por categoría
- 🔄 **Transferencias**: Mueve dinero entre cuentas sin afectar tu patrimonio total
- 📊 **Tendencias Detalladas**: Análisis de 15 días (predeterminado) hasta 1 año
- 💱 **Sincronización de Moneda**: La cuenta principal sigue automáticamente tu moneda global
- 📱 **PWA Instalable**: Instálala en tu móvil o desktop como una app nativa
- 🌙 **Modo Oscuro/Claro**: Interfaz adaptable a tu preferencia
- 💾 **Datos Persistentes**: Toda la información se guarda localmente en tu dispositivo
- 📤 **Exportar/Importar**: Realiza respaldos y restaura tus datos fácilmente
- ⚡ **Rápida y Optimizada**: Construida con Vite para máximo rendimiento

### 🚀 Demo en Vivo

**👉 [https://vibe-finance-psi.vercel.app](https://vibe-finance-psi.vercel.app)**

Prueba la aplicación directamente en tu navegador. Puedes instalarla en tu dispositivo para usarla offline.

### 💡 Cómo Funciona

**Patrimonio Total vs Balance Neto:**

- **Patrimonio Total**: Tu riqueza real (suma de todas las cuentas + balances iniciales + transferencias)
- **Balance Neto** (en Tendencias): Flujo de ingresos - gastos del período seleccionado

**Sistema de Metas de Ahorro:**

1. Crea una meta con objetivo y fecha límite
2. Usa el botón "Contribuir" para aportar desde cualquier cuenta
3. Las contribuciones se registran automáticamente como gastos
4. Visualiza tu progreso en tiempo real

**Gestión Multi-Cuenta:**

- Crea cuentas para diferentes propósitos (efectivo, banco, inversiones)
- La cuenta "General" está protegida y sincronizada con tu moneda global
- Realiza transferencias entre cuentas sin afectar tu patrimonio total

### 📸 Capturas de Pantalla

<div align="center">
  <img src="./public/screenshot.png" alt="Vibe Finance Dashboard" width="80%" />
</div>

### 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Almacenamiento**: IndexedDB (local)
- **PWA**: Service Worker + Manifest
- **Deploy**: Vercel

### 📦 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/VictorR29/vibe-finance.git

# Entrar al directorio
cd vibe-finance

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 🏗️ Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

### 📱 Instalación como PWA

**En Android (Chrome):**

1. Visita la app en Chrome
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"

**En iOS (Safari):**

1. Visita la app en Safari
2. Toca Compartir → "Agregar a Inicio"

**En Desktop (Chrome/Edge):**

1. Visita la app
2. Aparecerá el ícono de instalación en la barra de direcciones
3. Click → "Instalar Vibe Finance"

### 🔒 Privacidad y Seguridad

- ✅ **100% Privada**: Tus datos nunca salen de tu dispositivo
- ✅ **Sin Servidores**: Todo se almacena localmente en IndexedDB
- ✅ **Sin Cuentas**: No requiere registro ni login
- ✅ **Tus Datos**: Exporta tus datos en cualquier momento como respaldo

### 🐛 Reportar Problemas

Si encuentras algún error o tienes sugerencias, por favor abre un [issue](https://github.com/VictorR29/vibe-finance/issues).

### 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### 👨‍💻 Autor

**VictorR29**

- GitHub: [@VictorR29](https://github.com/VictorR29)

### 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">
  <p>Hecho con ❤️ y ☕ por VictorR29</p>
  <p>
    <a href="https://vibe-finance-psi.vercel.app">🚀 Ver App</a> •
    <a href="https://github.com/VictorR29/vibe-finance">📂 GitHub</a>
  </p>
</div>
