import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { createTicket } from '../../utils/services/axios/ticketService';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export {} 

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = ({ isOpen, onClose, total }) => {
  if (!isOpen) return null;

  const { carrito, clearCarrito } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const cryptoOptions = ['BTC',  'USDT','BNB'];

  const handleCryptoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCrypto(event.target.value);
  };
  const handleCryptoCheckoutSuccess = () => {
    // Lógica de redirección después del pago
    window.location.href = `/compra-exitosa?moneda=${selectedCrypto}&total=${total}`;
  };



  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      new window.MercadoPago('APP_USR-679e9c30-b8ee-44cf-943b-04e088ec9163', {
        locale: 'es-AR',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(event.target.value);
    setSelectedCrypto(''); // Reiniciar selección de moneda si cambia el método de pago
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    setLoading(true);

    try {
      if (selectedPaymentMethod === 'MP') {
        const response = await fetch('http://localhost:5252/api/mp/crear-preferencia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total: total,
            userEmail: 'usuario@example.com',
            descripcionProducto: 'Compra en ecommerce',
            cantidad: 1,
            precioUnitario: total,
          }),
        });

        const { init_point } = await response.json();

        if (init_point) {
          window.open(init_point, '_blank');
          clearCarrito();
        } else {
          console.error('Error: no se obtuvo el init_point');
        }
      } else if (selectedPaymentMethod === 'CRIPTO') {
        // Coinbase Commerce handled directly in the modal
        console.log(`Procesando pago con ${selectedCrypto}`);
        // Simulación de redirección para verificar el pago
        setTimeout(() => {
          alert(`Pago exitoso con ${selectedCrypto}`);
          clearCarrito();
          onClose();
        }, 2000);
      } else {
        const productos = carrito.map(producto => ({
          productoId: producto.id ?? 0,
          cantidad: producto.quantity,
        }));

        await createTicket(productos, selectedPaymentMethod);
        clearCarrito();
        alert('Compra realizada con éxito.');
        onClose();
      }
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      alert('Hubo un problema con el pago. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[750px] h-[400px] rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu método de pago</h2>

        <div className="flex flex-col space-y-4">
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="MP"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Mercado Pago
          </label>
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="EFECTIVO"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Efectivo
          </label>
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="CRIPTO"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Criptomonedas
          </label>
        </div>

        {selectedPaymentMethod === 'CRIPTO' && (
          <div className="mt-6">
          <label htmlFor="crypto-select" className="block text-lg font-medium mb-2">
            Selecciona la moneda:
          </label>
          <select
            id="crypto-select"
            className="border border-gray-300 rounded-lg p-2 w-full"
            value={selectedCrypto}
            onChange={handleCryptoChange}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {cryptoOptions.map((crypto) => (
              <option key={crypto} value={crypto}>
                {crypto}
              </option>
            ))}
          </select>

          {selectedCrypto && (
            <div className="mt-4">
              <Checkout productId="6a003d54-e95f-413f-b78b-27e759349e11" onStatus={handleCryptoCheckoutSuccess} >
                <CheckoutButton coinbaseBranded  />
                <CheckoutStatus />
              </Checkout>
            </div>
          )}
        </div>
        )}

<div className="mt-6 flex justify-between items-center">
          <span className="text-3xl text-primary font-black">Total: ${total.toFixed(2)}</span>
          {selectedPaymentMethod !== 'CRIPTO' && (
            <button
              className="bg-primary text-white py-2 px-4 rounded-lg text-lg"
              onClick={() => alert('Procesando otros métodos de pago')}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Pagar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;
