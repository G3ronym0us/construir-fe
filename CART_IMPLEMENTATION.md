# Implementación del Carrito de Compras

## Descripción General

Se ha implementado un sistema completo de carrito de compras que funciona tanto para usuarios autenticados como no autenticados. El carrito se sincroniza automáticamente cuando un usuario inicia sesión.

## Características Implementadas

- **Carrito Local (localStorage)**: Los usuarios sin autenticar pueden agregar productos
- **Carrito Persistente (Backend)**: Los usuarios autenticados tienen su carrito en el servidor
- **Sincronización Automática**: Al hacer login, el carrito local se fusiona con el del servidor
- **UI Completa**: Botón del carrito, drawer lateral, cards de productos
- **Validación de Stock**: Verifica disponibilidad antes de agregar
- **Actualización en Tiempo Real**: Contador de items se actualiza instantáneamente

## Estructura de Archivos

```
src/
├── types/index.ts                       # +47 líneas - Tipos del carrito
├── services/
│   └── cart.ts                          # Nuevo - Lógica de negocio del carrito
├── context/
│   └── CartContext.tsx                  # Nuevo - Estado global del carrito
├── components/
│   ├── Navbar.tsx                       # Actualizado - Incluye botón del carrito
│   ├── ProductCard.tsx                  # Nuevo - Card con botón "Agregar al carrito"
│   └── cart/
│       ├── CartButton.tsx               # Nuevo - Botón con contador de items
│       ├── CartDrawer.tsx               # Nuevo - Panel lateral del carrito
│       ├── CartItem.tsx                 # Nuevo - Item individual del carrito
│       └── AddToCartButton.tsx          # Nuevo - Botón reutilizable
└── app/
    └── layout.tsx                       # Actualizado - Incluye CartProvider
```

## Uso en Componentes

### 1. Agregar productos al carrito

#### Opción A: Usando el componente ProductCard
```tsx
import ProductCard from "@/components/ProductCard";

<ProductCard product={product} />
```

#### Opción B: Usando AddToCartButton directamente
```tsx
import AddToCartButton from "@/components/cart/AddToCartButton";

// Versión completa
<AddToCartButton productId={5} quantity={1} />

// Versión icono (para cards pequeñas)
<AddToCartButton
  productId={5}
  quantity={1}
  variant="icon"
/>
```

### 2. Acceder al estado del carrito

```tsx
"use client";

import { useCart } from "@/context/CartContext";

function MyComponent() {
  const {
    cart,              // Carrito del servidor (si está autenticado)
    localCart,         // Carrito local (si no está autenticado)
    loading,           // Estado de carga
    error,             // Errores
    addToCart,         // Agregar producto
    updateQuantity,    // Actualizar cantidad
    removeFromCart,    // Eliminar producto
    clearCart,         // Vaciar carrito
    refreshCart,       // Recargar carrito
    getTotalItems,     // Obtener total de items
    getItemQuantity,   // Obtener cantidad de un producto específico
  } = useCart();

  // Ejemplo: Agregar producto
  const handleAdd = async () => {
    try {
      await addToCart(productId, 2);
      console.log("Producto agregado!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <p>Total de items: {getTotalItems()}</p>
      <button onClick={handleAdd}>Agregar al carrito</button>
    </div>
  );
}
```

### 3. Mostrar el carrito

El carrito ya está integrado en el Navbar. Para abrirlo desde otro componente:

```tsx
// El drawer se controla desde el Navbar
// Solo necesitas el botón CartButton
import CartButton from "@/components/cart/CartButton";

<CartButton onClick={() => setIsCartOpen(true)} />
```

## Flujo de Usuario

### Usuario No Autenticado
1. **Agregar productos**: Los productos se guardan en `localStorage`
2. **Ver carrito**: Puede ver sus items en el drawer lateral
3. **Intentar checkout**: Se redirige a `/login?redirect=/checkout`
4. **Después de login**: El carrito local se sincroniza automáticamente con el servidor

### Usuario Autenticado
1. **Agregar productos**: Los productos se envían directamente al backend
2. **Ver carrito**: Los items se cargan desde el servidor
3. **Checkout**: Puede proceder directamente al pago
4. **Persistencia**: El carrito se mantiene entre dispositivos

## API Endpoints Utilizados

```typescript
// Obtener carrito
GET /cart

// Agregar producto
POST /cart/items
Body: { productId: number, quantity: number }

// Actualizar cantidad
PATCH /cart/items/:id
Body: { quantity: number }

// Eliminar item
DELETE /cart/items/:id

// Vaciar carrito
DELETE /cart

// Sincronizar precios
POST /cart/sync-prices
```

## Ejemplo: Página de Productos

```tsx
"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts({
          page: 1,
          limit: 20,
          published: true
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {products.map((product) => (
        <ProductCard key={product.uuid} product={product} />
      ))}
    </div>
  );
}
```

## Personalización

### Cambiar el diseño del drawer
Edita `src/components/cart/CartDrawer.tsx`

### Cambiar el diseño de los items
Edita `src/components/cart/CartItem.tsx`

### Agregar animaciones
Instala y configura `framer-motion` para transiciones suaves

### Agregar notificaciones
Instala `react-hot-toast` o `sonner` para notificaciones cuando se agreguen productos

## Validaciones de Seguridad

- ✅ Validación de stock antes de agregar
- ✅ Verificación de autenticación en el backend
- ✅ Sanitización de inputs (cantidad, productId)
- ✅ Manejo de errores del servidor
- ✅ Precios actualizados desde el servidor

## Próximos Pasos Recomendados

1. **Módulo de Checkout**: Crear página para completar la compra
2. **Módulo de Órdenes**: Sistema para gestionar pedidos
3. **Pasarela de Pago**: Integrar Stripe, PayPal, etc.
4. **Cupones de Descuento**: Sistema de códigos promocionales
5. **Cálculo de Envío**: Integración con API de mensajería
6. **Favoritos/Wishlist**: Lista de deseos de productos
7. **Notificaciones**: Email cuando productos vuelvan a estar en stock

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

## Variables de Entorno

Asegúrate de tener configurado en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Troubleshooting

### El carrito no se sincroniza después de login
- Verifica que el token JWT esté guardado correctamente en localStorage
- Revisa la consola del navegador para errores
- Asegúrate de que el backend esté corriendo

### Los productos no aparecen en el carrito local
- Verifica que localStorage esté habilitado en el navegador
- Abre las DevTools → Application → Local Storage → Busca la key "cart"

### Error "Cannot add X more items"
- El producto no tiene suficiente stock
- Verifica el inventario del producto en la base de datos

### El contador del carrito no se actualiza
- Asegúrate de que el componente esté dentro del CartProvider
- Verifica que el CartProvider esté en el layout.tsx

## Testing

Para probar el flujo completo:

1. **Sin login**: Agrega productos → Verifica localStorage → Intenta checkout
2. **Con login**: Inicia sesión → Verifica que el carrito local se haya sincronizado
3. **Actualizar cantidad**: Cambia la cantidad de un producto
4. **Eliminar item**: Elimina un producto del carrito
5. **Vaciar carrito**: Vacía completamente el carrito
6. **Multi-dispositivo**: Inicia sesión en otro dispositivo y verifica la persistencia

## Soporte

Para problemas o preguntas:
- Backend: Revisa la documentación en el archivo de documentación del carrito
- Frontend: Revisa este archivo o contacta al equipo de desarrollo
