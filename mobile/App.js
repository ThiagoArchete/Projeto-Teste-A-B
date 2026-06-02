import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';

// ATENÇÃO:
// No celular/emulador, localhost pode não funcionar.
// Se sua API estiver no PC, troque pelo IP da sua máquina.
// Exemplo: const API_URL = 'http://192.168.0.10:3000';
const API_URL = 'http://localhost:3000';

const Stack = createNativeStackNavigator();

const CATEGORIES = ['Todos', 'Quentes', 'Gelados', 'Doces'];

const COFFEES = [
  {
    id: '1',
    name: 'Cappuccino Premium',
    category: 'Quentes',
    price: 15.9,
    rating: 4.8,
    tag: 'Mais vendido',
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80',
    description: 'O clássico italiano com muita espuma, leite cremoso e toque especial de canela.',
  },
  {
    id: '2',
    name: 'Espresso Intenso',
    category: 'Quentes',
    price: 8.5,
    rating: 4.6,
    tag: 'Foco total',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80',
    description: 'Puro, forte e perfeito para dar aquele gás nos estudos ou no código.',
  },
  {
    id: '3',
    name: 'Mocha Gelado',
    category: 'Gelados',
    price: 18,
    rating: 4.9,
    tag: 'Refrescante',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
    description: 'Café, calda de chocolate, leite gelado e muito gelo para dias quentes.',
  },
  {
    id: '4',
    name: 'Latte Caramelo',
    category: 'Doces',
    price: 17.5,
    rating: 4.7,
    tag: 'Doce na medida',
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&q=80',
    description: 'Café suave com leite vaporizado e calda de caramelo artesanal.',
  },
  {
    id: '5',
    name: 'Cold Brew Citrus',
    category: 'Gelados',
    price: 16.9,
    rating: 4.5,
    tag: 'Novo',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80',
    description: 'Café extraído a frio, servido com gelo e um toque cítrico elegante.',
  },
];

const SIZES = [
  { id: 'P', label: 'P', extra: 0 },
  { id: 'M', label: 'M', extra: 2 },
  { id: 'G', label: 'G', extra: 4 },
];

const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const cleanTrackName = (text) => {
  return text.replace(/\s+/g, '_');
};

const trackClick = async (buttonName) => {
  try {
    await axios.post(`${API_URL}/analytics/click`, {
      button_name: buttonName,
    });
  } catch (error) {
    console.log('Erro clique:', error.message);
  }
};

const trackPage = async (pageName) => {
  const renderTime = Math.floor(Math.random() * 350) + 50;

  try {
    await axios.post(`${API_URL}/analytics/page`, {
      page_name: pageName,
      render_time_ms: renderTime,
    });
  } catch (error) {
    console.log('Erro página:', error.message);
  }
};

const trackOrder = async (orderData) => {
  try {
    await axios.post(`${API_URL}/analytics/order`, orderData);
  } catch (error) {
    console.log('Erro pedido:', error.message);
  }
};

function WelcomeScreen({ navigation }) {
  useEffect(() => {
    trackPage('Tela_Bem_Vindo');
  }, []);

  return (
    <SafeAreaView style={styles.welcomeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#2A1712" />

      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
        }}
        style={styles.welcomeCover}
      />

      <View style={styles.welcomeOverlay}>
        <Text style={styles.brandMini}>CaféExpress</Text>
        <Text style={styles.heroTitle}>Seu café favorito em poucos cliques.</Text>
        <Text style={styles.heroSubtitle}>
          Escolha, personalize e finalize seu pedido com uma experiência mais bonita.
        </Text>
      </View>

      <View style={styles.welcomeContent}>
        <View style={styles.benefitsRow}>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Rápido</Text>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <Text style={styles.benefitText}>Favoritos</Text>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🛵</Text>
            <Text style={styles.benefitText}>Entrega</Text>
          </View>
        </View>

        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>💡 Sugestão do Barista</Text>
          <Text style={styles.suggestionText}>
            Hoje o dia pede um Espresso Intenso para manter o foco nos estudos!
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.welcomeButton}
          onPress={() => {
            trackClick('Botao_Abrir_Menu_Principal');
            navigation.navigate('Catalog');
          }}
        >
          <Text style={styles.welcomeButtonText}>VER CARDÁPIO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function CatalogScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    trackPage('Tela_Catalogo_Menu');
  }, []);

  const filteredCoffees = useMemo(() => {
    return COFFEES.filter((coffee) => {
      const matchesCategory =
        selectedCategory === 'Todos' || coffee.category === selectedCategory;

      const matchesSearch = coffee.name.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const toggleFavorite = (coffeeId) => {
    setFavorites((currentFavorites) => {
      if (currentFavorites.includes(coffeeId)) {
        return currentFavorites.filter((id) => id !== coffeeId);
      }

      return [...currentFavorites, coffeeId];
    });
  };

  const renderCategory = ({ item }) => {
    const isActive = item === selectedCategory;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.categoryPill, isActive && styles.categoryPillActive]}
        onPress={() => {
          setSelectedCategory(item);
          trackClick(`Filtro_Categoria_${item}`);
        }}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          trackClick(`Abrir_Detalhes_${cleanTrackName(item.name)}`);
          navigation.navigate('Details', { coffee: item });
        }}
      >
        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>

            <TouchableOpacity
              hitSlop={10}
              onPress={() => {
                toggleFavorite(item.id);
                trackClick(`Favoritar_${cleanTrackName(item.name)}`);
              }}
            >
              <Text style={styles.heart}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.coffeeName}>{item.name}</Text>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.catalogHeader}>
        <Text style={styles.screenTitle}>Escolha seu café ☕</Text>
        <Text style={styles.screenSubtitle}>Cardápio especial de hoje</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar café..."
          placeholderTextColor="#9C8A82"
          style={styles.searchInput}
        />

        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={filteredCoffees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum café encontrado</Text>
            <Text style={styles.emptyText}>Tente outro nome ou categoria.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function DetailsScreen({ route, navigation }) {
  const { coffee } = route.params;

  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState('Retirada');

  useEffect(() => {
    trackPage('Tela_Detalhes_Produto');
  }, []);

  const unitPrice = coffee.price + selectedSize.extra;
  const total = unitPrice * quantity;

  const order = {
    coffee,
    size: selectedSize,
    quantity,
    deliveryType,
    unitPrice,
    total,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: coffee.image }} style={styles.imageLarge} />

        <View style={styles.detailsBox}>
          <View style={styles.detailsTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{coffee.name}</Text>
              <Text style={styles.ratingLarge}>
                ⭐ {coffee.rating} • {coffee.category}
              </Text>
            </View>

            <View style={styles.detailsPriceBadge}>
              <Text style={styles.detailsPriceText}>
                {formatCurrency(coffee.price)}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{coffee.description}</Text>

          <Text style={styles.sectionTitle}>Escolha o tamanho</Text>

          <View style={styles.optionRow}>
            {SIZES.map((size) => {
              const isActive = selectedSize.id === size.id;

              return (
                <TouchableOpacity
                  key={size.id}
                  activeOpacity={0.85}
                  style={[styles.sizeOption, isActive && styles.sizeOptionActive]}
                  onPress={() => {
                    setSelectedSize(size);
                    trackClick(`Selecionar_Tamanho_${size.label}`);
                  }}
                >
                  <Text style={[styles.sizeLabel, isActive && styles.sizeLabelActive]}>
                    {size.label}
                  </Text>

                  <Text style={[styles.sizeExtra, isActive && styles.sizeExtraActive]}>
                    {size.extra === 0 ? 'base' : `+ ${formatCurrency(size.extra)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Tipo de pedido</Text>

          <View style={styles.optionRow}>
            {['Retirada', 'Entrega'].map((type) => {
              const isActive = deliveryType === type;

              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.85}
                  style={[
                    styles.deliveryOption,
                    isActive && styles.deliveryOptionActive,
                  ]}
                  onPress={() => {
                    setDeliveryType(type);
                    trackClick(`Selecionar_${type}`);
                  }}
                >
                  <Text
                    style={[
                      styles.deliveryText,
                      isActive && styles.deliveryTextActive,
                    ]}
                  >
                    {type === 'Retirada' ? '🏪 Retirada' : '🛵 Entrega'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.quantityBox}>
            <Text style={styles.sectionTitle}>Quantidade</Text>

            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.quantityNumber}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((current) => current + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => {
              trackClick(`Adicionar_Carrinho_${cleanTrackName(coffee.name)}`);
              navigation.navigate('Cart', { order });
            }}
          >
            <Text style={styles.primaryButtonText}>Adicionar ao Carrinho 🛒</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CartScreen({ route, navigation }) {
  const { order } = route.params;

  useEffect(() => {
    trackPage('Tela_Carrinho_Checkout');
  }, []);

  const deliveryFee = order.deliveryType === 'Entrega' ? 5 : 0;
  const finalTotal = order.total + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cartContainer}>
        <Text style={styles.title}>Resumo do Pedido</Text>
        <Text style={styles.screenSubtitle}>Confira tudo antes de finalizar</Text>

        <View style={styles.cartCard}>
          <Image source={{ uri: order.coffee.image }} style={styles.cartImage} />

          <View style={styles.cartInfo}>
            <Text style={styles.cartCoffeeName}>{order.coffee.name}</Text>
            <Text style={styles.cartText}>Tamanho: {order.size.label}</Text>
            <Text style={styles.cartText}>Quantidade: {order.quantity}</Text>
            <Text style={styles.cartText}>Pedido: {order.deliveryType}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.total)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.finalLabel}>Total</Text>
            <Text style={styles.finalValue}>{formatCurrency(finalTotal)}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.checkoutButton}
          onPress={async () => {
            trackClick('Botao_Finalizar_Checkout');

            await trackOrder({
              product_name: order.coffee.name,
              category: order.coffee.category,
              size: order.size.label,
              quantity: order.quantity,
              delivery_type: order.deliveryType,
              unit_price: order.unitPrice,
              total: finalTotal,
            });

            Alert.alert(
              'Sucesso!',
              `Pedido confirmado: ${order.quantity}x ${order.coffee.name}.`
            );

            navigation.reset({
              index: 1,
              routes: [{ name: 'Welcome' }, { name: 'Catalog' }],
            });
          }}
        >
          <Text style={styles.checkoutButtonText}>PAGAR E FINALIZAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Catalog')}
        >
          <Text style={styles.secondaryButtonText}>Continuar comprando</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2A1712' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#F7F1EA' },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Catalog"
          component={CatalogScreen}
          options={{ title: 'Nosso Menu' }}
        />

        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Detalhes' }}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Seu Carrinho' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1EA',
  },

  welcomeContainer: {
    flex: 1,
    backgroundColor: '#2A1712',
  },

  welcomeCover: {
    width: '100%',
    height: '58%',
    opacity: 0.72,
  },

  welcomeOverlay: {
    position: 'absolute',
    top: 70,
    left: 24,
    right: 24,
  },

  brandMini: {
    color: '#F8D8B0',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 18,
  },

  heroTitle: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },

  heroSubtitle: {
    color: '#F8E8D6',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },

  welcomeContent: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    marginTop: -60,
  },

  benefitsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  benefitCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },

  benefitIcon: {
    fontSize: 24,
    marginBottom: 6,
  },

  benefitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3E2723',
  },

  suggestionBox: {
    backgroundColor: '#FFF3E0',
    padding: 18,
    borderRadius: 18,
    borderLeftWidth: 5,
    borderLeftColor: '#D2691E',
    marginBottom: 20,
  },

  suggestionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A94F14',
    marginBottom: 6,
  },

  suggestionText: {
    fontSize: 14,
    color: '#5E4B43',
    lineHeight: 20,
  },

  welcomeButton: {
    backgroundColor: '#3E2723',
    width: '100%',
    padding: 19,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 5,
    marginTop: 'auto',
  },

  welcomeButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },

  catalogHeader: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2A1712',
  },

  screenSubtitle: {
    fontSize: 15,
    color: '#7B6257',
    marginTop: 4,
    marginBottom: 14,
  },

  searchInput: {
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 15,
    color: '#2A1712',
    elevation: 2,
  },

  categoryList: {
    paddingVertical: 16,
    gap: 10,
  },

  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E8D6C7',
  },

  categoryPillActive: {
    backgroundColor: '#3E2723',
    borderColor: '#3E2723',
  },

  categoryText: {
    color: '#6C554B',
    fontWeight: '800',
  },

  categoryTextActive: {
    color: '#FFF',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 3,
    flexDirection: 'row',
  },

  image: {
    width: 128,
    height: 148,
  },

  cardInfo: {
    flex: 1,
    padding: 14,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  tagText: {
    color: '#A94F14',
    fontSize: 11,
    fontWeight: '900',
  },

  heart: {
    fontSize: 21,
  },

  coffeeName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2A1712',
    marginTop: 10,
  },

  cardDescription: {
    color: '#796259',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },

  price: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '900',
  },

  rating: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5C463D',
  },

  emptyBox: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2A1712',
  },

  emptyText: {
    fontSize: 14,
    color: '#7B6257',
    marginTop: 6,
  },

  imageLarge: {
    width: '100%',
    height: 310,
  },

  detailsBox: {
    padding: 22,
    backgroundColor: '#FFF8F0',
    flex: 1,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    marginTop: -32,
  },

  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#2A1712',
    marginBottom: 8,
  },

  ratingLarge: {
    fontSize: 14,
    color: '#7B6257',
    fontWeight: '700',
  },

  detailsPriceBadge: {
    backgroundColor: '#EAF7EF',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
  },

  detailsPriceText: {
    color: '#2E8B57',
    fontWeight: '900',
    fontSize: 15,
  },

  description: {
    fontSize: 16,
    color: '#625048',
    lineHeight: 24,
    marginTop: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2A1712',
    marginBottom: 10,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  sizeOption: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D6C7',
  },

  sizeOptionActive: {
    backgroundColor: '#3E2723',
    borderColor: '#3E2723',
  },

  sizeLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3E2723',
  },

  sizeLabelActive: {
    color: '#FFF',
  },

  sizeExtra: {
    fontSize: 12,
    color: '#7B6257',
    marginTop: 4,
    fontWeight: '700',
  },

  sizeExtraActive: {
    color: '#F8D8B0',
  },

  deliveryOption: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D6C7',
  },

  deliveryOptionActive: {
    backgroundColor: '#D2691E',
    borderColor: '#D2691E',
  },

  deliveryText: {
    fontWeight: '900',
    color: '#3E2723',
  },

  deliveryTextActive: {
    color: '#FFF',
  },

  quantityBox: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quantityButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#3E2723',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
  },

  quantityNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2A1712',
  },

  totalBox: {
    backgroundColor: '#2A1712',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  totalLabel: {
    color: '#F8D8B0',
    fontSize: 16,
    fontWeight: '800',
  },

  totalValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },

  primaryButton: {
    backgroundColor: '#D2691E',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 20,
  },

  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },

  cartContainer: {
    flex: 1,
    padding: 22,
  },

  cartCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    elevation: 3,
    marginTop: 12,
    marginBottom: 18,
  },

  cartImage: {
    width: 100,
    height: 100,
    borderRadius: 18,
  },

  cartInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },

  cartCoffeeName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2A1712',
    marginBottom: 6,
  },

  cartText: {
    fontSize: 14,
    color: '#6C554B',
    marginTop: 2,
    fontWeight: '700',
  },

  summaryBox: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 18,
    elevation: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  summaryLabel: {
    color: '#7B6257',
    fontSize: 15,
    fontWeight: '700',
  },

  summaryValue: {
    color: '#2A1712',
    fontSize: 15,
    fontWeight: '900',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8D6C7',
    marginVertical: 4,
  },

  finalLabel: {
    color: '#2A1712',
    fontSize: 18,
    fontWeight: '900',
  },

  finalValue: {
    color: '#2E8B57',
    fontSize: 22,
    fontWeight: '900',
  },

  checkoutButton: {
    backgroundColor: '#B22222',
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 'auto',
    elevation: 5,
  },

  checkoutButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },

  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#3E2723',
    fontSize: 15,
    fontWeight: '900',
  },
});