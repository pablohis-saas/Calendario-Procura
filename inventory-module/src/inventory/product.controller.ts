import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get('category/:categoryName')
  async findByCategory(@Param('categoryName') categoryName: string) {
    return this.productService.findByCategory(decodeURIComponent(categoryName));
  }
} 