import axios from 'axios';

// Function to create a Mercado Pago preference
export const create_mercadopago_preference = async (orderData: any) => {
  try {
    const response = await axios.post('/process-payment/', {
      amount: orderData.total_price,
      description: `Order with ${orderData.items.length} items`,
      payment_method_id: 'mercadopago',
      email: localStorage.getItem('user_email') || '',
      // Additional data for the order
      order_items: JSON.stringify(orderData.items),
      address: orderData.payer.address.street_name,
      city: orderData.payer.address.city_name,
      postal_code: orderData.payer.address.zip_code,
    });
    
    return response;
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    throw error;
  }
};

// Function to check payment status
export const check_payment_status = async (payment_id: string) => {
  try {
    const response = await axios.get(`/payment-status/${payment_id}/`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};
