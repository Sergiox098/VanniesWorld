# 🐰 Vannie's World — Juego de Plataformas 2D Kawaii con Transformación

Un juego de plataformas en 2D para navegador con cámara centrada continuamente en el personaje (desplazamiento en $X$ e $Y$), estética pixel art *kawaii*, física cinemática rigurosamente calculada y mecánica de transformación dual entre dos formas con afinidades ambientales opuestas.

---

## 🌟 Características Principales

- **Cámara 2D Centrada**: El personaje es el foco central ininterrumpido; el escenario se desplaza suavemente en todas las direcciones ($X$ e $Y$) mediante interpolación *smooth lerp* con compensación de altura de salto y límites de escenario.
- **Mecánica de Transformación Dual**:
  - 🌸 **Forma 1 (Pastel)**: Diseño adorable en tonos pastel rosa/menta. Camina y salta sobre **Plataformas de Nube Rosa**; es vulnerable al magma ardiente; activa interruptores pastel.
  - 🔥 **Forma 2 (Carmesí)**: Diseño entrañable en rojo carmesí y obsidiana con cuernitos dorados. Es **inmune al Magma Ardiente** y camina sólidamente sobre él; es intangible en nubes pastel (cae a través de ellas); activa interruptores carmesí.
- **Validación Física y Cinemática Rigurosa**: Alturas y distancias calculadas analíticamente y verificadas mediante simulación numérica a 60 FPS.
- **10 Niveles de Progresión de Puzles**: Niveles compactos y ascendentes en desafío mental y mecánico sin alargar artificialmente el tiempo de juego.
- **Gráficos y Audio Nativos**: Generación de pixel art procedural y sintetizador de sonido dinámico retro con la Web Audio API (cero dependencias externas).
- **Soporte Multiplataforma**: Controles de teclado completos y botones táctiles optimizados para móviles y tablets.

---

## 📐 Parámetros de Física y Cinemática de Salto

| Parámetro | Símbolo | Valor Físico | Valor en Tiles ($T=32\text{ px}$) |
| :--- | :--- | :--- | :--- |
| **Tamaño de Tile** | $T$ | $32\text{ px}$ | $1\text{ tile}$ |
| **Hitbox del Personaje** | $w \times h$ | $24\text{ px} \times 28\text{ px}$ | $0.75 \times 0.875\text{ tiles}$ |
| **Velocidad Horizontal** | $v_x$ | $224\text{ px/s}$ | $7.0\text{ tiles/s}$ |
| **Gravedad** | $g$ | $1300\text{ px/s}^2$ | $40.625\text{ tiles/s}^2$ |
| **Impulso de Salto Inicial** | $v_0$ | $-440\text{ px/s}$ | $-13.75\text{ tiles/s}$ |
| **Tiempo a la Cúspide** | $t_{peak}$ | $\frac{\|v_0\|}{g} = 0.3385\text{ s}$ | — |
| **Altura Máxima de Salto** | $H_{max}$ | $\frac{v_0^2}{2g} = \mathbf{74.46\text{ px}}$ | $\mathbf{2.327\text{ tiles}}$ ($\ge 2\text{ tiles}$ seguro) |
| **Tiempo de Vuelo en Llano** | $T_{hang}$ | $2 \times t_{peak} = 0.6769\text{ s}$ | — |
| **Distancia Máxima en Llano** | $D_{max}$ | $v_x \times T_{hang} = \mathbf{151.6\text{ px}}$ | $\mathbf{4.737\text{ tiles}}$ ($\le 4\text{ tiles}$ seguro) |

---

## 🎮 Controles

| Acción | Teclado | Táctil / Pantalla |
| :--- | :--- | :--- |
| **Moverse a la Izquierda** | `A` o `Flecha Izquierda` | Botón `◀` |
| **Moverse a la Derecha** | `D` o `Flecha Derecha` | Botón `▶` |
| **Saltar** | `W`, `Flecha Arriba` o `Z` | Botón `▲` (Verde) |
| **Transformar Forma** | `Espacio`, `X` o `Shift` | Botón `CAMBIO` (Degradado) |
| **Reiniciar Nivel** | `R` | Botón `🔄` |
| **Alternar Sonido** | `M` | Botón `🔊` |

---

## 🚀 Cómo Ejecutar el Juego

1. Abre una terminal en el directorio del proyecto:
   ```bash
   node server.js
   ```
2. Abre en tu navegador favorito:
   ```
   http://localhost:3000
   ```

*(También puedes abrir `index.html` directamente usando cualquier servidor local como Live Server en VS Code o npx http-server).*

---

## 🧪 Validación Automatizada de Físicas

Para ejecutar la suite de pruebas matemáticas y de consistencia de niveles:
```bash
node test/validate_physics.js
node test/test_suite.js
```
