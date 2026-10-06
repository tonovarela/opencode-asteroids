# Sistema de Skins - Documentación Técnica

## Descripción General

Se implementó un sistema completo de skins (temas visuales) para la nave del jugador en el juego Asteroids. El sistema permite cambiar la apariencia de la nave mediante un menú interactivo durante el juego, sin afectar la mecánica de juego.

## Arquitectura

### 1. Definición de Skins (líneas 250-372)

```javascript
const SKINS = {
  skinKey: {
    name: 'Nombre mostrado',
    color: '#hexcolor',
    draw: function() { /* función de dibujo */ }
  },
  ...
}
```

Cada skin contiene:
- **name**: Nombre legible para mostrar en el menú
- **color**: Color hexadecimal de la nave
- **draw()**: Función que dibuja el contorno específico del skin usando Canvas API

#### Skins Incluidos

1. **classic**: Triángulo clásico original con muesca trasera
2. **diamond**: Rombo puntiagudo
3. **pentagon**: Pentágono regular de 5 lados
4. **square**: Cuadrado/rectángulo
5. **star**: Estrella de 5 puntas
6. **wedge**: Triángulo más ancho
7. **compact**: Versión pequeña y compacta
8. **futuristic**: Forma angular moderna con más vértices

### 2. Clase SkinMenu (líneas 375-472)

Gestiona toda la lógica de selección y presentación del menú.

**Propiedades:**
- `visible`: Boolean que indica si el menú está abierto
- `selectedIndex`: Índice del skin actualmente seleccionado

**Métodos:**
- `toggle()`: Abre/cierra el menú
- `selectNext()`: Navega al siguiente skin
- `selectPrev()`: Navega al skin anterior
- `getCurrentSkinKey()`: Retorna la key del skin seleccionado
- `getCurrentSkin()`: Retorna el objeto skin completo
- `draw()`: Renderiza el menú en pantalla

**Diseño del Menú:**
- Panel semi-transparente en esquina superior derecha
- Preview del skin actual en relieve
- Lista de máximo 5 skins visibles
- Skin seleccionado resaltado
- Instrucciones de control en la parte inferior

### 3. Clase Ship (modificada, líneas 475-550)

**Cambios principales:**

1. Propiedad adicional:
   ```javascript
   this.currentSkin = 'classic';
   ```

2. Método `draw()` refactorizado:
   ```javascript
   const skin = SKINS[this.currentSkin];
   ctx.strokeStyle = skin.color;
   skin.draw();
   ```

El color de la nave y su forma cambian dinámicamente sin afectar:
- Física de movimiento
- Colisiones (usa el mismo radio: 12)
- Sistema de disparo
- Llama del propulsor (sigue igual)

### 4. Game Loop Integration

**En `update()` (líneas 703-725):**
```javascript
// Tecla S abre/cierra menú
if (pressed('KeyS')) {
  skinMenu.toggle();
}

// Si menú visible, procesar input del menú
if (skinMenu.visible) {
  if (pressed('ArrowUp')) skinMenu.selectPrev();
  if (pressed('ArrowDown')) skinMenu.selectNext();
  if (pressed('Enter')) {
    ship.currentSkin = skinMenu.getCurrentSkinKey();
    skinMenu.toggle();
  }
  return; // Pausa el juego
}
```

**En `draw()` (líneas 901-903):**
```javascript
skinMenu.draw();
// Mostrar instrucción si no está en menú
if (!skinMenu.visible && state === 'playing') {
  ctx.fillText('Presiona S para cambiar skin', ...);
}
```

**En `initGame()` (línea 664):**
```javascript
skinMenu = new SkinMenu();
```

## Flujo de Uso

1. **Jugador presiona S** → `update()` detecta con `pressed('KeyS')`
2. **Menú se abre** → `skinMenu.toggle()` cambia `visible` a true
3. **Juego pausa** → `update()` retorna temprano si menú visible
4. **Jugador navega** → Flechas ↑↓ llaman `selectNext()` o `selectPrev()`
5. **Jugador confirma** → ENTER asigna skin y cierra menú
6. **Nave cambia de forma** → Siguiente `draw()` usa nueva forma y color

## Variables Globales

```javascript
let skinMenu;  // Instancia única del menú de skins (línea 634)
```

Se inicializa en `initGame()` y persiste durante toda la sesión del juego.

## Aspectos Técnicos Importantes

### Renderización de Skins

Cada skin usa únicamente funciones de Canvas nativas:
```javascript
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x, y);
ctx.closePath();
ctx.stroke();
```

No usan imágenes, lo que garantiza escalabilidad y bajo overhead.

### No afecta Gameplay

- **Colisiones**: Usan `ship.radius = 12` (constante)
- **Disparos**: El origen sale del mismo punto
- **Física**: Velocidad, rotación, drag sin cambios
- **Puntuación**: No hay variación por skin

### Performance

- Una sola instancia de `SkinMenu`
- Dibujo solo si `visible === true`
- Arrays de skins sin búsquedas dinámicas
- Complejidad O(1) para cambiar skin

## Extensibilidad

Para agregar nuevos skins:

1. Agregar entrada a `SKINS`:
```javascript
newSkin: {
  name: 'Mi Skin',
  color: '#ff0000',
  draw: function() {
    ctx.beginPath();
    ctx.moveTo(10, 0);
    // ... dibujar forma
    ctx.closePath();
    ctx.stroke();
  }
}
```

2. El sistema automáticamente:
   - Lo incluye en `SKIN_KEYS`
   - Lo añade al menú
   - Permite navegación hacia él

## Testing

Se validó:
- ✓ Sintaxis: `node -c game.js`
- ✓ Estructura: Todas las clases y métodos presentes
- ✓ Lógica: SkinMenu funciona correctamente
- ✓ Integración: Game loop detecta input correcto
- ✓ Renderización: Menú se dibuja en posición correcta

## Archivos Modificados

- `game.js`: +259 líneas (~39% aumento)
- `index.html`: Sin cambios
- `README.md`: Sin cambios

## Notas

- Los skins se almacenan solo en memoria (sesión actual)
- Si recargues la página, se reinicia al skin 'classic'
- El menú es agnóstico de resolución (usa W y H globales)
- La pausa del menú es suave (sin saltos de audio/animación)
