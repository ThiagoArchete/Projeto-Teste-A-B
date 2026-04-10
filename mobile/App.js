import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function App() {
    const [currentScreen, setCurrentScreen] = useState('Home');

    const trackClick = async (buttonName) => {
        try {
            await axios.post(`${API_URL}/analytics/click`, { button_name: buttonName });
            console.log(`✅ Clique registrado: ${buttonName}`);
        } catch (error) {
            console.log('❌ Erro ao registrar clique:', error.message);
        }
    };

    const trackPage = async (pageName) => {
        const renderTime = Math.floor(Math.random() * 350) + 50;
        try {
            await axios.post(`${API_URL}/analytics/page`, {
                page_name: pageName,
                render_time_ms: renderTime
            });
            console.log(`✅ Página registrada: ${pageName} (${renderTime}ms)`);
        } catch (error) {
            console.log('❌ Erro ao registrar página:', error.message);
        }
    };

    useEffect(() => {
        trackPage(currentScreen);
    }, [currentScreen]);


    const renderHome = () => (
        <View style={styles.screen}>
            <Text style={styles.title}>Menu de Cafés ☕</Text>

            <View style={styles.card}>
                <Text style={styles.coffeeName}>Cappuccino Premium</Text>
                <Text style={styles.price}>R$ 15,90</Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#8B4513' }]}
                    onPress={() => {
                        trackClick('Botao_VerDetalhes_Marrom');
                        setCurrentScreen('Details');
                    }}>
                    <Text style={styles.buttonText}>Ver Detalhes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#D2691E', marginTop: 10 }]}
                    onPress={() => {
                        trackClick('Botao_ComprarRapido_Laranja');
                        setCurrentScreen('Cart');
                    }}>
                    <Text style={styles.buttonText}>Comprar Rápido ⚡</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDetails = () => (
        <View style={styles.screen}>
            <Text style={styles.title}>Detalhes do Produto</Text>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
                Delicioso café feito com grãos selecionados da serra mineira, com toque de canela.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2E8B57' }]}
                onPress={() => {
                    trackClick('Botao_AdicionarCarrinho_Verde');
                    setCurrentScreen('Cart');
                }}>
                <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.buttonOutline]}
                onPress={() => {
                    trackClick('Botao_VoltarParaHome');
                    setCurrentScreen('Home');
                }}>
                <Text style={styles.buttonOutlineText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCart = () => (
        <View style={styles.screen}>
            <Text style={styles.title}>Seu Carrinho 🛒</Text>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>1x Cappuccino Premium - R$ 15,90</Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#B22222', paddingVertical: 20 }]}
                onPress={() => {
                    trackClick('Botao_FinalizarCompra_Gigante');
                    Alert.alert("Sucesso!", "Compra finalizada com sucesso.");
                    setCurrentScreen('Home');
                }}>
                <Text style={[styles.buttonText, { fontSize: 20 }]}>FINALIZAR COMPRA</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.buttonOutline]}
                onPress={() => {
                    trackClick('Botao_ContinuarComprando');
                    setCurrentScreen('Home');
                }}>
                <Text style={styles.buttonOutlineText}>Continuar Comprando</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>CaféExpress</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {currentScreen === 'Home' && renderHome()}
                {currentScreen === 'Details' && renderDetails()}
                {currentScreen === 'Cart' && renderCart()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { backgroundColor: '#3E2723', padding: 20, alignItems: 'center', paddingTop: 50 },
    headerText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
    screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#3E2723' },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 3 },
    coffeeName: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    price: { fontSize: 20, color: '#2E8B57', marginBottom: 20, fontWeight: 'bold' },
    button: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    buttonOutline: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 5, borderWidth: 2, borderColor: '#3E2723' },
    buttonOutlineText: { color: '#3E2723', fontSize: 16, fontWeight: 'bold' }
});