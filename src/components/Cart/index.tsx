import { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { CartItem } from '../../types/CartItem';
import { Product } from '../../types/products';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../Button';
import { MinusCircle } from '../Icons/MinusCircle';
import { PlusCircle } from '../Icons/PlusCircle';
import { OrderConfirmedModal } from '../OrderConfirmedModal';
import api from '../../services/api';
import { Text } from '../Text';
import { ProductContainer, Actions, Item, Image, QuantityContainer, ProductDetails, Summary, TotalContent } from './styles';

interface CartProps {
  cartItems: CartItem[];
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
  onConfirmOrder: () => void;
  selectedTable: string;
}


export function Cart({ cartItems, onAdd, onRemove, onConfirmOrder, selectedTable }: CartProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const total = cartItems.reduce((acc, cartItem) => {
    return acc + cartItem.quantity * cartItem.product.price;
  }, 0);

  async function handleConfirmOrder() {
    setIsLoading(true);

    const payload = {
      table: selectedTable,
      products: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
    };
    await api.post('/orders', payload);

    setIsLoading(false);
    setIsModalVisible(true);
  }

  function handleOk() {
    onConfirmOrder();
    setIsModalVisible(false);
  }

  return (
    <>
      <OrderConfirmedModal visible={isModalVisible} onOk={(handleOk)} />
      {cartItems.length > 0 && (
        <FlatList
          data={cartItems}
          keyExtractor={cartItem => cartItem.product._id}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 20, maxHeight: 150 }}
          renderItem={({ item: cartItem }) => (
            <Item>
              <ProductContainer>
                <Image source={{ uri: `http://192.168.1.2:3333/uploads/${cartItem.product.imagePath}` }} />

                <QuantityContainer>
                  <Text size={14} color='#666'>{cartItem.quantity}x</Text>
                </QuantityContainer>

                <ProductDetails>
                  <Text weight='600' size={14}>{cartItem.product.name}</Text>
                  <Text color='#666' style={{ marginTop: 4 }} size={14}>{formatCurrency(cartItem.product.price)}</Text>
                </ProductDetails>

              </ProductContainer>
              <Actions>
                <TouchableOpacity style={{ marginRight: 24 }} onPress={() => onAdd(cartItem.product)}>
                  <PlusCircle />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onRemove(cartItem.product)}>
                  <MinusCircle />
                </TouchableOpacity>
              </Actions>
            </Item>
          )}
        >
        </FlatList>
      )}


      <Summary>
        <TotalContent>
          {cartItems.length > 0 ? (
            <>
              <Text color='#666'>Total</Text>
              <Text size={20} weight='600'>{formatCurrency(total)}</Text>
            </>
          ) : (
            <Text color='#666'>Seu carrinho está vazio</Text>
          )}

        </TotalContent>
        <Button onPress={handleConfirmOrder} disabled={cartItems.length === 0} loading={isLoading}>
          Confirmar pedido
        </Button>
      </Summary>

    </>
  );
}
