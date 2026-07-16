import { productDtoSchema } from '../models/product.dto';
import { Product } from '../models/product.model';

export class ProductMapper {
  private static readonly schema = productDtoSchema.transform((dto): Product => ({
    id: dto.id,
    name: dto.title,
    price: dto.price,
    category: dto.category,
    createdAt: new Date(dto.createdAt),
  }));

  /**
   * Transforms raw API response to internal Domain model.
   */
  static toDomain(data: unknown): Product {
    return this.schema.parse(data);
  }

  /**
   * Transforms raw API array response to array of Domain models.
   */
  static toDomainList(data: unknown): Product[] {
    return this.schema.array().parse(data);
  }
}
