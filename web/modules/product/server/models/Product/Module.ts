import { BaseModel } from "@/module-base/server";


class Module extends BaseModel {
  constructor() {
    super("product.variant");
  }
}

export default Module;