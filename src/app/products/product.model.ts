export type ProductType = 'single' | 'machine';

export interface Part {
  id: number;
  name: string;
  sku: string;
}

export interface ProductPayload {
  productName: string;
  model: string;
  brand: string;
  type: ProductType;
  unitPrice?: number;
  initialStock?: number;
  minStock?: number;
  parts?: Part[];
}

export const PARTS: Part[] = [
  { id: 1, name: 'Hydraulic Pump', sku: 'HP-102' },
  { id: 2, name: 'Control Valve', sku: 'CV-210' },
  { id: 3, name: 'Gasket Set', sku: 'GS-514' },
  { id: 4, name: 'Servo Motor', sku: 'SM-324' },
  { id: 5, name: 'Cooling Fan', sku: 'CF-408' }
];

export const SAMPLE_PRODUCTS: ProductPayload[] = [
  {
    productName: 'Hydraulic Press',
    model: 'HP-3000',
    brand: 'ProMech',
    type: 'machine',
    parts: [PARTS[0], PARTS[2], PARTS[3]]
  },
  {
    productName: 'Control Valve',
    model: 'CV-210',
    brand: 'ValveTech',
    type: 'single',
    unitPrice: 1450,
    initialStock: 26
  },
  {
    productName: 'Gasket Set',
    model: 'GS-514',
    brand: 'SealWorks',
    type: 'single',
    unitPrice: 48,
    initialStock: 120
  },
  {
    productName: 'Servo Motor',
    model: 'SM-324',
    brand: 'ElectroDrive',
    type: 'machine',
    parts: [PARTS[1], PARTS[4]]
  },
  {
    productName: 'Cooling Fan',
    model: 'CF-408',
    brand: 'CoolTech',
    type: 'single',
    unitPrice: 85,
    initialStock: 64
  }
];
