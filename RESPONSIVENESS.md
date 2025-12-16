# 📱 Guia de Responsividade - SBAR Kids

## Breakpoints (Tailwind CSS)

| Dispositivo | Breakpoint | Classe | Resolução |
|---|---|---|---|
| **Mobile** | - | (padrão) | < 640px |
| **Tablet (Portrait)** | sm | `sm:` | 640px - 768px |
| **Tablet (Landscape)** | md | `md:` | 768px - 1024px |
| **Desktop** | lg | `lg:` | 1024px+ |

## Padrões de Implementação

### 1. **Padding e Margins Responsivos**
```tsx
// ✅ BOM - Responsivo
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  {children}
</div>

// ❌ RUIM - Fixo para desktop
<div className="px-12">
  {children}
</div>
```

### 2. **Tamanho de Fonte Responsivo**
```tsx
// ✅ BOM
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Título
</h1>

// ❌ RUIM
<h1 className="text-4xl font-bold">
  Título
</h1>
```

### 3. **Grid e Layout Responsivo**
```tsx
// ✅ BOM - 1 coluna em mobile, 2 em tablet, 3 em desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ❌ RUIM
<div className="grid grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### 4. **Flexbox Responsivo**
```tsx
// ✅ BOM - Stack em mobile, horizontal em desktop
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">Coluna 1</div>
  <div className="flex-1">Coluna 2</div>
</div>

// ❌ RUIM
<div className="flex gap-4">
  <div className="w-1/2">Coluna 1</div>
  <div className="w-1/2">Coluna 2</div>
</div>
```

### 5. **Visibilidade Responsiva**
```tsx
// ✅ BOM - Mostrar/ocultar de acordo com viewport
<div className="hidden sm:block">Visível apenas em tablet e desktop</div>
<div className="sm:hidden">Visível apenas em mobile</div>

// ❌ RUIM
<div>Sempre visível</div>
```

### 6. **Altura Responsiva**
```tsx
// ✅ BOM
<button className="h-9 sm:h-10 lg:h-11 px-3 sm:px-4">
  Button
</button>

// ❌ RUIM
<button className="h-11 px-4">
  Button
</button>
```

## Hook `useViewport`

Para lógica condicional complexa:

```tsx
import { useViewport } from '../hooks/useViewport';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, viewport, width } = useViewport();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
      
      <p>Viewport atual: {viewport}</p>
      <p>Largura: {width}px</p>
    </div>
  );
};
```

## Checklist para Novos Componentes

- [ ] Padding/Margin responsivo (mobile-first)
- [ ] Tamanho de fonte responsivo
- [ ] Imagens responsivas (`max-w-full`)
- [ ] Botões com altura responsiva
- [ ] Layouts stacked em mobile
- [ ] Testado em: Mobile (375px), Tablet (768px), Desktop (1024px+)
- [ ] Sem overflow de conteúdo
- [ ] Touch targets ≥ 44px em mobile

## Dicas Importantes

1. **Mobile-First**: Sempre defina o estilo para mobile primeiro, depois adicione `sm:`, `md:`, `lg:`
2. **Testing**: Use DevTools do navegador para simular diferentes dispositivos
3. **Imagens**: Use `max-w-full` e alturas automáticas
4. **Typography**: Reduzir tamanho de fonte em mobile, aumentar em desktop
5. **Espacamento**: Use `gap` em vez de `margin` para melhor controle responsivo

## Ferramentas Úteis

- Tailwind CSS DevTools
- Chrome DevTools (F12) - Modo responsivo
- Testar em dispositivo real quando possível
