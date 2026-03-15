const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID || '';
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY || '';

export async function requestPayment(userInfo = {}) {
  if (!window.PortOne) {
    throw new Error('PortOne SDK 로딩 실패');
  }

  const paymentId = `payment-${crypto.randomUUID()}`;

  const response = await window.PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey: CHANNEL_KEY,
    paymentId,
    orderName: '30일 다이어트 챌린지 예치금',
    totalAmount: 200000,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
    customer: {
      fullName: userInfo.name || '',
      email: userInfo.email || 'customer@example.com',
      ...(userInfo.phone ? { phoneNumber: userInfo.phone } : {}),
    },
    redirectUrl: `${window.location.origin}/success`,
  });

  if (response.code !== undefined) {
    const error = new Error(response.message);
    error.code = response.code;
    throw error;
  }

  // 결제 성공 시 success 페이지로 이동
  window.location.href = `${window.location.origin}/success?paymentId=${response.paymentId}`;
}
