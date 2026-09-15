import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function EdControlAI() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeProject, setActiveProject] = useState({
    id: 1,
    name: 'St. Antonius Ziekenhuis',
    sector: 'Ziekenhuizen',
    location: 'OK-Complex 3',
  });

  const projects = [
    { id: 1, name: 'St. Antonius Ziekenhuis', sector: 'Ziekenhuizen', location: 'OK-Complex 3' },
    { id: 2, name: 'Kantoorpand Zenith', sector: 'Kantoren', location: 'Dakopbouw' },
    { id: 3, name: 'Basischool De Kring', sector: 'Scholen', location: 'Ketelhuis' },
  ];

  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Photo capture
  const handleCapturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Pick drawing
  const handlePickDrawing = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Media library permission required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newDrawing = {
        id: Date.now(),
        name: `Drawing_${Date.now()}.jpg`,
        uri: result.assets[0].uri,
      };
      setDrawings([...drawings, newDrawing]);
      setSelectedDrawing(newDrawing);
    }
  };

  // Run AI Analysis
  const runAIAnalysis = () => {
    if (!photo) {
      Alert.alert('Foto vereist', 'Maak eerst een foto');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const mockResult = {
        component: 'Luchtbehandelingskast (LBK) Sectie 2 - Warmtewisselaar & Regelklep',
        conditionScore: 'Score 4 (Slechte conditie)',
        rtl: '1 tot 2 jaar',
        sectorImpact:
          activeProject.sector === 'Ziekenhuizen'
            ? 'Kritiek risico voor drukverschillen in operatiekamers'
            : 'Verhoogd energieverlies',
        strategy: 'Directe Vervanging aanbevolen',
        tcoPayback: 'Investering €12.500 | Payback: 3.7 jaar',
        materials: [
          '1x Platenwarmtewisselaar (RVS 316)',
          '2x Regelaandrijving 24V',
          '4x Flenzen PN16 DN50',
          '1x Modulating regelklep',
        ],
      };
      setAiResult(mockResult);
      if (activePin) {
        setPins(pins.map((p) => (p.id === activePin.id ? { ...p, aiResult: mockResult, photo, note } : p)));
      }
      setLoading(false);
    }, 2000);
  };

  // Create pin
  const createPin = () => {
    if (!selectedDrawing) {
      Alert.alert('Geen tekening', 'Selecteer een tekening');
      return;
    }
    const newPin = {
      id: Date.now(),
      drawingId: selectedDrawing.id,
      note: '',
      photo: null,
      aiResult: null,
    };
    setPins([...pins, newPin]);
    setActivePin(newPin);
    setCurrentScreen('inspect');
  };

  const generateReport = async () => {
    const completedPins = pins.filter((p) => p.aiResult);
    if (completedPins.length === 0) {
      Alert.alert('Geen data', 'Voer eerst inspecties uit');
      return;
    }
    try {
      const reportContent = `EdControl AI Rapport\n${new Date().toLocaleDateString()}\n\n${completedPins
        .map((p, i) => `Punt #${i + 1}\n${p.aiResult.component}\n${p.aiResult.strategy}`)
        .join('\n\n')}`;
      const filePath = `${FileSystem.documentDirectory}rapport_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(filePath, reportContent);
      await Sharing.shareAsync(filePath);
    } catch (error) {
      Alert.alert('Fout', 'Rapport genereren mislukt');
    }
  };

  // HOME SCREEN
  if (currentScreen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>EdControl AI</Text>
            <Text style={styles.subtitle}>{activeProject.name}</Text>
          </View>

          <TouchableOpacity style={styles.projectCard} onPress={() => Alert.alert('Projects', activeProject.name)}>
            <Text style={styles.cardTitle}>Actieve Project</Text>
            <Text style={styles.projectName}>{activeProject.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { borderColor: '#60a5fa' }]}
            onPress={() => setCurrentScreen('drawings')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuTitle}>Tekeningen</Text>
            <Text style={styles.menuDesc}>Upload en beheer tekeningen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { borderColor: '#10b981' }]}
            onPress={() => setCurrentScreen('report')}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuTitle}>Rapporten</Text>
            <Text style={styles.menuDesc}>Bekijk inspecties en resultaten</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // DRAWINGS SCREEN
  if (currentScreen === 'drawings') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backText}>← Terug</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Tekeningen</Text>

          <TouchableOpacity style={styles.button} onPress={handlePickDrawing}>
            <Text style={styles.buttonText}>Kies Tekening</Text>
          </TouchableOpacity>

          {selectedDrawing && (
            <View>
              <Image source={{ uri: selectedDrawing.uri }} style={styles.image} />
              <TouchableOpacity style={styles.button} onPress={createPin}>
                <Text style={styles.buttonText}>Plaats Pin</Text>
              </TouchableOpacity>
            </View>
          )}

          {pins.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Pins ({pins.length})</Text>
              {pins.map((pin, idx) => (
                <TouchableOpacity
                  key={pin.id}
                  style={styles.pinItem}
                  onPress={() => {
                    setActivePin(pin);
                    setPhoto(pin.photo);
                    setAiResult(pin.aiResult);
                    setCurrentScreen('inspect');
                  }}
                >
                  <Text style={styles.pinText}>Pin #{idx + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // INSPECT SCREEN
  if (currentScreen === 'inspect') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity onPress={() => setCurrentScreen('drawings')}>
            <Text style={styles.backText}>← Terug</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Inspectie</Text>

          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleCapturePhoto}>
              <Text style={styles.buttonText}>📸 Maak Foto</Text>
            </TouchableOpacity>
          )}

          <TextInput
            style={styles.input}
            placeholder="Notities..."
            value={note}
            onChangeText={setNote}
            placeholderTextColor="#64748b"
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.5 }]}
            onPress={runAIAnalysis}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Analyseren...' : '🤖 Start AI'}</Text>
          </TouchableOpacity>

          {aiResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{aiResult.component}</Text>
              <Text style={styles.resultText}>Status: {aiResult.conditionScore}</Text>
              <Text style={styles.resultText}>RTL: {aiResult.rtl}</Text>
              <Text style={styles.resultText}>Advies: {aiResult.strategy}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // REPORT SCREEN
  if (currentScreen === 'report') {
    const completedPins = pins.filter((p) => p.aiResult);
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backText}>← Terug</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Rapporten</Text>

          <TouchableOpacity
            style={[styles.button, completedPins.length === 0 && { opacity: 0.5 }]}
            onPress={generateReport}
            disabled={completedPins.length === 0}
          >
            <Text style={styles.buttonText}>📥 Download Rapport</Text>
          </TouchableOpacity>

          {completedPins.length === 0 ? (
            <Text style={styles.emptyText}>Geen voltooide inspecties</Text>
          ) : (
            completedPins.map((pin, idx) => (
              <View key={pin.id} style={styles.reportItem}>
                <Text style={styles.reportTitle}>Punt #{idx + 1}</Text>
                <Text style={styles.reportText}>{pin.aiResult.component}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollView: { padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#60a5fa', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  backText: { fontSize: 16, color: '#60a5fa', marginBottom: 16, fontWeight: '600' },
  projectCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  projectName: { fontSize: 16, fontWeight: '600', color: '#e2e8f0' },
  menuCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2 },
  menuIcon: { fontSize: 32, marginBottom: 8 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginBottom: 4 },
  menuDesc: { fontSize: 12, color: '#94a3b8' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, marginVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  image: { width: '100%', height: 240, borderRadius: 8, marginVertical: 12 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, color: '#e2e8f0', marginVertical: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#e2e8f0', marginTop: 16, marginBottom: 8 },
  pinItem: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  pinText: { color: '#e2e8f0', fontWeight: '600' },
  resultCard: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#60a5fa' },
  resultTitle: { fontSize: 14, fontWeight: 'bold', color: '#60a5fa', marginBottom: 8 },
  resultText: { fontSize: 12, color: '#e2e8f0', marginBottom: 6 },
  reportItem: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#334155' },
  reportTitle: { fontSize: 14, fontWeight: 'bold', color: '#60a5fa' },
  reportText: { fontSize: 12, color: '#e2e8f0', marginTop: 4 },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginVertical: 32 },
});
