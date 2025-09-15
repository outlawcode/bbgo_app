# Push Notification Deep Link Fix

## Tổng quan
Tài liệu này mô tả việc sửa lỗi deep linking cho push notifications trong ứng dụng SME Mart và thêm các push notification mới.

## Các loại Push Notification được hỗ trợ

### 1. Product Notifications (PRODUCT)
- **Type**: `product`
- **Server**: Gửi `slug` và `shopId` trong data payload
- **App**: Mở ProductDetail screen với `slug` và `shopId`
- **Deep Link**: `smemart://app/product/{slug}?shopId={shopId}`
- **Screen**: `ProductDetail` - cần cả `slug` và `shopId` để fetch data

### 2. Post Notifications (INFO)
- **Type**: `info`
- **Server**: Gửi `slug` trong data payload
- **App**: Mở PostDetail screen với `slug`
- **Deep Link**: `smemart://app/post/{slug}`
- **Screen**: `PostDetail` - chỉ cần `slug` để fetch data

### 3. Order Notifications (ORDER)
- **Type**: `order`
- **Server**: Gửi `slug` (chứa order ID) trong data payload
- **App**: Mở OrderDetail screen với `id`
- **Deep Link**: `smemart://app/order/{id}`
- **Screen**: `OrderDetail` - cần `id` để fetch data

### 4. Transaction Notifications (TRANSACTION)
- **Type**: `transaction`
- **Server**: Gửi `slug` (chứa transaction ID) trong data payload
- **App**: Hiển thị thông báo (chưa có deep link)
- **Deep Link**: Chưa có (có thể thêm sau)
- **Screen**: Chưa có transaction detail screen

## Các thay đổi đã thực hiện

### Server-side Changes

#### 1. Product Service (`product.service.ts`)
```typescript
// Thêm shopId vào push notification
this.pushNotifyService.sendPushNotification({
  title: saveData.name,
  body: `Sản phẩm mới của ${shopInfo ? shopInfo.name : 'SME'}`,
  token: item.token,
  type: PushNotifyType.PRODUCT,
  slug: saveData.slug,
  shopId: shopInfo ? shopInfo.id : null  // ← Thêm shopId
});
```

#### 2. Push Notification Service (`push-notify.service.ts`)
```typescript
// Cập nhật method signatures để hỗ trợ shopId
async pushNow({
  title,
  body,
  token,
  type,
  slug,
  shopId,  // ← Thêm shopId parameter
  platform = 'mobile'
}) {
  // Thêm shopId vào data payload
  data: {
    type: type || '',
    slug: slug || '',
    shopId: shopId || '',  // ← Thêm shopId
    platform: 'mobile'
  }
}
```

#### 3. Order Service - Thanh toán thành công (`order.service.ts`)
```typescript
// Gửi push notification cho người mua
const buyerTokens = await this.pushNotificationTokenRepository
  .createQueryBuilder("token")
  .leftJoinAndSelect("token.user", "user")
  .where("user.id = :userId", {
    userId: order.user.id
  })
  .getMany();

if (buyerTokens.length > 0) {
  for (const item of buyerTokens) {
    this.pushNotifyService.sendPushNotification({
      title: 'Thanh toán đơn hàng thành công',
      body: `Đơn hàng #${order.id} đã được thanh toán thành công với số tiền ${formattedAmount}`,
      token: item.token,
      type: PushNotifyType.ORDER,
      slug: order.id.toString()
    });
  }
}

// Gửi push notification cho chủ shop
let shopOwner = null;
if (order.type === OrderType.PRODUCT && order.shop) {
  shopOwner = order.shop.user;
} else if (order.type === OrderType.SERVICE && order.serviceAddress) {
  shopOwner = order.serviceAddress.user;
}

if (shopOwner) {
  const shopTokens = await this.pushNotificationTokenRepository
    .createQueryBuilder("token")
    .leftJoinAndSelect("token.user", "user")
    .where("user.id = :userId", {
      userId: shopOwner.id
    })
    .getMany();

  if (shopTokens.length > 0) {
    for (const item of shopTokens) {
      this.pushNotifyService.sendPushNotification({
        title: 'Có đơn hàng mới được thanh toán',
        body: `Đơn hàng #${order.id} đã được thanh toán thành công với số tiền ${formattedAmount}`,
        token: item.token,
        type: PushNotifyType.ORDER,
        slug: order.id.toString()
      });
    }
  }
}
```

#### 4. Order Service - Cập nhật trạng thái đơn hàng
```typescript
// approvedOrder - Đơn hàng được duyệt
this.pushNotifyService.sendPushNotification({
  title: 'Đơn hàng đã được duyệt',
  body: `Đơn hàng #${order.id} đã được duyệt và đang chuẩn bị`,
  token: item.token,
  type: PushNotifyType.ORDER,
  slug: order.id.toString()
});

// dangGiaoHang - Đơn hàng đang giao
this.pushNotifyService.sendPushNotification({
  title: 'Đơn hàng đang được giao',
  body: `Đơn hàng #${order.id} đang được giao đến bạn`,
  token: item.token,
  type: PushNotifyType.ORDER,
  slug: order.id.toString()
});

// daNhanHang - Đơn hàng hoàn thành
this.pushNotifyService.sendPushNotification({
  title: 'Đơn hàng đã hoàn thành',
  body: `Đơn hàng #${order.id} đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ!`,
  token: item.token,
  type: PushNotifyType.ORDER,
  slug: order.id.toString()
});
```

#### 5. Transactions Service - Rút tiền/Nạp tiền
```typescript
// saleWithdraw - Yêu cầu rút tiền (đã có sẵn)
this.pushNotifyService.sendAdminNotification({
  title: 'Yêu cầu rút tiền mới',
  body: `${user.name} yêu cầu rút ${amount} VND từ ${walletName}`,
  type: 'transaction',
  slug: transaction.id.toString()
});

// saleDeposit - Yêu cầu nạp tiền (đã có sẵn)
this.pushNotifyService.sendAdminNotification({
  title: 'Yêu cầu nạp tiền mới',
  body: `${user.name} yêu cầu nạp ${amount} VND vào ${wallet}`,
  type: 'transaction',
  slug: newTransaction.id.toString()
});

// managerDeposit - Nhân viên nạp tiền cho thành viên
this.pushNotifyService.sendAdminNotification({
  title: 'Nhân viên nạp tiền cho thành viên',
  body: `${currentManager.name} đã nạp ${amount} VND vào ${wallet} cho ${user.name}`,
  type: 'transaction',
  slug: newTransaction.id.toString()
});
```

#### 6. Transactions Service - Duyệt/Từ chối giao dịch
```typescript
// managerApprovedTransaction - Duyệt giao dịch
// Gửi push notification cho user khi rút tiền được duyệt
this.pushNotifyService.sendPushNotification({
  title: 'Yêu cầu rút tiền đã được duyệt',
  body: `Yêu cầu rút ${formattedAmount} đã được admin duyệt và chuyển khoản`,
  token: item.token,
  type: 'transaction',
  slug: transactionInfo.id.toString()
});

// Gửi push notification cho user khi nạp tiền được duyệt
this.pushNotifyService.sendPushNotification({
  title: 'Yêu cầu nạp tiền đã được duyệt',
  body: `Yêu cầu nạp ${formattedAmount} đã được admin duyệt và cộng vào ví`,
  token: item.token,
  type: 'transaction',
  slug: transactionInfo.id.toString()
});

// managerCanceledTransaction - Từ chối giao dịch
this.pushNotifyService.sendPushNotification({
  title: 'Yêu cầu rút tiền đã bị từ chối',
  body: `Yêu cầu rút ${formattedAmount} đã bị admin từ chối`,
  token: item.token,
  type: 'transaction',
  slug: transactionInfo.id.toString()
});
```

### App-side Changes

#### 1. Push Notification Handler (`pushnotifycation.js`)
```javascript
// Xử lý product notifications với shopId
if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
  console.log('Opening product with slug:', remoteMessage.data.slug, 'shopId:', remoteMessage.data.shopId);
  if (remoteMessage.data.shopId) {
    Linking.openURL(`smemart://app/product/${remoteMessage.data.slug}?shopId=${remoteMessage.data.shopId}`)
  } else {
    Linking.openURL(`smemart://app/product/${remoteMessage.data.slug}`)
  }
}

// Xử lý transaction notifications
if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
  console.log('Transaction notification:', remoteMessage.data.slug);
  // Có thể mở transaction detail screen nếu có
  // Linking.openURL(`smemart://app/transaction/${remoteMessage.data.slug}`)
}
```

#### 2. ProductDetail Screen (`ProductDetail/index.js`)
```javascript
// Xử lý shopId từ route params hoặc query params
const { slug } = props.route.params;
const shopId = props.route.params.shopId || props.route.params?.query?.shopId;

// Thêm error handling
if (!slug) {
  console.log('No slug provided');
  showMessage({
    message: 'Không tìm thấy sản phẩm!',
    type: 'danger',
    icon: 'danger',
    duration: 3000,
  });
  props.navigation.goBack();
  return;
}

if (!shopId) {
  console.log('No shopId provided');
  showMessage({
    message: 'Không tìm thấy thông tin cửa hàng!',
    type: 'danger',
    icon: 'danger',
    duration: 3000,
  });
  props.navigation.goBack();
  return;
}
```

#### 3. PostDetail Screen (`PostDetail.js`)
```javascript
// Thêm error handling cho post detail
if (!slug) {
  console.log('No slug provided');
  showMessage({
    message: 'Không tìm thấy bài viết!',
    type: 'danger',
    icon: 'danger',
    duration: 3000,
  });
  props.navigation.goBack();
  return;
}
```

#### 4. OrderDetail Screen (`OrderDetail.js`)
```javascript
// Thêm error handling cho order detail
if (!orderId) {
  console.log('No orderId provided');
  showMessage({
    message: 'Không tìm thấy đơn hàng!',
    type: 'danger',
    icon: 'danger',
    duration: 3000,
  });
  props.navigation.goBack();
  return;
}
```

## Linking Configuration

### Navigation Linking (`linking.js`)
```javascript
const config = {
  screens: {
    ProductDetail: {
      path: 'product/:slug',
      parse: {
        slug: (slug) => `${slug}`,
      },
    },
    PostDetail: {
      path: 'post/:slug',
      parse: {
        slug: (slug) => `${slug}`,
      },
    },
    OrderDetail: {
      path: 'order/:id',
      parse: {
        id: (id) => `${id}`,
      },
    },
  }
}
```

## Danh sách Push Notifications mới

### 1. Thanh toán đơn hàng thành công
- **Người mua**: "Thanh toán đơn hàng thành công"
- **Chủ shop**: "Có đơn hàng mới được thanh toán"
- **Admin**: "Đơn hàng mới" (đã có sẵn)

### 2. Cập nhật trạng thái đơn hàng
- **Đơn hàng được duyệt**:
  - Người mua: "Đơn hàng đã được duyệt"
  - Chủ shop: "Đơn hàng đã được admin duyệt"
- **Đơn hàng đang giao**:
  - Người mua: "Đơn hàng đang được giao"
  - Chủ shop: "Đơn hàng đã được giao cho khách hàng"
- **Đơn hàng hoàn thành**:
  - Người mua: "Đơn hàng đã hoàn thành"
  - Chủ shop: "Đơn hàng đã được khách hàng xác nhận nhận hàng"

### 3. Giao dịch tài chính
- **Yêu cầu rút tiền**:
  - Admin: "Yêu cầu rút tiền mới" (đã có sẵn)
  - User: "Yêu cầu rút tiền đã được duyệt/từ chối"
- **Yêu cầu nạp tiền**:
  - Admin: "Yêu cầu nạp tiền mới" (đã có sẵn)
  - User: "Yêu cầu nạp tiền đã được duyệt/từ chối"
- **Nhân viên nạp tiền**:
  - Admin: "Nhân viên nạp tiền cho thành viên"

## Testing

### Test Push Notifications
1. **Product**: Tạo sản phẩm mới → Kiểm tra push notification → Click vào notification → Mở đúng ProductDetail
2. **Post**: Tạo bài viết mới → Kiểm tra push notification → Click vào notification → Mở đúng PostDetail  
3. **Order**: Tạo đơn hàng mới → Kiểm tra push notification → Click vào notification → Mở đúng OrderDetail
4. **Payment**: Thanh toán đơn hàng → Kiểm tra push notification cho người mua và chủ shop
5. **Order Status**: Cập nhật trạng thái đơn hàng → Kiểm tra push notification
6. **Withdraw/Deposit**: Tạo yêu cầu rút/nạp tiền → Kiểm tra push notification cho admin và user

### Debug Steps
1. Kiểm tra console logs trong app để xem deep link parameters
2. Kiểm tra server logs để xem push notification data
3. Sử dụng Firebase Console để test push notifications
4. Kiểm tra FCM token validity

## Lưu ý quan trọng

1. **Product notifications** cần cả `slug` và `shopId` để hoạt động đúng
2. **Post notifications** chỉ cần `slug`
3. **Order notifications** sử dụng `id` của order
4. **Transaction notifications** hiện tại chỉ hiển thị thông báo, chưa có deep link
5. Tất cả screens đều có error handling để tránh crash app
6. Push notifications được gửi async để không block UI
7. Admin luôn nhận được thông báo khi có yêu cầu rút tiền/nạp tiền
8. User nhận được thông báo khi giao dịch được duyệt/từ chối

## Troubleshooting

### Lỗi thường gặp
1. **"Post not found"**: Kiểm tra slug parameter trong deep link
2. **"Product not found"**: Kiểm tra cả slug và shopId parameters
3. **"Order not found"**: Kiểm tra order ID parameter
4. **FCM errors**: Kiểm tra Firebase configuration và token validity
5. **Missing notifications**: Kiểm tra user có FCM token không

### Debug Commands
```bash
# Kiểm tra server logs
docker logs smemart_server

# Test push notification endpoint
curl -X POST http://localhost:3000/api/push-notify/test

# Kiểm tra FCM tokens
curl -X GET http://localhost:3000/api/push-notify-token
``` 