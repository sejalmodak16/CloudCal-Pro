import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const pressButton = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setExpression('');
      return;
    }

    if (value === '⌫') {
      setDisplay((previous) =>
        previous.length > 1 ? previous.slice(0, -1) : '0'
      );
      return;
    }

    if (value === '=') {
      try {
        const safeExpression = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');

        const result = Function(
          `"use strict"; return (${safeExpression})`
        )();

        setExpression(display);
        setDisplay(String(result));
      } catch {
        setDisplay('Error');
      }

      return;
    }

    if (display === '0' && !['.', '+', '−', '×', '÷', '%'].includes(value)) {
      setDisplay(value);
    } else {
      setDisplay((previous) => previous + value);
    }
  };

  const buttons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>CloudCalc Pro</Text>

          <Text style={styles.subtitle}>
            Smart Cloud Calculator
          </Text>
        </View>

        {/* DISPLAY */}
        <View style={styles.displayCard}>
          <Text style={styles.expression}>
            {expression}
          </Text>

          <Text
            style={styles.display}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
          </Text>
        </View>

        {/* VOICE */}
        <TouchableOpacity
          style={styles.voiceButton}
          activeOpacity={0.8}
          onPress={() => {
            console.log('Voice calculator selected');
          }}
        >
          <Text style={styles.voiceText}>
            🎤 Voice Calculator
          </Text>
        </TouchableOpacity>

        {/* CALCULATOR */}
        <View style={styles.keypad}>
          {buttons.flat().map((button, index) => (
            <TouchableOpacity
              key={`${button}-${index}`}
              activeOpacity={0.75}
              style={[
                styles.button,

                ['÷', '×', '−', '+'].includes(button) &&
                  styles.operatorButton,

                button === 'C' &&
                  styles.clearButton,

                button === '=' &&
                  styles.equalsButton,

                button === '0' &&
                  styles.zeroButton,
              ]}
              onPress={() => pressButton(button)}
            >
              <Text style={styles.buttonText}>
                {button}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          ☁️ Cloud synced • Secure calculations
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 35,
  },

  header: {
    marginBottom: 22,
  },

  logo: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '800',
  },

  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 5,
  },

  displayCard: {
    minHeight: 155,
    borderRadius: 24,
    backgroundColor: '#151c32',
    padding: 22,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },

  expression: {
    color: '#8b93a7',
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 8,
  },

  display: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'right',
  },

  voiceButton: {
    height: 55,
    borderRadius: 18,
    backgroundColor: '#202a48',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  voiceText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  button: {
    width: '23%',
    height: 70,
    borderRadius: 20,
    backgroundColor: '#171f36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  operatorButton: {
    backgroundColor: '#29365d',
  },

  clearButton: {
    backgroundColor: '#472b3b',
  },

  equalsButton: {
    width: '48%',
    backgroundColor: '#3158d4',
  },

  zeroButton: {
    width: '48%',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    color: '#7d879f',
    fontSize: 12,
    marginTop: 8,
  },
});