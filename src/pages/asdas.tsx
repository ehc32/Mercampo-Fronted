// Checkout.tsx
import React, { useState } from 'react';
import axiosInstance from './axiosConfig';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: 'Producto 1', price: 100, quantity: 2 },
    { id: 2, name: 'Producto 2', price: 50, quantity: 1 }
  ]);
  
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    postalCode: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('mercadoPago');

  const calculateTotal = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleMercadoPagoPayment = async (): Promise<void> => {
    if (!address.street || !address.city || !address.postalCode) {
      setError('Completa la dirección de envío');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Arma la data de la orden
      const orderData = {
        order_items: JSON.stringify(
          cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        ),
        total_price: calculateTotal(),
        address: address.street,
        city: address.city,
        postal_code: address.postalCode
      };

      // Llama al endpoint que crea la orden y genera la preferencia de Mercado Pago
      const response = await axiosInstance.post<{ checkout_url: string }>(
        '/orders/create_with_mp/',
        orderData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Redirige a Mercado Pago
      window.location.href = response.data.checkout_url;
    } catch (err: any) {
      console.error('Error al procesar el pago:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: number, value: number): void => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, value) } : item
    ));
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Productos</h2>
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border rounded text-center"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-right font-bold">Total: ${calculateTotal().toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Calle</label>
            <input
              type="text"
              name="street"
              value={address.street}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                name="postalCode"
                value={address.postalCode}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="paymentMethod"
              value="mercadoPago"
              checked={paymentMethod === 'mercadoPago'}
              onChange={() => setPaymentMethod('mercadoPago')}
              className="h-4 w-4 text-blue-600"
            />
            <span>Mercado Pago</span>
          </label>
          {/* Puedes agregar más métodos si es necesario */}
        </div>
      </div>
      
      <button
        onClick={handleMercadoPagoPayment}
        disabled={loading || !paymentMethod || !address.street || !address.city || !address.postalCode}
        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
      </button>
    </div>
  );
};

export default Checkout;
