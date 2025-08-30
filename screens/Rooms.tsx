// screens/Rooms.tsx
import React, { useState } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Header from '../navigation/Header';
import Footer from '../navigation/Footer';

type PickerState = {
  type: 'date' | 'timeIn' | 'timeOut' | '';
  visible: boolean;
};

export default function Rooms(): JSX.Element {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [idNumber, setIdNumber] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [date, setDate] = useState<Date | null>(null);
  const [showTimeInputs, setShowTimeInputs] = useState<boolean>(false);
  const [timeIn, setTimeIn] = useState<Date | null>(null);
  const [timeOut, setTimeOut] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<PickerState>({ type: '', visible: false });

  const rooms = ['Room 206', 'Room 207', 'Room 208', 'Room 209', 'Room 210', 'Room 211'];

  const openModal = (room: string) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowTimeInputs(false);
    setShowPicker({ type: '', visible: false });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android the picker auto-closes after selection/cancel — hide it
    if (Platform.OS === 'android') {
      setShowPicker({ type: '', visible: false });
    }

    // selectedDate is undefined when user cancels on Android
    if (selectedDate) {
      setDate(selectedDate);
      setShowTimeInputs(true);
    }
  };

  const handleTimeChange =
    (pickerType: 'timeIn' | 'timeOut') =>
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker({ type: '', visible: false });
      }

      if (selectedDate) {
        if (pickerType === 'timeIn') setTimeIn(selectedDate);
        else setTimeOut(selectedDate);
      }
    };

  return (
    <View style={{ flex: 1, backgroundColor: '#bbe0cd' }}>
      <Header />
      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Available Rooms</Text>

        <View style={styles.container}>
          {rooms.map((room) => (
            <TouchableOpacity key={room} style={styles.item} onPress={() => openModal(room)}>
              <Text>{room}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
          <View style={styles.modal}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Room Booking Request</Text>
            <Text style={styles.roomDisplay}>{selectedRoom}</Text>

            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="ID Number"
              style={styles.input}
              value={idNumber}
              onChangeText={setIdNumber}
            />
            <TextInput placeholder="Room Number" style={styles.input} value={selectedRoom} editable={false} />
            <TextInput placeholder="Purpose" style={styles.input} value={purpose} onChangeText={setPurpose} />

            <TouchableOpacity onPress={() => setShowPicker({ type: 'date', visible: true })} style={styles.input}>
              <Text>{date ? date.toDateString() : 'Select Date'}</Text>
            </TouchableOpacity>

            {showTimeInputs && (
              <>
                <TouchableOpacity onPress={() => setShowPicker({ type: 'timeIn', visible: true })} style={styles.input}>
                  <Text>{timeIn ? timeIn.toLocaleTimeString() : 'Select Time In'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPicker({ type: 'timeOut', visible: true })} style={styles.input}>
                  <Text>{timeOut ? timeOut.toLocaleTimeString() : 'Select Time Out'}</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={{ color: 'white' }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={{ color: 'black' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {showPicker.visible && showPicker.type === 'date' && (
          <DateTimePicker
            mode="date"
            value={date ?? new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        {showPicker.visible && (showPicker.type === 'timeIn' || showPicker.type === 'timeOut') && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange(showPicker.type === 'timeIn' ? 'timeIn' : 'timeOut')}
          />
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#bbe0cd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // 'gap' isn't supported in RN stylesheet — spacing is handled via margin on items
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    width: 130,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roomDisplay: {
    fontWeight: 'bold',
    color: '#007e3a',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#00a651',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 5,
    zIndex: 99,
  },
  closeText: {
    fontSize: 24,
    color: 'red',
  },
});
