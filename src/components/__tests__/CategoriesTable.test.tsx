import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoriesTable } from '../admin/CategoriesTable';
import type { Category } from '@/types';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  uuid: 'cat-1',
  name: 'Herramientas',
  slug: 'herramientas',
  visible: true,
  isFeatured: false,
  image: 'https://cdn.construir/herramientas.webp',
  productCount: 12,
  order: 0,
  ...overrides,
} as Category);

const parentCategory = makeCategory({
  uuid: 'cat-parent',
  name: 'Maquinaria',
  slug: 'maquinaria',
  productCount: 96,
  childrens: [makeCategory(), makeCategory({ uuid: 'cat-2' })],
});

const childCategory = makeCategory({
  uuid: 'cat-child',
  name: 'Mano',
  slug: 'mano',
  parent: parentCategory,
  childrens: [],
});

const standaloneCategory = makeCategory({
  uuid: 'cat-solo',
  name: 'Pinturas',
  slug: 'pinturas',
  childrens: [],
});

const defaultProps = {
  categories: [parentCategory, childCategory, standaloneCategory],
  onDelete: vi.fn(),
  onToggleFeatured: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CategoriesTable — íconos de tipo', () => {
  it('muestra el tooltip "Categoría padre" para una categoría con hijos', () => {
    render(<CategoriesTable {...defaultProps} />);
    expect(document.querySelector('[title="Categoría padre"]')).toBeTruthy();
  });

  it('muestra el tooltip "Subcategoría" para una categoría con parent', () => {
    render(<CategoriesTable {...defaultProps} />);
    expect(document.querySelector('[title="Subcategoría"]')).toBeTruthy();
  });

  it('muestra el tooltip "Independiente" para una categoría sin parent ni hijos', () => {
    render(<CategoriesTable {...defaultProps} />);
    expect(document.querySelector('[title="Independiente"]')).toBeTruthy();
  });
});

describe('CategoriesTable — nombre y slug', () => {
  it('muestra el nombre de la categoría', () => {
    render(<CategoriesTable {...defaultProps} categories={[standaloneCategory]} />);
    expect(screen.getAllByText('Pinturas').length).toBeGreaterThan(0);
  });

  it('muestra customName en lugar de name cuando está disponible', () => {
    const cat = makeCategory({ customName: 'Pinturas Premium', childrens: [] });
    render(<CategoriesTable {...defaultProps} categories={[cat]} />);
    expect(screen.getAllByText('Pinturas Premium').length).toBeGreaterThan(0);
  });

  it('muestra el slug como la ruta pública', () => {
    render(<CategoriesTable {...defaultProps} categories={[standaloneCategory]} />);
    expect(screen.getAllByText('/pinturas').length).toBeGreaterThan(0);
  });
});

describe('CategoriesTable — jerarquía y conteos', () => {
  it('muestra el conteo de productos de la fila', () => {
    render(<CategoriesTable {...defaultProps} categories={[standaloneCategory]} />);
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
  });

  it('acompaña el conteo con las subcategorías cuando la categoría es padre', () => {
    render(<CategoriesTable {...defaultProps} categories={[parentCategory]} />);
    // El mock de traducciones devuelve la key: "96 · childrenCount"
    expect(screen.getByText('96 · childrenCount')).toBeInTheDocument();
  });

  it('cae a 0 productos cuando el backend no manda el conteo', () => {
    const sinConteo = makeCategory({ productCount: undefined, childrens: [] });
    render(<CategoriesTable {...defaultProps} categories={[sinConteo]} />);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});

describe('CategoriesTable — destacadas sin imagen', () => {
  it('avisa que una destacada sin imagen no se está mostrando', () => {
    const rota = makeCategory({ isFeatured: true, image: undefined, childrens: [] });
    render(<CategoriesTable {...defaultProps} categories={[rota]} />);
    expect(screen.getAllByText('noImageShort').length).toBeGreaterThan(0);
  });

  it('no avisa cuando la destacada sí tiene imagen', () => {
    const sana = makeCategory({ isFeatured: true, childrens: [] });
    render(<CategoriesTable {...defaultProps} categories={[sana]} />);
    expect(screen.queryByText('noImageShort')).toBeNull();
  });
});

describe('CategoriesTable — acciones', () => {
  it('llama a onToggleFeatured con el uuid y el valor actual al hacer click en la estrella', () => {
    render(<CategoriesTable {...defaultProps} categories={[standaloneCategory]} />);

    // Estrella de escritorio y de móvil renderizan las dos.
    fireEvent.click(screen.getAllByTitle('markFeatured')[0]);

    expect(defaultProps.onToggleFeatured).toHaveBeenCalledWith('cat-solo', false);
  });

  it('delega el eliminado a la página con la categoría completa', () => {
    render(<CategoriesTable {...defaultProps} categories={[standaloneCategory]} />);

    fireEvent.click(screen.getAllByText('delete')[0]);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(standaloneCategory);
  });
});
