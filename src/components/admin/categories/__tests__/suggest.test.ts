import { describe, it, expect } from 'vitest';
import { suggestCategory } from '../suggest';
import type { Category } from '@/types';

const makeCategory = (name: string, slug: string): Category =>
  ({ uuid: slug, name, slug, visible: true, isFeatured: false, order: 0 } as Category);

const CATEGORIES = [
  makeCategory('Plomería', 'plomeria'),
  makeCategory('Pinturas y acabados', 'pinturas-y-acabados'),
  makeCategory('Cemento y agregados', 'cemento-y-agregados'),
];

describe('suggestCategory', () => {
  it('corrige un error de tipeo cercano y sugiere el nombre legible', () => {
    expect(suggestCategory('plomeira', CATEGORIES)).toBe('Plomería');
  });

  it('ignora los acentos al comparar', () => {
    expect(suggestCategory('plomeria', CATEGORIES)).toBe('Plomería');
  });

  it('también acierta cuando lo parecido es el slug y no el nombre', () => {
    const categorias = [makeCategory('Techos y láminas', 'techos-y-laminas')];
    expect(suggestCategory('techos-y-lamina', categorias)).toBe('techos-y-laminas');
  });

  it('no sugiere nada cuando ninguna categoría está cerca', () => {
    expect(suggestCategory('taladros', CATEGORIES)).toBeNull();
  });

  it('no sugiere con términos demasiado cortos para acertar', () => {
    expect(suggestCategory('pl', CATEGORIES)).toBeNull();
  });

  it('devuelve el candidato más cercano cuando hay varios en rango', () => {
    const cercanas = [
      makeCategory('Pinturas', 'pinturas'),
      makeCategory('Pintura', 'pintura'),
    ];
    expect(suggestCategory('pintura', cercanas)).toBe('Pintura');
  });
});
