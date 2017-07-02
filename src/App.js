import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Text,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';

import { getHistory, setHistory } from './support/Storage';

import Converter from './components/Converter';

class App extends Component {
  state = {
    isLoading: true,
    isError: false,
    data: null,
    history: [],
  };

  async getHistory() {
    const savedItems = await getHistory();
    this.setState({
      history: savedItems,
    });
  }

  componentDidMount() {
    this.loadData();
    this.getHistory();
  }

  loadData = () => {
    // Reset state to handle retry.
    this.setState({
      error: false,
      isLoading: true,
    });
    fetch('https://txf-ecb.glitch.me/rates')
      .then((res) => res.json())
      .then((data) => {
        data.rates.unshift({
          currency: data.base,
          rate: 1,
        });
        this.setState({
          isLoading: false,
          data,
        });
      })
      .catch(() => {
        this.setState({
          error: true,
        });
      });
  }

  updateHistory = (amount, converted, from, to) => {
    if (from === to) {
      return;
    }
    const history = this.state.history;
    history.unshift({
      amount,
      converted,
      from,
      to,
      date: this.state.data.time,
    });
    this.setState({
      history: history.slice(0, 30),
    });
    setHistory(this.state.history);
  }

  render() {
    const date = new Date();
    if (this.state.error) {
      return (
        <View style={styles.error}>
          <Text>Oops! Something unexpected happened</Text>
          <Button
            onPress={this.loadData}
            title="Retry"
            style={styles.errorButton}
            accessibilityLabel="Reload"
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Currency Converter
          </Text>
          <Text style={styles.subtitle}>
            Conversion rates for {date.toDateString()}
          </Text>
        </View>
        {
          this.state.data
            ? <Converter
                data={this.state.data}
                onConversion={this.updateHistory}
                history={this.state.history}
              />
            : <ActivityIndicator
                size='small'
                style={styles.loader}
                animating={this.state.isLoading}
              />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#4ed34e',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 5,
  },
  title: {
    fontSize: 20,
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
  },
  loader: {
    alignSelf: 'center',
    marginTop: 50,
  },
});

export default App;