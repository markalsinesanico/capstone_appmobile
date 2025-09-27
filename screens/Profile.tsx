import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Header from '../navigation/Header';
import Footer from '../navigation/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import API from '../src/api';

export default function Profile() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = React.useState<string>('msanico@ssct.edu.ph');

  React.useEffect(() => {
    let mounted = true;
    const loadEmail = async () => {
      try {
        const stored = await AsyncStorage.getItem('email');
        if (mounted && stored) setEmail(stored);
      } catch {}
    };
    loadEmail();
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      if (API?.defaults?.headers?.common) delete API.defaults.headers.common['Authorization'];
      Alert.alert('Logged out', 'You have been logged out.');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      Alert.alert('Error', 'Unable to logout, please try again.');
    }
  };

  const [receiptVisible, setReceiptVisible] = React.useState(false);
  const [loadingReceipt, setLoadingReceipt] = React.useState(false);
  const [itemRequests, setItemRequests] = React.useState<any[]>([]);
  const [roomRequests, setRoomRequests] = React.useState<any[]>([]);
  const [cancellingIds, setCancellingIds] = React.useState<number[]>([]);

  const openReceipt = async () => {
    setReceiptVisible(true);
    await loadReceipts();
  };

  const loadReceipts = async () => {
    setLoadingReceipt(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      const [itemsRes, roomsRes] = await Promise.all([
        API.get('/requests'),
        API.get('/room-requests'),
      ]);

      const items = itemsRes.data || [];
      const rooms = roomsRes.data || [];

      const storedEmail = await AsyncStorage.getItem('email');
      const storedBorrowerId = await AsyncStorage.getItem('borrower_id');
      const candidates = new Set<string>();
      if (user) {
        if (user.id) candidates.add(String(user.id));
        if (user.email) candidates.add(String(user.email));
        if (user.name) candidates.add(String(user.name));
      }
      if (storedEmail) candidates.add(storedEmail);
      if (storedBorrowerId) candidates.add(storedBorrowerId);

      const matchBorrower = (r: any) => {
        if (!r) return false;
        const fields = [r.borrower_id, r.user_id, r.email, r.name];
        return fields.some((f) => f != null && candidates.has(String(f)));
      };

      setItemRequests(candidates.size ? items.filter(matchBorrower) : items);
      setRoomRequests(candidates.size ? rooms.filter(matchBorrower) : rooms);
    } catch (err) {
      console.log('Failed to load receipts', err);
      Alert.alert('Error', 'Failed to load receipts');
    } finally {
      setLoadingReceipt(false);
    }
  };

  function formatDisplayTime(t: string | null | undefined) {
    if (!t) return '-';
    if (t.includes('T')) t = t.split('T')[1]?.split('.')[0]; // extract time from ISO
    if (t.includes(' ')) t = t.split(' ')[1]; // fallback for "YYYY-MM-DD HH:mm:ss"

    const [hourStr, minuteStr] = t.split(':');
    if (!hourStr || !minuteStr) return t;
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
  }

  function formatDateOnly(ts: string | null | undefined) {
    if (!ts) return '-';
    if (typeof ts !== 'string') return String(ts);
    if (ts.includes('T')) return ts.split('T')[0];
    if (ts.includes(' ')) return ts.split(' ')[0];
    return ts;
  }

  const cancelItemRequest = async (id: number) => {
    setCancellingIds((prev) => [...prev, id]);
    try {
      await API.delete(`/requests/${id}`);
      setItemRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert('Cancelled', 'Item request cancelled successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel request';
      Alert.alert('Error', msg);
    } finally {
      setCancellingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const cancelRoomRequest = async (id: number) => {
    setCancellingIds((prev) => [...prev, id]);
    try {
      await API.delete(`/room-requests/${id}`);
      setRoomRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert('Cancelled', 'Room reservation cancelled successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel room reservation';
      Alert.alert('Error', msg);
    } finally {
      setCancellingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.profileSection}>
        <View style={styles.profileImg}>
          <FontAwesome5 name="user" size={40} color="white" />
        </View>
        <Text style={styles.emailText}>{email}</Text>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={openReceipt}>
          <View style={styles.menuLeft}>
            <FontAwesome5 name="receipt" size={20} />
            <Text>Receipt</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <FontAwesome5 name="history" size={20} />
            <Text>History</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <FontAwesome5 name="sign-out-alt" size={20} />
            <Text>Logout</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} />
        </TouchableOpacity>
      </View>
      <Footer />

      <Modal visible={receiptVisible} animationType="slide" onRequestClose={() => setReceiptVisible(false)}>
        <View style={[styles.container, { padding: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Your Receipts</Text>
            <TouchableOpacity onPress={() => setReceiptVisible(false)}>
              <Text style={{ color: '#007e3a' }}>Close</Text>
            </TouchableOpacity>
          </View>

          {loadingReceipt ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={[...itemRequests.map((r) => ({ ...r, type: 'item' })), ...roomRequests.map((r) => ({ ...r, type: 'room' }))]}
              keyExtractor={(it) => `${it.type}-${it.id}`}
              renderItem={({ item }) => (
                <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginTop: 12 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
                    {item.type === 'item' ? item.item?.name ?? 'Item Request' : item.room?.name ?? 'Room Reservation'}
                  </Text>

                  <Text>{`Name: ${item.name ?? item.user?.name ?? item.borrower_name ?? '-'}`}</Text>
                  <Text>{`School / Borrower ID: ${item.school_id ?? item.student_id ?? item.borrower_id ?? '-'}`}</Text>
                  <Text>{`Year: ${item.year ?? item.yr ?? '-'}`}</Text>
                  <Text>{`Department: ${item.department ?? item.dept ?? '-'}`}</Text>
                  <Text>{`Course: ${item.course ?? '-'}`}</Text>
                  <Text>{`Date: ${formatDateOnly(item.date ?? item.created_at ?? '-')}`}</Text>
                  <Text>{`Time In: ${formatDisplayTime(item.time_in ?? item.start_time ?? item.created_at ?? '')}`}</Text>
                  <Text>{`Time Out: ${formatDisplayTime(item.time_out ?? item.end_time ?? '')}`}</Text>

                  <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                    <TouchableOpacity
                      disabled={cancellingIds.includes(item.id)}
                      style={{ backgroundColor: cancellingIds.includes(item.id) ? '#aaa' : '#e74c3c', padding: 8, borderRadius: 6, minWidth: 90, alignItems: 'center' }}
                      onPress={() => {
                        Alert.alert('Cancel', 'Are you sure you want to cancel?', [
                          { text: 'No', style: 'cancel' },
                          { text: 'Yes', onPress: () => item.type === 'item' ? cancelItemRequest(item.id) : cancelRoomRequest(item.id) },
                        ]);
                      }}
                    >
                      {cancellingIds.includes(item.id) ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Cancel</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => <Text style={{ marginTop: 20 }}>No receipts found.</Text>}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#bbe0cd' },
  profileSection: { alignItems: 'center', marginTop: 40 },
  profileImg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#007e3a', marginBottom: 10 },
  emailText: { fontSize: 14, marginBottom: 20 },
  divider: { width: '80%', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 20 },
  menuItem: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginVertical: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 2 } },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
