# Guía Rápida - Sistema de Skins

## Usa tu Nave Personalizada

### Teclas para Cambiar Skin

| Tecla | Función |
|-------|---------|
| **S** | Abre/cierra el menú de skins |
| **↑** | Navega al skin anterior |
| **↓** | Navega al skin siguiente |
| **ENTER** | Confirma y aplica el skin |

### Skins Disponibles

1. **Clásico** - Triángulo con muesca (blanco) - El original
2. **Diamante** - Rombo puntiagudo (verde)
3. **Pentágono** - 5 lados regulares (cian)
4. **Cuadrado** - Forma rectangular (magenta)
5. **Estrella** - Estrella de 5 puntas (amarillo)
6. **Cuña** - Triángulo muy ancho (naranja)
7. **Compacta** - Nave pequeña (verde agua)
8. **Futurista** - Forma angular moderna (magenta)

### Cómo Jugar

1. Abre el juego en el navegador
2. Presiona **S** durante el juego
3. Se abre un panel en la esquina superior derecha
4. Usa **↑** y **↓** para navegar entre skins
5. Presiona **ENTER** para confirmar
6. ¡El menú se cierra y tu nave cambia de forma!
7. Puedes cambiar de skin en cualquier momento

### Características

- ✓ Solo cambia la apariencia visual
- ✓ La jugabilidad permanece igual
- ✓ Puedes cambiar en cualquier momento
- ✓ El skin se mantiene entre muertes y niveles
- ✓ Cada skin tiene su color único

### Ejemplo de Uso

```
Durante una partida:
  1. Presiona S
  2. Ves el menú con un preview del skin actual
  3. Presiona ↓ para ir al siguiente skin
  4. Ves "Diamante" resaltado en el menú
  5. Presiona ENTER
  6. ¡Tu nave es ahora un diamante verde!
```

## Notas Técnicas

- El menú pausa automáticamente el juego
- Los skins se almacenan solo en memoria (sesión actual)
- Si recargars la página, vuelves al "Clásico"
- El menú aparece en la esquina superior derecha
- Hay un recordatorio en la esquina inferior derecha: "Presiona S para cambiar skin"

## Extensión Futura

Si quieres agregar más skins, solo necesitas:
1. Agregar una entrada al objeto `SKINS` en game.js
2. Definir el nombre, color y función de dibujo
3. ¡El sistema automáticamente lo incluye!

Consulta `SKINS_IMPLEMENTATION.md` para detalles técnicos.
