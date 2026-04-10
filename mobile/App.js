import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const Stack = createNativeStackNavigator();

const COFFEES = [
  { id: '1', name: 'Cappuccino Premium', price: 'R$ 15,90', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&q=80', description: 'O clássico italiano com muita espuma e toque de canela.' },
  { id: '2', name: 'Espresso Intenso', price: 'R$ 8,50', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80', description: 'Puro, forte e perfeito para dar aquele gás nos estudos.' },
  { id: '3', name: 'Mocha Gelado', price: 'R$ 18,00', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', description: 'Café, calda de chocolate e muito gelo.' },
];

const trackClick = async (buttonName) => {
  try {
    await axios.post(`${API_URL}/analytics/click`, { button_name: buttonName });
  } catch (error) {
    console.log('Erro clique:', error.message);
  }
};

const trackPage = async (pageName) => {
  const renderTime = Math.floor(Math.random() * 350) + 50; 
  try {
    await axios.post(`${API_URL}/analytics/page`, { page_name: pageName, render_time_ms: renderTime });
  } catch (error) {
    console.log('Erro página:', error.message);
  }
};

function WelcomeScreen({ navigation }) {
  useEffect(() => { trackPage('Tela_Bem_Vindo'); }, []);

  return (
    <View style={styles.welcomeContainer}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80' }} 
        style={styles.welcomeCover} 
      />
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>CaféExpress</Text>
        <Text style={styles.welcomeSubtitle}>O combustível perfeito para o seu código.</Text>
        
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>💡 Sugestão do Barista:</Text>
          <Text style={styles.suggestionText}>Hoje o dia pede um Espresso Intenso para manter o foco!</Text>
        </View>

        <TouchableOpacity 
          style={styles.welcomeButton} 
          onPress={() => {
            trackClick('Botao_Abrir_Menu_Principal');
            navigation.navigate('Catalog');
          }}>
          <Text style={styles.welcomeButtonText}>VER CARDÁPIO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CatalogScreen({ navigation }) {
  useEffect(() => { trackPage('Tela_Catalogo_Menu'); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardInfo}>
        <Text style={styles.coffeeName}>{item.name}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            trackClick(`Ver_Detalhes_${item.name.replace(' ', '')}`);
            navigation.navigate('Details', { coffee: item });
          }}>
          <Text style={styles.buttonText}>Ver Opções</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={COFFEES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  useEffect(() => { trackPage('Tela_Detalhes_Produto'); }, []);
  const { coffee } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: coffee.image }} style={styles.imageLarge} />
      <View style={styles.detailsBox}>
        <Text style={styles.title}>{coffee.name}</Text>
        <Text style={styles.description}>{coffee.description}</Text>
        <Text style={styles.priceLarge}>{coffee.price}</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#2E8B57', marginTop: 20 }]} 
          onPress={() => {
            trackClick(`Adicionar_Carrinho_${coffee.name.replace(' ', '')}`);
            navigation.navigate('Cart', { coffee });
          }}>
          <Text style={styles.buttonText}>Adicionar ao Carrinho 🛒</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CartScreen({ route, navigation }) {
  useEffect(() => { trackPage('Tela_Carrinho_Checkout'); }, []);
  const { coffee } = route.params;

  return (
    <View style={[styles.container, { justifyContent: 'center', padding: 20 }]}>
      <Text style={styles.title}>Resumo do Pedido</Text>
      <View style={styles.cartItem}>
        <Text style={styles.cartText}>1x {coffee.name}</Text>
        <Text style={styles.cartText}>{coffee.price}</Text>
      </View>

        <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#B22222', paddingVertical: 20, marginTop: 40 }]} 
        onPress={() => {
          trackClick('Botao_Finalizar_Checkout');
          Alert.alert("Sucesso!", "Seu pedido está sendo preparado!");
          
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Welcome' },
              { name: 'Catalog' }
            ],
          });
        }}>
        <Text style={[styles.buttonText, { fontSize: 18 }]}>PAGAR E FINALIZAR</Text>
        </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#3E2723' }, 
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: 'bold' }
      }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Nosso Menu' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Seu Carrinho' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  
  welcomeContainer: { flex: 1, backgroundColor: '#3E2723' },
  welcomeCover: { width: '100%', height: '50%', opacity: 0.8 },
  welcomeContent: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: -40 },
  welcomeTitle: { fontSize: 36, fontWeight: 'bold', color: '#3E2723', marginTop: 10 },
  welcomeSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  suggestionBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 15, width: '100%', borderLeftWidth: 5, borderLeftColor: '#D2691E' },
  suggestionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D2691E', marginBottom: 5 },
  suggestionText: { fontSize: 14, color: '#555', fontStyle: 'italic' },
  welcomeButton: { backgroundColor: '#3E2723', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 5 },
  welcomeButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

  card: { backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 3, flexDirection: 'row' },
  image: { width: 120, height: 120 },
  cardInfo: { flex: 1, padding: 15, justifyContent: 'center' },
  coffeeName: { fontSize: 18, fontWeight: 'bold', color: '#3E2723' },
  price: { fontSize: 16, color: '#2E8B57', marginVertical: 8, fontWeight: 'bold' },
  button: { backgroundColor: '#D2691E', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  imageLarge: { width: '100%', height: 250 },
  detailsBox: { padding: 20, backgroundColor: '#FFF', flex: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#3E2723', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 15 },
  priceLarge: { fontSize: 24, color: '#2E8B57', fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 2, marginTop: 20 },
  cartText: { fontSize: 18, fontWeight: 'bold', color: '#333' }
});