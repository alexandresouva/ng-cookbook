import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ProductsApi } from './products.api';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private readonly api = inject(ProductsApi);

  getProduct(id: string): Observable<Product> {
    return this.api.getProduct(id);
  }

  getProducts(): Observable<Product[]> {
    return this.api.getProducts();
  }
}
