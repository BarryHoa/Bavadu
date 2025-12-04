# JSON-RPC Handler

Hệ thống JSON-RPC tích hợp với module.json để tự động expose các models đã đăng ký.

## Cấu trúc

- `jsonRpcHandler.ts`: Core handler cho JSON-RPC requests
- `methods/auth.ts`: Auth method handlers (auth.login, auth.logout, auth.me)
- `route.ts`: Next.js route handler tại `/api/rpc`

## Cách hoạt động

### 1. Dynamic Model Queries

Handler tự động expose các models từ `module.json`:

#### View List Queries
```
Method: viewList.<model-id>
Example: viewList.product.view-list
        viewList.b2c-sales.order.view-list
```

#### Dropdown Queries
```
Method: dropdown.<model-id>
Example: dropdown.product.dropdown-list
        dropdown.b2c-sales.price-list.dropdown-list
```

#### Generic Model Queries
```
Method: model.<model-id>.<method>
Example: model.product.createProduct
        model.b2c-sales.order.view-list.getData
```

### 2. Explicit Methods

Các methods được đăng ký rõ ràng:

- `auth.login`: Đăng nhập
- `auth.logout`: Đăng xuất
- `auth.me`: Lấy thông tin user hiện tại

## Client Usage

### Sử dụng JsonRpcClientService

```typescript
import { JsonRpcClientService } from "@base/client/services";

const rpc = new JsonRpcClientService("/api/rpc");

// Single call
const result = await rpc.call("auth.me");

// Dropdown query
const options = await rpc.call("dropdown.product.dropdown-list", {
  offset: 0,
  limit: 20,
  search: "laptop"
});

// Batch call
const results = await rpc.batch([
  { method: "auth.me" },
  { method: "viewList.product.view-list", params: { page: 1, pageSize: 10 } }
]);
```

### DropdownOptionsService

Service đã được cập nhật để dùng JSON-RPC:

```typescript
import { dropdownOptionsService } from "@base/client/services";

const options = await dropdownOptionsService.getOptionsDropdown(
  "product.dropdown-list",
  { offset: 0, limit: 20, search: "laptop" }
);
```

## Adding New Methods

### 1. Tạo method handler

```typescript
// module-base/server/rpc/methods/yourModule.ts
import { JsonRpcMethod } from "../jsonRpcHandler";

export const your_method: JsonRpcMethod = async (params, request) => {
  // Your logic here
  return result;
};
```

### 2. Đăng ký method

```typescript
// app/api/rpc/route.ts
import * as yourMethods from "@base/server/rpc/methods/yourModule";

rpcHandler.registerBatch(yourMethods);
```

## Model Validation

Handler tự động validate:
- Model tồn tại trong registry (từ module.json)
- Model name format (view-list, dropdown-list)
- Sử dụng `validateModelName` và `getModuleQueryByModel` utilities

## Error Codes

- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32001`: Authentication error
- `-32002`: Authorization error
- `-32003`: Validation error
- `-32004`: Not found
- `-32005`: Model error
- `-32006`: Model not found

