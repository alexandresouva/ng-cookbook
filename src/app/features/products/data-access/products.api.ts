import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProductMapper } from './products.mapper';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);

  getProduct(id: string): Observable<Product> {
    return this.http
      .get<unknown>(`/api/products/${id}`)
      .pipe(map((response) => ProductMapper.toDomain(response)));
  }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<unknown>('/api/products')
      .pipe(map((response) => ProductMapper.toDomainList(response)));
  }
}
